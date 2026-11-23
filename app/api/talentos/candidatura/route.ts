import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 10;

function gerarSlug(texto: string): string {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      titulo_profissional,
      whatsapp,
      categoria,
      segmentos,
      foto_url,
      foto_capa_url,
      foto_capa_posicao_y,
      cidade_nome,
      estado,
      cidades_atendidas,
      bio_curta,
      bio_completa,
      seguidores_total,
      redes_sociais,
      servicos,
      videos,
    } = body;

    if (!nome?.trim() || !whatsapp?.trim() || !titulo_profissional?.trim() || !foto_url?.trim() || !bio_curta?.trim()) {
      return NextResponse.json(
        { error: "Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp, Título/Profissão, Foto de Perfil e Apresentação curta)." },
        { status: 400 }
      );
    }

    const slug = gerarSlug(nome);
    const adminSupabase = getSupabaseAdmin();

    const novoTalento = {
      nome: nome.trim(),
      slug,
      titulo_profissional: titulo_profissional.trim(),
      whatsapp: whatsapp.trim(),
      categoria: categoria || "influenciadores",
      segmentos: Array.isArray(segmentos) ? segmentos : [],
      foto_url: foto_url.trim(),
      foto_capa_url: foto_capa_url ? foto_capa_url.trim() : null,
      foto_capa_posicao_y: Number(foto_capa_posicao_y) >= 0 ? Number(foto_capa_posicao_y) : 50,
      cidade_nome: cidade_nome?.trim() || "Uberlândia",
      estado: estado?.trim() || "MG",
      cidades_atendidas: cidades_atendidas?.trim() || "Nacional e Internacional",
      bio_curta: bio_curta.trim(),
      bio_completa: bio_completa?.trim() || null,
      seguidores_total: seguidores_total?.trim() || "+ 100 mil seguidores",
      redes_sociais: {
        ...(redes_sociais || {}),
        whatsapp: whatsapp.trim(),
        cep: (body.cep || redes_sociais?.cep || "")?.trim() || undefined,
        endereco: (body.endereco || redes_sociais?.endereco || "")?.trim() || undefined,
      },
      servicos: Array.isArray(servicos) ? servicos : [],
      modalidades: ["Presencial", "Online/Remoto"],
      videos: Array.isArray(videos) ? videos : [],
      galeria_fotos: [],
      programas_tv: [],
      verificado: false,
      destaque_home: false,
      ordem: 99,
      status: "pendente", // Aguarda aprovação do administrador
    };

    let { data, error } = await adminSupabase
      .from("talentos")
      .insert(novoTalento)
      .select()
      .single();

    // Fallback se colunas novas ainda não estiverem migradas no Postgres
    if (error && (error.message?.includes("whatsapp") || error.message?.includes("foto_capa_posicao_y") || error.code === "42703" || error.code === "PGRST204")) {
      const { whatsapp: _w, foto_capa_posicao_y: _pos, ...talentoSemColunasNovas } = novoTalento;
      if (whatsapp && talentoSemColunasNovas.redes_sociais) {
        talentoSemColunasNovas.redes_sociais = {
          ...talentoSemColunasNovas.redes_sociais,
          whatsapp,
        };
      }
      const retry = await adminSupabase
        .from("talentos")
        .insert(talentoSemColunasNovas)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("[Candidatura Talento] Erro ao cadastrar:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/talentos");
      revalidateTag("talentos");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Candidatura enviada com sucesso! Seu perfil está em análise curatorial.",
      data: {
        id: data?.id,
        nome: data?.nome,
        slug: data?.slug,
        status: data?.status,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno ao submeter candidatura.";
    console.error("[Candidatura Talento] Exceção:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
