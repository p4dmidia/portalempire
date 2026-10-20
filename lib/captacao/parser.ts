import Parser from "rss-parser";

export interface ParsedFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  description?: string;
  enclosure?: {
    url?: string;
    type?: string;
    length?: string;
  };
  "media:content"?: {
    $?: {
      url?: string;
    };
  };
  "media:thumbnail"?: {
    $?: {
      url?: string;
    };
  };
}

export interface ParsedFeed {
  title?: string;
  description?: string;
  link?: string;
  items: ParsedFeedItem[];
}

const parser = new Parser<Record<string, unknown>, ParsedFeedItem>({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Portal Empire RSS Reader/1.0)",
    Accept:
      "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
  },
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["content:encoded", "contentEncoded"],
      ["dc:creator", "creator"],
    ],
  },
});

function isHtml(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype html") ||
    trimmed.startsWith("<html") ||
    (trimmed.includes("<head") && trimmed.includes("<body")) ||
    (!trimmed.includes("<rss") && !trimmed.includes("<feed") && !trimmed.includes("<channel"))
  );
}

async function fetchRawXml(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Portal Empire RSS Reader/1.0)",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    // Tratamento de encoding (UTF-8 com fallback para ISO-8859-1)
    let xmlText = new TextDecoder("utf-8").decode(buffer);
    if (
      xmlText.toLowerCase().includes('encoding="iso-8859-1"') ||
      xmlText.toLowerCase().includes("encoding='iso-8859-1'")
    ) {
      xmlText = new TextDecoder("iso-8859-1").decode(buffer);
    }

    return xmlText;
  } finally {
    clearTimeout(timeoutId);
  }
}

function scrapeNewsFromHtml(html: string, pageUrl: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const seenLinks = new Set<string>();

  // Regex para capturar tags <a> que apontam para notícias (relativas ou absolutas)
  const aRegex =
    /<a[^>]+href=["']((?:https?:\/\/[^"']+|)\/(?:noticia|noticias|materia|materias|post|posts|artigo|artigos|conteudo|cidades|politica|policia|economia|cultura|esporte|geral|brasil|mundo|\d{4}\/\d{2})\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = aRegex.exec(html)) !== null && items.length < 30) {
    const rawHref = match[1];
    const innerHtml = match[2];

    try {
      const fullUrl = new URL(rawHref, pageUrl).toString();
      if (seenLinks.has(fullUrl)) continue;
      seenLinks.add(fullUrl);

      // 1. Tenta extrair título: Primeiro de <h1..h6>, depois de <img alt="...">, por fim de texto limpo
      let titulo = "";
      const hMatch = innerHtml.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
      if (hMatch && hMatch[1]) {
        titulo = hMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }

      const imgMatch =
        innerHtml.match(/<img[^>]+src=["']([^"']+)["']/i) ||
        innerHtml.match(/<img[^>]+data-src=["']([^"']+)["']/i);

      if (!titulo && imgMatch) {
        const altMatch = innerHtml.match(/<img[^>]+alt=["']([^"']+)["']/i);
        if (altMatch && altMatch[1] && altMatch[1].length > 15) {
          titulo = altMatch[1].trim();
        }
      }

      if (!titulo) {
        const rawText = innerHtml
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (rawText.length > 20) {
          titulo = rawText;
        }
      }

      if (!titulo || titulo.length < 10) continue;

      // 2. Extrai imagem se houver
      let imgUrl: string | undefined = undefined;
      if (imgMatch && imgMatch[1]) {
        try {
          imgUrl = new URL(imgMatch[1], pageUrl).toString();
        } catch {}
      }

      // 3. Extrai resumo/lead se houver tag <p> dentro do card
      let resumo = titulo;
      const pMatch = innerHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (pMatch && pMatch[1]) {
        const pText = pMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (pText.length > 20 && pText !== titulo) {
          resumo = pText;
        }
      }

      items.push({
        title: titulo,
        link: fullUrl,
        pubDate: new Date().toISOString(),
        summary: resumo,
        contentSnippet: resumo,
        enclosure: imgUrl ? { url: imgUrl, type: "image/jpeg" } : undefined,
        "media:content": imgUrl ? { $: { url: imgUrl } } : undefined,
      });
    } catch {}
  }

  return items;
}

/**
 * Faz o download e parsing de um feed RSS ou Atom com timeout de 15 segundos,
 * autodescoberta inteligente de feed RSS e fallback para extração HTML de portais modernos.
 */
export async function parseFeedUrl(feedUrl: string): Promise<ParsedFeed> {
  let targetUrl = feedUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  let xmlText = "";
  try {
    xmlText = await fetchRawXml(targetUrl);
  } catch (err) {
    // Se a URL digitada continha /rss.xml, /feed, etc. e deu 404/erro, tenta a raiz do domínio
    try {
      const parsedUrl = new URL(targetUrl);
      if (parsedUrl.pathname !== "/" && parsedUrl.pathname !== "") {
        const rootUrl = parsedUrl.origin;
        console.log(`[Fallback Raiz] Falha em ${targetUrl}, tentando raiz: ${rootUrl}`);
        xmlText = await fetchRawXml(rootUrl);
        targetUrl = rootUrl;
      } else {
        throw err;
      }
    } catch {
      throw err;
    }
  }

  try {
    // Se o retorno for uma página HTML (ex: o usuário colou a URL principal do site em vez do link direto do RSS)
    if (isHtml(xmlText)) {
      // 1. Tenta extrair a tag <link rel="alternate" type="application/rss+xml"> do HTML
      const match =
        xmlText.match(/<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/i) ||
        xmlText.match(/<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/(?:rss|atom)\+xml["']/i);

      const candidatos: string[] = [];
      if (match && match[1]) {
        try {
          candidatos.push(new URL(match[1], targetUrl).toString());
        } catch {}
      }

      // 2. Testa os sufixos padrão mais comuns de feeds de notícias (/rss.xml, /feed, /feed/, /rss) em paralelo
      const baseUrl = targetUrl.replace(/\/+$/, "");
      const sufixosPadrao = [`${baseUrl}/rss.xml`, `${baseUrl}/feed`, `${baseUrl}/feed/`, `${baseUrl}/rss`];
      for (const s of sufixosPadrao) {
        if (!candidatos.includes(s)) candidatos.push(s);
      }

      const resultadosCandidatos = await Promise.allSettled(
        candidatos
          .filter((cand) => cand !== targetUrl)
          .map(async (cand) => {
            const candXml = await fetchRawXml(cand, 5000);
            if (!isHtml(candXml)) {
              const parsed = await parser.parseString(candXml);
              if (parsed && parsed.items && parsed.items.length > 0) {
                return { parsed, url: cand };
              }
            }
            throw new Error("Não é feed");
          })
      );

      const feedEncontradoResult = resultadosCandidatos.find(
        (r): r is PromiseFulfilledResult<{ parsed: any; url: string }> => r.status === "fulfilled"
      );

      if (feedEncontradoResult) {
        const feedEncontrado = feedEncontradoResult.value.parsed;
        console.log(`[Auto-Discovery RSS] Feed localizado com sucesso em: ${feedEncontradoResult.value.url}`);
        const rawItems = feedEncontrado.items || [];
        rawItems.sort((a: any, b: any) => {
          const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
          const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
          return timeB - timeA;
        });

        return {
          title: feedEncontrado.title,
          description: feedEncontrado.description,
          link: feedEncontrado.link || targetUrl,
          items: rawItems,
        };
      }

      // 3. Fallback inteligente: se o site não possuir feed XML nativo (portais Next.js/HTML como Gazeta de Alphaville),
      // faz a extração estruturada de matérias diretamente do HTML
      const itensHtml = scrapeNewsFromHtml(xmlText, targetUrl);
      if (itensHtml.length > 0) {
        console.log(`[HTML Scraper] ${itensHtml.length} notícias captadas da página HTML de: ${targetUrl}`);
        const titleMatch = xmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const siteTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "Portal de Notícias";

        return {
          title: siteTitle,
          description: `Notícias captadas do portal ${targetUrl}`,
          link: targetUrl,
          items: itensHtml,
        };
      }

      throw new Error(
        `A URL informada ("${targetUrl}") é uma página web sem feed RSS público detectado. Tente adicionar uma seção específica ou o link direto do feed RSS.`
      );
    }

    const feed = await parser.parseString(xmlText);
    const rawItems = feed.items || [];

    // Ordenar itens do feed pelas mais recentes primeiro (data mais nova no topo)
    rawItems.sort((a, b) => {
      const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return timeB - timeA;
    });

    return {
      title: feed.title,
      description: feed.description,
      link: feed.link,
      items: rawItems,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Timeout de 15 segundos excedido ao carregar o feed RSS.");
    }

    // Se houve erro de XML (ex: Attribute without value em HTML não detectado), tenta o HTML Scraper de resgate
    if (
      xmlText &&
      error instanceof Error &&
      (error.message.includes("Attribute without value") || error.message.includes("Non-whitespace before first tag"))
    ) {
      const itensResgate = scrapeNewsFromHtml(xmlText, targetUrl);
      if (itensResgate.length > 0) {
        console.log(`[HTML Scraper Resgate] ${itensResgate.length} notícias captadas após erro de XML: ${targetUrl}`);
        const titleMatch = xmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const siteTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "Portal de Notícias";
        return {
          title: siteTitle,
          description: `Notícias captadas do portal ${targetUrl}`,
          link: targetUrl,
          items: itensResgate,
        };
      }
    }

    throw error;
  }
}
