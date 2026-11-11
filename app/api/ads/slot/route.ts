import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const posicao = searchParams.get("posicao");
    const colunaId = searchParams.get("coluna_id");
    const tipoPagina = searchParams.get("tipo_pagina") || "todas"; // "coluna" (home da coluna) ou "materia" (artigo)

    if (!posicao) {
      return NextResponse.json({ error: "Parâmetro 'posicao' é obrigatório." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const hoje = new Date().toISOString().slice(0, 10);

    // 1. Buscar os IDs de formato para a posição solicitada
    const { data: formatos } = await supabase
      .from("formatos_anuncio")
      .select("id, nome, posicao")
      .eq("posicao", posicao);

    const formatoIds = (formatos || []).map((f) => f.id);

    if (formatoIds.length === 0) {
      return NextResponse.json({ success: true, anuncio: null, anuncios: [] });
    }

    // 2. Buscar o espaço correspondente à coluna ou à plataforma geral
    let queryEspaco = supabase
      .from("espacos_anuncio")
      .select("id, nome, dono_tipo, coluna_id, formato_id")
      .eq("ativo", true)
      .in("formato_id", formatoIds);

    if (colunaId) {
      queryEspaco = queryEspaco.eq("coluna_id", colunaId);
    } else {
      queryEspaco = queryEspaco.eq("dono_tipo", "plataforma");
    }

    const { data: espacos } = await queryEspaco;
    let anunciosAtivos: Array<{
      id: string;
      espaco_id: string;
      titulo: string;
      imagem_desktop_url: string;
      imagem_mobile_url: string | null;
      link_destino: string;
    }> = [];

    if (espacos && espacos.length > 0) {
      const espacoIds = espacos.map((e) => e.id);

      // 3. Buscar anúncios ativos no período para esses espaços
      const { data: anuncios } = await supabase
        .from("anuncios")
        .select(`
          id,
          espaco_id,
          titulo,
          imagem_desktop_url,
          imagem_mobile_url,
          link_destino
        `)
        .in("espaco_id", espacoIds)
        .eq("status", "ativo")
        .lte("inicio_em", hoje)
        .gte("fim_em", hoje)
        .order("created_at", { ascending: false });

      if (anuncios && anuncios.length > 0) {
        anunciosAtivos = anuncios;
      }
    }

    // 4. Fallbacks inteligentes:
    // 4.1 Se for de uma coluna e não houver anúncio ativo na coluna, buscar anúncio da plataforma geral
    if (anunciosAtivos.length === 0 && colunaId) {
      const { data: platEspacos } = await supabase
        .from("espacos_anuncio")
        .select("id, nome, dono_tipo, coluna_id, formato_id")
        .eq("ativo", true)
        .eq("dono_tipo", "plataforma")
        .in("formato_id", formatoIds);

      if (platEspacos && platEspacos.length > 0) {
        const platIds = platEspacos.map((e) => e.id);
        const { data: platAnuncios } = await supabase
          .from("anuncios")
          .select(`
            id,
            espaco_id,
            titulo,
            imagem_desktop_url,
            imagem_mobile_url,
            link_destino
          `)
          .in("espaco_id", platIds)
          .eq("status", "ativo")
          .lte("inicio_em", hoje)
          .gte("fim_em", hoje)
          .order("created_at", { ascending: false });

        if (platAnuncios && platAnuncios.length > 0) {
          anunciosAtivos = platAnuncios;
        }
      }
    }

    // 4.2 Se for na Home Geral do Portal (sem colunaId) e não houver anúncio da plataforma,
    // buscar anúncios ativos configurados para aparecer na capa / principal
    if (anunciosAtivos.length === 0 && !colunaId) {
      const { data: allEspacos } = await supabase
        .from("espacos_anuncio")
        .select("id, nome, dono_tipo, coluna_id, formato_id")
        .eq("ativo", true)
        .in("formato_id", formatoIds);

      if (allEspacos && allEspacos.length > 0) {
        const allIds = allEspacos.map((e) => e.id);
        const { data: fallAnuncios } = await supabase
          .from("anuncios")
          .select(`
            id,
            espaco_id,
            titulo,
            imagem_desktop_url,
            imagem_mobile_url,
            link_destino
          `)
          .in("espaco_id", allIds)
          .eq("status", "ativo")
          .lte("inicio_em", hoje)
          .gte("fim_em", hoje)
          .order("created_at", { ascending: false });

        if (fallAnuncios && fallAnuncios.length > 0) {
          anunciosAtivos = fallAnuncios;
        }
      }
    }

    // 5. Filtrar por páginas de exibição escolhidas pelo anunciante / colunista
    if (tipoPagina && tipoPagina !== "todas") {
      const filtrados = anunciosAtivos.filter((a) => {
        const match = a.titulo.match(/\[paginas:(.*?)\]/);
        const configPag = match ? match[1] : "todas";
        if (configPag === "todas") return true;
        // Na Home geral do site (localhost:3000), exibe se configurado para home_portal, home_coluna ("Página Principal") ou todas
        if (tipoPagina === "home" && (configPag === "home_portal" || configPag === "home_coluna")) return true;
        // Na capa da coluna (/coluna/[slug]), exibe se configurado para home_coluna ou home_portal
        if (tipoPagina === "coluna" && (configPag === "home_coluna" || configPag === "home_portal")) return true;
        // Nas matérias (/materia/[slug]), exibe se configurado para artigos
        if (tipoPagina === "materia" && configPag === "artigos") return true;
        return false;
      });
      if (filtrados.length > 0) {
        anunciosAtivos = filtrados;
      }
    }

    // Limpar marcador interno do título
    const limpos = anunciosAtivos.map((a) => ({
      ...a,
      titulo: a.titulo.replace(/\[paginas:.*?\]/, "").trim(),
    }));

    const primeiroAnuncio = limpos[0] || null;

    return NextResponse.json({
      success: true,
      anuncio: primeiroAnuncio,
      anuncios: limpos,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao carregar anúncio do slot.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
