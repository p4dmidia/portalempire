import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuario_id");
    const acao = searchParams.get("acao");
    const dataInicio = searchParams.get("data_inicio");
    const dataFim = searchParams.get("data_fim");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "30", 10)));
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let query = supabase
      .from("auditoria")
      .select("*, usuario:profiles(id, nome, email, role)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (usuarioId) {
      query = query.eq("usuario_id", usuarioId);
    }

    if (acao) {
      query = query.ilike("acao", `%${acao}%`);
    }

    if (dataInicio) {
      query = query.gte("created_at", dataInicio);
    }

    if (dataFim) {
      query = query.lte("created_at", dataFim);
    }

    if (search) {
      query = query.or(
        `acao.ilike.%${search}%,entidade.ilike.%${search}%,entidade_id.ilike.%${search}%`
      );
    }

    query = query.range(offset, offset + limit - 1);

    const { data: logs, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
