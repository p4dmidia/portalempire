import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: materiasHoje },
      { count: materiasSemana },
      { data: topMateriasData },
      { data: totalViewsData },
      { data: fontesRssData },
      { data: ultimoLogData },
      { data: pedidosMesData },
      { data: anunciosData },
      { data: usuariosData },
    ] = await Promise.all([
      // 1. Matérias hoje
      supabaseAdmin
        .from("materias")
        .select("id", { count: "exact", head: true })
        .eq("status", "publicado")
        .gte("publicado_em", startOfToday),

      // 2. Matérias na semana
      supabaseAdmin
        .from("materias")
        .select("id", { count: "exact", head: true })
        .eq("status", "publicado")
        .gte("publicado_em", sevenDaysAgo),

      // 3. Top 5 matérias
      supabaseAdmin
        .from("materias")
        .select("id, titulo, slug, visualizacoes, publicado_em, origem, categoria:categorias(nome, cor)")
        .eq("status", "publicado")
        .order("visualizacoes", { ascending: false })
        .limit(5),

      // 4. Total de visualizações
      supabaseAdmin
        .from("materias")
        .select("visualizacoes"),

      // 5. Status da captação (fontes RSS)
      supabaseAdmin
        .from("fontes_rss")
        .select("id, nome, veiculo, ativo, ultimo_status, total_importadas, ultima_execucao"),

      // 6. Último log de captação
      supabaseAdmin
        .from("captacao_logs")
        .select("id, iniciado_em, status, itens_lidos, itens_novos, erro, fonte:fontes_rss(nome)")
        .order("iniciado_em", { ascending: false })
        .limit(1)
        .maybeSingle(),

      // 7. Financeiro do mês (pedidos pagos este mês)
      supabaseAdmin
        .from("pedidos")
        .select("valor_total, valor_comissao, valor_liquido_dono, status, pago_em")
        .eq("status", "pago")
        .gte("pago_em", firstDayOfMonth),

      // 8. Anúncios ativos
      supabaseAdmin
        .from("anuncios")
        .select("id, status, valor, impressoes, cliques"),

      // 9. Usuários
      supabaseAdmin
        .from("profiles")
        .select("id, role, status"),
    ]);

    const totalVisualizacoes = (totalViewsData || []).reduce(
      (acc, m) => acc + (m.visualizacoes || 0),
      0
    );

    const fontesTotal = fontesRssData?.length || 0;
    const fontesAtivas = fontesRssData?.filter((f) => f.ativo).length || 0;
    const totalImportadasRss = (fontesRssData || []).reduce(
      (acc, f) => acc + (f.total_importadas || 0),
      0
    );
    const fontesComErro = fontesRssData?.filter((f) => f.ultimo_status === "erro").length || 0;

    const receitaMesTotal = (pedidosMesData || []).reduce(
      (acc, p) => acc + Number(p.valor_total || 0),
      0
    );
    const comissaoMesTotal = (pedidosMesData || []).reduce(
      (acc, p) => acc + Number(p.valor_comissao || 0),
      0
    );
    const liquidoColunistasMes = (pedidosMesData || []).reduce(
      (acc, p) => acc + Number(p.valor_liquido_dono || 0),
      0
    );

    const anunciosAtivos = anunciosData?.filter((a) => a.status === "ativo").length || 0;
    const anunciosAguardando =
      anunciosData?.filter((a) => a.status === "aguardando_pagamento").length || 0;
    const totalImpressoesAds = (anunciosData || []).reduce(
      (acc, a) => acc + (a.impressoes || 0),
      0
    );
    const totalCliquesAds = (anunciosData || []).reduce(
      (acc, a) => acc + (a.cliques || 0),
      0
    );

    const totalUsuarios = usuariosData?.length || 0;
    const usuariosPorRole = {
      admin: usuariosData?.filter((u) => u.role === "admin").length || 0,
      editor: usuariosData?.filter((u) => u.role === "editor").length || 0,
      colunista: usuariosData?.filter((u) => u.role === "colunista").length || 0,
      anunciante: usuariosData?.filter((u) => u.role === "anunciante").length || 0,
    };
    const usuariosPendentes =
      usuariosData?.filter((u) => u.status === "pendente").length || 0;

    return NextResponse.json({
      materias: {
        hoje: materiasHoje || 0,
        semana: materiasSemana || 0,
        totalVisualizacoes,
        topMaterias: topMateriasData || [],
      },
      captacao: {
        fontesTotal,
        fontesAtivas,
        fontesComErro,
        totalImportadas: totalImportadasRss,
        ultimoLog: ultimoLogData || null,
      },
      financeiro: {
        receitaMesTotal,
        comissaoMesTotal,
        liquidoColunistasMes,
        totalPedidosMes: pedidosMesData?.length || 0,
      },
      publicidade: {
        anunciosAtivos,
        anunciosAguardando,
        totalAnuncios: anunciosData?.length || 0,
        totalImpressoes: totalImpressoesAds,
        totalCliques: totalCliquesAds,
      },
      usuarios: {
        total: totalUsuarios,
        pendentes: usuariosPendentes,
        porRole: usuariosPorRole,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
