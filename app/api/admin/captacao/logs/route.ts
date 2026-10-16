import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    await requireRole(["admin"]);
    const { searchParams } = new URL(request.url);
    const fonteId = searchParams.get("fonte_id");
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("captacao_logs")
      .select(`
        *,
        fonte:fontes_rss(id, nome, veiculo)
      `, { count: "exact" })
      .order("iniciado_em", { ascending: false })
      .range(offset, offset + limit - 1);

    if (fonteId) {
      query = query.eq("fonte_id", fonteId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: logs, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: logs || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar logs de captação.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
