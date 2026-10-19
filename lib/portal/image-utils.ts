/**
 * Utilitários de Otimização e Tratamento de Imagens do Portal Empire
 * 
 * Resolve problemas comuns de:
 * 1. Miniaturas em baixa resolução capturadas via feeds RSS (?w=200, ?fit=300, etc.)
 * 2. Entidades HTML não decodificadas em URLs (&amp;)
 * 3. Sufixos de miniaturas de CMS (-150x150, -300x200)
 * 4. URLs relativas ou ausentes (fallback elegante)
 */

export const IMAGEM_FALLBACK_PADRAO =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200";

/**
 * Limpa e otimiza a URL da imagem para garantir a máxima resolução e qualidade possíveis.
 */
export function otimizarUrlImagem(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return IMAGEM_FALLBACK_PADRAO;
  }

  let limpa = url.replace(/&amp;/g, "&").trim();

  if (!limpa.startsWith("http://") && !limpa.startsWith("https://") && !limpa.startsWith("/")) {
    return IMAGEM_FALLBACK_PADRAO;
  }

  // 1. CNN Brasil: remove parâmetros de redimensionamento miniatura (?w=200, ?w=193&h=...)
  // A URL base no admin da CNN entrega a imagem original em resolução total (1890px, 1200px, etc.)
  if (limpa.includes("cnnbrasil.com.br")) {
    limpa = limpa.replace(/\?w=\d+.*$/i, "");
    limpa = limpa.replace(/\?.*(crop|quality|resize)=.*$/i, "");
  }

  // 2. InfoMoney: remove ?fit=300%2C200&quality=70... para entregar a foto original de alta resolução
  if (limpa.includes("infomoney.com.br")) {
    limpa = limpa.replace(/\?fit=\d+%2C\d+.*$/i, "");
    limpa = limpa.replace(/\?.*quality=\d+.*$/i, "");
  }

  // 3. Imagens da Globo/G1: se tiver thumbnail de largura baixa (ex: /300x0/ ou /200x0/), atualiza para 1200x0
  if (limpa.includes("glbimg.com")) {
    limpa = limpa.replace(/\/\d{2,3}x\d{0,4}\//i, "/1200x0/");
  }

  // 4. Amazon (usado por portais de tech/deals): substitui miniatura SL300/SL500 por SL1200
  if (limpa.includes("media-amazon.com")) {
    limpa = limpa.replace(/\._SL\d{2,3}_\./i, "._SL1200_.");
  }

  // 5. WordPress em geral: remove sufixos de miniatura pequena (-150x150, -300x200, -300x169)
  // Mantém resoluções médias/altas como -1024x... ou -1280x...
  limpa = limpa.replace(/(-\d{2,3}x\d{2,3})(\.(jpe?g|png|webp|avif))/i, "$2");

  // 6. Remove parâmetros genéricos de thumbnail miniatura que forçam menos de 500px
  if (/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(?:&|$)/i.test(limpa)) {
    limpa = limpa.replace(/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(&|$)/i, "$1");
    // Se sobrou '?' ou '&' solto no final
    limpa = limpa.replace(/[?&]$/, "");
  }

  return limpa || IMAGEM_FALLBACK_PADRAO;
}
