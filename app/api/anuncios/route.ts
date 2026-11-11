import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { criarCobrancaComSplit, RespostaCobrancaAsaas } from "@/lib/asaas/cobrancas";
import { enviarEmailCobrancaAnuncio } from "@/lib/email/servico";

const AnuncioSchema = z.object({
  espaco_id: z.preprocess((val) => (val === "" || val === undefined ? null : val), z.string().uuid().optional().nullable()),
  anunciante_id: z.preprocess((val) => (val === "" || val === undefined ? null : val), z.string().uuid().optional().nullable()),
  titulo: z.string().min(1, "Título do anúncio deve ter pelo menos 1 caractere"),
  imagem_desktop_url: z.string().min(1, "Imagem desktop é obrigatória"),
  imagem_mobile_url: z.string().nullable().optional().or(z.literal("")),
  link_destino: z.string().min(1, "Link de destino inválido"),
  inicio_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início inválida (AAAA-MM-DD)"),
  fim_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de fim inválida (AAAA-MM-DD)"),
  status: z.enum(["aguardando_pagamento", "ativo", "agendado", "pausado", "expirado", "cancelado", "rascunho"]).default("ativo"),
  valor: z.number().min(0, "Valor do anúncio não pode ser negativo").default(0),
  forma_pagamento: z.enum(["pix", "boleto", "cartao", "manual", "dinheiro"]).default("manual"),
  gerar_cobranca_asaas: z.boolean().default(false),
});

interface AnuncioQueryRow {
  id: string;
  titulo: string;
  valor: number;
  impressoes: number;
  cliques: number;
  anunciante?: {
    id: string;
    nome: string;
    email?: string | null;
    telefone?: string | null;
    cpf_cnpj?: string | null;
  } | null;
  pedidos?: Array<{
    id: string;
    valor_total: number;
    comissao_percentual: number;
    valor_comissao: number;
    valor_liquido_dono: number;
    forma_pagamento: string;
    asaas_payment_id: string | null;
    link_pagamento: string | null;
    status: string;
    pago_em: string | null;
  }>;
  [key: string]: unknown;
}

export async function GET(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista", "anunciante"]);
    const { searchParams } = new URL(request.url);
    const todos = searchParams.get("todos") === "true";
    const status = searchParams.get("status");

    const userSupabase = await createClient();
    const supabase = getSupabaseAdmin();

    let query = userSupabase
      .from("anuncios")
      .select(`
        *,
        espaco:espacos_anuncio(
          id, nome, dono_tipo, preco_mensal, preco_semanal,
          formato:formatos_anuncio(id, nome, posicao, largura, altura, largura_mobile, altura_mobile),
          coluna:colunas(id, nome, slug)
        ),
        anunciante:anunciantes(id, nome, email, telefone, cpf_cnpj),
        dono:profiles!dono_id(id, nome, email, foto_url, asaas_wallet_id),
        pedidos(
          id, valor_total, comissao_percentual, valor_comissao, valor_liquido_dono,
          forma_pagamento, asaas_payment_id, link_pagamento, status, pago_em
        )
      `)
      .order("created_at", { ascending: false });

    if (profile.role === "colunista") {
      query = query.eq("dono_id", profile.id);
    } else if (profile.role === "anunciante") {
      query = query.eq("anunciante.usuario_id", profile.id);
    } else if (profile.role === "admin" && !todos) {
      // admin pode ver todos ou filtrados
    }

    if (status) {
      query = query.eq("status", status);
    }

    let { data: anuncios, error } = await query;

    // Se o cliente autenticado não trouxer por RLS ou joins, consulta com admin
    if (error || !anuncios || anuncios.length === 0) {
      let adminQ = supabase
        .from("anuncios")
        .select(`
          *,
          espaco:espacos_anuncio(
            id, nome, dono_tipo, preco_mensal, preco_semanal,
            formato:formatos_anuncio(id, nome, posicao, largura, altura, largura_mobile, altura_mobile),
            coluna:colunas(id, nome, slug)
          ),
          anunciante:anunciantes(id, nome, email, telefone, cpf_cnpj),
          dono:profiles!dono_id(id, nome, email, foto_url, asaas_wallet_id),
          pedidos(
            id, valor_total, comissao_percentual, valor_comissao, valor_liquido_dono,
            forma_pagamento, asaas_payment_id, link_pagamento, status, pago_em
          )
        `)
        .order("created_at", { ascending: false });

      if (profile.role === "colunista") {
        adminQ = adminQ.eq("dono_id", profile.id);
      }
      if (status) {
        adminQ = adminQ.eq("status", status);
      }

      const resAdmin = await adminQ;
      if (resAdmin.data && resAdmin.data.length > 0) {
        anuncios = resAdmin.data;
        error = null;
      }
    }

    if (error) throw error;

    // Normalizar campos para compatibilidade com a interface
    const formatados = ((anuncios as unknown as AnuncioQueryRow[]) || []).map((a) => ({
      ...a,
      anunciante: {
        id: a.anunciante?.id,
        nome_contato: a.anunciante?.nome,
        empresa: null,
        email: a.anunciante?.email,
        telefone: a.anunciante?.telefone,
        cpf_cnpj: a.anunciante?.cpf_cnpj,
      },
      valor_total: a.valor || 0,
      impressoes: a.impressoes || 0,
      cliques: a.cliques || 0,
      pedido: a.pedidos?.[0] || null,
    }));

    return NextResponse.json({ success: true, data: formatados, anuncios: formatados });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar anúncios.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const body = await request.json();
    const dados = AnuncioSchema.parse(body);

    const inicio = new Date(dados.inicio_em);
    const fim = new Date(dados.fim_em);

    if (fim < inicio) {
      return NextResponse.json(
        { error: "A data de término não pode ser anterior à data de início." },
        { status: 400 }
      );
    }

    const userSupabase = await createClient();
    const supabase = getSupabaseAdmin();

    // 0. Auto-resolver espaco_id caso não tenha sido enviado
    let finalEspacoId = dados.espaco_id;
    if (!finalEspacoId) {
      if (profile.role === "colunista") {
        const { data: userCols } = await supabase
          .from("colunas")
          .select("id")
          .eq("dono_id", profile.id)
          .limit(1);
        if (userCols && userCols.length > 0) {
          const { data: espCol } = await supabase
            .from("espacos_anuncio")
            .select("id")
            .eq("coluna_id", userCols[0].id)
            .limit(1);
          if (espCol && espCol.length > 0) {
            finalEspacoId = espCol[0].id;
          }
        }
      }
      if (!finalEspacoId) {
        const { data: anyEspaco } = await supabase
          .from("espacos_anuncio")
          .select("id")
          .limit(1);
        if (anyEspaco && anyEspaco.length > 0) {
          finalEspacoId = anyEspaco[0].id;
        }
      }
    }

    if (!finalEspacoId) {
      return NextResponse.json({ error: "Nenhum espaço publicitário disponível." }, { status: 400 });
    }

    // 1. Obter informações do espaço
    const { data: espaco } = await supabase
      .from("espacos_anuncio")
      .select(`
        id, dono_tipo, coluna_id, portal_id,
        coluna:colunas(dono_id, dono:profiles(id, nome, email, asaas_wallet_id))
      `)
      .eq("id", finalEspacoId)
      .single();

    if (!espaco) {
      return NextResponse.json({ error: "Espaço de anúncio não encontrado." }, { status: 404 });
    }

    let donoId = profile.id;
    let donoWalletId = profile.asaas_wallet_id || null;

    if (espaco.dono_tipo === "coluna") {
      const colunaData = Array.isArray(espaco.coluna)
        ? espaco.coluna[0]
        : (espaco.coluna as { dono_id?: string; dono?: { asaas_wallet_id?: string | null } } | null);

      const colunaDonoId = colunaData?.dono_id;

      if (!colunaDonoId) {
        return NextResponse.json({ error: "Coluna do espaço não encontrada." }, { status: 400 });
      }

      if (profile.role !== "admin" && colunaDonoId !== profile.id) {
        return NextResponse.json(
          { error: "Você só pode criar anúncios em espaços das suas próprias colunas." },
          { status: 403 }
        );
      }

      donoId = colunaDonoId;

      const donoProfile = Array.isArray(colunaData?.dono)
        ? (colunaData.dono[0] as { asaas_wallet_id?: string | null } | undefined)
        : (colunaData?.dono as { asaas_wallet_id?: string | null } | null);

      donoWalletId = donoProfile?.asaas_wallet_id || donoWalletId;
    }

    // 2. Verificar se não excedeu o limite máximo de banners em rotação no mesmo espaço (máx 10)
    if (["ativo", "aguardando_pagamento"].includes(dados.status)) {
      const { data: sobrepostos } = await supabase
        .from("anuncios")
        .select("id, titulo, inicio_em, fim_em, status")
        .eq("espaco_id", finalEspacoId)
        .in("status", ["ativo", "aguardando_pagamento"])
        .lte("inicio_em", dados.fim_em)
        .gte("fim_em", dados.inicio_em);

      if (sobrepostos && sobrepostos.length >= 10) {
        return NextResponse.json(
          {
            error: "Limite de rotação atingido: este espaço já possui 10 banners ativos em rotação simultânea no mesmo período.",
          },
          { status: 409 }
        );
      }
    }

    // 3. Buscar dados do anunciante ou criar automaticamente se não existir
    let anunciante = null;
    let finalAnuncianteId = dados.anunciante_id || null;

    if (finalAnuncianteId) {
      const { data: a } = await supabase
        .from("anunciantes")
        .select("*")
        .eq("id", finalAnuncianteId)
        .maybeSingle();
      anunciante = a;
      if (!anunciante) finalAnuncianteId = null;
    }

    if (!anunciante) {
      // Obter portal_id garantido (do espaço ou da tabela portais)
      let portalId = espaco.portal_id;
      if (!portalId) {
        const { data: portaisList } = await supabase.from("portais").select("id").limit(1);
        portalId = portaisList?.[0]?.id;
      }
      if (!portalId) {
        portalId = "a0000000-0000-0000-0000-000000000001";
      }

      const nomeCampanha = (dados.titulo || "").trim() || "Anunciante Local";

      // 3.1 Verificar se o colunista já tem um anunciante cadastrado com esse nome
      const { data: existente } = await userSupabase
        .from("anunciantes")
        .select("*")
        .eq("cadastrado_por", profile.id)
        .ilike("nome", nomeCampanha)
        .limit(1)
        .maybeSingle();

      if (existente) {
        anunciante = existente;
        finalAnuncianteId = existente.id;
      } else {
        // 3.2 Criar novo anunciante no banco com o cliente autenticado (atende política de RLS)
        let errInsertMsg = null;
        const payloadNovoAnun = {
          portal_id: portalId,
          cadastrado_por: profile.id,
          nome: nomeCampanha,
        };

        const resUser = await userSupabase
          .from("anunciantes")
          .insert(payloadNovoAnun)
          .select("*")
          .maybeSingle();

        if (resUser.data) {
          anunciante = resUser.data;
          finalAnuncianteId = resUser.data.id;
        } else {
          errInsertMsg = resUser.error?.message;
          // Tentar com cliente admin
          const resAdmin = await supabase
            .from("anunciantes")
            .insert(payloadNovoAnun)
            .select("*")
            .maybeSingle();

          if (resAdmin.data) {
            anunciante = resAdmin.data;
            finalAnuncianteId = resAdmin.data.id;
          } else {
            errInsertMsg = resAdmin.error?.message || errInsertMsg;
          }
        }

        if (!anunciante) {
          console.error("Falha ao criar anunciante automático:", errInsertMsg);
          // 3.3 Fallback: buscar qualquer anunciante do colunista ou do banco
          const { data: fallbackUser } = await userSupabase
            .from("anunciantes")
            .select("*")
            .eq("cadastrado_por", profile.id)
            .limit(1)
            .maybeSingle();

          if (fallbackUser) {
            anunciante = fallbackUser;
            finalAnuncianteId = fallbackUser.id;
          } else {
            const { data: fallbackGlobal } = await supabase
              .from("anunciantes")
              .select("*")
              .limit(1)
              .maybeSingle();

            if (fallbackGlobal) {
              anunciante = fallbackGlobal;
              finalAnuncianteId = fallbackGlobal.id;
            }
          }
        }
      }
    }

    if (!finalAnuncianteId || !anunciante) {
      return NextResponse.json({ error: "Não foi possível vincular o anunciante." }, { status: 400 });
    }

    // 4. Buscar percentual de comissão padrão nas configurações
    const { data: configComissao } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "comissao_padrao_percentual")
      .single();

    const comissaoPct = Number(configComissao?.valor || 20);
    const valorTotal = dados.valor || 0;
    const valorComissao = Number(((valorTotal * comissaoPct) / 100).toFixed(2));
    const valorLiquidoDono = Number((valorTotal - valorComissao).toFixed(2));

    const isPagamentoManual = dados.forma_pagamento === "manual" || dados.forma_pagamento === "dinheiro";
    let statusAnuncio = dados.status;

    if (dados.gerar_cobranca_asaas && !isPagamentoManual) {
      statusAnuncio = "aguardando_pagamento";
    }

    // 5. Inserir anúncio
    const payloadAnuncio = {
      espaco_id: finalEspacoId,
      anunciante_id: finalAnuncianteId,
      dono_id: donoId,
      titulo: dados.titulo,
      imagem_desktop_url: dados.imagem_desktop_url,
      imagem_mobile_url: dados.imagem_mobile_url || null,
      link_destino: dados.link_destino,
      inicio_em: dados.inicio_em,
      fim_em: dados.fim_em,
      status: statusAnuncio,
      valor: valorTotal,
    };

    let novoAnuncio = null;
    let insertError = null;

    // Tentar primeiro com o cliente do usuário logado (atende RLS: dono_id = auth.uid())
    const resUser = await userSupabase
      .from("anuncios")
      .insert(payloadAnuncio)
      .select(`
        *,
        espaco:espacos_anuncio(
          id, nome, dono_tipo,
          formato:formatos_anuncio(nome, posicao, largura, altura)
        ),
        anunciante:anunciantes(id, nome, email, telefone)
      `)
      .maybeSingle();

    if (resUser.data) {
      novoAnuncio = resUser.data;
    } else {
      insertError = resUser.error;
      // Tentar com cliente admin
      const resAdmin = await supabase
        .from("anuncios")
        .insert(payloadAnuncio)
        .select(`
          *,
          espaco:espacos_anuncio(
            id, nome, dono_tipo,
            formato:formatos_anuncio(nome, posicao, largura, altura)
          ),
          anunciante:anunciantes(id, nome, email, telefone)
        `)
        .maybeSingle();

      if (resAdmin.data) {
        novoAnuncio = resAdmin.data;
        insertError = null;
      } else {
        insertError = resAdmin.error || insertError;
      }
    }

    if (insertError || !novoAnuncio) {
      console.error("[API Anuncios Insert Error]:", insertError);
      throw insertError || new Error("Erro ao gravar anúncio no banco de dados.");
    }

    // 6. Gerar Pedido & Cobrança Asaas com Split se solicitado
    let asaasPaymentId: string | null = null;
    let linkPagamento: string | null = null;
    let pixQrCode: RespostaCobrancaAsaas["pixQrCode"] | null = null;

    if (dados.gerar_cobranca_asaas && !isPagamentoManual && valorTotal > 0) {
      try {
        const cobranca = await criarCobrancaComSplit({
          cliente: {
            name: anunciante.nome,
            cpfCnpj: anunciante.cpf_cnpj,
            email: anunciante.email,
            phone: anunciante.telefone,
            mobilePhone: anunciante.telefone,
          },
          valor: valorTotal,
          descricao: `Publicidade: ${dados.titulo} (${dados.inicio_em} a ${dados.fim_em})`,
          vencimento: dados.inicio_em,
          formaPagamento: dados.forma_pagamento === "cartao" ? "CREDIT_CARD" : dados.forma_pagamento === "boleto" ? "BOLETO" : "PIX",
          splitColunistaWalletId: espaco.dono_tipo === "coluna" ? donoWalletId : null,
          valorLiquidoColunista: espaco.dono_tipo === "coluna" ? valorLiquidoDono : null,
          externalReference: novoAnuncio.id,
        });

        asaasPaymentId = cobranca.id;
        linkPagamento = cobranca.invoiceUrl;
        pixQrCode = cobranca.pixQrCode || null;

        // Enviar e-mail de cobrança para o anunciante
        if (anunciante.email) {
          enviarEmailCobrancaAnuncio({
            email: anunciante.email,
            nomeCliente: anunciante.nome,
            tituloAnuncio: dados.titulo,
            valor: valorTotal,
            linkPagamento: cobranca.invoiceUrl,
          }).catch(console.error);
        }
      } catch (err) {
        console.error("Erro ao gerar cobrança no Asaas:", err);
      }
    }

    // 7. Criar registro na tabela pedidos (não-bloqueante)
    const statusPedido = isPagamentoManual || statusAnuncio === "ativo" ? "pago" : "pendente";
    const formaPgtoPedido = isPagamentoManual ? "dinheiro" : dados.forma_pagamento === "cartao" ? "cartao" : dados.forma_pagamento === "boleto" ? "boleto" : "pix";
    let pedidoCriado = null;

    try {
      const payloadPedido = {
        anuncio_id: novoAnuncio.id,
        dono_id: donoId,
        valor_total: valorTotal,
        comissao_percentual: comissaoPct,
        valor_comissao: valorComissao,
        valor_liquido_dono: valorLiquidoDono,
        forma_pagamento: formaPgtoPedido,
        asaas_payment_id: asaasPaymentId,
        link_pagamento: linkPagamento,
        status: statusPedido,
        pago_em: statusPedido === "pago" ? new Date().toISOString() : null,
      };

      const resPed = await supabase
        .from("pedidos")
        .insert(payloadPedido)
        .select("*")
        .maybeSingle();

      if (resPed.data) {
        pedidoCriado = resPed.data;
      }
    } catch (pedErr) {
      console.warn("Aviso ao registrar pedido (não impeditivo):", pedErr);
    }

    // 8. Revalidar cache público se ativo
    if (statusAnuncio === "ativo") {
      try {
        revalidatePath("/");
        revalidatePath("/colunas");
      } catch {
        // Ignore cache in dev
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: novoAnuncio,
        pedido: pedidoCriado,
        link_pagamento: linkPagamento,
        pix_qr_code: pixQrCode,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const errObj = error as { message?: string; details?: string; hint?: string };
    const mensagem =
      errObj?.message || (error instanceof Error ? error.message : "Erro ao criar anúncio.");
    console.error("[API Anuncios POST Error]:", error);
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
