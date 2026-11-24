import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validarTokenEdicao } from "@/lib/talentos/token-edicao";

export const maxDuration = 10;

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, token, ...dadosAtualizados } = body;

    if (!id || !token) {
      return NextResponse.json(
        { error: "Identificação ou token de edição ausente." },
        { status: 401 }
      );
    }

    // Valida o token assinado
    const validacao = validarTokenEdicao(token);
    if (!validacao.valido || validacao.talentoId !== id) {
      return NextResponse.json(
        { error: validacao.error || "Acesso de edição inválido ou expirado." },
        { status: 403 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    // 1. Extração segura dos campos informados
    const cepValor = (dadosAtualizados.cep || dadosAtualizados.redes_sociais?.cep || "")?.trim();
    const enderecoValor = (dadosAtualizados.endereco || dadosAtualizados.redes_sociais?.endereco || "")?.trim();
    const emailValor = (dadosAtualizados.email || dadosAtualizados.redes_sociais?.email || "")?.trim()?.toLowerCase();
    const whatsappValor = (dadosAtualizados.whatsapp || dadosAtualizados.redes_sociais?.whatsapp || "")?.trim();
    const fotoPosicaoY = Number(dadosAtualizados.foto_posicao_y) >= 0 ? Number(dadosAtualizados.foto_posicao_y) : 50;
    const fotoCapaPosicaoY = Number(dadosAtualizados.foto_capa_posicao_y) >= 0 ? Number(dadosAtualizados.foto_capa_posicao_y) : 50;

    // Garante que dados de contato e endereço fiquem preservados dentro de redes_sociais (JSONB)
    const redesSociaisAtualizadas = {
      ...(dadosAtualizados.redes_sociais || {}),
      email: emailValor || undefined,
      whatsapp: whatsappValor || undefined,
      cep: cepValor || undefined,
      endereco: enderecoValor || undefined,
      foto_posicao_y: fotoPosicaoY,
      foto_capa_posicao_y: fotoCapaPosicaoY,
    };

    // 2. Monta o payload de atualização apenas com as colunas válidas da tabela talentos
    const updatePayload: Record<string, any> = {
      nome: dadosAtualizados.nome?.trim(),
      titulo_profissional: dadosAtualizados.titulo_profissional?.trim(),
      whatsapp: whatsappValor,
      categoria: dadosAtualizados.categoria,
      segmentos: Array.isArray(dadosAtualizados.segmentos) ? dadosAtualizados.segmentos : [],
      foto_url: dadosAtualizados.foto_url?.trim(),
      foto_posicao_y: fotoPosicaoY,
      foto_capa_url: dadosAtualizados.foto_capa_url?.trim() || null,
      foto_capa_posicao_y: fotoCapaPosicaoY,
      email: emailValor || null,
      cidade_nome: dadosAtualizados.cidade_nome?.trim() || "Uberlândia",
      estado: dadosAtualizados.estado?.trim() || "MG",
      cidades_atendidas: dadosAtualizados.cidades_atendidas?.trim() || "Nacional e Internacional",
      bio_curta: dadosAtualizados.bio_curta?.trim(),
      bio_completa: dadosAtualizados.bio_completa?.trim() || null,
      seguidores_total: dadosAtualizados.seguidores_total?.trim() || "+ 100 mil seguidores",
      redes_sociais: redesSociaisAtualizadas,
      servicos: Array.isArray(dadosAtualizados.servicos) ? dadosAtualizados.servicos : [],
      videos: Array.isArray(dadosAtualizados.videos) ? dadosAtualizados.videos : [],
    };

    // Remove campos que nunca devem estar no update direto
    delete updatePayload.id;
    delete updatePayload.token;
    delete updatePayload.cep; // cep fica salvo dentro de redes_sociais
    delete updatePayload.endereco; // endereco fica salvo dentro de redes_sociais
    delete updatePayload.status;
    delete updatePayload.verificado;
    delete updatePayload.destaque_home;
    delete updatePayload.created_at;
    delete updatePayload.updated_at;

    Object.keys(updatePayload).forEach((k) => {
      if (updatePayload[k] === undefined) delete updatePayload[k];
    });

    // 3. Execução resiliente: remove dinamicamente qualquer coluna que não exista no schema cache do Postgres
    let data = null;
    let error = null;
    const payloadTentativa: Record<string, any> = { ...updatePayload };

    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const res = await adminSupabase
        .from("talentos")
        .update(payloadTentativa)
        .eq("id", id)
        .select()
        .single();

      data = res.data;
      error = res.error;

      if (!error) break;

      // Detecta erro específico de coluna inexistente no schema cache (ex: 'cep', 'email', 'foto_posicao_y')
      const match =
        error.message?.match(/Could not find the '([^']+)' column of 'talentos'/i) ||
        error.message?.match(/column "([^"]+)" of relation "talentos" does not exist/i);

      if (match && match[1]) {
        const colunaInvalida = match[1];
        delete payloadTentativa[colunaInvalida];
        continue;
      }

      // Códigos de erro Postgres / PostgREST para coluna desconhecida
      if (error.code === "PGRST204" || error.code === "42703") {
        if ("email" in payloadTentativa) {
          delete payloadTentativa.email;
          continue;
        }
        if ("foto_posicao_y" in payloadTentativa) {
          delete payloadTentativa.foto_posicao_y;
          continue;
        }
        if ("foto_capa_posicao_y" in payloadTentativa) {
          delete payloadTentativa.foto_capa_posicao_y;
          continue;
        }
      }

      break;
    }

    if (error) {
      console.error("[ERRO_EDICAO_TALENTO]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/talentos");
      if (data?.slug) {
        revalidatePath(`/talentos/${data.slug}`);
      }
      revalidateTag("talentos");
    } catch {}

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao salvar alterações.";
    console.error("[ERRO_FATAL_EDICAO_TALENTO]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
