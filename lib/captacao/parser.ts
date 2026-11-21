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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Portal Empire RSS Reader/1.0)",
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

export function isTituloValido(titulo: string | undefined | null): boolean {
  if (!titulo) return false;
  const texto = titulo.trim();
  if (texto.length < 25) return false;

  const palavras = texto.split(/\s+/).filter(Boolean);
  if (palavras.length < 4) return false;

  const norm = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  const termosProibidos = new Set([
    "economia",
    "esportes",
    "cultura",
    "concursos",
    "cidades",
    "geral",
    "politica",
    "policial",
    "home",
    "inicio",
    "opiniao",
    "artigos",
    "noticias",
    "brasil",
    "mundo",
    "saude",
    "educacao",
    "futebol",
    "tecnologia",
    "videos",
    "fotos",
    "fique por dentro",
    "em destaque",
    "entenda",
    "ultimas noticias",
    "pagina inicial",
    "todas as materias",
    "ver mais",
    "leia mais",
    "classificados",
    "revistas",
    "contato",
    "sobre nos",
    "anuncie",
  ]);

  if (termosProibidos.has(norm)) return false;

  return true;
}

function isHtml(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype html") ||
    trimmed.startsWith("<html") ||
    (trimmed.includes("<head") && trimmed.includes("<body")) ||
    (!trimmed.includes("<rss") && !trimmed.includes("<feed") && !trimmed.includes("<channel"))
  );
}

/**
 * Faz download de URL com suporte a User-Agent moderno e headers de crawler caso necessário.
 */
async function fetchRawXml(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Portal Empire RSS Reader/1.0)",
    Accept:
      "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  try {
    let response = await fetch(url, {
      signal: controller.signal,
      headers: defaultHeaders,
    });

    if (response.status === 403 || response.status === 401) {
      try {
        const fbResponse = await fetch(url, {
          signal: controller.signal,
          headers: {
            ...defaultHeaders,
            "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          },
        });
        if (fbResponse.ok) {
          response = fbResponse;
        }
      } catch {}
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    let xmlText = new TextDecoder("utf-8").decode(buffer);
    if (
      xmlText.toLowerCase().includes('encoding="iso-8859-1"') ||
      xmlText.toLowerCase().includes("encoding='iso-8859-1'") ||
      xmlText.toLowerCase().includes('charset="iso-8859-1"') ||
      xmlText.toLowerCase().includes("charset=iso-8859-1")
    ) {
      xmlText = new TextDecoder("iso-8859-1").decode(buffer);
    }

    return xmlText;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Faz o download e parsing estrito de um feed RSS ou Atom com timeout,
 * utilizando SOMENTE dados nativos do feed XML (sem scraping de HTML).
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
    // Se a URL digitada falhou diretamente, tenta caminhos padrões de RSS da raiz antes de desistir
    const parsedUrl = new URL(targetUrl);
    const origin = parsedUrl.origin;
    const candidatosFallback = [
      `${origin}/feed`,
      `${origin}/rss.xml`,
      `${origin}/feed/`,
      `${origin}/rss`,
    ];

    const resultadosFallback = await Promise.allSettled(
      candidatosFallback
        .filter((cand) => cand !== targetUrl)
        .map(async (cand) => {
          const candXml = await fetchRawXml(cand, 6000);
          if (!isHtml(candXml)) {
            const parsed = await parser.parseString(candXml);
            if (parsed && parsed.items && parsed.items.length > 0) {
              return { parsed, url: cand };
            }
          }
          throw new Error("Não é feed");
        })
    );

    const achouFallback = resultadosFallback.find(
      (r): r is PromiseFulfilledResult<{ parsed: any; url: string }> => r.status === "fulfilled"
    );

    if (achouFallback) {
      const feedItems = achouFallback.value.parsed.items || [];
      feedItems.sort((a: any, b: any) => {
        const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return timeB - timeA;
      });

      return {
        title: achouFallback.value.parsed.title,
        description: achouFallback.value.parsed.description,
        link: achouFallback.value.parsed.link || achouFallback.value.url,
        items: feedItems,
      };
    }

    throw err;
  }

  // Se o retorno for uma página HTML (e não XML)
  if (isHtml(xmlText)) {
    // Tenta autodescoberta apenas se houver tag <link rel="alternate" type="application/rss+xml">
    const match =
      xmlText.match(/<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/i) ||
      xmlText.match(/<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/(?:rss|atom)\+xml["']/i);

    if (match && match[1]) {
      try {
        const feedRealUrl = new URL(match[1], targetUrl).toString();
        const candXml = await fetchRawXml(feedRealUrl, 8000);
        if (!isHtml(candXml)) {
          const parsed = await parser.parseString(candXml);
          if (parsed && parsed.items && parsed.items.length > 0) {
            const rawItems = parsed.items;
            rawItems.sort((a, b) => {
              const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
              const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
              return timeB - timeA;
            });
            return {
              title: parsed.title,
              description: parsed.description,
              link: parsed.link || feedRealUrl,
              items: rawItems,
            };
          }
        }
      } catch {}
    }

    throw new Error(
      `A URL informada ("${targetUrl}") retornou HTML e não possui feed RSS/Atom válido.`
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
}
