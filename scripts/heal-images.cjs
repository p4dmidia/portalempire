const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function otimizarUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let limpa = url.replace(/&amp;/g, '&').trim();

  if (limpa.includes('cnnbrasil.com.br')) {
    limpa = limpa.replace(/\?w=\d+.*$/i, '');
    limpa = limpa.replace(/\?.*(crop|quality|resize)=.*$/i, '');
  }

  if (limpa.includes('infomoney.com.br')) {
    limpa = limpa.replace(/\?fit=\d+%2C\d+.*$/i, '');
    limpa = limpa.replace(/\?.*quality=\d+.*$/i, '');
  }

  if (limpa.includes('glbimg.com')) {
    limpa = limpa.replace(/\/\d{2,3}x\d{0,4}\//i, '/1200x0/');
  }

  if (limpa.includes('media-amazon.com')) {
    limpa = limpa.replace(/\._SL\d{2,3}_\./i, '._SL1200_.');
  }

  limpa = limpa.replace(/(-\d{2,3}x\d{2,3})(\.(jpe?g|png|webp|avif))/i, '$2');

  if (/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(?:&|$)/i.test(limpa)) {
    limpa = limpa.replace(/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(&|$)/i, '$1');
    limpa = limpa.replace(/[?&]$/, '');
  }

  return limpa;
}

async function run() {
  console.log('--- Iniciando limpeza e cura de imagens no Supabase ---');

  // 1. Matéria da arqueóloga: atualizar com a imagem oficial em alta resolução da CNN
  const novaImagemCnn = 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2026/10/Operacao-assalto-arqueologa.png';
  const { data: arqueologaMat, error: errBusca } = await sb
    .from('materias')
    .select('id, titulo, slug, imagem_url')
    .ilike('slug', '%arqueologa%')
    .ilike('slug', '%autoridades%');

  if (arqueologaMat && arqueologaMat.length > 0) {
    for (const mat of arqueologaMat) {
      console.log(`Corrigindo imagem da matéria [${mat.titulo.substring(0, 45)}...] para HD oficial da CNN.`);
      await sb
        .from('materias')
        .update({ imagem_url: novaImagemCnn })
        .eq('id', mat.id);
    }
  }

  // 2. Buscar todas as matérias com imagens para otimizar
  const { data: materias, error } = await sb
    .from('materias')
    .select('id, titulo, imagem_url, url_original')
    .not('imagem_url', 'is', null);

  if (error) {
    console.error('Erro ao buscar materias:', error);
    return;
  }

  console.log(`Total de matérias encontradas para verificação: ${materias.length}`);
  let corrigidas = 0;

  for (const m of materias) {
    if (!m.imagem_url) continue;
    const otimizada = otimizarUrl(m.imagem_url);

    if (otimizada && otimizada !== m.imagem_url) {
      console.log(`Corrigindo [${m.titulo.substring(0, 35)}]:\n  DE:   ${m.imagem_url}\n  PARA: ${otimizada}\n`);
      const { error: errUpdate } = await sb
        .from('materias')
        .update({ imagem_url: otimizada })
        .eq('id', m.id);

      if (errUpdate) {
        console.error(`Erro ao atualizar materia ${m.id}:`, errUpdate);
      } else {
        corrigidas++;
      }
    }
  }

  console.log(`--- Concluído: ${corrigidas} matérias atualizadas para alta resolução! ---`);
}

run();
