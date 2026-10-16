-- ==============================================================================
-- MIGRATION: 20261014000001_sistema_afiliados.sql
-- DESCRIÇÃO: Sistema de Afiliados Recorrente para Colunistas (20%),
--            Mensalidade de Coluna e Gestão de Saques Manuais via PIX
-- ==============================================================================

-- 1. ADICIONAR CAMPOS DE AFILIAÇÃO EM PROFILES
alter table public.profiles
  add column if not exists codigo_afiliado text unique,
  add column if not exists indicado_por_id uuid references public.profiles(id) on delete set null,
  add column if not exists saldo_afiliado numeric(10,2) not null default 0.00,
  add column if not exists chave_pix text,
  add column if not exists tipo_chave_pix text;

create index if not exists idx_profiles_indicado_por on public.profiles(indicado_por_id);
create index if not exists idx_profiles_codigo_afiliado on public.profiles(codigo_afiliado);

-- Gerar código de afiliado para perfis existentes que não possuem
update public.profiles
set codigo_afiliado = coalesce(slug, lower(replace(nome, ' ', '')) || '-' || substr(md5(random()::text), 1, 4))
where codigo_afiliado is null and role in ('colunista', 'admin');

-- 2. TABELA ASSINATURAS_COLUNISTAS
create table if not exists public.assinaturas_colunistas (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  colunista_id uuid not null references public.profiles(id) on delete cascade,
  coluna_id uuid references public.colunas(id) on delete set null,
  valor_mensal numeric(10,2) not null default 97.00,
  mp_payment_id text,
  status text not null default 'pendente' check (status in ('ativa', 'pendente', 'atrasada', 'cancelada')),
  forma_pagamento text default 'pix',
  proximo_vencimento date,
  ultimo_pagamento timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assinaturas_colunista on public.assinaturas_colunistas(colunista_id);
create index if not exists idx_assinaturas_status on public.assinaturas_colunistas(status);

-- Trigger de updated_at para assinaturas_colunistas
drop trigger if exists tr_assinaturas_colunistas_updated_at on public.assinaturas_colunistas;
create trigger tr_assinaturas_colunistas_updated_at
  before update on public.assinaturas_colunistas
  for each row execute function public.set_updated_at();

-- 3. TABELA COMISSOES_AFILIADOS (EXTRATO DE 20% RECORRENTE)
create table if not exists public.comissoes_afiliados (
  id uuid primary key default gen_random_uuid(),
  afiliado_id uuid not null references public.profiles(id) on delete cascade,
  indicado_id uuid not null references public.profiles(id) on delete cascade,
  assinatura_id uuid references public.assinaturas_colunistas(id) on delete set null,
  mp_payment_id text,
  mes_referencia text not null, -- ex: '2026-10'
  valor_mensalidade numeric(10,2) not null,
  percentual_comissao numeric(5,2) not null default 20.00,
  valor_comissao numeric(10,2) not null,
  status text not null default 'creditado' check (status in ('creditado', 'estornado')),
  created_at timestamptz not null default now()
);

create index if not exists idx_comissoes_afiliado on public.comissoes_afiliados(afiliado_id, created_at desc);
create index if not exists idx_comissoes_indicado on public.comissoes_afiliados(indicado_id);

-- 4. TABELA SAQUES_AFILIADOS (SOLICITAÇÕES DE RESGATE MANUAL PIX)
create table if not exists public.saques_afiliados (
  id uuid primary key default gen_random_uuid(),
  colunista_id uuid not null references public.profiles(id) on delete cascade,
  valor numeric(10,2) not null check (valor > 0),
  chave_pix text not null,
  tipo_chave_pix text not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'rejeitado')),
  comprovante text,
  motivo_rejeicao text,
  solicitado_em timestamptz not null default now(),
  pago_em timestamptz,
  processado_por uuid references public.profiles(id) on delete set null
);

create index if not exists idx_saques_colunista on public.saques_afiliados(colunista_id, solicitado_em desc);
create index if not exists idx_saques_status on public.saques_afiliados(status);

-- 5. ATUALIZAR FUNÇÃO HANDLE_NEW_USER COM SUPORTE A AFILIADO
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_portal_id uuid;
  v_nome text;
  v_slug text;
  v_ref_codigo text;
  v_indicador_id uuid;
  v_meu_codigo text;
begin
  select id into v_portal_id from public.portais limit 1;
  v_nome := coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1));
  v_slug := lower(regexp_replace(
    regexp_replace(
      translate(v_nome, 'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn'),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )) || '-' || substr(new.id::text, 1, 4);

  -- Código de afiliado pessoal
  v_meu_codigo := v_slug;

  -- Verificar se veio por indicação (ref) de forma flexível e case-insensitive
  v_ref_codigo := trim(new.raw_user_meta_data->>'ref');
  if v_ref_codigo is not null and v_ref_codigo <> '' then
    select id into v_indicador_id
    from public.profiles
    where lower(trim(codigo_afiliado)) = lower(v_ref_codigo)
       or lower(trim(slug)) = lower(v_ref_codigo)
    limit 1;
  end if;

  insert into public.profiles (
    id,
    portal_id,
    nome,
    slug,
    email,
    role,
    status,
    codigo_afiliado,
    indicado_por_id,
    saldo_afiliado
  ) values (
    new.id,
    v_portal_id,
    v_nome,
    v_slug,
    new.email,
    'colunista',
    'pendente',
    v_meu_codigo,
    v_indicador_id,
    0.00
  );

  return new;
end;
$$;

-- 6. CONFIGURAÇÕES DEFAULT DO SISTEMA (com portal_id e chave únicos)
insert into public.configuracoes (portal_id, chave, valor, descricao)
select
  p.id,
  c.chave,
  c.valor::jsonb,
  c.descricao
from public.portais p
cross join (
  values
    ('colunista_mensalidade_valor', '97.00'::jsonb, 'Valor da mensalidade para colunistas do portal'),
    ('afiliados_comissao_percentual', '20.00'::jsonb, 'Percentual de comissão recorrente para afiliados colunistas'),
    ('afiliados_saque_minimo', '50.00'::jsonb, 'Valor mínimo em reais para solicitação de saque PIX'),
    ('afiliados_ativo', 'true'::jsonb, 'Status geral do programa de afiliados de colunistas')
) as c(chave, valor, descricao)
on conflict (portal_id, chave) do update
set valor = excluded.valor,
    descricao = excluded.descricao;

-- 7. POLÍTICAS RLS (ROW LEVEL SECURITY)

-- Profiles: Permitir que o colunista indicador veja os perfis de quem ele indicou
drop policy if exists "Profiles: Leitura de indicados pelo afiliado" on public.profiles;
create policy "Profiles: Leitura de indicados pelo afiliado"
  on public.profiles for select
  using (indicado_por_id = auth.uid());

-- Assinaturas Colunistas
alter table public.assinaturas_colunistas enable row level security;

drop policy if exists "Assinaturas: Leitura pelo próprio colunista ou admin" on public.assinaturas_colunistas;
create policy "Assinaturas: Leitura pelo próprio colunista ou admin"
  on public.assinaturas_colunistas for select
  using (
    colunista_id = auth.uid()
    or public.current_role() = 'admin'
    or exists (
      select 1 from public.profiles p
      where p.id = assinaturas_colunistas.colunista_id
        and p.indicado_por_id = auth.uid()
    )
  );

drop policy if exists "Assinaturas: Modificação pelo admin ou service_role" on public.assinaturas_colunistas;
create policy "Assinaturas: Modificação pelo admin ou service_role"
  on public.assinaturas_colunistas for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Colunas: Permitir que o indicador visualize a coluna do indicado no painel
drop policy if exists "Colunas: Leitura de indicados pelo afiliado" on public.colunas;
create policy "Colunas: Leitura de indicados pelo afiliado"
  on public.colunas for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = colunas.dono_id
        and p.indicado_por_id = auth.uid()
    )
  );

-- Comissões Afiliados
alter table public.comissoes_afiliados enable row level security;

drop policy if exists "Comissões: Leitura pelo afiliado titular ou admin" on public.comissoes_afiliados;
create policy "Comissões: Leitura pelo afiliado titular ou admin"
  on public.comissoes_afiliados for select
  using (afiliado_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "Comissões: Apenas admin e service_role podem gerenciar" on public.comissoes_afiliados;
create policy "Comissões: Apenas admin e service_role podem gerenciar"
  on public.comissoes_afiliados for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Saques Afiliados
alter table public.saques_afiliados enable row level security;

drop policy if exists "Saques: Leitura pelo próprio colunista ou admin" on public.saques_afiliados;
create policy "Saques: Leitura pelo próprio colunista ou admin"
  on public.saques_afiliados for select
  using (colunista_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "Saques: Colunista pode solicitar saque" on public.saques_afiliados;
create policy "Saques: Colunista pode solicitar saque"
  on public.saques_afiliados for insert
  with check (colunista_id = auth.uid() and public.current_role() in ('colunista', 'admin'));

drop policy if exists "Saques: Admin pode atualizar status (marcar como pago / rejeitar)" on public.saques_afiliados;
create policy "Saques: Admin pode atualizar status (marcar como pago / rejeitar)"
  on public.saques_afiliados for update
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
