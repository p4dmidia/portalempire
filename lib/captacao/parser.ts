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

/**
 * Faz o download e parsing de um feed RSS ou Atom com timeout de 15 segundos,
 * autodescoberta inteligente caso o usuário forneça a URL base do site e tratamento de encoding.
 */
export async function parseFeedUrl(feedUrl: string): Promise<ParsedFeed> {
  try {
    let xmlText = await fetchRawXml(feedUrl);

    // Se o retorno for uma página HTML (ex: o usuário colou a URL principal do site em vez do link direto do RSS)
    if (isHtml(xmlText)) {
      // 1. Tenta extrair a tag <link rel="alternate" type="application/rss+xml"> do HTML
      const match =
        xmlText.match(/<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/i) ||
        xmlText.match(/<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/(?:rss|atom)\+xml["']/i);

      const candidatos: string[] = [];
      if (match && match[1]) {
        try {
          candidatos.push(new URL(match[1], feedUrl).toString());
        } catch {}
      }

      // 2. Testa os sufixos padrão mais comuns de feeds de notícias (/rss.xml, /feed, /feed/, /rss)
      const baseUrl = feedUrl.replace(/\/+$/, "");
      candidatos.push(`${baseUrl}/rss.xml`, `${baseUrl}/feed`, `${baseUrl}/feed/`, `${baseUrl}/rss`);

      let feedEncontrado: any = null;
      for (const cand of candidatos) {
        if (cand === feedUrl) continue;
        try {
          const candXml = await fetchRawXml(cand, 8000);
          if (!isHtml(candXml)) {
            feedEncontrado = await parser.parseString(candXml);
            if (feedEncontrado && feedEncontrado.items) {
              console.log(`[Auto-Discovery RSS] Feed localizado com sucesso em: ${cand}`);
              break;
            }
          }
        } catch {}
      }

      if (feedEncontrado) {
        const rawItems = feedEncontrado.items || [];
        rawItems.sort((a: any, b: any) => {
          const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
          const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
          return timeB - timeA;
        });

        return {
          title: feedEncontrado.title,
          description: feedEncontrado.description,
          link: feedEncontrado.link || feedUrl,
          items: rawItems,
        };
      }

      throw new Error(
        `A URL informada ("${feedUrl}") é uma página de site (HTML) e não um feed RSS válido. Tente adicionar o sufixo do feed (ex: ${baseUrl}/rss.xml ou ${baseUrl}/feed).`
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
    // Tratamento amigável para erro do parser SAX em HTML com atributos sem valor
    if (error instanceof Error && error.message.includes("Attribute without value")) {
      const baseUrl = feedUrl.replace(/\/+$/, "");
      throw new Error(
        `A URL fornecida não é um arquivo XML/RSS direto (é uma página web HTML). Para este portal, utilize a URL do feed: ${baseUrl}/rss.xml`
      );
    }
    throw error;
  }
}
