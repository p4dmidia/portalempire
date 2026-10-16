import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseFeedUrl } from "@/lib/captacao/parser";
import { normalizarUrl, gerarHashUrl, limparResumo, extrairImagem } from "@/lib/captacao/normalizar";
import { classificarMateria } from "@/lib/captacao/classificar";

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);

    const body = await request.json();
    const { url_feed, veiculo = "Veículo", categoria_padrao_id, cidade_padrao_id } = body;

    if (!url_feed || typeof url_feed !== "string") {
      return NextResponse.json(
        { error: "URL do feed RSS é obrigatória." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const [cidadesRes, categoriasRes] = await Promise.all([
      supabase.from("cidades").select("id, nome, slug, palavras_chave"),
      supabase.from("categorias").select("id, nome, slug, pai_id, palavras_chave"),
    ]);

    const cidades = cidadesRes.data || [];
    const categorias = categoriasRes.data || [];

    // Faz o parse do feed com timeout de 15s
    const feed = await parseFeedUrl(url_feed);
    const primeiros5 = (feed.items || []).slice(0, 5);

    const itensPreview = primeiros5.map((item, index) => {
      const linkNormalizado = normalizarUrl(item.link || "");
      const hash = gerarHashUrl(linkNormalizado);
      const titulo = item.title?.trim() || "Sem título";
      const resumoBruto = item.contentSnippet || item.summary || item.description || "";
      const resumo = limparResumo(resumoBruto, 400);
      const imagemUrl = extrairImagem(item);

      const classificacao = classificarMateria({
        titulo,
        resumo,
        cidades,
        categorias,
        categoriaPadraoId: categoria_padrao_id || categorias[0]?.id || "",
        cidadePadraoId: cidade_padrao_id || null,
      });

      const catEncontrada = categorias.find((c) => c.id === classificacao.categoria_id);
      const cidEncontrada = cidades.find((c) => c.id === classificacao.cidade_id);

      return {
        id: `preview-${index}`,
        titulo,
        resumo,
        imagem_url: imagemUrl,
        imagem_credito: `Foto: ${veiculo}`,
        link_original: linkNormalizado,
        hash,
        pubDate: item.pubDate || new Date().toISOString(),
        categoria_nome: catEncontrada?.nome || "Padrão",
        cidade_nome: cidEncontrada?.nome || "Sem cidade",
        tags_sugeridas: classificacao.tags_sugeridas,
      };
    });

    return NextResponse.json({
      success: true,
      titulo_feed: feed.title || "Sem título",
      total_itens_no_feed: feed.items?.length || 0,
      itens_preview: itensPreview,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao testar feed RSS.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
