import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getTalentos, TALENTOS_MOCK } from "@/lib/talentos/queries";

export const maxDuration = 10;

function gerarSlug(texto: string): string {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}

// GET: Lista pública de talentos ou listagem administrativa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria") || undefined;
    const modoAdmin = searchParams.get("admin") === "true";

    if (modoAdmin) {
      const user = await getProfile();
      if (user?.role === "admin") {
        const adminSupabase = getSupabaseAdmin();
        const { data, error } = await adminSupabase
          .from("talentos")
          .select("*")
          .order("ordem", { ascending: true })
          .order("created_at", { ascending: false });

        if (!error && data) {
          return NextResponse.json({ success: true, data });
        }
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const talentos = await getTalentos(categoria);
    return NextResponse.json({ success: true, data: talentos });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao buscar talentos.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST: Cria um novo talento (Apenas Admin)
export async function POST(request: Request) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado. Apenas administradores podem cadastrar talentos." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nome,
      slug: slugInput,
      titulo_profissional,
      whatsapp,
      categoria,
      segmentos,
      foto_url,
      foto_posicao_y,
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
      modalidades,
      videos,
      galeria_fotos,
      programas_tv,
      verificado,
      destaque_home,
      ordem,
      status,
    } = body;

    if (!nome || !titulo_profissional || !foto_url || !bio_curta) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios (nome, título, foto e bio curta)." },
        { status: 400 }
      );
    }

    const slug = slugInput?.trim() ? slugInput.trim() : gerarSlug(nome);
    const adminSupabase = getSupabaseAdmin();

    const novoTalento = {
      nome,
      slug,
      titulo_profissional,
      whatsapp: whatsapp ? whatsapp.trim() : null,
      categoria: categoria || "apresentadores",
      segmentos: segmentos || [],
      foto_url,
      foto_posicao_y: Number(foto_posicao_y) >= 0 ? Number(foto_posicao_y) : 50,
      foto_capa_url: foto_capa_url || null,
      foto_capa_posicao_y: Number(foto_capa_posicao_y) >= 0 ? Number(foto_capa_posicao_y) : 50,
      cidade_nome: cidade_nome || "Uberlândia",
      estado: estado || "MG",
      cidades_atendidas: cidades_atendidas || "Nacional e Internacional",
      bio_curta,
      bio_completa: bio_completa || null,
      seguidores_total: seguidores_total || "+ 100 mil seguidores",
      redes_sociais: redes_sociais || {},
      servicos: servicos || [],
      modalidades: modalidades || ["Presencial", "Online/Remoto"],
      videos: videos || [],
      galeria_fotos: galeria_fotos || [],
      programas_tv: programas_tv || [],
      verificado: verificado !== undefined ? verificado : true,
      destaque_home: destaque_home !== undefined ? destaque_home : false,
      ordem: Number(ordem) || 0,
      status: status || "ativo",
      created_by: user.id,
    };

    let { data, error } = await adminSupabase
      .from("talentos")
      .insert(novoTalento)
      .select()
      .single();

    // Fallback se a coluna whatsapp, foto_capa_posicao_y ou foto_posicao_y ainda não foi criada no Postgres físico
    if (error && (error.message?.includes("whatsapp") || error.message?.includes("foto_capa_posicao_y") || error.message?.includes("foto_posicao_y") || error.code === "42703" || error.code === "PGRST204")) {
      const { whatsapp: _w, foto_capa_posicao_y: _pos, foto_posicao_y: _posF, ...talentoSemColunasNovas } = novoTalento;
      if (whatsapp && talentoSemColunasNovas.redes_sociais) {
        talentoSemColunasNovas.redes_sociais = {
          ...talentoSemColunasNovas.redes_sociais,
          whatsapp,
          foto_posicao_y: Number(foto_posicao_y) >= 0 ? Number(foto_posicao_y) : 50,
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/talentos");
      revalidatePath(`/talentos/${slug}`);
      revalidateTag("talentos");
    } catch {}

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno ao cadastrar talento.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
