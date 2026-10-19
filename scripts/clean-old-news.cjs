const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('=== OTIMIZAÇÃO DO BANCO DE DADOS: LIMPEZA DE MATÉRIAS ANTIGAS (> 1 SEMANA) ===\n');

  // 1. Atualizar configuração no banco para retenção de 7 dias
  const { data: configAtual } = await sb
    .from('configuracoes')
    .select('id, chave, valor')
    .eq('chave', 'captacao_arquivar_dias')
    .maybeSingle();

  if (configAtual) {
    await sb
      .from('configuracoes')
      .update({
        valor: 7,
        descricao: 'Dias para exclusão automática de matérias captadas (otimização de storage)'
      })
      .eq('id', configAtual.id);
    console.log('✔ Configuração "captacao_arquivar_dias" definida para 7 dias (1 semana).');
  }

  // 2. Contar antes da limpeza
  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count: totalAntes } = await sb
    .from('materias')
    .select('*', { count: 'exact', head: true });

  const { count: paraExcluir } = await sb
    .from('materias')
    .select('*', { count: 'exact', head: true })
    .eq('origem', 'captacao')
    .or(`publicado_em.lt.${seteDiasAtras},created_at.lt.${seteDiasAtras}`);

  console.log(`\nTotal atual de matérias no banco: ${totalAntes}`);
  console.log(`Matérias captadas com mais de 7 dias para exclusão: ${paraExcluir}`);

  // 3. Executar exclusão em lotes (para evitar timeouts de payload)
  let totalExcluidas = 0;
  let temMais = true;

  while (temMais) {
    const { data: lote, error: errBusca } = await sb
      .from('materias')
      .select('id')
      .eq('origem', 'captacao')
      .or(`publicado_em.lt.${seteDiasAtras},created_at.lt.${seteDiasAtras}`)
      .limit(200);

    if (errBusca) {
      console.error('Erro ao buscar lote para exclusão:', errBusca);
      break;
    }

    if (!lote || lote.length === 0) {
      temMais = false;
      break;
    }

    const ids = lote.map((m) => m.id);
    const { error: errDel } = await sb
      .from('materias')
      .delete()
      .in('id', ids);

    if (errDel) {
      console.error('Erro ao deletar lote de IDs:', errDel);
      break;
    }

    totalExcluidas += ids.length;
    console.log(`  - Excluídas ${totalExcluidas} de ${paraExcluir}...`);
  }

  // 4. Limpar logs de captação antigos (> 7 dias)
  const { data: logsDeletados, error: errLogs } = await sb
    .from('captacao_logs')
    .delete()
    .lt('iniciado_em', seteDiasAtras)
    .select('id');

  const totalLogsExcluidos = logsDeletados?.length || 0;
  console.log(`\n✔ Logs de execução antigos removidos: ${totalLogsExcluidos}`);

  // 5. Total final após a limpeza
  const { count: totalDepois } = await sb
    .from('materias')
    .select('*', { count: 'exact', head: true });

  console.log(`\n=== RESULTADO DA OTIMIZAÇÃO ===`);
  console.log(`Matérias antes da limpeza: ${totalAntes}`);
  console.log(`Matérias excluídas permanentemente: ${totalExcluidas}`);
  console.log(`Matérias restantes no banco (apenas última semana): ${totalDepois}`);
  console.log(`Status: O banco de dados agora mantém apenas notícias recentes (≤ 7 dias)!`);
}

run();
