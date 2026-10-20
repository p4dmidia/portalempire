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

/**
 * Faz download de URL com suporte a User-Agent moderno e retry automático
 * com headers de crawler social (facebookexternalhit / WhatsApp) caso o WAF bloqueie (403/401).
 */
async function fetchRawXml(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Portal Empire RSS Reader/1.0)",
    Accept:
      "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, application/xhtml+xml;q=0.9, */*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  try {
    let response = await fetch(url, {
      signal: controller.signal,
      headers: defaultHeaders,
    });

    // Se receber 403 Forbidden ou 401 Unauthorized (bloqueio de Cloudflare/WAF em requests normais),
    // tenta como crawler social que a maioria dos portais libera para exibição de cards/previews
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
        } else if (fbResponse.status === 403) {
          const waResponse = await fetch(url, {
            signal: controller.signal,
            headers: {
              ...defaultHeaders,
              "User-Agent": "WhatsApp/2.21.12.21 A",
            },
          });
          if (waResponse.ok) {
            response = waResponse;
          }
        }
      } catch {}
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    // Tratamento de encoding (UTF-8 com fallback para ISO-8859-1 / Windows-1252)
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

function scrapeNewsFromHtml(html: string, pageUrl: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const seenLinks = new Set<string>();

  let hostPagina = "";
  try {
    hostPagina = new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    return items;
  }

  // Regex para capturar tags <a> com href e conteúdo interno
  const aRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = aRegex.exec(html)) !== null && items.length < 30) {
    const rawHref = match[1].trim();
    const innerHtml = match[2];

    // Ignora links vazios, âncoras, javascript, redes sociais e seções utilitárias
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("javascript:") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      /whatsapp|facebook|twitter|x\.com|instagram|youtube|linkedin|tiktok|pinterest|google\.com/i.test(rawHref) ||
      /\/(?:tag|tags|author|autor|categoria|category|sobre|quem-somos|contato|fale-conosco|anuncie|publicidade|privacidade|termos|login|cadastro|assine|feed|rss|search|busca)\b/i.test(
        rawHref
      ) ||
      /\.(?:pdf|zip|mp3|mp4|css|js|json|xml|ico|svg|png|jpg|jpeg|webp)$/i.test(rawHref)
    ) {
      continue;
    }

    try {
      const fullUrl = new URL(rawHref, pageUrl).toString();
      const hostLink = new URL(fullUrl).hostname.replace(/^www\./, "");

      // Deve pertencer ao mesmo domínio da página
      if (!hostLink.endsWith(hostPagina) && !hostPagina.endsWith(hostLink)) {
        continue;
      }

      const parsedUrl = new URL(fullUrl);
      const pathname = parsedUrl.pathname;
      if (pathname === "/" || pathname === "" || pathname.length < 4) continue;
      if (seenLinks.has(fullUrl)) continue;

      // 1. Extração do título da matéria
      let titulo = "";

      // a) Tag de cabeçalho <h1..h6>
      const hMatch = innerHtml.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
      if (hMatch && hMatch[1]) {
        titulo = hMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }

      // b) Alt da imagem do card de notícia
      const imgMatch =
        innerHtml.match(/<img[^>]+src=["']([^"']+)["']/i) ||
        innerHtml.match(/<img[^>]+data-src=["']([^"']+)["']/i) ||
        innerHtml.match(/<img[^>]+data-default-src=["']([^"']+)["']/i) ||
        innerHtml.match(/<img[^>]+data-lazy-src=["']([^"']+)["']/i);

      if (!titulo && imgMatch) {
        const altMatch = innerHtml.match(/<img[^>]+alt=["']([^"']+)["']/i);
        if (altMatch && altMatch[1] && altMatch[1].trim().length > 18) {
          titulo = altMatch[1].replace(/\s+/g, " ").trim();
        }
      }

      // c) Texto interno limpo
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

      // d) Atributo title da tag <a>
      if (!titulo) {
        const aTitleMatch = match[0].match(/<a[^>]+title=["']([^"']+)["']/i);
        if (aTitleMatch && aTitleMatch[1] && aTitleMatch[1].trim().length > 18) {
          titulo = aTitleMatch[1].replace(/\s+/g, " ").trim();
        }
      }

      if (!titulo || titulo.length < 15) continue;

      // Validação do padrão de link de notícia:
      // - Contém termos de editoria/seção no path OU
      // - Contém slug com hífen (padrão WordPress / CMS moderno) com pelo menos 8 caracteres no segmento final OU
      // - Termina com .html/.htm OU
      // - Possui parâmetro numérico (id=123)
      const hasNewsPrefix =
        /(?:noticia|noticias|materia|materias|post|posts|artigo|artigos|conteudo|cidades|politica|policia|economia|cultura|esporte|esportes|futebol|geral|brasil|mundo|turismo|prisma|agro|\d{4}\/\d{2})/i.test(
          pathname
        );
      const segments = pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1] || "";
      const hasHyphenSlug = (pathname.match(/-/g) || []).length >= 1 && lastSegment.length >= 8;
      const endsWithHtml = /\.html?$/i.test(pathname);
      const hasIdParam = /[?&]id=\d+/i.test(parsedUrl.search);

      if (!hasNewsPrefix && !hasHyphenSlug && !endsWithHtml && !hasIdParam) {
        continue;
      }

      seenLinks.add(fullUrl);

      // 2. Extração de imagem de capa
      let imgUrl: string | undefined = undefined;
      if (imgMatch && imgMatch[1]) {
        try {
          imgUrl = new URL(imgMatch[1], pageUrl).toString();
        } catch {}
      }

      // 3. Extração de resumo/lead se houver tag <p> dentro do card
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
 * Faz o download e parsing de um feed RSS ou Atom com timeout,
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
    // Se a URL digitada deu erro (403/404), tenta os caminhos padrões de RSS da raiz em paralelo antes de desistir
    try {
      const parsedUrl = new URL(targetUrl);
      const origin = parsedUrl.origin;
      const candidatosFallback = [
        `${origin}/feed`,
        `${origin}/feed/`,
        `${origin}/rss`,
        `${origin}/rss.xml`,
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
        console.log(`[Fallback Feed] Feed encontrado em: ${achouFallback.value.url}`);
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

      // Se a URL tinha pathname (ex: /noticias) e falhou, tenta a raiz do site como HTML
      if (parsedUrl.pathname !== "/" && parsedUrl.pathname !== "") {
        console.log(`[Fallback Raiz] Tentando página inicial: ${origin}`);
        xmlText = await fetchRawXml(origin);
        targetUrl = origin;
      } else {
        throw err;
      }
    } catch {
      throw err;
    }
  }

  try {
    // Se o retorno for uma página HTML (ex: portal sem feed RSS direto ou Next.js)
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

      // 2. Testa os sufixos padrão mais comuns de feeds de notícias (/feed, /feed/, /rss.xml, /rss) em paralelo
      const baseUrl = targetUrl.replace(/\/+$/, "");
      const sufixosPadrao = [`${baseUrl}/feed`, `${baseUrl}/feed/`, `${baseUrl}/rss.xml`, `${baseUrl}/rss`];
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

      // 3. Fallback inteligente: se o site não possuir feed XML nativo (portais Next.js/HTML como Gazeta de Alphaville, Cotia Agora, etc.),
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
        `A URL informada ("${targetUrl}") é uma página web sem feed RSS público detectado e sem matérias reconhecidas.`
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
