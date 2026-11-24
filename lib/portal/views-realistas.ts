/**
 * Módulo para cálculo determinístico de visualizações em tempo real do ecossistema Empire Cidades.
 * Calibrado para uma audiência consolidada de mais de 30 milhões de visualizações/mês (~1 milhão/dia).
 * 
 * Princípios de Engenharia:
 * 1. Zero sobrecarga no banco de dados e no servidor:
 *    - O valor é computado matematicamente em tempo de execução através de funções determinísticas
 *      baseadas no timestamp contínuo (segundo a segundo) e no hash único do conteúdo.
 * 2. Atualização Dinâmica Contínua (Estilo YouTube):
 *    - Cada vez que o leitor atualiza a página (F5) ou acessa minutos depois, o número avança
 *      proporcionalmente ao tempo decorrido (ex: 100.000 -> 100.345 após 10 minutos).
 * 3. Estritamente Monotônico:
 *    - O número NUNCA diminui conforme o tempo passa. Sempre cresce para a frente.
 * 4. Determinismo Global:
 *    - Qualquer pessoa no mundo que carregar a página no mesmo segundo receberá exatamente
 *      o mesmo número inteiro, garantindo consistência absoluta entre diferentes usuários.
 * 5. Calibragem de Grande Porte (+30 Milhões/mês):
 *    - Notícias e artigos variam entre 85.000 e 850.000+ views, condizentes com um ecossistema
 *      multimídia de alta penetração.
 */

const TEMAS_ALTA_BUSCA = new Set([
  "politica",
  "esportes",
  "esporte",
  "futebol",
  "negocios",
  "economia",
  "cidades",
  "brasil",
  "governo",
  "policia",
  "seguranca",
  "urgente",
]);

const TEMAS_NICHO_BUSCA = new Set([
  "meio-ambiente",
  "cultura",
  "entretenimento",
  "beleza",
  "estetica",
  "moda",
  "bem-estar",
]);

export const TETO_MAXIMO_VIEWS_MATERIA = 1500000;
export const TETO_MAXIMO_VIEWS_COLUNA = 5000000;

/**
 * Gera um hash numérico pseudo-aleatório determinístico a partir de uma string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface MateriaParaViews {
  id?: string;
  slug?: string;
  titulo?: string;
  urgente?: boolean | null;
  destaque?: boolean | null;
  categoria?: { slug?: string } | null;
  categoria_id?: string | null;
  publicado_em?: string | null;
  created_at?: string | null;
  visualizacoes?: number | null;
  coluna_id?: string | null;
  coluna?: { slug?: string } | null;
  autor_id?: string | null;
  origem?: string | null;
}

export interface ColunaParaViews {
  id?: string;
  slug?: string;
  nome?: string;
  created_at?: string | null;
  visualizacoes?: number | null;
}

/**
 * Calcula a quantidade de visualizações de forma contínua, realista, altamente diversificada e determinística por segundo.
 */
export function calcularVisualizacoesRealistas(
  materia: MateriaParaViews,
  dataReferencia: Date = new Date()
): number {
  const seedString = materia.slug || materia.id || materia.titulo || "empire-news";
  const seed = hashString(seedString);

  const categoriaSlug = (materia.categoria?.slug || "").toLowerCase();
  const ehUrgente = Boolean(materia.urgente || materia.destaque || categoriaSlug === "urgente");
  const ehArtigoColuna = Boolean(
    materia.coluna_id ||
    materia.coluna ||
    categoriaSlug === "colunistas" ||
    categoriaSlug === "opiniao" ||
    categoriaSlug === "cronicas" ||
    materia.origem === "autoral"
  );
  const ehCidades = categoriaSlug === "cidades" || categoriaSlug.startsWith("cidade-");
  const ehNicho = TEMAS_NICHO_BUSCA.has(categoriaSlug);
  const ehAltaBusca = TEMAS_ALTA_BUSCA.has(categoriaSlug);

  // 1. Fator de Repercussão / Viralidade Orgânica com Ampla Distribuição
  // Evita que os números fiquem todos parecidos, criando uma curva realista
  const tierVariacao = seed % 100;
  let multiplicadorTier = 1.0;
  if (tierVariacao < 6) {
    // 6% Viral / Mega Destaque
    multiplicadorTier = 2.4 + ((seed % 1200) / 1000); // 2.4x a 3.6x
  } else if (tierVariacao < 25) {
    // 19% Alta repercussão
    multiplicadorTier = 1.4 + ((seed % 600) / 1000); // 1.4x a 2.0x
  } else if (tierVariacao < 72) {
    // 47% Média / Padrão estável
    multiplicadorTier = 0.75 + ((seed % 450) / 1000); // 0.75x a 1.2x
  } else {
    // 28% Leitura de nicho / alcance concentrado
    multiplicadorTier = 0.35 + ((seed % 300) / 1000); // 0.35x a 0.65x
  }

  // 2. Definição da base de audiência conforme a categoria e formato
  let basePiso = 45000;
  let amplitude = 40000;
  let taxaBasePorSegundo = 0.08 + ((seed % 1000) / 10000);

  if (ehArtigoColuna) {
    // Artigos Autorais de Colunistas: Faixa crível e atrativa (3.200 a 48.000+)
    basePiso = 6500;
    amplitude = 18000;
    taxaBasePorSegundo = 0.015 + ((seed % 300) / 10000);
  } else if (ehUrgente) {
    // Urgência e Manchetes de Destaque Nacional
    basePiso = 140000;
    amplitude = 220000;
    taxaBasePorSegundo = 0.25 + ((seed % 2000) / 10000);
  } else if (ehAltaBusca) {
    // Política, Economia, Esportes, Negócios
    basePiso = 68000;
    amplitude = 95000;
    taxaBasePorSegundo = 0.12 + ((seed % 1500) / 10000);
  } else if (ehCidades) {
    // Notícias Regionais e Municipais
    basePiso = 18000;
    amplitude = 42000;
    taxaBasePorSegundo = 0.04 + ((seed % 600) / 10000);
  } else if (ehNicho) {
    // Cultura, Gastronomia, Moda, Beleza, Meio Ambiente
    basePiso = 12000;
    amplitude = 26000;
    taxaBasePorSegundo = 0.025 + ((seed % 400) / 10000);
  }

  // Jitter orgânico (garante dígitos finais naturais e não redondos)
  const jitter = (seed % 797) + ((seed * 13) % 199);
  const baseCalculada = Math.round((basePiso + (seed % amplitude) + jitter) * multiplicadorTier);

  // 3. Tempo decorrido desde a publicação
  const dataPublicacaoStr = materia.publicado_em || materia.created_at;
  const dataPublicacao = dataPublicacaoStr
    ? new Date(dataPublicacaoStr)
    : new Date("2026-10-01T00:00:00Z");

  const diffMs = Math.max(0, dataReferencia.getTime() - dataPublicacao.getTime());
  const segundosDecorridos = Math.floor(diffMs / 1000);

  const viewsDoBanco = Number(materia.visualizacoes) || 0;

  // 4. Curva de maturação temporal realista e estritamente monotônica
  const SEGUNDOS_24H = 86400;
  const SEGUNDOS_72H = 259200;
  let ganhoTempo = 0;

  if (segundosDecorridos < SEGUNDOS_24H) {
    // Matérias muito recentes (< 24h): iniciam com fração proporcional e crescem hora a hora
    const fatorTempo = Math.pow(segundosDecorridos / SEGUNDOS_24H, 0.7);
    const baseInicial = Math.round(baseCalculada * (0.35 + 0.65 * fatorTempo));
    const ganhoContinuo = Math.floor(segundosDecorridos * taxaBasePorSegundo);
    return Math.max(viewsDoBanco, baseInicial + ganhoContinuo);
  } else if (segundosDecorridos < SEGUNDOS_72H) {
    // 24h a 72h: consolidação com ritmo constante
    const ganho24h = Math.floor(SEGUNDOS_24H * taxaBasePorSegundo);
    const segundosExtras = segundosDecorridos - SEGUNDOS_24H;
    ganhoTempo = ganho24h + Math.floor(segundosExtras * (taxaBasePorSegundo * 0.65));
  } else {
    // Acima de 72h: crescimento contínuo de cauda longa (buscas, compartilhamentos)
    const ganho72h = Math.floor(SEGUNDOS_72H * taxaBasePorSegundo * 0.75);
    const segundosApos72h = segundosDecorridos - SEGUNDOS_72H;
    const diasDecorridos = segundosDecorridos / 86400;
    const fatorEscala = Math.min(2.2, 1 + Math.log10(1 + diasDecorridos / 10));
    ganhoTempo = Math.floor((ganho72h + segundosApos72h * (taxaBasePorSegundo * 0.12)) * fatorEscala);
  }

  let totalCalculado = baseCalculada + ganhoTempo;
  totalCalculado = Math.min(TETO_MAXIMO_VIEWS_MATERIA, totalCalculado);

  const finalViews = Math.max(viewsDoBanco, totalCalculado);
  return Math.min(TETO_MAXIMO_VIEWS_MATERIA, finalViews);
}

/**
 * Calcula a quantidade de visualizações acumuladas para uma coluna em tempo real.
 * Proporcional ao número de artigos publicados pelo colunista e tráfego da coluna.
 */
export function calcularVisualizacoesColuna(
  coluna: ColunaParaViews,
  totalArtigos: number = 1,
  dataReferencia: Date = new Date()
): number {
  const seedString = coluna.slug || coluna.id || coluna.nome || "coluna-empire";
  const seed = hashString(seedString);

  // Audiência da coluna coerente com os artigos publicados
  // Coluna com 1 artigo: ~12.000 a 35.000
  // Coluna com 5 artigos: ~45.000 a 110.000
  // Coluna com 15+ artigos: ~120.000 a 320.000
  const artigosEfetivos = Math.max(1, totalArtigos);
  const basePiso = 9500 + (seed % 14000); // 9.500 a 23.500 de base da coluna
  const ganhoPorArtigo = Math.min(artigosEfetivos, 50) * (4200 + (seed % 3800)); // ~4.2k a 8k por artigo

  const dataCriacaoStr = coluna.created_at;
  const dataCriacao = dataCriacaoStr
    ? new Date(dataCriacaoStr)
    : new Date("2026-10-01T00:00:00Z");

  const diffMs = Math.max(0, dataReferencia.getTime() - dataCriacao.getTime());
  const segundosDecorridos = Math.floor(diffMs / 1000);

  // Taxa de crescimento contínuo da coluna
  const taxaPorSegundo = 0.04 + ((seed % 500) / 10000);
  const ganhoTempo = Math.floor(segundosDecorridos * taxaPorSegundo * 0.25);

  let total = basePiso + ganhoPorArtigo + ganhoTempo;
  return Math.min(TETO_MAXIMO_VIEWS_COLUNA, total);
}

/**
 * Formata o número de visualizações no padrão brasileiro legível.
 * Ex: 100345 -> "100.345" | 1250400 -> "1.250.400"
 */
export function formatarVisualizacoes(views: number): string {
  return views.toLocaleString("pt-BR");
}
