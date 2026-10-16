import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "editor" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: materiasHoje },
      { count: materiasSemana },
      { data: todasMaterias },
      { data: topMaterias },
    ] = await Promise.all([
      supabaseAdmin
        .from("materias")
        .select("id", { count: "exact", head: true })
        .eq("autor_id", profile.id)
        .eq("status", "publicado")
        .gte("publicado_em", startOfToday),

      supabaseAdmin
        .from("materias")
        .select("id", { count: "exact", head: true })
        .eq("autor_id", profile.id)
        .eq("status", "publicado")
        .gte("publicado_em", sevenDaysAgo),

      supabaseAdmin
        .from("materias")
        .select("id, status, visualizacoes, publicado_em, categoria:categorias(nome)")
        .eq("autor_id", profile.id),

      supabaseAdmin
        .from("materias")
        .select("id, titulo, slug, visualizacoes, publicado_em, status, categoria:categorias(nome, cor)")
        .eq("autor_id", profile.id)
        .order("visualizacoes", { ascending: false })
        .limit(5),
    ]);

    const totalVisualizacoes = (todasMaterias || []).reduce(
      (acc, m) => acc + (m.visualizacoes || 0),
      0
    );

    const porStatus = {
      publicado: todasMaterias?.filter((m) => m.status === "publicado").length || 0,
      rascunho: todasMaterias?.filter((m) => m.status === "rascunho").length || 0,
      agendado: todasMaterias?.filter((m) => m.status === "agendado").length || 0,
      despublicado: todasMaterias?.filter((m) => m.status === "despublicado").length || 0,
    };

    return NextResponse.json({
      metricas: {
        hoje: materiasHoje || 0,
        semana: materiasSemana || 0,
        total: todasMaterias?.length || 0,
        totalVisualizacoes,
        porStatus,
      },
      topMaterias: topMaterias || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
