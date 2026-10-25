import { otimizarUrlImagem } from "@/lib/portal/image-utils";
import { limparEPadronizarTextoJornalistico } from "@/lib/portal/limpador-jornalistico";

/**
 * Módulo de Extração de Conteúdo e Imagem Original de Matérias
 * Faz o download da página original da notícia e extrai:
 * 1. O texto integral dos parágrafos, eliminando ruídos, anúncios e chamadas externas.
 * 2. A imagem editorial principal em alta resolução (og:image / twitter:image).
 */

export function extrairImagemMeta(html: string): string | null {
  if (!html) return null;

  // 1. og:image ou og:image:url
  const ogMatch =
    html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i);

  if (ogMatch && ogMatch[1]) {
    const raw = ogMatch[1].trim();
    if (!raw.includes("logo") && !raw.includes("favicon") && !raw.includes("fallbackImage")) {
      return otimizarUrlImagem(raw);
    }
  }

  // 2. twitter:image ou twitter:image:src
  const twitterMatch =
    html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i);

  if (twitterMatch && twitterMatch[1]) {
    const raw = twitterMatch[1].trim();
    if (!raw.includes("logo") && !raw.includes("favicon") && !raw.includes("fallbackImage")) {
      return otimizarUrlImagem(raw);
    }
  }

  // 3. link rel="image_src"
  const linkMatch = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
  if (linkMatch && linkMatch[1]) {
    return otimizarUrlImagem(linkMatch[1].trim());
  }

  return null;
}

export interface DetalhesMateriaOriginal {
  conteudoHtml: string | null;
  imagemUrl: string | null;
}

export async function extrairDetalhesMateriaOriginal(url: string): Promise<DetalhesMateriaOriginal> {
  if (!url || !url.startsWith("http")) {
    return { conteudoHtml: null, imagemUrl: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { conteudoHtml: null, imagemUrl: null };
    }

    const html = await response.text();
    if (!html || html.length < 500) {
      return { conteudoHtml: null, imagemUrl: null };
    }

    // Extrai imagem editorial principal de alta resolução
    const imagemUrl = extrairImagemMeta(html);

    // 1. Localizar o bloco principal do artigo
    let corpoHtml = html;

    // Procura por tags <article>
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch && articleMatch[1].length > 400) {
      corpoHtml = articleMatch[1];
    } else {
      // Procura por container principal de matérias comuns (G1, Folha, UOL, CNN)
      const mainMatch = html.match(
        /<(?:main|div)[^>]*(?:class|id)=["'][^"']*(?:content-text|post__content|news__body|entry-content|article-body|corpo-texto|materia-conteudo|story-body|article__body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:main|div)>/i
      );
      if (mainMatch && mainMatch[1].length > 400) {
        corpoHtml = mainMatch[1];
      } else {
        const genericMain = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        if (genericMain && genericMain[1].length > 400) {
          corpoHtml = genericMain[1];
        }
      }
    }

    // Limpar tags estruturais que não pertencem ao corpo da notícia
    corpoHtml = corpoHtml
      .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "")
      .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, "")
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");

    // 2. Extrair título da página original caso disponível para auxiliar na deduplicação
    const ogTitleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const tituloOriginal = ogTitleMatch ? ogTitleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // 3. Aplica limpeza, descarte de links de matérias recomendadas, deduplicação e padronização jornalística
    const htmlPadronizado = limparEPadronizarTextoJornalistico(corpoHtml, tituloOriginal);

    // Valida se o conteúdo obtido possui robustez mínima
    const totalParagrafos = (htmlPadronizado.match(/<p\b/gi) || []).length;
    if (totalParagrafos < 3 || htmlPadronizado.length < 350) {
      return { conteudoHtml: null, imagemUrl };
    }

    return { conteudoHtml: htmlPadronizado, imagemUrl };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[Extrator Conteúdo] Não foi possível extrair dados completos de ${url}:`, error);
    return { conteudoHtml: null, imagemUrl: null };
  }
}

/**
 * Função mantida para retrocompatibilidade
 */
export async function extrairConteudoCompleto(url: string): Promise<string | null> {
  const detalhes = await extrairDetalhesMateriaOriginal(url);
  return detalhes.conteudoHtml;
}
