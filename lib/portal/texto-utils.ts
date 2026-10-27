/**
 * Utilitários de manipulação de texto, decodificação de entidades HTML e resolução de domínio oficial.
 */

const MAPA_ENTIDADES_HTML: Record<string, string> = {
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
  "&bull;": "•",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&aacute;": "á",
  "&eacute;": "é",
  "&iacute;": "í",
  "&oacute;": "ó",
  "&uacute;": "ú",
  "&atilde;": "ã",
  "&otilde;": "õ",
  "&acirc;": "â",
  "&ecirc;": "ê",
  "&ocirc;": "ô",
  "&ccedil;": "ç",
  "&Aacute;": "Á",
  "&Eacute;": "É",
  "&Iacute;": "Í",
  "&Oacute;": "Ó",
  "&Uacute;": "Ú",
  "&Atilde;": "Ã",
  "&Otilde;": "Õ",
  "&Acirc;": "Â",
  "&Ecirc;": "Ê",
  "&Ocirc;": "Ô",
  "&Ccedil;": "Ç",
};

/**
 * Decodifica entidades HTML hexadecimais (ex: &#xFA; -> ú, &#xE1; -> á),
 * decimais (ex: &#250; -> ú) e nomeadas (ex: &quot;, &eacute;).
 */
export function decodificarEntidadesHtml(str?: string | null): string {
  if (!str || typeof str !== "string") return "";

  let res = str;

  // 1. Entidades hexadecimais (ex: &#xFA; ou &#XFA;)
  res = res.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => {
    try {
      const code = parseInt(hex, 16);
      return isNaN(code) ? _ : String.fromCodePoint(code);
    } catch {
      return _;
    }
  });

  // 2. Entidades numéricas decimais (ex: &#250;)
  res = res.replace(/&#([0-9]+);/g, (_, dec) => {
    try {
      const code = parseInt(dec, 10);
      return isNaN(code) ? _ : String.fromCodePoint(code);
    } catch {
      return _;
    }
  });

  // 3. Entidades nomeadas do HTML
  for (const [entity, char] of Object.entries(MAPA_ENTIDADES_HTML)) {
    if (res.includes(entity)) {
      res = res.split(entity).join(char);
    }
  }

  // 4. Limpeza de múltiplos espaços
  return res.replace(/\s+/g, " ").trim();
}

export const DOMINIO_OFICIAL_PADRAO = "https://www.empirecidades.com.br";

/**
 * Obtém a URL base canônica do site, substituindo quaisquer referências antigas a portalempire.
 */
export function obterSiteUrl(portalDominio?: string | null): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";

  // Se o env for vazio ou contiver o domínio antigo portalempire, corrige
  if (!url || url.includes("portalempire.com.br")) {
    if (portalDominio) {
      const dominioLimpo = portalDominio.trim().replace(/^https?:\/\//i, "");
      url = `https://${dominioLimpo}`;
    } else {
      url = DOMINIO_OFICIAL_PADRAO;
    }
  }

  // Substitui qualquer resquício antigo
  url = url.replace(/https?:\/\/(?:www\.)?portalempire\.com\.br/gi, DOMINIO_OFICIAL_PADRAO);

  return url.replace(/\/+$/, "");
}

/**
 * Normaliza uma URL para compartilhamento nas redes sociais (WhatsApp, X, Facebook).
 * Substitui qualquer resquício de portalempire pelo domínio oficial www.empirecidades.com.br.
 */
export function normalizarUrlCompartilhamento(rawUrl: string): string {
  if (!rawUrl) return DOMINIO_OFICIAL_PADRAO;

  let limpa = rawUrl.trim();

  // Substitui domínio antigo pelo oficial
  limpa = limpa
    .replace(/https?:\/\/(?:www\.)?portalempire\.com\.br/gi, DOMINIO_OFICIAL_PADRAO)
    .replace(/http:\/\/localhost:3000/gi, DOMINIO_OFICIAL_PADRAO);

  return limpa;
}
