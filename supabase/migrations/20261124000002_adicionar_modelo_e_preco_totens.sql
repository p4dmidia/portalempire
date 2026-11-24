-- Migration para adicionar tipo_modelo e preco_mensal na tabela de totens
alter table if exists public.totens
  add column if not exists tipo_modelo text default 'totem_carregador',
  add column if not exists preco_mensal numeric default 250;

comment on column public.totens.tipo_modelo is 'Modelo do equipamento: totem_carregador (R$ 250/mês) ou totem_interativo_maior (R$ 350/mês)';
comment on column public.totens.preco_mensal is 'Preço mensal oficial do plano de anúncio em reais';
