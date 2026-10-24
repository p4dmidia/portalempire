/**
 * Módulo para cálculo determinístico de visualizações fake realistas.
 * 
 * Regras do portal (baseado em ~100 mil visitas mensais):
 * 1. Notícia recém-postada começa com 0 visualizações e sobre gradualmente nas primeiras 24 horas.
 * 2. Pisos de relevância consolidados (após o ciclo inicial de 24h):
 *    - Temas mais buscados (Política, Esportes, Negócios, Economia, Cidades, Brasil): acima de 20.000 views.
 *    - Temas gerais (Saúde, Educação, Agronegócio, Empreendedorismo, Turismo, Gastronomia, etc.): mínimo de 10.000 views.
 *    - Temas menos pesquisados / nicho (Meio Ambiente, Cultura, Beleza, Estética): acima de 3.000 views.
 * 3. Crescimento contínuo a cada bloco de 15 minutos.
 * 4. Fator de crescimento da base de 5% ao mês.
 * 5. Determinismo: para o mesmo id/slug e no mesmo intervalo de 15 min, retorna sempre o mesmo número.
 */

// Categorias por nível de atratividade e busca
const TEMAS_ALTA_BUSCA = new Set([
  "politica",
  "esportes",
  "esporte",
  "negocios",
  "economia",
  "cidades",
  "brasil",
  "governo",
]);

const TEMAS_NICHO_BUSCA = new Set([
  "meio-ambiente",
  "cultura",
  "entretenimento",
  "beleza",
  "estetica",
]);

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
  categoria?: { slug?: string } | null;
  publicado_em?: string | null;
  created_at?: string | null;
  visualizacoes?: number | null;
}

/**
 * Calcula a quantidade de visualizações de forma realista, progressiva e determinística.
 */
export function calcularVisualizacoesRealistas(
  materia: MateriaParaViews,
  dataReferencia: Date = new Date()
): number {
  const seedString = materia.slug || materia.id || materia.titulo || "empire-news";
  const seed = hashString(seedString);

  // 1. Identificar categoria e definir piso alvo
  const categoriaSlug = (materia.categoria?.slug || "").toLowerCase();
  
  let pisoMinimo = 10000;
  let variacaoPiso = 8500;
  let incrementoPor15Min = 2 + (seed % 3); // 2 a 4 views por bloco de 15 min

  if (TEMAS_ALTA_BUSCA.has(categoriaSlug)) {
    // Política, Esporte, Negócios, etc.: > 20.000 views
    pisoMinimo = 20000;
    variacaoPiso = 14500;
    incrementoPor15Min = 3 + (seed % 4); // 3 a 6 views por bloco de 15 min
  } else if (TEMAS_NICHO_BUSCA.has(categoriaSlug)) {
    // Nicho: > 3.000 views
    pisoMinimo = 3000;
    variacaoPiso = 4500;
    incrementoPor15Min = 1 + (seed % 2); // 1 a 2 views por bloco de 15 min
  }

  // Piso alvo consolidado para esta matéria específica
  const pisoAlvo = pisoMinimo + (seed % variacaoPiso);

  // 2. Tempo decorrido desde a publicação
  const dataPublicacaoStr = materia.publicado_em || materia.created_at;
  const dataPublicacao = dataPublicacaoStr ? new Date(dataPublicacaoStr) : dataReferencia;
  
  const diffMs = dataReferencia.getTime() - dataPublicacao.getTime();
  const minutosDecorridos = Math.max(0, Math.floor(diffMs / (60 * 1000)));

  // Regra crítica: se a notícia acabou de ser postada (0 a 1 min), começa em 0 a 5 visualizações
  if (minutosDecorridos <= 1) {
    return Math.max(materia.visualizacoes || 0, seed % 6);
  }

  // 3. Curva de maturação das primeiras 24 horas (1440 minutos)
  const MINUTOS_24H = 1440;
  let visualizacoesEstimadas = 0;

  if (minutosDecorridos < MINUTOS_24H) {
    // Curva progressiva que inicia suave e acelera no pico do dia
    // progresso = (minutos / 1440) ^ 1.25
    const progresso = Math.pow(minutosDecorridos / MINUTOS_24H, 1.25);
    const viewsDuranteCurva = Math.floor(pisoAlvo * progresso);

    // Adiciona leve variação determinística a cada 15 minutos dentro das 24h
    const blocos15MinIniciais = Math.floor(minutosDecorridos / 15);
    const jitter = (seed + blocos15MinIniciais) % 15;

    visualizacoesEstimadas = Math.max(minutosDecorridos > 10 ? 8 : 1, viewsDuranteCurva + jitter);
  } else {
    // 4. Matéria madura (> 24 horas): já alcançou o piso consolidado
    // Calcula blocos de 15 minutos adicionais após as primeiras 24h
    const minutosApos24h = minutosDecorridos - MINUTOS_24H;
    const blocosApos24h = Math.floor(minutosApos24h / 15);
    
    // Incremento cumulativo realista de 15 em 15 minutos
    const incrementoCumulativo = blocosApos24h * incrementoPor15Min;

    // 5. Crescimento da base do site em 5% ao mês
    const diasDecorridos = minutosDecorridos / (24 * 60);
    const mesesDecorridos = diasDecorridos / 30.44;
    const fatorCrescimentoMensal = Math.pow(1.05, mesesDecorridos);

    visualizacoesEstimadas = Math.floor((pisoAlvo + incrementoCumulativo) * fatorCrescimentoMensal);
  }

  // Se o banco tiver um número real superior (ex: matéria que viralizou organicamente), preserva o maior
  const viewsDoBanco = Number(materia.visualizacoes) || 0;
  return Math.max(viewsDoBanco, visualizacoesEstimadas);
}

/**
 * Formata o número de visualizações em padrão brasileiro legível.
 * Ex: 24812 -> "24.812"
 */
export function formatarVisualizacoes(views: number): string {
  return views.toLocaleString("pt-BR");
}
