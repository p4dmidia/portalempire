import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista", "anunciante"]);
    const { id } = await props.params;

    const supabase = getSupabaseAdmin();

    // 1. Verificar permissão de acesso ao anúncio
    const { data: anuncio, error: fetchError } = await supabase
      .from("anuncios")
      .select("id, titulo, dono_id, impressoes, cliques, anunciante:anunciantes(usuario_id)")
      .eq("id", id)
      .single();

    if (fetchError || !anuncio) {
      return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });
    }

    const anuncianteData = Array.isArray(anuncio.anunciante)
      ? anuncio.anunciante[0]
      : (anuncio.anunciante as { usuario_id?: string | null } | null);

    const isAnuncianteOwner = anuncianteData?.usuario_id === profile.id;

    if (profile.role !== "admin" && anuncio.dono_id !== profile.id && !isAnuncianteOwner) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    // 2. Buscar histórico diário dos últimos 30 dias
    const { data: metricas, error: metricasError } = await supabase
      .from("metricas_anuncio_diarias")
      .select("data, impressoes, cliques")
      .eq("anuncio_id", id)
      .order("data", { ascending: true })
      .limit(30);

    if (metricasError) throw metricasError;

    const historico = (metricas || []).map((m) => {
      const imp = m.impressoes || 0;
      const clk = m.cliques || 0;
      const ctr = imp > 0 ? (clk / imp) * 100 : 0;
      return {
        data: m.data,
        impressoes: imp,
        cliques: clk,
        ctr: Number(ctr.toFixed(2)),
      };
    });

    const totalImpressoes = anuncio.impressoes || 0;
    const totalCliques = anuncio.cliques || 0;
    const ctrTotal = totalImpressoes > 0 ? (totalCliques / totalImpressoes) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        anuncio_id: id,
        titulo: anuncio.titulo,
        total_impressoes: totalImpressoes,
        total_cliques: totalCliques,
        ctr_geral: Number(ctrTotal.toFixed(2)),
        historico,
      },
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao carregar métricas.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
