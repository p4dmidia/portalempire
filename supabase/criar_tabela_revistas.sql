-- ==============================================================================
-- CRIAÇÃO DA TABELA DE REVISTAS NO SUPABASE + DADOS DEMO
-- Execute este script no SQL Editor do Supabase
-- ==============================================================================

-- 1. Criar tabela public.revistas
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

-- 2. Gatilho updated_at
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

-- 3. Índices
create index if not exists idx_revistas_ativo_destaque on public.revistas (ativo, destaque, data_publicacao desc);
create index if not exists idx_revistas_cidade on public.revistas (cidade);
create index if not exists idx_revistas_escritor on public.revistas (escritor);

-- 4. RLS
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

-- 5. Bucket de Storage
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

-- 6. Inserção de Revistas Iniciais Demonstrativas
INSERT INTO public.revistas (
  titulo,
  subtitulo,
  slug,
  capa_url,
  link_url,
  cidade,
  estado,
  escritor,
  categoria,
  tipo_acesso,
  data_publicacao,
  destaque,
  ativo,
  ordem
) VALUES
  (
    'Vem ai a Revista Empire Magazine de Carmópolis de Minas',
    'EMPIRE CARMÓPOLIS DE MINAS',
    'empire-magazine-carmopolis-de-minas',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    'https://conecteonline.com.br/#top-revistas',
    'Carmópolis de Minas',
    'MG',
    'Redação Empire',
    'ENTRETENIMENTO',
    'GRATUITA',
    '2024-04-16',
    true,
    true,
    1
  ),
  (
    'Empire Magazine Ribeirão Preto',
    'EMPIRE RIBEIRÃO PRETO',
    'empire-magazine-ribeirao-preto',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    'https://conecteonline.com.br/#top-revistas',
    'Ribeirão Preto',
    'SP',
    'Redação Empire',
    'DIVERSOS',
    'GRATUITA',
    '2024-04-16',
    true,
    true,
    2
  ),
  (
    'Empire Magazine 25 de Março',
    'EMPIRE 25 DE MARÇO',
    'empire-magazine-25-de-marco',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    'https://conecteonline.com.br/#top-revistas',
    'São Paulo',
    'SP',
    'Redação Empire',
    'DIVERSOS',
    'GRATUITA',
    '2024-04-16',
    true,
    true,
    3
  ),
  (
    'Empire Magazine Brás',
    'EMPIRE BRÁS',
    'empire-magazine-bras',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    'https://conecteonline.com.br/#top-revistas',
    'São Paulo',
    'SP',
    'Redação Empire',
    'DIVERSOS',
    'GRATUITA',
    '2024-04-16',
    true,
    true,
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  titulo = excluded.titulo,
  subtitulo = excluded.subtitulo,
  capa_url = excluded.capa_url,
  link_url = excluded.link_url,
  updated_at = now();

SELECT id, titulo, subtitulo, cidade, escritor, categoria, data_publicacao, ativo FROM public.revistas;
