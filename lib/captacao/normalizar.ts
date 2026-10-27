import crypto from "crypto";
import type { ParsedFeedItem } from "./parser";
import { otimizarUrlImagem } from "@/lib/portal/image-utils";

/**
 * Remove parâmetros de rastreamento (UTM, fbclid, gclid, etc.) e fragmentos (#) de uma URL.
 */
export function normalizarUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl.trim());
    // Parâmetros comuns de rastreamento a remover
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_id",
      "fbclid",
      "gclid",
      "gclsrc",
      "dclid",
      "zanpid",
      "msclkid",
      "mc_cid",
      "mc_eid",
      "igshid",
      "_hsenc",
      "_hsmi",
      "ref",
      "source",
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Remove hash/fragment
    parsed.hash = "";

    return parsed.toString();
  } catch {
    // Se não for URL absoluta válida, faz limpeza básica de string
    return rawUrl.split("#")[0].split("?")[0].trim();
  }
}

/**
 * Gera hash SHA-256 da URL normalizada para deduplicação no banco.
 */
export function gerarHashUrl(rawUrl: string): string {
  const normalizada = normalizarUrl(rawUrl);
  return crypto.createHash("sha256").update(normalizada).digest("hex");
}

/**
 * Limpa tags HTML, decodifica entidades básicas e trunca o resumo para ~400 caracteres sem quebrar palavras.
 */
export function limparResumo(htmlOrText?: string, maxChars = 400): string {
  if (!htmlOrText) return "";

  // Remove tags HTML
  let texto = htmlOrText
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Decodifica entidades HTML comuns
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
  };

  for (const [entity, replacement] of Object.entries(entities)) {
    texto = texto.split(entity).join(replacement);
  }

  // Substitui entidades numéricas básicas &#123;
  texto = texto.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));

  // Limpar espaços duplicados após decodificação
  texto = texto.replace(/\s+/g, " ").trim();

  if (texto.length <= maxChars) {
    return texto;
  }

  // Corta no limite e ajusta para o último espaço para não quebrar palavra
  const cortado = texto.slice(0, maxChars);
  const ultimoEspaco = cortado.lastIndexOf(" ");
  if (ultimoEspaco > maxChars * 0.7) {
    return cortado.slice(0, ultimoEspaco).trim() + "...";
  }

  return cortado.trim() + "...";
}

function isUrlImagemValida(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  let limpa = url.trim();
  if (limpa.includes(",")) {
    const partes = limpa.split(",").map((p) => p.trim().split(/\s+/)[0]).filter(Boolean);
    const valida = partes.find((p) => p.startsWith("http://") || p.startsWith("https://"));
    if (valida) limpa = valida;
    else return false;
  }
  const u = limpa.toLowerCase();
  if (
    u === "none" ||
    u === "null" ||
    u === "undefined" ||
    (!u.startsWith("http://") && !u.startsWith("https://")) ||
    u.includes("googleusercontent.com") ||
    u.includes("gstatic.com") ||
    u.includes("google.com/images") ||
    u.includes("news.google.com") ||
    u.includes("1x1") ||
    u.includes("pixel") ||
    u.includes("tracking") ||
    u.includes("beacon") ||
    u.includes("avatar") ||
    u.includes("gravatar") ||
    u.includes("placeholder") ||
    u.includes("fallbackimage")
  ) {
    return false;
  }
  return true;
}

/**
 * Extrai a melhor URL de imagem disponível no item do feed.
 * Ordem de prioridade:
 * 1. enclosure (se tipo for imagem ou extensão for de imagem)
 * 2. media:content (tag customizada do RSS)
 * 3. media:thumbnail
 * 4. Primeira tag <img> encontrada na description / content / contentEncoded (filtrando 'leia também')
 */
export function extrairImagem(item: ParsedFeedItem): string | null {
  // 1. Enclosure
  if (item.enclosure?.url && isUrlImagemValida(item.enclosure.url)) {
    const url = item.enclosure.url;
    const type = item.enclosure.type?.toLowerCase() || "";
    if (
      !type ||
      type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url) ||
      url.includes("/media/") ||
      url.includes("/imagem") ||
      url.includes("/foto") ||
      url.includes("/capa/")
    ) {
      return otimizarUrlImagem(url);
    }
  }

  // 2. media:content
  if (item["media:content"]?.$?.url && isUrlImagemValida(item["media:content"].$.url)) {
    return otimizarUrlImagem(item["media:content"].$.url);
  }

  // 3. media:thumbnail
  if (item["media:thumbnail"]?.$?.url && isUrlImagemValida(item["media:thumbnail"].$.url)) {
    return otimizarUrlImagem(item["media:thumbnail"].$.url);
  }

  // 4. Primeira imagem em description, content ou contentEncoded
  const fontesHtml = [
    item.content,
    (item as Record<string, unknown>).contentEncoded as string | undefined,
    item.description,
  ];

  for (const rawHtml of fontesHtml) {
    if (rawHtml && typeof rawHtml === "string") {
      // Remove blocos de "leia também", chamadas de posts relacionados (ex: CNN read-too, listas)
      const htmlSemRelacionados = rawHtml
        .replace(/<(?:li|div|aside|section)[^>]*(?:read-too|leia-tambem|veja-tambem|relacionad)[^>]*>[\s\S]*?<\/(?:li|div|aside|section)>/gi, "")
        .replace(/<picture[^>]*class=["'][^"']*read-too[^"']*["'][^>]*>[\s\S]*?<\/picture>/gi, "");

      const matches = [...htmlSemRelacionados.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
      for (const m of matches) {
        const tag = m[0];
        const src = m[1];
        if (!isUrlImagemValida(src) || tag.includes("read-too")) {
          continue;
        }

        const otimizada = otimizarUrlImagem(src);
        if (otimizada && isUrlImagemValida(otimizada)) {
          return otimizada;
        }
      }
    }
  }

  return null;
}
