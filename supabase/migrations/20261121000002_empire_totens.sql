-- ==============================================================================
-- MIGRATION: Empire Totens — Mídia Digital & Publicidade por Cidade
-- ==============================================================================

-- 1. Tabela de Totens Publicitários
create table if not exists public.totens (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid references public.portais(id) on delete set null,
  cidade_id uuid references public.cidades(id) on delete set null,
  cidade_nome text not null default 'Uberlândia',
  estado text not null default 'MG',
  nome text not null,
  slug text unique not null,
  estabelecimento_nome text not null,
  tipo_estabelecimento text not null default 'Galeria',
  cep text,
  endereco text not null,
  bairro text not null,
  descricao_ponto text not null,
  circulacao_estimada text not null default '25.000 pessoas/mês',
  circulacao_numero integer default 25000,
  perfil_publico text[] default '{"Consumidores", "Famílias", "Profissionais"}',
  modelo_equipamento text default 'Totem Digital Vertical 55 polegadas',
  tamanho_tela text default '55 polegadas 4K Ultra HD',
  formato_publicidade text default '20 slots de 15 segundos',
  slots_disponiveis integer default 5,
  slots_total integer default 20,
  duracao_slot_segundos integer default 15,
  recursos_extras text[] default '{"Com carregador de celular"}',
  foto_url text not null,
  galeria_fotos text[] default '{}',
  google_maps_url text,
  latitude numeric,
  longitude numeric,
  franqueado_nome text not null default 'Marcelo Olivers',
  franqueado_telefone text,
  franqueado_whatsapp text not null default '34988676886',
  franqueado_email text,
  franqueado_user_id uuid references public.profiles(id) on delete set null,
  destaque boolean default true,
  status text default 'ativo',
  ordem integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Trigger para updated_at em totens
create or replace function public.set_totens_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_totens_updated_at on public.totens;
create trigger tr_totens_updated_at
  before update on public.totens
  for each row execute function public.set_totens_updated_at();

-- 2. Tabela de Solicitações de Anúncio em Totens
create table if not exists public.totens_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  totem_id uuid references public.totens(id) on delete cascade,
  nome_contato text not null,
  empresa text,
  whatsapp text not null,
  email text,
  cidade text,
  mensagem text,
  status text default 'pendente',
  created_at timestamptz default now() not null
);

-- Índices de busca e ordenação
create index if not exists idx_totens_cidade_nome on public.totens(cidade_nome);
create index if not exists idx_totens_status on public.totens(status);
create index if not exists idx_totens_tipo on public.totens(tipo_estabelecimento);
create index if not exists idx_totens_ordem on public.totens(ordem);
create index if not exists idx_totens_solicitacoes_totem on public.totens_solicitacoes(totem_id);

-- RLS
alter table public.totens enable row level security;
alter table public.totens_solicitacoes enable row level security;

-- Políticas de totens
drop policy if exists "Totens ativos são públicos" on public.totens;
create policy "Totens ativos são públicos"
  on public.totens for select
  using (status = 'ativo' or auth.role() = 'service_role');

drop policy if exists "Admin gerencia totens" on public.totens;
create policy "Admin gerencia totens"
  on public.totens for all
  using (
    auth.role() = 'service_role' or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Políticas de solicitações
drop policy if exists "Público pode registrar solicitação de totem" on public.totens_solicitacoes;
create policy "Público pode registrar solicitação de totem"
  on public.totens_solicitacoes for insert
  with check (true);

drop policy if exists "Admin visualiza e gerencia solicitações de totens" on public.totens_solicitacoes;
create policy "Admin visualiza e gerencia solicitações de totens"
  on public.totens_solicitacoes for all
  using (
    auth.role() = 'service_role' or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
