-- MIGRATION: 20261019000001_limpeza_automatica_materias.sql
-- Descrição: Otimização do banco de dados com expurgo automático de notícias com mais de 7 dias (1 semana)

-- 1. FUNÇÃO SECURITY DEFINER PARA EXCLUSÃO AUTOMÁTICA DE MATÉRIAS ANTIGAS (> 7 DIAS)
create or replace function public.limpar_materias_antigas(dias_retencao int default 7)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  limite_timestamp timestamptz;
  qtd_materias_excluidas int := 0;
  qtd_logs_excluidos int := 0;
begin
  -- Calcula a data limite (padrão: 7 dias atrás)
  limite_timestamp := now() - (coalesce(dias_retencao, 7) || ' days')::interval;

  -- 1.1 Deleta matérias originadas de captação RSS mais antigas que a data limite
  -- Preserva matérias autorais/locais e colunas de redação
  with deletadas as (
    delete from public.materias
    where origem = 'captacao'
      and (publicado_em < limite_timestamp or created_at < limite_timestamp)
    returning id
  )
  select count(*) into qtd_materias_excluidas from deletadas;

  -- 1.2 Limpa logs de captação antigos (> 7 dias) para evitar inchaço do storage Postgres
  with logs_del as (
    delete from public.captacao_logs
    where iniciado_em < limite_timestamp
    returning id
  )
  select count(*) into qtd_logs_excluidos from logs_del;

  return jsonb_build_object(
    'sucesso', true,
    'dias_retencao', dias_retencao,
    'limite_timestamp', limite_timestamp,
    'materias_excluidas', qtd_materias_excluidas,
    'logs_excluidos', qtd_logs_excluidos
  );
end;
$$;

-- 2. GARANTIR PERMISSÃO DE EXECUÇÃO DA RPC
grant execute on function public.limpar_materias_antigas(int) to anon, authenticated, service_role;

-- 3. ATUALIZAR CONFIGURAÇÃO GLOBAL DE RETENÇÃO PARA 7 DIAS (1 SEMANA)
update public.configuracoes
set valor = '7'::jsonb,
    descricao = 'Dias para exclusão automática de matérias captadas (otimização de banco de dados)'
where chave = 'captacao_arquivar_dias';

-- Se não existir a chave, insere com portal_id
insert into public.configuracoes (portal_id, chave, valor, descricao)
select
  p.id,
  'captacao_arquivar_dias',
  '7'::jsonb,
  'Dias para exclusão automática de matérias captadas (otimização de banco de dados)'
from public.portais p
where not exists (
  select 1 from public.configuracoes where chave = 'captacao_arquivar_dias'
);

-- 4. AGENDAMENTO NATIVO NO POSTGRESQL (SE PG_CRON ESTIVER ATIVO NO SUPABASE)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Remove agendamento anterior se houver
    perform cron.unschedule(jobname)
    from cron.job
    where jobname = 'limpeza-diaria-materias-antigas';

    -- Agenda para rodar todo dia às 03:00 da madrugada
    perform cron.schedule(
      'limpeza-diaria-materias-antigas',
      '0 3 * * *',
      'select public.limpar_materias_antigas(7);'
    );
  end if;
exception
  when others then
    -- Continua normalmente se pg_cron não estiver habilitado
    null;
end;
$$;
