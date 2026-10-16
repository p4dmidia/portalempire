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

/**
 * Faz o download e parsing de um feed RSS ou Atom com timeout de 15 segundos e suporte a encoding.
 */
export async function parseFeedUrl(feedUrl: string): Promise<ParsedFeed> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(feedUrl, {
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
    if (xmlText.toLowerCase().includes("encoding=\"iso-8859-1\"") || xmlText.toLowerCase().includes("encoding='iso-8859-1'")) {
      xmlText = new TextDecoder("iso-8859-1").decode(buffer);
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
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Timeout de 15 segundos excedido ao carregar o feed RSS.");
    }
    throw error;
  }
}
