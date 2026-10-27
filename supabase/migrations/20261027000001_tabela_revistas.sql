-- ==============================================================================
-- MIGRATION: Módulo de Revistas Empire Magazine
-- ==============================================================================

create table if not exists public.revistas (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid references public.portais(id) on delete set null,
  titulo text not null,
  subtitulo text,
  slug text unique not null,
  capa_url text not null,
  link_url text not null,
  cidade text,
  estado text default 'SP',
  escritor text default 'Redação Empire',
  categoria text default 'Diversos',
  tipo_acesso text default 'Gratuita',
  data_publicacao date default current_date,
  destaque boolean default true,
  ativo boolean default true,
  ordem integer default 0,
  visualizacoes integer default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Gatilho para atualizar updated_at automaticamente
create or replace function public.set_revistas_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_revistas_updated_at on public.revistas;
create trigger tr_revistas_updated_at
  before update on public.revistas
  for each row execute function public.set_revistas_updated_at();

-- Índices de busca e ordenação
create index if not exists idx_revistas_ativo_destaque on public.revistas (ativo, destaque, data_publicacao desc);
create index if not exists idx_revistas_cidade on public.revistas (cidade);
create index if not exists idx_revistas_escritor on public.revistas (escritor);
create index if not exists idx_revistas_categoria on public.revistas (categoria);

-- Políticas RLS
alter table public.revistas enable row level security;

drop policy if exists "Revistas: Leitura pública de ativas" on public.revistas;
create policy "Revistas: Leitura pública de ativas"
  on public.revistas for select
  using (ativo = true or public.current_role() = 'admin');

drop policy if exists "Revistas: Controle total apenas para Admin" on public.revistas;
create policy "Revistas: Controle total apenas para Admin"
  on public.revistas for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Bucket de Storage para Capas de Revistas
insert into storage.buckets (id, name, public)
values ('revistas', 'revistas', true)
on conflict (id) do update set public = true;

drop policy if exists "Revistas Storage: Leitura pública" on storage.objects;
create policy "Revistas Storage: Leitura pública"
  on storage.objects for select
  using (bucket_id = 'revistas');

drop policy if exists "Revistas Storage: Upload Admin" on storage.objects;
create policy "Revistas Storage: Upload Admin"
  on storage.objects for insert
  with check (bucket_id = 'revistas' and (public.current_role() = 'admin' or auth.role() = 'authenticated'));
