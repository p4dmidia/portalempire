/**
 * Módulo para cálculo determinístico de visualizações realistas do portal.
 * 
 * Regras de visualização:
 * 1. Ao invés de sair do zero, as notícias iniciam na faixa de 50 mil a 80 mil views:
 *    - Notícias mais procuradas (Política, Esportes, Economia, Negócios, Cidades, Brasil, Governo, Urgente): começam em 80 mil views.
 *    - Notícias gerais / intermediárias (Saúde, Educação, Tecnologia, Agronegócio, Empreendedorismo, Turismo, etc.): começam em 65 mil views.
 *    - Notícias menos procuradas / nicho (Meio Ambiente, Cultura, Beleza, Estética, Entretenimento): começam em 50 mil views.
 * 2. As visualizações crescem aos poucos com o tempo e os acessos (a cada bloco de 15 minutos e com a maturidade da matéria).
 * 3. Teto máximo: escala progressivamente até alcançar até 500 mil views (500.000).
 * 4. Determinismo: para o mesmo id/slug e no mesmo bloco de tempo, retorna sempre o mesmo valor exato.
 */

// Categorias por nível de atratividade e volume de buscas
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

export const TETO_MAXIMO_VIEWS = 500000;

/**
 * Gera um hash numérico pseudo-aleatório determinístico a partir de uma string (UUID ou slug).
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Converte para inteiro de 32 bits
  }
  return Math.abs(hash);
}

export interface MateriaParaViews {
  id?: string;
  slug?: string;
  titulo?: string;
  urgente?: boolean | null;
  categoria?: { slug?: string } | null;
  publicado_em?: string | null;
  created_at?: string | null;
  visualizacoes?: number | null;
}

/**
 * Calcula a quantidade de visualizações de forma realista, progressiva e determinística.
 * Faixa: 50.000 / 80.000 até 500.000 views.
 */
export function calcularVisualizacoesRealistas(
  materia: MateriaParaViews,
  dataReferencia: Date = new Date()
): number {
  const seedString = materia.slug || materia.id || materia.titulo || "empire-cidades-news";
  const seed = hashString(seedString);

  // 1. Identificar categoria e definir o piso inicial (50k a 80k)
  const categoriaSlug = (materia.categoria?.slug || "").toLowerCase();
  const ehUrgente = Boolean(materia.urgente);

  let pisoInicial = 65000; // Notícias gerais (Saúde, Educação, Tecnologia, etc.)
  let variacaoPiso = seed % 3500; // 65.000 a 68.499
  let potencial24h = 45000; // ganho ao longo das primeiras 24h
  let taxaPor15Min = 5 + (seed % 4); // 5 a 8 views por bloco de 15 min após 24h

  if (ehUrgente || TEMAS_ALTA_BUSCA.has(categoriaSlug)) {
    // Notícia mais procurada: começa em 80 mil views
    pisoInicial = 80000;
    variacaoPiso = seed % 3800; // 80.000 a 83.799
    potencial24h = 65000;
    taxaPor15Min = 8 + (seed % 5); // 8 a 12 views por bloco de 15 min após 24h
  } else if (TEMAS_NICHO_BUSCA.has(categoriaSlug)) {
    // Notícia menos procurada: começa em 50 mil views
    pisoInicial = 50000;
    variacaoPiso = seed % 2900; // 50.000 a 52.899
    potencial24h = 28000;
    taxaPor15Min = 3 + (seed % 3); // 3 a 5 views por bloco de 15 min após 24h
  }

  const baseInicial = pisoInicial + variacaoPiso;

  // 2. Tempo decorrido desde a publicação
  const dataPublicacaoStr = materia.publicado_em || materia.created_at;
  const dataPublicacao = dataPublicacaoStr ? new Date(dataPublicacaoStr) : dataReferencia;

  const diffMs = dataReferencia.getTime() - dataPublicacao.getTime();
  const minutosDecorridos = Math.max(0, Math.floor(diffMs / (60 * 1000)));

  // 3. Crescimento gradual a partir do piso inicial
  const MINUTOS_24H = 1440;
  let ganhoProgressivo = 0;

  if (minutosDecorridos < MINUTOS_24H) {
    // Primeiras 24h: cresce aos poucos a partir do piso inicial
    // Curva que acelera no ciclo diário
    const progresso = Math.pow(minutosDecorridos / MINUTOS_24H, 0.85);
    const viewsDuranteCurva = Math.floor(potencial24h * progresso);

    // Micro-variação determinística a cada 15 minutos dentro das 24h
    const blocos15MinIniciais = Math.floor(minutosDecorridos / 15);
    const jitter = (seed + blocos15MinIniciais * 11) % 43;

    ganhoProgressivo = viewsDuranteCurva + jitter;
  } else {
    // Matéria madura (> 24 horas): consolida o ganho das 24h e continua subindo aos poucos
    const minutosApos24h = minutosDecorridos - MINUTOS_24H;
    const blocosApos24h = Math.floor(minutosApos24h / 15);
    const incrementoBlocos = blocosApos24h * taxaPor15Min;

    // Fator de maturidade progressivo que faz matérias antigas alcançarem até 500k
    const diasDecorridos = minutosDecorridos / (24 * 60);
    const fatorMaturidade = Math.min(3.2, 1 + Math.log10(1 + diasDecorridos / 5));

    ganhoProgressivo = Math.floor((potencial24h + incrementoBlocos) * fatorMaturidade);
  }

  // 4. Total calculado respeitando o teto de 500 mil views
  let visualizacoesEstimadas = baseInicial + ganhoProgressivo;
  visualizacoesEstimadas = Math.min(TETO_MAXIMO_VIEWS, visualizacoesEstimadas);

  // Se o banco tiver um número real superior (até o limite de 500k), preserva
  const viewsDoBanco = Number(materia.visualizacoes) || 0;
  const finalViews = Math.max(viewsDoBanco, visualizacoesEstimadas);

  return Math.min(TETO_MAXIMO_VIEWS, finalViews);
}

/**
 * Formata o número de visualizações em padrão brasileiro legível.
 * Ex: 81240 -> "81.240" | 500000 -> "500.000"
 */
export function formatarVisualizacoes(views: number): string {
  return views.toLocaleString("pt-BR");
}
