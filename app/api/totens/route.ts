import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getTotens } from "@/lib/totens/queries";

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

// GET: Lista totens públicos ou lista administrativa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get("cidade") || undefined;
    const tipo = searchParams.get("tipo") || undefined;
    const modoAdmin = searchParams.get("admin") === "true";

    if (modoAdmin) {
      const user = await getProfile();
      if (user?.role === "admin") {
        const adminSupabase = getSupabaseAdmin();
        const { data, error } = await adminSupabase
          .from("totens")
          .select("*")
          .order("ordem", { ascending: true })
          .order("created_at", { ascending: false });

        if (!error && data) {
          return NextResponse.json({ success: true, data });
        }
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const totens = await getTotens(cidade, tipo);
    return NextResponse.json({ success: true, data: totens });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao buscar totens.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST: Cadastra novo totem (Apenas Admin)
export async function POST(request: Request) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado. Apenas administradores podem cadastrar totens." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nome,
      slug: slugInput,
      estabelecimento_nome,
      tipo_estabelecimento,
      cep,
      endereco,
      bairro,
      cidade_nome,
      estado,
      descricao_ponto,
      circulacao_estimada,
      circulacao_numero,
      perfil_publico,
      modelo_equipamento,
      tamanho_tela,
      formato_publicidade,
      slots_disponiveis,
      slots_total,
      duracao_slot_segundos,
      recursos_extras,
      foto_url,
      galeria_fotos,
      google_maps_url,
      latitude,
      longitude,
      franqueado_nome,
      franqueado_telefone,
      franqueado_whatsapp,
      franqueado_email,
      destaque,
      status,
      ordem,
    } = body;

    if (!nome || !estabelecimento_nome || !endereco || !bairro || !foto_url || !franqueado_whatsapp) {
      return NextResponse.json(
        { error: "Preencha os campos obrigatórios (nome, estabelecimento, endereço, foto e WhatsApp do franqueado)." },
        { status: 400 }
      );
    }

    const slug = slugInput?.trim() ? slugInput.trim() : gerarSlug(`${nome}-${cidade_nome || "totem"}`);
    const adminSupabase = getSupabaseAdmin();

    const novoTotem = {
      nome: nome.trim(),
      slug,
      estabelecimento_nome: estabelecimento_nome.trim(),
      tipo_estabelecimento: tipo_estabelecimento || "Galeria",
      cep: cep?.trim() || null,
      endereco: endereco.trim(),
      bairro: bairro.trim(),
      cidade_nome: cidade_nome?.trim() || "Uberlândia",
      estado: estado?.trim() || "MG",
      descricao_ponto: descricao_ponto?.trim() || "Ponto de grande circulação.",
      circulacao_estimada: circulacao_estimada?.trim() || "25.000 pessoas/mês",
      circulacao_numero: Number(circulacao_numero) || 25000,
      perfil_publico: perfil_publico || ["Consumidores", "Famílias"],
      modelo_equipamento: modelo_equipamento?.trim() || "Totem Digital Vertical 55 polegadas",
      tamanho_tela: tamanho_tela?.trim() || "55 polegadas 4K Ultra HD",
      formato_publicidade: formato_publicidade?.trim() || "20 slots de 15 segundos",
      slots_disponiveis: Number(slots_disponiveis) || 5,
      slots_total: Number(slots_total) || 20,
      duracao_slot_segundos: Number(duracao_slot_segundos) || 15,
      recursos_extras: recursos_extras || [],
      foto_url: foto_url.trim(),
      galeria_fotos: galeria_fotos || [],
      google_maps_url: google_maps_url?.trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      franqueado_nome: franqueado_nome?.trim() || "Marcelo Olivers",
      franqueado_telefone: franqueado_telefone?.trim() || null,
      franqueado_whatsapp: franqueado_whatsapp.trim(),
      franqueado_email: franqueado_email?.trim() || null,
      destaque: destaque !== undefined ? destaque : true,
      status: status || "ativo",
      ordem: Number(ordem) || 0,
    };

    let { data, error } = await adminSupabase
      .from("totens")
      .insert(novoTotem)
      .select()
      .single();

    if (error && (error.message?.includes("cep") || error.code === "42703")) {
      const { cep: _c, ...totemSemCep } = novoTotem;
      const retry = await adminSupabase
        .from("totens")
        .insert(totemSemCep)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/totens");
      revalidatePath(`/totens/${slug}`);
      revalidateTag("totens");
    } catch {}

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno ao cadastrar totem.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
