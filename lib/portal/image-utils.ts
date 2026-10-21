/**
 * Utilitários de Otimização e Tratamento de Imagens do Portal Empire
 * 
 * Resolve problemas de:
 * 1. Miniaturas em baixa resolução capturadas via feeds RSS (?w=200, ?fit=300, etc.)
 * 2. Bloqueio e descarte de ícones genéricos de agregadores (ex: logo do Google News lh3.googleusercontent.com)
 * 3. Catálogo contextual de imagens editoriais em alta resolução (1200px+) por tema/editoria
 * 4. Entidades HTML não decodificadas em URLs (&amp;)
 */

export const IMAGENS_EDITORIAIS_POR_TEMA: Record<string, string[]> = {
  agro: [
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200", // Campo agrícola ensolarado
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200", // Plantação de soja/milho
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200", // Trator e máquinas agrícolas
  ],
  economia: [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200", // Mercado financeiro e gráficos
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200", // Prédios corporativos e negócios
    "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200", // Reunião executiva e contratos
  ],
  cidades: [
    "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200", // Vista aérea urbana moderna
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200", // Centro da cidade movimentado
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1200", // Arquitetura urbana e praças
  ],
  politica: [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200", // Palácio do governo e parlamento
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", // Balança da justiça e direito
    "https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&q=80&w=1200", // Plenário e debates
  ],
  esportes: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200", // Estádio iluminado
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1200", // Campo de futebol
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=1200", // Ação esportiva
  ],
  saude: [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200", // Hospital e estetoscópio
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200", // Cuidados médicos e ciência
  ],
  tecnologia: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200", // Tecnologia e chips
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200", // Inteligência Artificial e dados
  ],
  geral: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200", // Jornal impresso e café
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200", // Sala de redação jornalística
  ],
};

export const IMAGEM_FALLBACK_PADRAO = IMAGENS_EDITORIAIS_POR_TEMA.geral[0];

/**
 * Retorna uma foto editorial contextual de alta resolução baseada no título ou editoria.
 */
export function obterImagemEditorialContextual(textoOuTema?: string): string {
  if (!textoOuTema) return IMAGEM_FALLBACK_PADRAO;
  const t = textoOuTema.toLowerCase();

  let lista: string[] = IMAGENS_EDITORIAIS_POR_TEMA.geral;

  if (t.includes("agro") || t.includes("soja") || t.includes("milho") || t.includes("safra") || t.includes("cafeicultura") || t.includes("pecuaria") || t.includes("campo")) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.agro;
  } else if (t.includes("econ") || t.includes("financ") || t.includes("mercado") || t.includes("dolar") || t.includes("juros") || t.includes("acao") || t.includes("recuperacao judicial") || t.includes("b2b")) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.economia;
  } else if (t.includes("polit") || t.includes("governo") || t.includes("prefeito") || t.includes("camara") || t.includes("stf") || t.includes("eleicao") || t.includes("justica") || t.includes("lei")) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.politica;
  } else if (t.includes("esport") || t.includes("futebol") || t.includes("gol") || t.includes("corinthians") || t.includes("palmeiras") || t.includes("flamengo") || t.includes("copa")) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.esportes;
  } else if (t.includes("saude") || t.includes("vacina") || t.includes("hospital") || t.includes("medico") || t.includes("dengue") || t.includes("doenca")) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.saude;
  } else if (t.includes("tec") || t.includes("ia ") || t.includes("inteligencia artificial") || t.includes("celular") || t.includes("software") || t.includes("chatgpt")) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.tecnologia;
  } else if (t.includes("cidade") || t.includes("maringa") || t.includes("uberlandia") || t.includes("assis") || t.includes("guarulhos") || t.includes("porto alegre") || t.includes("bairro") || t.includes("rua") || t.includes("obra")) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.cidades;
  }

  // Seleciona deterministicamente pelo tamanho do texto para dar variedade harmônica na página
  const index = Math.abs(textoOuTema.length) % lista.length;
  return lista[index];
}

/**
 * Limpa e otimiza a URL da imagem para garantir a máxima resolução e qualidade possíveis.
 * Rejeita ícones de agregadores (como o logo GE do Google News) e aplica fallback contextual.
 */
export function otimizarUrlImagem(url?: string | null, contexto?: string): string {
  if (!url || typeof url !== "string") {
    return obterImagemEditorialContextual(contexto);
  }

  let limpa = url.replace(/&amp;/g, "&").trim();

  // Rejeita placeholders genéricos, ícones do Google News e avatares
  if (
    limpa.includes("googleusercontent.com") ||
    limpa.includes("gstatic.com") ||
    limpa.includes("google.com/images") ||
    limpa.includes("news.google.com") ||
    limpa.includes("default-image") ||
    limpa.includes("placeholder") ||
    limpa.includes("fallbackImage") ||
    limpa.includes("logo-original") ||
    limpa.includes("avatar")
  ) {
    return obterImagemEditorialContextual(contexto);
  }

  if (!limpa.startsWith("http://") && !limpa.startsWith("https://") && !limpa.startsWith("/")) {
    return obterImagemEditorialContextual(contexto);
  }

  // 1. CNN Brasil: remove parâmetros de redimensionamento miniatura (?w=200, ?w=193&h=...)
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

  // 4. Amazon: substitui miniatura SL300/SL500 por SL1200
  if (limpa.includes("media-amazon.com")) {
    limpa = limpa.replace(/\._SL\d{2,3}_\./i, "._SL1200_.");
  }

  // 5. WordPress em geral: remove sufixos de miniatura pequena (-150x150, -300x200, -300x169)
  limpa = limpa.replace(/(-\d{2,3}x\d{2,3})(\.(jpe?g|png|webp|avif))/i, "$2");

  // 6. Remove parâmetros genéricos de thumbnail miniatura que forçam menos de 500px
  if (/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(?:&|$)/i.test(limpa)) {
    limpa = limpa.replace(/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(&|$)/i, "$1");
    limpa = limpa.replace(/[?&]$/, "");
  }

  return limpa || obterImagemEditorialContextual(contexto);
}
