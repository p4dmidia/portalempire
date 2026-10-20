import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { parseFeedUrl } from "./parser";
import { normalizarUrl, gerarHashUrl, limparResumo, extrairImagem } from "./normalizar";
import { classificarMateria } from "./classificar";
import { reescreverNoticiaCaptada } from "./reescritor";
import { extrairDetalhesMateriaOriginal } from "./extrator-conteudo";

export interface ExecutarCaptacaoOptions {
  fonteId?: string;
  manual?: boolean;
  forcar?: boolean;
}

export interface ResultadoFonteCaptacao {
  fonte_id: string;
  nome: string;
  veiculo: string;
  sucesso: boolean;
  itens_lidos: number;
  itens_novos: number;
  itens_duplicados: number;
  erro?: string;
}

export interface ResultadoExecucaoCaptacao {
  executado_em: string;
  fontes_processadas: number;
  total_lidos: number;
  total_novos: number;
  total_duplicados: number;
  total_erros: number;
  detalhes: ResultadoFonteCaptacao[];
  arquivadas_antigas?: number;
  materias_deletadas_antigas?: number;
  ignorado_global?: boolean;
}

function gerarSlug(texto: string): string {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
}

/**
 * Função utilitária para executar tarefas com concorrência limitada (máx 5 em paralelo).
 */
async function mapConcorrencia<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item)).then((res) => {
      results.push(res);
    });

    const e: Promise<void> = p.then(() => {
      executing.splice(executing.indexOf(e), 1);
    });
    executing.push(e);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

export async function executarCaptacao(
  options: ExecutarCaptacaoOptions = {},
  customClient?: SupabaseClient
): Promise<ResultadoExecucaoCaptacao> {
  const supabase = customClient || getSupabaseAdmin();
  const inicioExecucao = new Date().toISOString();

  // 1. Verificar Liga/Desliga Global e configurações de reescrita
  const [
    { data: configGlobal },
    { data: configReescrita },
    { data: configGeminiKey },
  ] = await Promise.all([
    supabase.from("configuracoes").select("valor").eq("chave", "captacao_ativa_global").maybeSingle(),
    supabase.from("configuracoes").select("valor").eq("chave", "captacao_reescrita_automatica").maybeSingle(),
    supabase.from("configuracoes").select("valor").eq("chave", "gemini_api_key").maybeSingle(),
  ]);

  const captacaoAtivaGlobal =
    configGlobal?.valor === undefined ||
    configGlobal.valor === true ||
    configGlobal.valor === "true" ||
    configGlobal.valor === 1;

  const reescritaAtiva =
    configReescrita?.valor === undefined ||
    configReescrita.valor === true ||
    configReescrita.valor === "true" ||
    configReescrita.valor === 1;

  const apiKeyIa = typeof configGeminiKey?.valor === "string" ? configGeminiKey.valor : undefined;

  if (!captacaoAtivaGlobal && !options.forcar && !options.manual) {
    return {
      executado_em: inicioExecucao,
      fontes_processadas: 0,
      total_lidos: 0,
      total_novos: 0,
      total_duplicados: 0,
      total_erros: 0,
      detalhes: [],
      ignorado_global: true,
    };
  }

  // 2. Carregar Portal ID padrão
  const { data: portal } = await supabase
    .from("portais")
    .select("id")
    .limit(1)
    .single();

  const portalId = portal?.id;
  if (!portalId) {
    throw new Error("Nenhum portal cadastrado no sistema.");
  }

  // 3. Carregar Cidades e Categorias para classificação
  const [cidadesRes, categoriasRes] = await Promise.all([
    supabase.from("cidades").select("id, nome, slug, palavras_chave").eq("portal_id", portalId),
    supabase.from("categorias").select("id, nome, slug, pai_id, palavras_chave").eq("portal_id", portalId),
  ]);

  const cidades = cidadesRes.data || [];
  const categorias = categoriasRes.data || [];

  // 4. Selecionar Fontes RSS a executar
  let query = supabase
    .from("fontes_rss")
    .select("*")
    .eq("portal_id", portalId);

  if (options.fonteId) {
    query = query.eq("id", options.fonteId);
  } else {
    query = query.eq("ativo", true);
  }

  const { data: todasFontes, error: fontesError } = await query;
  if (fontesError) throw fontesError;

  const agora = new Date();

  // Filtrar fontes vencidas pelo intervalo (se não for execução forçada/manual individual)
  let fontesParaExecutar = (todasFontes || []).filter((fonte) => {
    if (options.forcar || options.fonteId) return true;
    if (!fonte.ultima_execucao) return true;
    const ultima = new Date(fonte.ultima_execucao);
    // Intervalo de no máximo 3 minutos para manter o portal sempre atualizado em tempo real
    const intervaloMinutos = Math.min(fonte.intervalo_minutos || 3, 3);
    const intervaloMs = intervaloMinutos * 60 * 1000;
    return agora.getTime() - ultima.getTime() >= intervaloMs;
  });

  // Ordenar fontes: as que nunca rodaram primeiro, seguidas pelas que rodaram há mais tempo
  fontesParaExecutar.sort((a, b) => {
    const timeA = a.ultima_execucao ? new Date(a.ultima_execucao).getTime() : 0;
    const timeB = b.ultima_execucao ? new Date(b.ultima_execucao).getTime() : 0;
    return timeA - timeB;
  });

  // Em execuções automáticas de cron geral, processa um lote de até 15 fontes por ciclo
  // para garantir resposta ágil (<25s) e rotação contínua de todo o catálogo
  const fontesLote =
    !options.fonteId && !options.forcar && fontesParaExecutar.length > 15
      ? fontesParaExecutar.slice(0, 15)
      : fontesParaExecutar;

  const categoriasAfetadas = new Set<string>();
  const cidadesAfetadas = new Set<string>();

  // 5. Processar com concorrência máxima de 5
  const detalhes = await mapConcorrencia(
    fontesLote,
    5,
    async (fonte): Promise<ResultadoFonteCaptacao> => {
      const inicioFonte = new Date().toISOString();
      let logId: string | null = null;

      // Gravar log inicial
      try {
        const { data: logData } = await supabase
          .from("captacao_logs")
          .insert({
            fonte_id: fonte.id,
            iniciado_em: inicioFonte,
            status: "executando",
            itens_lidos: 0,
            itens_novos: 0,
            itens_duplicados: 0,
          })
          .select("id")
          .single();

        logId = logData?.id || null;
      } catch (err) {
        console.error("Erro ao iniciar captacao_log:", err);
      }

      try {
        // Baixar e parsear feed com timeout de 15s
        const feed = await parseFeedUrl(fonte.url_feed);
        const itens = (feed.items || []).slice(0, fonte.max_itens_por_execucao || 20);

        let itensNovos = 0;
        let itensDuplicados = 0;

        for (const item of itens) {
          const rawLink = item.link || "";
          if (!rawLink) continue;

          const linkNormalizado = normalizarUrl(rawLink);
          const hash = gerarHashUrl(linkNormalizado);

          // Verificar duplicidade por url_original_hash
          const { data: existente } = await supabase
            .from("materias")
            .select("id")
            .eq("url_original_hash", hash)
            .maybeSingle();

          if (existente) {
            itensDuplicados++;
            continue;
          }

          const rawTitulo = item.title?.trim() || "Sem título";
          const rawResumo = item.contentSnippet || item.summary || item.description || "";
          const imagemUrl = extrairImagem(item);

          // Classificar cidade e categoria
          const classificacao = classificarMateria({
            titulo: rawTitulo,
            resumo: limparResumo(rawResumo, 400),
            cidades,
            categorias,
            categoriaPadraoId: fonte.categoria_padrao_id,
            cidadePadraoId: fonte.cidade_padrao_id,
          });

          let tituloFinal = rawTitulo;
          let subtituloFinal: string | null = null;
          let resumoFinal = limparResumo(rawResumo, 400);
          let conteudoHtmlFinal: string | null = null;

          if (reescritaAtiva) {
            const cidadeEncontrada = cidades.find(
              (c) => c.id === classificacao.cidade_id || c.id === fonte.cidade_padrao_id
            );

            try {
              const reescrito = await reescreverNoticiaCaptada({
                titulo: rawTitulo,
                resumoBruto: rawResumo,
                conteudoBruto: item.content,
                veiculo: fonte.veiculo,
                cidadeNome: cidadeEncontrada?.nome,
                apiKeyIa,
              });

              tituloFinal = reescrito.titulo;
              subtituloFinal = reescrito.subtitulo || null;
              resumoFinal = reescrito.resumo;
              conteudoHtmlFinal = reescrito.conteudoHtml;
            } catch (err) {
              console.warn("[Reescrita] Erro ao reescrever, mantendo original:", err);
            }
          }

          let imagemFinal = imagemUrl;

          // Extrair o conteúdo jornalístico integral e imagem editorial em alta resolução da página original
          if (linkNormalizado) {
            try {
              const detalhes = await extrairDetalhesMateriaOriginal(linkNormalizado);
              if (detalhes.conteudoHtml && detalhes.conteudoHtml.length > 250) {
                conteudoHtmlFinal = detalhes.conteudoHtml;
              }
              if (detalhes.imagemUrl) {
                imagemFinal = detalhes.imagemUrl;
              }
            } catch (errExtracao) {
              console.warn("[Captacao] Falha ao extrair texto/imagem da página original:", errExtracao);
            }
          }

          // Data de publicação inteligente:
          // Se o feed tiver data recente (últimas 2 horas), respeita o pubDate original;
          // Se o feed trouxer matéria com horas de atraso (> 2h ou pubDate ausente), define a data como agora (momento de entrada no portal)
          let publicadoEm = new Date();
          if (item.pubDate) {
            const parsedDate = new Date(item.pubDate);
            if (!isNaN(parsedDate.getTime())) {
              const diffHours = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60);
              if (diffHours >= 0 && diffHours <= 2) {
                publicadoEm = parsedDate;
              } else {
                publicadoEm = new Date();
              }
            }
          }

          const slug = gerarSlug(tituloFinal);
          const statusMateria = fonte.publicar_automatico ? "publicado" : "rascunho";

          // Inserir na tabela materias com dados reescritos e respaldo jurídico
          const { error: insertError } = await supabase.from("materias").insert({
            portal_id: portalId,
            categoria_id: classificacao.categoria_id,
            cidade_id: classificacao.cidade_id,
            titulo: tituloFinal,
            slug,
            subtitulo: subtituloFinal,
            resumo: resumoFinal || null,
            conteudo_html: conteudoHtmlFinal,
            imagem_url: imagemFinal,
            imagem_credito: "Foto: Divulgação / Redação Empire Cidades",
            origem: "captacao",
            fonte_id: fonte.id,
            fonte_nome: "Redatores da Empire Cidades",
            url_original: linkNormalizado,
            url_original_hash: hash,
            status: statusMateria,
            publicado_em: statusMateria === "publicado" ? publicadoEm.toISOString() : null,
            tags: classificacao.tags_sugeridas,
            visualizacoes: 0,
            urgente: false,
            destaque: false,
            seo_titulo: tituloFinal,
            seo_descricao: resumoFinal,
          });

          if (insertError) {
            // Se falhou por conflito de hash único gerado em concorrência
            if (insertError.code === "23505") {
              itensDuplicados++;
            } else {
              console.error("Erro ao inserir materia captada:", insertError);
            }
          } else {
            itensNovos++;

            // Registrar categorias/cidades para revalidação
            const cat = categorias.find((c) => c.id === classificacao.categoria_id);
            if (cat) categoriasAfetadas.add(cat.slug);

            if (classificacao.cidade_id) {
              const cid = cidades.find((c) => c.id === classificacao.cidade_id);
              if (cid) cidadesAfetadas.add(cid.slug);
            }
          }
        }

        const fimFonte = new Date().toISOString();

        // Atualizar status da fonte RSS
        await supabase
          .from("fontes_rss")
          .update({
            ultima_execucao: fimFonte,
            ultimo_status: "ok",
            ultimo_erro: null,
            total_importadas: (fonte.total_importadas || 0) + itensNovos,
          })
          .eq("id", fonte.id);

        // Atualizar log
        if (logId) {
          await supabase
            .from("captacao_logs")
            .update({
              finalizado_em: fimFonte,
              itens_lidos: itens.length,
              itens_novos: itensNovos,
              itens_duplicados: itensDuplicados,
              status: "sucesso",
            })
            .eq("id", logId);
        }

        return {
          fonte_id: fonte.id,
          nome: fonte.nome,
          veiculo: fonte.veiculo,
          sucesso: true,
          itens_lidos: itens.length,
          itens_novos: itensNovos,
          itens_duplicados: itensDuplicados,
        };
      } catch (err: unknown) {
        const fimFonte = new Date().toISOString();
        const mensagemErro = err instanceof Error ? err.message : String(err);

        // Atualizar status da fonte RSS com erro
        await supabase
          .from("fontes_rss")
          .update({
            ultima_execucao: fimFonte,
            ultimo_status: "erro",
            ultimo_erro: mensagemErro,
          })
          .eq("id", fonte.id);

        // Atualizar log de erro
        if (logId) {
          await supabase
            .from("captacao_logs")
            .update({
              finalizado_em: fimFonte,
              status: "erro",
              erro: mensagemErro,
            })
            .eq("id", logId);
        }

        return {
          fonte_id: fonte.id,
          nome: fonte.nome,
          veiculo: fonte.veiculo,
          sucesso: false,
          itens_lidos: 0,
          itens_novos: 0,
          itens_duplicados: 0,
          erro: mensagemErro,
        };
      }
    }
  );

  // 6. Exclusão e limpeza automática de matérias antigas (máx 7 dias / 1 semana) para otimização de banco e site
  let totalDeletadas = 0;
  try {
    const { data: configRetencao } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "captacao_arquivar_dias")
      .maybeSingle();

    // Padrão estrito de retenção: 7 dias (1 semana)
    const diasRetencao =
      configRetencao?.valor !== undefined && configRetencao?.valor !== null && Number(configRetencao.valor) > 0
        ? Number(configRetencao.valor)
        : 7;

    // 6.1 Tenta chamar a RPC PostgreSQL `limpar_materias_antigas` (SECURITY DEFINER, sem bloqueios de RLS)
    const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc("limpar_materias_antigas", {
      dias_retencao: diasRetencao,
    });

    if (!rpcErr && rpcRes && typeof rpcRes.materias_excluidas === "number") {
      totalDeletadas = rpcRes.materias_excluidas;
      if (totalDeletadas > 0) {
        console.log(
          `[Limpeza Automática RPC] ${totalDeletadas} matérias antigas (> ${diasRetencao} dias) foram excluídas com sucesso.`
        );
      }
    } else {
      // Fallback via query direta se a RPC ainda não tiver sido criada no Supabase
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasRetencao);
      const dataLimiteIso = dataLimite.toISOString();

      const { data: deletadas, error: errDelete } = await supabase
        .from("materias")
        .delete()
        .eq("origem", "captacao")
        .or(`publicado_em.lt.${dataLimiteIso},created_at.lt.${dataLimiteIso}`)
        .select("id");

      if (!errDelete && deletadas) {
        totalDeletadas = deletadas.length;
        if (totalDeletadas > 0) {
          console.log(`[Limpeza Automática] ${totalDeletadas} matérias com mais de ${diasRetencao} dias foram deletadas do banco.`);
        }
      }

      await supabase
        .from("captacao_logs")
        .delete()
        .lt("iniciado_em", dataLimiteIso);
    }
  } catch (errLimpeza) {
    console.warn("[Limpeza Automática] Falha ao excluir dados antigos:", errLimpeza);
  }

  // 7. Revalidação de Cache das páginas afetadas
  try {
    revalidatePath("/");
    revalidatePath("/rss.xml");
    for (const catSlug of categoriasAfetadas) {
      revalidatePath(`/categoria/${catSlug}`);
    }
    for (const cidSlug of cidadesAfetadas) {
      revalidatePath(`/cidade/${cidSlug}`);
    }
  } catch (err) {
    console.warn("Aviso ao revalidar caminhos de cache:", err);
  }

  const totalLidos = detalhes.reduce((acc, d) => acc + d.itens_lidos, 0);
  const totalNovos = detalhes.reduce((acc, d) => acc + d.itens_novos, 0);
  const totalDuplicados = detalhes.reduce((acc, d) => acc + d.itens_duplicados, 0);
  const totalErros = detalhes.filter((d) => !d.sucesso).length;

  return {
    executado_em: inicioExecucao,
    fontes_processadas: detalhes.length,
    total_lidos: totalLidos,
    total_novos: totalNovos,
    total_duplicados: totalDuplicados,
    total_erros: totalErros,
    detalhes,
    arquivadas_antigas: totalDeletadas,
    materias_deletadas_antigas: totalDeletadas,
  };
}
