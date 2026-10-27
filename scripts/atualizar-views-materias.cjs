const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente do Supabase não encontradas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

const TETO_MAXIMO_VIEWS = 500000;

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function calcularVisualizacoes(materia) {
  const seedString = materia.slug || materia.id || materia.titulo || "empire-news";
  const seed = hashString(seedString);

  const categoriaSlug = (materia.categoria?.slug || "").toLowerCase();
  const ehUrgente = Boolean(materia.urgente);

  let pisoInicial = 65000;
  let variacaoPiso = seed % 3500;
  let potencial24h = 45000;
  let taxaPor15Min = 5 + (seed % 4);

  if (ehUrgente || TEMAS_ALTA_BUSCA.has(categoriaSlug)) {
    pisoInicial = 80000;
    variacaoPiso = seed % 3800;
    potencial24h = 65000;
    taxaPor15Min = 8 + (seed % 5);
  } else if (TEMAS_NICHO_BUSCA.has(categoriaSlug)) {
    pisoInicial = 50000;
    variacaoPiso = seed % 2900;
    potencial24h = 28000;
    taxaPor15Min = 3 + (seed % 3);
  }

  const baseInicial = pisoInicial + variacaoPiso;

  const dataPublicacaoStr = materia.publicado_em || materia.created_at;
  const dataPublicacao = dataPublicacaoStr ? new Date(dataPublicacaoStr) : new Date();

  const diffMs = Date.now() - dataPublicacao.getTime();
  const minutosDecorridos = Math.max(0, Math.floor(diffMs / (60 * 1000)));

  const MINUTOS_24H = 1440;
  let ganhoProgressivo = 0;

  if (minutosDecorridos < MINUTOS_24H) {
    const progresso = Math.pow(minutosDecorridos / MINUTOS_24H, 0.85);
    const viewsDuranteCurva = Math.floor(potencial24h * progresso);
    const blocos15MinIniciais = Math.floor(minutosDecorridos / 15);
    const jitter = (seed + blocos15MinIniciais * 11) % 43;
    ganhoProgressivo = viewsDuranteCurva + jitter;
  } else {
    const minutosApos24h = minutosDecorridos - MINUTOS_24H;
    const blocosApos24h = Math.floor(minutosApos24h / 15);
    const incrementoBlocos = blocosApos24h * taxaPor15Min;

    const diasDecorridos = minutosDecorridos / (24 * 60);
    const fatorMaturidade = Math.min(3.2, 1 + Math.log10(1 + diasDecorridos / 5));

    ganhoProgressivo = Math.floor((potencial24h + incrementoBlocos) * fatorMaturidade);
  }

  let visualizacoesEstimadas = baseInicial + ganhoProgressivo;
  visualizacoesEstimadas = Math.min(TETO_MAXIMO_VIEWS, visualizacoesEstimadas);

  const viewsDoBanco = Number(materia.visualizacoes) || 0;
  const finalViews = Math.max(viewsDoBanco, visualizacoesEstimadas);

  return Math.min(TETO_MAXIMO_VIEWS, finalViews);
}

async function run() {
  console.log("=== ATUALIZANDO VISUALIZAÇÕES DAS MATÉRIAS (50k a 80k até 500k) ===\n");

  const { data: materias, error } = await supabase
    .from("materias")
    .select("id, titulo, slug, urgente, visualizacoes, publicado_em, created_at, categoria:categorias(slug)");

  if (error) {
    console.error("Erro ao buscar matérias:", error);
    process.exit(1);
  }

  console.log(`Encontradas ${materias.length} matérias no banco de dados.`);

  let atualizadas = 0;
  for (const m of materias) {
    const novaView = calcularVisualizacoes(m);
    if (!m.visualizacoes || m.visualizacoes < novaView) {
      const { error: updErr } = await supabase
        .from("materias")
        .update({ visualizacoes: novaView })
        .eq("id", m.id);

      if (!updErr) {
        atualizadas++;
      }
    }
  }

  console.log(`\n✔ Sucesso: ${atualizadas} matérias atualizadas com o novo padrão de visualizações!`);
}

run();
