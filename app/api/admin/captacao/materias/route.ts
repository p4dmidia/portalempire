import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    await requireRole(["admin", "editor"]);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fonteId = searchParams.get("fonte_id");
    const categoriaId = searchParams.get("categoria_id");
    const cidadeId = searchParams.get("cidade_id");
    const busca = searchParams.get("busca");
    const limit = Math.min(Number(searchParams.get("limit")) || 30, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("materias")
      .select(`
        id,
        titulo,
        slug,
        resumo,
        imagem_url,
        imagem_credito,
        fonte_nome,
        url_original,
        status,
        publicado_em,
        created_at,
        categoria:categorias(id, nome, slug),
        cidade:cidades(id, nome, slug),
        fonte:fontes_rss(id, nome, veiculo)
      `, { count: "exact" })
      .eq("origem", "captacao")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (fonteId) query = query.eq("fonte_id", fonteId);
    if (categoriaId) query = query.eq("categoria_id", categoriaId);
    if (cidadeId) query = query.eq("cidade_id", cidadeId);
    if (busca) query = query.ilike("titulo", `%${busca}%`);

    const { data: materias, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: materias || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar matérias captadas.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
