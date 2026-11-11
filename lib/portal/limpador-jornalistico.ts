/**
 * Módulo de Padronização, Limpeza Editorial e Redação Jornalística Profissional
 *
 * Responsável por:
 * 1. Eliminar ruídos de scraping (anúncios, canais de WhatsApp, links internos, menus vazados).
 * 2. Deduplicação estrita de parágrafos e frases repetidas.
 * 3. Expansão de matérias curtas em reportagens completas, ricas e bem articuladas.
 * 4. Formatação de parágrafos com tipografia premium (Lead de destaque + parágrafos estruturados).
 */

// Lista de termos e padrões de ruído para remoção de parágrafos inteiros
const TERMOS_DESCARTE_PARAGRAFO = [
  "resumo gerado por ferramenta de ia",
  "sem resultado veja todos os resultados",
  "veja todos os resultados",
  "página inicial",
  "todos os direitos reservados",
  "clique aqui para se inscrever",
  "termos de uso",
  "política de privacidade",
  "inscreva-se na nossa newsletter",
  "baixe o app",
  "ouça o podcast",
  "publicidade",
  "assine a folha",
  "assine o estadão",
  "assine o globo",
  "faça uma denúncia ou sugira uma reportagem",
  "receba notícias de",
  "receba notícias do",
  "receba notícias no seu whatsapp",
  "fique por dentro do que acontece",
  "leia a notícia completa",
  "conteúdo sob responsabilidade",
  "leia mais em:",
  "leia mais no",
  "veja mais no",
  "confira no",
];

// Veículos externos para substituição editorial em favor da redação do Empire Cidades
const REGEX_VEICULOS_EXTERNOS = [
  /(?:Segundo|De acordo com|Conforme apurou|Conforme apurado pelo?|Conforme divulgado pelo?)\s+(?:o\s+|a\s+)?(?:G1|g1|UOL|Folha|CNN|CNN Brasil|Estadão|O Globo|R7|Metrópoles|Terra|InfoMoney|Valor Econômico|Reuters|Agência Brasil|Globo Esporte|GE|ge\.globo|CARAS|CARAS Brasil)/gi,
  /(?:ao|à|no|na)\s+(?:G1|g1|UOL|Folha|CNN|Estadão|O Globo|R7|Metrópoles|Terra|InfoMoney|ge\.globo|CARAS|CARAS Brasil)/gi,
];

/**
 * Substitui sistematicamente menções de veículos concorrentes (G1, UOL, CARAS, etc.)
 * pela identidade editorial do Portal Empire Cidades.
 */
export function substituirFontesPorEmpire(texto: string): string {
  if (!texto) return "";
  let resultado = texto;

  // 1. Citações e declarações ("Ao g1, fulano disse..." -> "Ao Portal Empire Cidades, fulano disse...")
  resultado = resultado.replace(
    /(?:ao|à|no|na)\s+(?:g1|uol|folha(?:\s+de\s+s(?:ão|\.)\s*paulo)?|cnn(?:\s+brasil)?|estad[aã]o|o globo|metr[oó]poles|r7|terra|infomoney|caras(?:\s+brasil)?|ge\.globo|globo esporte)\b/gi,
    "ao Portal Empire Cidades"
  );

  // 2. Reportagem / apuração ("Segundo o G1...", "Conforme apurou o G1...")
  resultado = resultado.replace(
    /(?:segundo|de acordo com|conforme apurou|conforme apurado pel[oa]|conforme divulgado pel[oa])\s+(?:o\s+|a\s+)?(?:g1|uol|folha(?:\s+de\s+s(?:ão|\.)\s*paulo)?|cnn(?:\s+brasil)?|estad[aã]o|o globo|metr[oó]poles|r7|terra|infomoney|caras(?:\s+brasil)?|ge\.globo|globo esporte|ag[eê]ncia brasil|reuters)\b/gi,
    "conforme apuração da equipe de reportagem do Portal Empire Cidades"
  );

  // 3. Rodapés e créditos de publicação ("O post X apareceu primeiro em CARAS Brasil", "Fonte: G1")
  resultado = resultado.replace(
    /o\s+post\s+.*?apareceu\s+primeiro\s+em\s+[\w\s.]+/gi,
    "Reportagem veiculada pela equipe de jornalismo do Portal Empire Cidades."
  );
  resultado = resultado.replace(
    /(?:fonte|cr[eé]dito|ve[ií]culo|reportagem):\s*(?:g1|uol|folha|cnn(?:\s+brasil)?|estad[aã]o|o globo|metr[oó]poles|r7|terra|caras(?:\s+brasil)?)/gi,
    "Fonte: Portal Empire Cidades"
  );
  resultado = resultado.replace(
    /(?:por|pelo|pela)\s+(?:g1|metr[oó]poles|r7|uol|folha|cnn)\s+[^–—:\n]{0,40}[–—:]/gi,
    "Redação Portal Empire Cidades:"
  );

  // 4. Sufixos de título ou cabeçalho ("Matéria X | G1", "Matéria Y - CARAS Brasil")
  resultado = resultado.replace(
    /\s*([|–—-])\s*(?:g1|uol|folha(?:\s+de\s+s(?:ão|\.)\s*paulo)?|cnn(?:\s+brasil)?|estad[aã]o|o globo|metr[oó]poles|r7|caras(?:\s+brasil)?|terra|infomoney|ag[eê]ncia brasil)[^–—|.\n]*$/gi,
    ""
  );

  // 5. Menções isoladas de marcas concorrentes no texto
  resultado = resultado.replace(/\b(?:G1|CARAS Brasil|Revista CARAS)\b/g, "Portal Empire Cidades");

  return resultado;
}

/**
 * Normaliza um texto para comparação de duplicidade (ignora caixa, acentos e pontuação).
 */
function normalizarTextoParaComparacao(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Calcula a similaridade entre duas strings usando contagem de palavras únicas (coeficiente de Jaccard).
 */
function calcularSimilaridade(t1: string, t2: string): number {
  const norm1 = normalizarTextoParaComparacao(t1);
  const norm2 = normalizarTextoParaComparacao(t2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0;

  // Se uma estiver totalmente contida na outra e tiver tamanho relevante
  if ((norm1.includes(norm2) || norm2.includes(norm1)) && Math.min(norm1.length, norm2.length) > 30) {
    return 0.95;
  }

  const palavras1 = new Set(t1.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const palavras2 = new Set(t2.toLowerCase().split(/\s+/).filter((w) => w.length > 3));

  if (palavras1.size === 0 || palavras2.size === 0) return 0;

  let intersec = 0;
  for (const w of palavras1) {
    if (palavras2.has(w)) intersec++;
  }

  const uniao = new Set([...palavras1, ...palavras2]).size;
  return uniao > 0 ? intersec / uniao : 0;
}

/**
 * Remove links de WhatsApp/Redes Sociais preservando o restante do parágrafo
 */
function limparLinksEPromocoes(conteudoHtml: string): string {
  let resultado = conteudoHtml;

  // 1. Remove tags <a> que sejam canais de WhatsApp, redes ou inscrições
  resultado = resultado.replace(
    /<a\b[^>]*>(?:Entre|Acesse|Siga|Participe|Receba|Inscreva-se)?[^<]*(?:whatsapp|telegram|instagram|twitter|facebook|app|newsletter|comunidade|canal)[^<]*<\/a>\s*/gi,
    " "
  );

  // 2. Se for texto puro sem tags, remove chamadas de canais completas incluindo nomes e UFs
  resultado = resultado.replace(
    /(?:Entre|Acesse|Siga|Participe|Receba|Inscreva-se)\s+[^.!?\n]*?(?:whatsapp|telegram|instagram|twitter|facebook|app|newsletter|comunidade)[^.!?\n]*?(?:SP|DF|RJ|MG|RS|PR|SC|BA|PE|CE|GO|Brasil)?(?:\.|\s*—|\s*-\s*|\s*:\s*|(?=\s+(?:Além\s+disso|Segundo|Conforme|De\s+acordo|O\s|A\s|Os\s|As\s|Em\s|No\s|Na\s|Para\s|Com\s)))/gi,
    " "
  );

  // 3. Remove créditos de foto no início de parágrafos (ex: "Reprodução São Paulo – ", "(Fotos: TVGlobo, Reprodução)")
  resultado = resultado.replace(
    /^\s*(?:Reprodução|Foto|Fotos|Crédito|Imagem|Divulgação|Arquivo|Agência\s+[\w\s]+)[^–—:\n]{0,80}[–—:]\s*/gi,
    ""
  );
  resultado = resultado.replace(/\((?:Fotos?|Crédito|Imagem|Divulgação|Reprodução)[^)]*\)/gi, " ");

  // 4. Remove menções de data/seção no início de parágrafo (ex: "24/10/2026 Notícias ...")
  resultado = resultado.replace(
    /^\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s+(?:Notícias|Gerais|Política|Economia|Cidades|Esportes|Brasil|Mundo|Região)?\s*/gi,
    ""
  );

  // 5. Remove chamadas de encerramento de matéria
  resultado = resultado.replace(/Siga o perfil d[oe] [\w\s]+ no Instagram\s*\.?/gi, " ");
  resultado = resultado.replace(/Basta acessar o canal de notícias d[oe] [\w\s]+ no WhatsApp\s*\.?/gi, " ");

  return resultado;
}

/**
 * Limpa um parágrafo individual removendo ruídos de scraping e propagandas.
 */
function limparParagrafo(paragrafoRaw: string): string {
  // Limpa links promocionais primeiro mantendo o restante
  const semPromocoes = limparLinksEPromocoes(paragrafoRaw);

  let texto = semPromocoes
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\s+/g, " ")
    .trim();

  // Substitui menções nominais de concorrentes por redação neutra
  for (const regex of REGEX_VEICULOS_EXTERNOS) {
    texto = texto.replace(regex, "conforme apuração dos redatores da Empire Cidades");
  }

  // Remove prefixos residuais de veículos no início do parágrafo (ex: "Do Metrópoles SP Além disso, ...")
  texto = texto.replace(
    /^(?:[Dd]o|[Dd]a|[Nn]o|[Nn]a|[Pp]elo|[Pp]ela)?\s*(?:Metrópoles|G1|UOL|Folha|CNN|Estadão|O Globo|R7|Terra|InfoMoney)[^.\n]{0,35}?(?:SP|DF|RJ|MG|RS|BA|Brasil)?\s*(?:—|-|:|,|\s+)/gi,
    ""
  ).trim();

  // Remove sigla residual solta no início gerada por corte
  texto = texto.replace(/^(?:SP|DF|RJ|MG|RS|PR|SC|BA|PE|CE|GO|Brasil)\s+/i, "");

  // Limpa pontuações estranhas no início geradas por cortes
  texto = texto
    .replace(/^[\s,;:.–—-]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Remove espaços espúrios antes de pontuação (ex: "São Paulo ." -> "São Paulo.", "SP ," -> "SP,")
  texto = texto.replace(/\s+([,.:;!?])/g, "$1");

  // Garante inicial maiúscula se começou com minúscula após remoção de prefixos
  if (texto.length > 0) {
    texto = texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  // Aplica substituição completa de fontes e concorrentes por Portal Empire Cidades
  texto = substituirFontesPorEmpire(texto);

  return texto;
}

/**
 * Função principal: processa, limpa, deduplica e padroniza o conteúdo HTML de uma matéria real.
 * Não inventa fatos nem gera parágrafos fictícios; preserva estritamente o conteúdo jornalístico.
 */
export function limparEPadronizarTextoJornalistico(
  conteudoHtmlOuTexto: string | null | undefined,
  titulo: string,
  cidadeNome?: string
): string {
  if (!conteudoHtmlOuTexto || conteudoHtmlOuTexto.trim().length < 50) {
    return "";
  }

  // 1. Extrai todos os blocos de texto (seja por <p> tags ou quebras de linha)
  let blocosBrutos: string[] = [];
  if (conteudoHtmlOuTexto.includes("<p")) {
    const matches = [...conteudoHtmlOuTexto.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    blocosBrutos = matches.map((m) => m[1]);
  } else {
    blocosBrutos = conteudoHtmlOuTexto.split(/\n{2,}/);
  }

  const normTitulo = normalizarTextoParaComparacao(titulo);
  const paragrafosLimpos: string[] = [];
  const vistosSet = new Set<string>();

  for (const bloco of blocosBrutos) {
    // Se o bloco original continha APENAS uma tag <a>, é com certeza um link de matéria relacionada
    const somenteLinkMatch = bloco.trim().match(/^<a\b[^>]*>([\s\S]*?)<\/a>$/i);
    if (somenteLinkMatch) {
      continue; // Descarte imediato de links recomendados / caixas de "leia também"
    }

    const textoLimpo = limparParagrafo(bloco);

    // Descarte por tamanho mínimo (frases menores que 45 caracteres costumam ser legendas, cabeçalhos ou links)
    if (textoLimpo.length < 45) continue;

    // Descarte por termos de propaganda / ruído
    const textoMin = textoLimpo.toLowerCase();
    const contemDescarte = TERMOS_DESCARTE_PARAGRAFO.some((termo) => textoMin.includes(termo));
    if (contemDescarte) continue;

    // Descarte se for idêntico ao título da matéria
    const norm = normalizarTextoParaComparacao(textoLimpo);
    if (norm === normTitulo || (normTitulo.includes(norm) && norm.length < 120)) {
      continue;
    }

    // Descarte de títulos soltos sem pontuação conclusiva (ex: "Trem da Linha 15-Prata derruba guindaste...")
    const terminaComPontuacao = /[.!?…”"]$/.test(textoLimpo);
    if (!terminaComPontuacao && textoLimpo.length < 130) {
      continue;
    }

    // Deduplicação estrita: verifica se já temos parágrafo igual ou quase igual (> 75% similaridade)
    let ehDuplicado = false;
    for (const visto of vistosSet) {
      if (calcularSimilaridade(textoLimpo, visto) > 0.75) {
        ehDuplicado = true;
        break;
      }
    }

    if (!ehDuplicado) {
      vistosSet.add(textoLimpo);
      paragrafosLimpos.push(textoLimpo);
    }
  }

  // 2. Se a matéria não tem substância mínima real (menos de 2 parágrafos ou menos de 200 caracteres),
  // retorna vazio para não publicar matéria oca ou inventar texto.
  const textoTotal = paragrafosLimpos.join(" ");
  if (paragrafosLimpos.length < 2 || textoTotal.length < 200) {
    return "";
  }

  return formatarParagrafosHtml(paragrafosLimpos);
}

/**
 * Converte um array de parágrafos em HTML estilizado conforme a identidade do portal.
 */
function formatarParagrafosHtml(paragrafos: string[]): string {
  const corpo = paragrafos
    .map((p, index) => {
      if (index === 0) {
        return `<p class="lead text-xl font-medium leading-relaxed text-slate-900 dark:text-slate-100 mb-6">${p}</p>`;
      }
      return `<p class="mb-5 leading-relaxed text-slate-800 dark:text-slate-200 text-base md:text-lg">${p}</p>`;
    })
    .join("\n");

  const rodapeFonte = `<p class="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-500">Fonte: Portal Empire Cidades</p>`;

  return `${corpo}\n${rodapeFonte}`;
}
