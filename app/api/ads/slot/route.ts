import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const posicao = searchParams.get("posicao");
    const colunaId = searchParams.get("coluna_id");

    if (!posicao) {
      return NextResponse.json({ error: "Parâmetro 'posicao' é obrigatório." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const hoje = new Date().toISOString().slice(0, 10);

    // 1. Buscar o espaço correspondente à posição e coluna
    let queryEspaco = supabase
      .from("espacos_anuncio")
      .select(`
        id, nome, dono_tipo, coluna_id,
        formato:formatos_anuncio!inner(posicao, largura, altura, largura_mobile, altura_mobile)
      `)
      .eq("ativo", true)
      .eq("formato.posicao", posicao);

    if (colunaId) {
      queryEspaco = queryEspaco.eq("coluna_id", colunaId);
    } else {
      queryEspaco = queryEspaco.eq("dono_tipo", "plataforma");
    }

    const { data: espacos } = await queryEspaco;
    if (!espacos || espacos.length === 0) {
      return NextResponse.json({ success: true, anuncio: null });
    }

    const espacoIds = espacos.map((e) => e.id);

    // 2. Buscar anúncio ativo no período para esses espaços
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
      .limit(1);

    const anuncioAtivo = anuncios?.[0] || null;

    return NextResponse.json({
      success: true,
      anuncio: anuncioAtivo,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao carregar anúncio do slot.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
