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
  publicado_em?: string | null;
  created_at?: string | null;
  visualizacoes?: number | null;
}

export interface ColunaParaViews {
  id?: string;
  slug?: string;
  nome?: string;
  created_at?: string | null;
  visualizacoes?: number | null;
}

/**
 * Calcula a quantidade de visualizações de forma contínua, realista e determinística por segundo.
 */
export function calcularVisualizacoesRealistas(
  materia: MateriaParaViews,
  dataReferencia: Date = new Date()
): number {
  const seedString = materia.slug || materia.id || materia.titulo || "empire-news";
  const seed = hashString(seedString);

  const categoriaSlug = (materia.categoria?.slug || "").toLowerCase();
  const ehUrgente = Boolean(materia.urgente || materia.destaque);

  // 1. Definição do Piso Inicial Condizente com o Ecossistema de 30 Milhões/Mês
  let pisoInicial = 125000; // Notícias gerais (Tecnologia, Saúde, Educação, Agronegócio, etc.)
  let variacaoPiso = seed % 35000; // 125.000 a 160.000
  let taxaBasePorSegundo = 0.2831 + ((seed % 2500) / 10000); // ~0.28 a 0.53 views/segundo (~170 a 320 views a cada 10 min)

  if (ehUrgente || TEMAS_ALTA_BUSCA.has(categoriaSlug)) {
    // Matérias de altíssima tração (Política, Economia, Urgente, Destaque)
    pisoInicial = 195000;
    variacaoPiso = seed % 55000; // 195.000 a 250.000
    taxaBasePorSegundo = 0.4217 + ((seed % 3500) / 10000); // ~0.42 a 0.77 views/segundo (~250 a 460 views a cada 10 min)
  } else if (TEMAS_NICHO_BUSCA.has(categoriaSlug)) {
    // Matérias de nicho e reflexão
    pisoInicial = 85000;
    variacaoPiso = seed % 28000; // 85.000 a 113.000
    taxaBasePorSegundo = 0.1843 + ((seed % 2000) / 10000); // ~0.18 a 0.38 views/segundo (~110 a 230 views a cada 10 min)
  }

  const baseInicial = pisoInicial + variacaoPiso;

  // 2. Tempo decorrido em segundos desde a publicação
  const dataPublicacaoStr = materia.publicado_em || materia.created_at;
  const dataPublicacao = dataPublicacaoStr
    ? new Date(dataPublicacaoStr)
    : new Date("2026-10-01T00:00:00Z"); // data fixa de referência do portal se não informada

  const diffMs = Math.max(0, dataReferencia.getTime() - dataPublicacao.getTime());
  const segundosDecorridos = Math.floor(diffMs / 1000);

  // 3. Crescimento contínuo e estritamente monotônico por segundo
  const SEGUNDOS_48H = 172800; // 48 horas
  let ganhoTempo = 0;

  if (segundosDecorridos <= SEGUNDOS_48H) {
    // Primeiras 48 horas: pico de consumo contínuo segundo a segundo
    ganhoTempo = Math.floor(segundosDecorridos * taxaBasePorSegundo);
  } else {
    // Matéria consolidada (> 48h): ganho das primeiras 48h + taxa contínua amortecida
    const ganho48h = Math.floor(SEGUNDOS_48H * taxaBasePorSegundo);
    const segundosApos48h = segundosDecorridos - SEGUNDOS_48H;
    const taxaAmortecida = taxaBasePorSegundo * 0.18; // busca orgânica contínua
    
    // Curva logarítmica para matérias com dias/semanas de histórico
    const diasDecorridos = segundosDecorridos / 86400;
    const fatorEscala = Math.min(2.8, 1 + Math.log10(1 + diasDecorridos / 7));
    
    ganhoTempo = Math.floor((ganho48h + (segundosApos48h * taxaAmortecida)) * fatorEscala);
  }

  let totalCalculado = baseInicial + ganhoTempo;
  totalCalculado = Math.min(TETO_MAXIMO_VIEWS_MATERIA, totalCalculado);

  // Se o banco tiver um valor maior já registrado, preserva
  const viewsDoBanco = Number(materia.visualizacoes) || 0;
  const finalViews = Math.max(viewsDoBanco, totalCalculado);

  return Math.min(TETO_MAXIMO_VIEWS_MATERIA, finalViews);
}

/**
 * Calcula a quantidade de visualizações acumuladas para uma coluna em tempo real.
 */
export function calcularVisualizacoesColuna(
  coluna: ColunaParaViews,
  totalArtigos: number = 1,
  dataReferencia: Date = new Date()
): number {
  const seedString = coluna.slug || coluna.id || coluna.nome || "coluna-empire";
  const seed = hashString(seedString);

  // Piso inicial robusto para colunista oficial
  const basePiso = 480000 + (seed % 280000); // 480.000 a 760.000
  const bonusPorArtigo = Math.min(totalArtigos, 50) * 42000; // valorização da produção do colunista

  const dataCriacaoStr = coluna.created_at;
  const dataCriacao = dataCriacaoStr
    ? new Date(dataCriacaoStr)
    : new Date("2026-10-01T00:00:00Z"); // data fixa de referência do portal se não informada

  const diffMs = Math.max(0, dataReferencia.getTime() - dataCriacao.getTime());
  const segundosDecorridos = Math.floor(diffMs / 1000);

  // Taxa contínua de visualizações da coluna (~0.52 a 0.88 views por segundo)
  const taxaPorSegundo = 0.5213 + ((seed % 3600) / 10000);
  const ganhoTempo = Math.floor(segundosDecorridos * taxaPorSegundo * 0.45);

  let total = basePiso + bonusPorArtigo + ganhoTempo;
  return Math.min(TETO_MAXIMO_VIEWS_COLUNA, total);
}

/**
 * Formata o número de visualizações no padrão brasileiro legível.
 * Ex: 100345 -> "100.345" | 1250400 -> "1.250.400"
 */
export function formatarVisualizacoes(views: number): string {
  return views.toLocaleString("pt-BR");
}
