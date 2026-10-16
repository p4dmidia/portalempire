import crypto from "crypto";
import type { ParsedFeedItem } from "./parser";

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

/**
 * Extrai a melhor URL de imagem disponível no item do feed.
 * Ordem de prioridade:
 * 1. enclosure (se tipo for imagem ou extensão for de imagem)
 * 2. media:content (tag customizada do RSS)
 * 3. media:thumbnail
 * 4. Primeira tag <img> encontrada na description / content / contentEncoded
 */
export function extrairImagem(item: ParsedFeedItem): string | null {
  // 1. Enclosure
  if (item.enclosure?.url) {
    const url = item.enclosure.url;
    const type = item.enclosure.type?.toLowerCase() || "";
    if (type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url)) {
      return url;
    }
  }

  // 2. media:content
  if (item["media:content"]?.$?.url) {
    return item["media:content"].$.url;
  }

  // 3. media:thumbnail
  if (item["media:thumbnail"]?.$?.url) {
    return item["media:thumbnail"].$.url;
  }

  // 4. Primeira imagem em description, content ou contentEncoded
  const fontesHtml = [
    item.content,
    (item as Record<string, unknown>).contentEncoded as string | undefined,
    item.description,
  ];

  for (const html of fontesHtml) {
    if (html && typeof html === "string") {
      const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        const src = match[1];
        // Ignora imagens de tracking/pixel de 1x1
        if (!src.includes("1x1") && !src.includes("tracking") && !src.includes("beacon")) {
          return src;
        }
      }
    }
  }

  return null;
}
