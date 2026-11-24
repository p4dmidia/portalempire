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
  const ehArtigoColuna = Boolean(materia.coluna_id || materia.coluna || categoriaSlug === "colunistas" || categoriaSlug === "opiniao");
  const ehCidades = categoriaSlug === "cidades" || categoriaSlug.startsWith("cidade-");
  const ehNicho = TEMAS_NICHO_BUSCA.has(categoriaSlug);
  const ehAltaBusca = TEMAS_ALTA_BUSCA.has(categoriaSlug);

  // Fator de Viralidade / Repercussão Amplo
  const tierVariacao = seed % 100;
  let multiplicadorTier = 1.0;
  if (tierVariacao < 6) {
    multiplicadorTier = 2.4 + ((seed % 1200) / 1000);
  } else if (tierVariacao < 25) {
    multiplicadorTier = 1.4 + ((seed % 600) / 1000);
  } else if (tierVariacao < 72) {
    multiplicadorTier = 0.75 + ((seed % 450) / 1000);
  } else {
    multiplicadorTier = 0.35 + ((seed % 300) / 1000);
  }

  let basePiso = 45000;
  let amplitude = 40000;
  let taxaPor15Min = 5 + (seed % 4);

  if (ehArtigoColuna) {
    basePiso = 6500;
    amplitude = 18000;
    taxaPor15Min = 1 + (seed % 2);
  } else if (ehUrgente) {
    basePiso = 140000;
    amplitude = 220000;
    taxaPor15Min = 12 + (seed % 6);
  } else if (ehAltaBusca) {
    basePiso = 68000;
    amplitude = 95000;
    taxaPor15Min = 7 + (seed % 4);
  } else if (ehCidades) {
    basePiso = 18000;
    amplitude = 42000;
    taxaPor15Min = 3 + (seed % 3);
  } else if (ehNicho) {
    basePiso = 12000;
    amplitude = 26000;
    taxaPor15Min = 2 + (seed % 2);
  }

  const jitter = (seed % 797) + ((seed * 13) % 199);
  const baseInicial = Math.round((basePiso + (seed % amplitude) + jitter) * multiplicadorTier);

  const dataPublicacaoStr = materia.publicado_em || materia.created_at;
  const dataPublicacao = dataPublicacaoStr ? new Date(dataPublicacaoStr) : new Date();

  const diffMs = Date.now() - dataPublicacao.getTime();
  const minutosDecorridos = Math.max(0, Math.floor(diffMs / (60 * 1000)));

  const MINUTOS_24H = 1440;
  let ganhoProgressivo = 0;

  if (minutosDecorridos < MINUTOS_24H) {
    const progresso = Math.pow(minutosDecorridos / MINUTOS_24H, 0.7);
    const viewsDuranteCurva = Math.floor(baseInicial * 0.5 * progresso);
    ganhoProgressivo = viewsDuranteCurva;
  } else {
    const minutosApos24h = minutosDecorridos - MINUTOS_24H;
    const blocosApos24h = Math.floor(minutosApos24h / 15);
    const incrementoBlocos = blocosApos24h * taxaPor15Min;

    const diasDecorridos = minutosDecorridos / (24 * 60);
    const fatorMaturidade = Math.min(2.2, 1 + Math.log10(1 + diasDecorridos / 10));

    ganhoProgressivo = Math.floor(incrementoBlocos * fatorMaturidade);
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
