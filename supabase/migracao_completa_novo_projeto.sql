-- ==============================================================================
-- PORTAL EMPIRE: SCRIPT COMPLETO DE MIGRAÇÃO PARA NOVO PROJETO SUPABASE
-- Execute este script no SQL Editor do novo projeto Supabase.
-- Ele cria:
-- 1. Extensões e Tipos (Enums)
-- 2. Todas as Tabelas do Sistema (Portais, Profiles, Matérias, Colunas, Categorias, Cidades, etc.)
-- 3. RLS e Políticas de Segurança
-- 4. Funções e Triggers
-- 5. Tabelas auxiliares (Revistas, Classificados, Afiliados, etc.)
-- 6. Seeds iniciais (Editorias completas, Fontes RSS de captação, Cidades de MG e Brasil)
-- 7. Formatos e Espaços Publicitários IAB
-- 8. Configuração de Buckets de Armazenamento (Storage)
-- 9. Usuário Administrador Principal (admin@empirecidades.com.br / admin123)
-- 10. Colunista Agência P4D + Coluna Belo Horizonte em Foco + Banners
-- ==============================================================================


-- ==============================================================================
-- MIGRATION: 20261009000001_initial_schema.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION 20261009000001_initial_schema.sql
-- Portal Empire: Estrutura Completa de Banco, Enums, Triggers, Views e RLS
-- ==============================================================================

-- 1. EXTENSÕES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- 2. ENUMS
create type public.user_role as enum ('admin', 'editor', 'colunista', 'anunciante');
create type public.user_status as enum ('pendente', 'ativo', 'bloqueado');
create type public.materia_origem as enum ('manual', 'captacao');
create type public.materia_status as enum ('rascunho', 'publicado', 'despublicado', 'agendado');
create type public.coluna_status as enum ('pendente', 'ativa', 'suspensa');
create type public.dono_tipo as enum ('plataforma', 'coluna');
create type public.formato_posicao as enum ('topo', 'lateral', 'meio_texto', 'rodape', 'home_entre_blocos');
create type public.anuncio_status as enum ('aguardando_pagamento', 'ativo', 'pausado', 'expirado', 'cancelado');
create type public.pedido_forma_pagamento as enum ('pix', 'boleto', 'cartao', 'manual');
create type public.pedido_status as enum ('pendente', 'pago', 'vencido', 'cancelado', 'estornado');

-- 3. FUNÇÃO TRIGGER UPDATED_AT
create or replace function public.set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. TABELAS

-- 4.1 portais
create table public.portais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  dominio text,
  logo_url text,
  cor_primaria text not null default '#2563eb',
  descricao_seo text,
  redes_sociais jsonb default '{}'::jsonb,
  youtube_live_url text,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_portais_updated_at
  before update on public.portais
  for each row execute function public.set_updated_at();

-- 4.2 profiles (1:1 auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  portal_id uuid references public.portais(id) on delete set null,
  nome text not null,
  slug text unique not null,
  email text not null,
  role public.user_role not null default 'colunista',
  status public.user_status not null default 'pendente',
  foto_url text,
  bio text,
  redes_sociais jsonb default '{}'::jsonb,
  asaas_wallet_id text,
  cpf_cnpj text,
  telefone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 4.3 cidades
create table public.cidades (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  nome text not null,
  slug text not null,
  uf char(2) not null,
  destaque_menu boolean default false not null,
  ordem int default 0 not null,
  palavras_chave text[] default array[]::text[] not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint uq_cidades_portal_slug unique (portal_id, slug)
);

create trigger tr_cidades_updated_at
  before update on public.cidades
  for each row execute function public.set_updated_at();

-- 4.4 categorias (editorias)
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  nome text not null,
  slug text not null,
  pai_id uuid references public.categorias(id) on delete set null,
  exibir_menu boolean default true not null,
  exibir_home boolean default true not null,
  ordem_menu int default 0 not null,
  ordem_home int default 0 not null,
  cor text,
  palavras_chave text[] default array[]::text[] not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint uq_categorias_portal_slug unique (portal_id, slug)
);

create trigger tr_categorias_updated_at
  before update on public.categorias
  for each row execute function public.set_updated_at();

-- 4.5 colunas
create table public.colunas (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  dono_id uuid not null references public.profiles(id) on delete cascade,
  cidade_id uuid references public.cidades(id) on delete set null,
  nome text not null,
  slug text not null,
  descricao text,
  capa_url text,
  status public.coluna_status default 'pendente' not null,
  aceita_anuncios boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint uq_colunas_portal_slug unique (portal_id, slug)
);

create trigger tr_colunas_updated_at
  before update on public.colunas
  for each row execute function public.set_updated_at();

-- 4.6 fontes_rss
create table public.fontes_rss (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  nome text not null,
  veiculo text not null,
  url_feed text not null,
  categoria_padrao_id uuid not null references public.categorias(id) on delete restrict,
  cidade_padrao_id uuid references public.cidades(id) on delete set null,
  ativo boolean default true not null,
  intervalo_minutos int default 15 not null,
  max_itens_por_execucao int default 20 not null,
  publicar_automatico boolean default true not null,
  ultima_execucao timestamptz,
  ultimo_status text,
  ultimo_erro text,
  total_importadas int default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_fontes_rss_updated_at
  before update on public.fontes_rss
  for each row execute function public.set_updated_at();

-- 4.7 captacao_logs
create table public.captacao_logs (
  id uuid primary key default gen_random_uuid(),
  fonte_id uuid not null references public.fontes_rss(id) on delete cascade,
  iniciado_em timestamptz default now() not null,
  finalizado_em timestamptz,
  itens_lidos int default 0 not null,
  itens_novos int default 0 not null,
  itens_duplicados int default 0 not null,
  status text,
  erro text,
  created_at timestamptz default now() not null
);

-- 4.8 formatos_anuncio (admin)
create table public.formatos_anuncio (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  posicao public.formato_posicao not null,
  largura int not null,
  altura int not null,
  largura_mobile int,
  altura_mobile int,
  preco_minimo numeric(10,2) default 0.00 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_formatos_anuncio_updated_at
  before update on public.formatos_anuncio
  for each row execute function public.set_updated_at();

-- 4.9 espacos_anuncio (slots)
create table public.espacos_anuncio (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  dono_tipo public.dono_tipo not null,
  coluna_id uuid references public.colunas(id) on delete cascade,
  formato_id uuid not null references public.formatos_anuncio(id) on delete restrict,
  nome text not null,
  preco_mensal numeric(10,2) not null,
  preco_semanal numeric(10,2),
  ativo boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_espacos_anuncio_updated_at
  before update on public.espacos_anuncio
  for each row execute function public.set_updated_at();

-- 4.10 anunciantes
create table public.anunciantes (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  cadastrado_por uuid not null references public.profiles(id) on delete cascade,
  usuario_id uuid references public.profiles(id) on delete set null,
  nome text not null,
  cpf_cnpj text,
  email text,
  telefone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_anunciantes_updated_at
  before update on public.anunciantes
  for each row execute function public.set_updated_at();

-- 4.11 anuncios
create table public.anuncios (
  id uuid primary key default gen_random_uuid(),
  espaco_id uuid not null references public.espacos_anuncio(id) on delete cascade,
  anunciante_id uuid not null references public.anunciantes(id) on delete cascade,
  dono_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  imagem_desktop_url text not null,
  imagem_mobile_url text,
  link_destino text not null,
  inicio_em date not null,
  fim_em date not null,
  status public.anuncio_status default 'aguardando_pagamento' not null,
  valor numeric(10,2) default 0.00 not null,
  impressoes int default 0 not null,
  cliques int default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_anuncios_updated_at
  before update on public.anuncios
  for each row execute function public.set_updated_at();

-- 4.12 pedidos (cobrancas)
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  anuncio_id uuid not null references public.anuncios(id) on delete cascade,
  dono_id uuid not null references public.profiles(id) on delete cascade,
  valor_total numeric(10,2) not null,
  comissao_percentual numeric(5,2) not null,
  valor_comissao numeric(10,2) not null,
  valor_liquido_dono numeric(10,2) not null,
  forma_pagamento public.pedido_forma_pagamento default 'pix' not null,
  asaas_payment_id text,
  link_pagamento text,
  status public.pedido_status default 'pendente' not null,
  pago_em timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_pedidos_updated_at
  before update on public.pedidos
  for each row execute function public.set_updated_at();

-- 4.13 metricas_anuncio_diarias
create table public.metricas_anuncio_diarias (
  anuncio_id uuid not null references public.anuncios(id) on delete cascade,
  data date not null default current_date,
  impressoes int default 0 not null,
  cliques int default 0 not null,
  primary key (anuncio_id, data)
);

-- 4.14 materias
create table public.materias (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  autor_id uuid references public.profiles(id) on delete set null,
  coluna_id uuid references public.colunas(id) on delete set null,
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  cidade_id uuid references public.cidades(id) on delete set null,
  titulo text not null,
  slug text not null,
  subtitulo text,
  resumo text,
  conteudo jsonb,
  conteudo_html text,
  imagem_url text,
  imagem_credito text,
  origem public.materia_origem default 'manual' not null,
  fonte_id uuid references public.fontes_rss(id) on delete set null,
  fonte_nome text,
  url_original text,
  url_original_hash text unique,
  status public.materia_status default 'rascunho' not null,
  publicado_em timestamptz,
  urgente boolean default false not null,
  destaque boolean default false not null,
  tags text[] default array[]::text[] not null,
  visualizacoes int default 0 not null,
  seo_titulo text,
  seo_descricao text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint uq_materias_portal_slug unique (portal_id, slug)
);

create trigger tr_materias_updated_at
  before update on public.materias
  for each row execute function public.set_updated_at();

-- 4.15 configuracoes
create table public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  chave text not null,
  valor jsonb not null,
  descricao text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint uq_configuracoes_portal_chave unique (portal_id, chave)
);

create trigger tr_configuracoes_updated_at
  before update on public.configuracoes
  for each row execute function public.set_updated_at();

-- 4.16 shorts / videos
create table public.shorts (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  youtube_id text not null,
  titulo text not null,
  ordem int default 0 not null,
  ativo boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_shorts_updated_at
  before update on public.shorts
  for each row execute function public.set_updated_at();

-- 4.17 auditoria
create table public.auditoria (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.profiles(id) on delete set null,
  acao text not null,
  entidade text not null,
  entidade_id text,
  dados jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- 5. ÍNDICES DE PERFORMANCE E FULL-TEXT SEARCH
create index idx_materias_portal_status_pub on public.materias(portal_id, status, publicado_em desc);
create index idx_materias_categoria_pub on public.materias(categoria_id, publicado_em desc);
create index idx_materias_cidade_pub on public.materias(cidade_id, publicado_em desc);
create index idx_materias_coluna on public.materias(coluna_id);
create index idx_materias_autor on public.materias(autor_id);
create index idx_materias_destaque on public.materias(portal_id, destaque) where destaque = true;
create index idx_materias_urgente on public.materias(portal_id, urgente) where urgente = true;
create index idx_materias_fts on public.materias using gin (
  to_tsvector('portuguese', coalesce(titulo, '') || ' ' || coalesce(resumo, '') || ' ' || coalesce(subtitulo, ''))
);

create index idx_colunas_portal_status on public.colunas(portal_id, status);
create index idx_colunas_dono on public.colunas(dono_id);
create index idx_colunas_cidade on public.colunas(cidade_id);

create index idx_anuncios_espaco_datas on public.anuncios(espaco_id, status, inicio_em, fim_em);
create index idx_anuncios_dono on public.anuncios(dono_id);
create index idx_pedidos_dono_status on public.pedidos(dono_id, status);
create index idx_pedidos_anuncio on public.pedidos(anuncio_id);

-- 6. FUNÇÕES AUXILIARES E SECURITY DEFINER

-- 6.1 current_role()
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and status = 'ativo';
$$;

-- 6.2 incrementar_visualizacao(materia_id uuid)
create or replace function public.incrementar_visualizacao(materia_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.materias
  set visualizacoes = visualizacoes + 1
  where id = materia_id;
end;
$$;

-- 6.3 incrementar_metrica(anuncio_id uuid, tipo text)
create or replace function public.incrementar_metrica(p_anuncio_id uuid, p_tipo text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_tipo = 'impressao' then
    update public.anuncios
    set impressoes = impressoes + 1
    where id = p_anuncio_id;

    insert into public.metricas_anuncio_diarias (anuncio_id, data, impressoes, cliques)
    values (p_anuncio_id, current_date, 1, 0)
    on conflict (anuncio_id, data)
    do update set impressoes = public.metricas_anuncio_diarias.impressoes + 1;

  elsif p_tipo = 'clique' then
    update public.anuncios
    set cliques = cliques + 1
    where id = p_anuncio_id;

    insert into public.metricas_anuncio_diarias (anuncio_id, data, impressoes, cliques)
    values (p_anuncio_id, current_date, 0, 1)
    on conflict (anuncio_id, data)
    do update set cliques = public.metricas_anuncio_diarias.cliques + 1;
  end if;
end;
$$;

-- 6.4 Trigger de criação automática de profile em auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_nome text;
  v_slug text;
  v_portal_id uuid;
  v_base_slug text;
  v_count int;
begin
  v_nome := coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1));
  v_base_slug := lower(regexp_replace(v_nome, '[^a-zA-Z0-9]+', '-', 'g'));
  v_base_slug := trim(both '-' from v_base_slug);
  
  if v_base_slug = '' then
    v_base_slug := 'usuario';
  end if;

  v_slug := v_base_slug;
  v_count := 1;
  while exists (select 1 from public.profiles where slug = v_slug) loop
    v_slug := v_base_slug || '-' || v_count;
    v_count := v_count + 1;
  end loop;

  select id into v_portal_id from public.portais limit 1;

  insert into public.profiles (
    id,
    portal_id,
    nome,
    slug,
    email,
    role,
    status
  ) values (
    new.id,
    v_portal_id,
    v_nome,
    v_slug,
    new.email,
    'colunista',
    'pendente'
  );

  return new;
end;
$$;

-- Drop trigger se existir e recria
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. VIEWS PÚBLICAS
create or replace view public.autores_publicos as
select
  p.id,
  p.portal_id,
  p.nome,
  p.slug,
  p.foto_url,
  p.bio,
  p.redes_sociais,
  p.role
from public.profiles p
where p.status = 'ativo' and p.role in ('admin', 'editor', 'colunista');

create or replace view public.anuncios_ativos_publicos as
select
  a.id,
  a.espaco_id,
  a.titulo,
  a.imagem_desktop_url,
  a.imagem_mobile_url,
  a.link_destino
from public.anuncios a
where a.status = 'ativo'
  and a.inicio_em <= current_date
  and a.fim_em >= current_date;

-- 8. ROW LEVEL SECURITY (RLS) EM 100% DAS TABELAS

-- 8.1 portais
alter table public.portais enable row level security;

create policy "Portais: Leitura pública"
  on public.portais for select
  using (true);

create policy "Portais: Apenas admin pode modificar"
  on public.portais for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.2 profiles
alter table public.profiles enable row level security;

create policy "Profiles: Leitura pelo próprio usuário ou admin"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "Profiles: Próprio usuário pode atualizar dados não sensíveis"
  on public.profiles for update
  using (id = auth.uid() or public.current_role() = 'admin')
  with check (
    -- Admin pode tudo
    public.current_role() = 'admin'
    or (
      id = auth.uid()
      -- Garante que usuário comum não muda seu role nem seu status
      and role = (select p.role from public.profiles p where p.id = auth.uid())
      and status = (select p.status from public.profiles p where p.id = auth.uid())
    )
  );

create policy "Profiles: Admin pode inserir e excluir"
  on public.profiles for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.3 cidades
alter table public.cidades enable row level security;

create policy "Cidades: Leitura pública"
  on public.cidades for select
  using (true);

create policy "Cidades: Admin gerencia"
  on public.cidades for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.4 categorias
alter table public.categorias enable row level security;

create policy "Categorias: Leitura pública"
  on public.categorias for select
  using (true);

create policy "Categorias: Admin gerencia"
  on public.categorias for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.5 materias
alter table public.materias enable row level security;

create policy "Matérias: Leitura pública de publicadas, próprio autor ou admin"
  on public.materias for select
  using (
    (status = 'publicado' and publicado_em <= now())
    or autor_id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "Matérias: Inserção pelo autor ou admin"
  on public.materias for insert
  with check (
    (autor_id = auth.uid() and public.current_role() in ('admin', 'editor', 'colunista'))
    or public.current_role() = 'admin'
  );

create policy "Matérias: Atualização pelo próprio autor ou admin"
  on public.materias for update
  using (autor_id = auth.uid() or public.current_role() = 'admin')
  with check (autor_id = auth.uid() or public.current_role() = 'admin');

create policy "Matérias: Exclusão pelo próprio autor ou admin"
  on public.materias for delete
  using (autor_id = auth.uid() or public.current_role() = 'admin');

-- 8.6 colunas
alter table public.colunas enable row level security;

create policy "Colunas: Leitura de ativas para o público, dono vê as suas, admin tudo"
  on public.colunas for select
  using (
    status = 'ativa'
    or dono_id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "Colunas: Inserção pelo colunista dono ou admin"
  on public.colunas for insert
  with check (
    (dono_id = auth.uid() and public.current_role() in ('admin', 'colunista'))
    or public.current_role() = 'admin'
  );

create policy "Colunas: Atualização pelo dono ou admin"
  on public.colunas for update
  using (dono_id = auth.uid() or public.current_role() = 'admin')
  with check (
    public.current_role() = 'admin'
    or (
      dono_id = auth.uid()
      -- Colunista não pode auto-aprovar coluna
      and status = (select c.status from public.colunas c where c.id = colunas.id)
    )
  );

create policy "Colunas: Exclusão pelo dono ou admin"
  on public.colunas for delete
  using (dono_id = auth.uid() or public.current_role() = 'admin');

-- 8.7 fontes_rss
alter table public.fontes_rss enable row level security;

create policy "Fontes RSS: Apenas admin"
  on public.fontes_rss for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.8 captacao_logs
alter table public.captacao_logs enable row level security;

create policy "Captação Logs: Apenas admin"
  on public.captacao_logs for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.9 formatos_anuncio
alter table public.formatos_anuncio enable row level security;

create policy "Formatos de Anúncio: Leitura para usuários autenticados e admin"
  on public.formatos_anuncio for select
  using (auth.uid() is not null);

create policy "Formatos de Anúncio: Admin gerencia"
  on public.formatos_anuncio for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.10 espacos_anuncio
alter table public.espacos_anuncio enable row level security;

create policy "Espaços de Anúncio: Leitura pública de ativos, dono da coluna ou admin"
  on public.espacos_anuncio for select
  using (
    ativo = true
    or (
      dono_tipo = 'coluna'
      and exists (
        select 1 from public.colunas c
        where c.id = espacos_anuncio.coluna_id and c.dono_id = auth.uid()
      )
    )
    or public.current_role() = 'admin'
  );

create policy "Espaços de Anúncio: Criação pelo dono da coluna ou admin"
  on public.espacos_anuncio for insert
  with check (
    public.current_role() = 'admin'
    or (
      dono_tipo = 'coluna'
      and exists (
        select 1 from public.colunas c
        where c.id = espacos_anuncio.coluna_id and c.dono_id = auth.uid()
      )
    )
  );

create policy "Espaços de Anúncio: Edição/Exclusão pelo dono da coluna ou admin"
  on public.espacos_anuncio for update
  using (
    public.current_role() = 'admin'
    or (
      dono_tipo = 'coluna'
      and exists (
        select 1 from public.colunas c
        where c.id = espacos_anuncio.coluna_id and c.dono_id = auth.uid()
      )
    )
  )
  with check (
    public.current_role() = 'admin'
    or (
      dono_tipo = 'coluna'
      and exists (
        select 1 from public.colunas c
        where c.id = espacos_anuncio.coluna_id and c.dono_id = auth.uid()
      )
    )
  );

create policy "Espaços de Anúncio: Delete pelo dono da coluna ou admin"
  on public.espacos_anuncio for delete
  using (
    public.current_role() = 'admin'
    or (
      dono_tipo = 'coluna'
      and exists (
        select 1 from public.colunas c
        where c.id = espacos_anuncio.coluna_id and c.dono_id = auth.uid()
      )
    )
  );

-- 8.11 anunciantes
alter table public.anunciantes enable row level security;

create policy "Anunciantes: Leitura por quem cadastrou, usuário vinculado ou admin"
  on public.anunciantes for select
  using (
    cadastrado_por = auth.uid()
    or usuario_id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "Anunciantes: Inserção pelo cadastrador ou admin"
  on public.anunciantes for insert
  with check (
    cadastrado_por = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "Anunciantes: Atualização por quem cadastrou ou admin"
  on public.anunciantes for update
  using (cadastrado_por = auth.uid() or public.current_role() = 'admin')
  with check (cadastrado_por = auth.uid() or public.current_role() = 'admin');

create policy "Anunciantes: Exclusão por quem cadastrou ou admin"
  on public.anunciantes for delete
  using (cadastrado_por = auth.uid() or public.current_role() = 'admin');

-- 8.12 anuncios
alter table public.anuncios enable row level security;

create policy "Anúncios: Leitura pelo dono, anunciante vinculado ou admin"
  on public.anuncios for select
  using (
    dono_id = auth.uid()
    or exists (
      select 1 from public.anunciantes a
      where a.id = anuncios.anunciante_id and a.usuario_id = auth.uid()
    )
    or public.current_role() = 'admin'
  );

create policy "Anúncios: Inserção pelo dono do espaço ou admin"
  on public.anuncios for insert
  with check (
    dono_id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "Anúncios: Edição pelo dono do espaço ou admin"
  on public.anuncios for update
  using (dono_id = auth.uid() or public.current_role() = 'admin')
  with check (dono_id = auth.uid() or public.current_role() = 'admin');

create policy "Anúncios: Exclusão pelo dono do espaço ou admin"
  on public.anuncios for delete
  using (dono_id = auth.uid() or public.current_role() = 'admin');

-- 8.13 pedidos
alter table public.pedidos enable row level security;

create policy "Pedidos: Leitura pelo dono ou admin"
  on public.pedidos for select
  using (dono_id = auth.uid() or public.current_role() = 'admin');

create policy "Pedidos: Apenas admin e service role podem inserir/atualizar/excluir"
  on public.pedidos for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.14 metricas_anuncio_diarias
alter table public.metricas_anuncio_diarias enable row level security;

create policy "Métricas Anúncios: Leitura pelo dono do anúncio ou admin"
  on public.metricas_anuncio_diarias for select
  using (
    exists (
      select 1 from public.anuncios a
      where a.id = metricas_anuncio_diarias.anuncio_id and (a.dono_id = auth.uid() or public.current_role() = 'admin')
    )
  );

-- 8.15 configuracoes
alter table public.configuracoes enable row level security;

create policy "Configurações: Leitura pública"
  on public.configuracoes for select
  using (true);

create policy "Configurações: Apenas admin gerencia"
  on public.configuracoes for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.16 shorts
alter table public.shorts enable row level security;

create policy "Shorts: Leitura pública"
  on public.shorts for select
  using (true);

create policy "Shorts: Admin gerencia"
  on public.shorts for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 8.17 auditoria
alter table public.auditoria enable row level security;

create policy "Auditoria: Apenas admin"
  on public.auditoria for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- 9. CONFIGURAÇÃO DE BUCKETS DE STORAGE E POLÍTICAS DE ACESSO
insert into storage.buckets (id, name, public)
values
  ('materias', 'materias', true),
  ('perfis', 'perfis', true),
  ('colunas', 'colunas', true),
  ('anuncios', 'anuncios', true)
on conflict (id) do update set public = true;

-- Políticas de Storage
create policy "Storage: Leitura pública para todos os buckets"
  on storage.objects for select
  using (bucket_id in ('materias', 'perfis', 'colunas', 'anuncios'));

create policy "Storage: Upload pelo próprio usuário ou admin"
  on storage.objects for insert
  with check (
    bucket_id in ('materias', 'perfis', 'colunas', 'anuncios')
    and (
      (auth.uid())::text = (storage.foldername(name))[1]
      or public.current_role() = 'admin'
    )
  );

create policy "Storage: Atualização pelo próprio usuário ou admin"
  on storage.objects for update
  using (
    bucket_id in ('materias', 'perfis', 'colunas', 'anuncios')
    and (
      (auth.uid())::text = (storage.foldername(name))[1]
      or public.current_role() = 'admin'
    )
  );

create policy "Storage: Exclusão pelo próprio usuário ou admin"
  on storage.objects for delete
  using (
    bucket_id in ('materias', 'perfis', 'colunas', 'anuncios')
    and (
      (auth.uid())::text = (storage.foldername(name))[1]
      or public.current_role() = 'admin'
    )
  );


-- ==============================================================================
-- MIGRATION: 20261014000001_sistema_afiliados.sql
-- ==============================================================================

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


-- ==============================================================================
-- MIGRATION: 20261014000002_novas_fontes_rss.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261014000002_novas_fontes_rss.sql
-- DESCRIÇÃO: Cadastra novas fontes de captação RSS verificadas e ativas:
--            Cobertura regional (Cidades), Política (Poder360, Senado),
--            Agronegócio (Globo Rural, Canal Rural), Economia, Tecnologia e Esportes.
-- IDEMPOTÊNCIA: Utiliza WHERE NOT EXISTS para evitar duplicações se executado mais de uma vez.
-- ==============================================================================

do $$
declare
  v_portal_id uuid;
  v_cat_cidades uuid;
  v_cat_politica uuid;
  v_cat_economia uuid;
  v_cat_agro uuid;
  v_cat_saude uuid;
  v_cat_entretenimento uuid;
  v_cat_esportes uuid;
  v_cat_geral uuid;
  
  -- Cidades
  v_cid_sp uuid;
  v_cid_campinas uuid;
  v_cid_rj uuid;
  v_cid_bh uuid;
  v_cid_salvador uuid;
  v_cid_brasilia uuid;
begin
  -- 1. Obter Portal ID
  select id into v_portal_id from public.portais limit 1;
  if v_portal_id is null then
    raise notice 'Nenhum portal cadastrado no banco. Abortando inserção de fontes.';
    return;
  end if;

  -- 2. Obter IDs das Categorias (com fallback para Geral se não existir)
  select id into v_cat_geral from public.categorias where portal_id = v_portal_id and slug = 'geral' limit 1;
  if v_cat_geral is null then
    select id into v_cat_geral from public.categorias where portal_id = v_portal_id limit 1;
  end if;

  select coalesce(id, v_cat_geral) into v_cat_cidades from public.categorias where portal_id = v_portal_id and slug = 'cidades' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_politica from public.categorias where portal_id = v_portal_id and slug = 'politica' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_economia from public.categorias where portal_id = v_portal_id and slug = 'economia' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_agro from public.categorias where portal_id = v_portal_id and slug = 'agronegocio' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_saude from public.categorias where portal_id = v_portal_id and slug = 'saude' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_entretenimento from public.categorias where portal_id = v_portal_id and slug = 'entretenimento' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_esportes from public.categorias where portal_id = v_portal_id and slug = 'esportes' limit 1;

  -- 3. Obter IDs das Cidades
  select id into v_cid_sp from public.cidades where portal_id = v_portal_id and slug = 'sao-paulo' limit 1;
  select id into v_cid_campinas from public.cidades where portal_id = v_portal_id and slug = 'campinas' limit 1;
  select id into v_cid_rj from public.cidades where portal_id = v_portal_id and slug = 'rio-de-janeiro' limit 1;
  select id into v_cid_bh from public.cidades where portal_id = v_portal_id and slug = 'belo-horizonte' limit 1;
  select id into v_cid_salvador from public.cidades where portal_id = v_portal_id and slug = 'salvador' limit 1;
  select id into v_cid_brasilia from public.cidades where portal_id = v_portal_id and slug = 'brasilia' limit 1;

  -- 4. Inserir Fontes RSS (apenas as que ainda não estiverem cadastradas)
  insert into public.fontes_rss (
    portal_id,
    nome,
    veiculo,
    url_feed,
    categoria_padrao_id,
    cidade_padrao_id,
    ativo,
    intervalo_minutos,
    max_itens_por_execucao,
    publicar_automatico
  )
  select
    v_portal_id,
    t.nome,
    t.veiculo,
    t.url_feed,
    coalesce(t.cat_id, v_cat_geral),
    t.cid_id,
    true,
    15,
    20,
    true
  from (
    values
      -- Cobertura Regional / Cidades
      ('G1 - São Paulo e Região Metropolitana', 'G1 São Paulo', 'https://g1.globo.com/rss/g1/sao-paulo/', v_cat_cidades, v_cid_sp),
      ('G1 - Campinas e Região', 'G1 Campinas', 'https://g1.globo.com/rss/g1/sp/campinas-regiao/', v_cat_cidades, v_cid_campinas),
      ('G1 - Santos e Baixada Santista', 'G1 Santos', 'https://g1.globo.com/rss/g1/sp/santos-regiao/', v_cat_cidades, null),
      ('G1 - Vale do Paraíba e Região', 'G1 Vale do Paraíba', 'https://g1.globo.com/rss/g1/sp/vale-do-paraiba-regiao/', v_cat_cidades, null),
      ('G1 - Ribeirão Preto e Franca', 'G1 Ribeirão Preto', 'https://g1.globo.com/rss/g1/sp/ribeirao-preto-franca/', v_cat_cidades, null),
      ('G1 - Rio de Janeiro', 'G1 Rio de Janeiro', 'https://g1.globo.com/rss/g1/rio-de-janeiro/', v_cat_cidades, v_cid_rj),
      ('G1 - Minas Gerais', 'G1 Minas Gerais', 'https://g1.globo.com/rss/g1/minas-gerais/', v_cat_cidades, v_cid_bh),
      ('G1 - Rio Grande do Sul', 'G1 RS', 'https://g1.globo.com/rss/g1/rs/rio-grande-do-sul/', v_cat_cidades, null),
      ('G1 - Bahia', 'G1 Bahia', 'https://g1.globo.com/rss/g1/bahia/', v_cat_cidades, v_cid_salvador),
      ('G1 - Goiás', 'G1 Goiás', 'https://g1.globo.com/rss/g1/goias/', v_cat_cidades, null),
      ('G1 - Distrito Federal e Entorno', 'G1 DF', 'https://g1.globo.com/rss/g1/distrito-federal/', v_cat_cidades, v_cid_brasilia),

      -- Política Nacional e Poder
      ('Poder360 - Notícias e Bastidores', 'Poder360', 'https://www.poder360.com.br/feed/', v_cat_politica, null),
      ('CartaCapital - Notícias e Análises', 'CartaCapital', 'https://www.cartacapital.com.br/feed/', v_cat_politica, null),
      ('Agência Senado - Votações e Projetos', 'Agência Senado', 'https://www12.senado.leg.br/noticias/feed/todasnoticias/RSS', v_cat_politica, v_cid_brasilia),
      ('Agência Brasil - Política Nacional', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br/rss/politica/feed.xml', v_cat_politica, null),

      -- Agronegócio
      ('Globo Rural - Notícias e Agronegócio', 'Globo Rural', 'https://g1.globo.com/rss/g1/economia/agronegocios/', v_cat_agro, null),
      ('Canal Rural - Notícias do Campo', 'Canal Rural', 'https://www.canalrural.com.br/feed/', v_cat_agro, null),

      -- Economia & Investimentos
      ('Money Times - Mercado e Finanças', 'Money Times', 'https://www.moneytimes.com.br/feed/', v_cat_economia, null),
      ('Agência Brasil - Economia e Mercados', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml', v_cat_economia, null),

      -- Tecnologia, Ciência & Saúde
      ('Olhar Digital - Tecnologia e Inovação', 'Olhar Digital', 'https://olhardigital.com.br/feed/', v_cat_geral, null),
      ('G1 - Ciência e Saúde', 'G1 Saúde', 'https://g1.globo.com/rss/g1/ciencia-e-saude/', v_cat_saude, null),

      -- Cultura e Entretenimento
      ('G1 - Pop & Arte, Famosos e Cultura', 'G1 Pop & Arte', 'https://g1.globo.com/rss/g1/pop-arte/', v_cat_entretenimento, null),

      -- Esportes & Clubes
      ('Trivela - Futebol do Brasil e do Mundo', 'Trivela', 'https://trivela.com.br/feed/', v_cat_esportes, null),
      ('ge.globo - Notícias do Flamengo', 'ge.globo', 'https://ge.globo.com/rss/ge/futebol/times/flamengo/', v_cat_esportes, v_cid_rj),
      ('ge.globo - Notícias do Corinthians', 'ge.globo', 'https://ge.globo.com/rss/ge/futebol/times/corinthians/', v_cat_esportes, v_cid_sp),
      ('ge.globo - Notícias do Palmeiras', 'ge.globo', 'https://ge.globo.com/rss/ge/futebol/times/palmeiras/', v_cat_esportes, v_cid_sp),
      ('ge.globo - Notícias do São Paulo FC', 'ge.globo', 'https://ge.globo.com/rss/ge/futebol/times/sao-paulo/', v_cat_esportes, v_cid_sp)
  ) as t(nome, veiculo, url_feed, cat_id, cid_id)
  where not exists (
    select 1 from public.fontes_rss f where f.url_feed = t.url_feed
  );

  raise notice 'Novas fontes RSS cadastradas com sucesso!';
end $$;


-- ==============================================================================
-- MIGRATION: 20261019000001_limpeza_automatica_materias.sql
-- ==============================================================================

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


-- ==============================================================================
-- MIGRATION: 20261020000001_novos_portais_regionais_e_nacionais.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261020000001_novos_portais_regionais_e_nacionais.sql
-- DESCRIÇÃO: Cadastra catálogo expandido com mais de 75 portais de notícias
--            regionais e nacionais (SP, MG, PR, RS, SC, GO, DF, RJ, ES, BA, MT,
--            MS, TO, SE, CE, PI, PE, MA, PB, PA, AP, RN, AC, AM, RR, RO, AL),
--            além de editorias de Economia, Negócios, Esportes e Turismo.
-- IDEMPOTÊNCIA: Utiliza ON CONFLICT e WHERE NOT EXISTS para evitar duplicações.
-- ==============================================================================

do $$
declare
  v_portal_id uuid;

  -- Categorias
  v_cat_geral uuid;
  v_cat_cidades uuid;
  v_cat_brasil uuid;
  v_cat_internacional uuid;
  v_cat_politica uuid;
  v_cat_economia uuid;
  v_cat_esportes uuid;
  v_cat_entretenimento uuid;
  v_cat_educacao uuid;

  -- Cidades
  v_cid_barueri uuid;
  v_cid_cotia uuid;
  v_cid_sp uuid;
  v_cid_uberlandia uuid;
  v_cid_assis uuid;
  v_cid_guarulhos uuid;
  v_cid_maringa uuid;
  v_cid_umuarama uuid;
  v_cid_maceio uuid;
  v_cid_uberaba uuid;
  v_cid_araguari uuid;
  v_cid_bh uuid;
  v_cid_curitiba uuid;
  v_cid_poa uuid;
  v_cid_riogrande uuid;
  v_cid_floripa uuid;
  v_cid_goiania uuid;
  v_cid_brasilia uuid;
  v_cid_rj uuid;
  v_cid_vitoria uuid;
  v_cid_salvador uuid;
  v_cid_aracaju uuid;
  v_cid_cuiaba uuid;
  v_cid_campo_grande uuid;
  v_cid_palmas uuid;
  v_cid_belem uuid;
  v_cid_macapa uuid;
  v_cid_rio_branco uuid;
  v_cid_manaus uuid;
  v_cid_boa_vista uuid;
  v_cid_porto_velho uuid;
  v_cid_fortaleza uuid;
  v_cid_teresina uuid;
  v_cid_recife uuid;
  v_cid_sao_luis uuid;
  v_cid_joao_pessoa uuid;
  v_cid_natal uuid;

begin
  -- 1. Obter Portal ID
  select id into v_portal_id from public.portais limit 1;
  if v_portal_id is null then
    raise notice 'Nenhum portal cadastrado no banco. Abortando.';
    return;
  end if;

  -- 2. Inserir Novas Cidades (se não existirem)
  insert into public.cidades (portal_id, nome, slug, uf, destaque_menu, ordem, palavras_chave)
  values
    (v_portal_id, 'Uberlândia', 'uberlandia', 'MG', false, 20, array['uberlandia', 'uberlândia', 'triangulo mineiro']::text[]),
    (v_portal_id, 'Assis', 'assis', 'SP', false, 21, array['assis', 'regiao de assis', 'assis sp']::text[]),
    (v_portal_id, 'Guarulhos', 'guarulhos', 'SP', false, 22, array['guarulhos', 'cumbica', 'cecap']::text[]),
    (v_portal_id, 'Maringá', 'maringa', 'PR', false, 23, array['maringa', 'maringá', 'norte do parana']::text[]),
    (v_portal_id, 'Umuarama', 'umuarama', 'PR', false, 24, array['umuarama', 'capital da amizade']::text[]),
    (v_portal_id, 'Uberaba', 'uberaba', 'MG', false, 25, array['uberaba', 'triangulo mineiro']::text[]),
    (v_portal_id, 'Araguari', 'araguari', 'MG', false, 26, array['araguari', 'triangulo mineiro']::text[]),
    (v_portal_id, 'Porto Alegre', 'porto-alegre', 'RS', false, 27, array['porto alegre', 'poa', 'gaucho', 'capital gaucha']::text[]),
    (v_portal_id, 'Goiânia', 'goiania', 'GO', false, 28, array['goiania', 'goiânia', 'capital goiana']::text[]),
    (v_portal_id, 'Florianópolis', 'florianopolis', 'SC', false, 29, array['florianopolis', 'florianópolis', 'floripa', 'santa catarina']::text[]),
    (v_portal_id, 'Rio Grande', 'rio-grande', 'RS', false, 30, array['rio grande', 'cidade de rio grande']::text[]),
    (v_portal_id, 'Vitória', 'vitoria', 'ES', false, 31, array['vitoria', 'vitória', 'espirito santo', 'capixaba']::text[]),
    (v_portal_id, 'Cuiabá', 'cuiaba', 'MT', false, 32, array['cuiaba', 'cuiabá', 'mato grosso', 'pantanal']::text[]),
    (v_portal_id, 'Campo Grande', 'campo-grande', 'MS', false, 33, array['campo grande', 'mato grosso do sul', 'ms']::text[]),
    (v_portal_id, 'Palmas', 'palmas', 'TO', false, 34, array['palmas', 'tocantins']::text[]),
    (v_portal_id, 'Aracaju', 'aracaju', 'SE', false, 35, array['aracaju', 'sergipe']::text[]),
    (v_portal_id, 'Fortaleza', 'fortaleza', 'CE', false, 36, array['fortaleza', 'ceara', 'ceará']::text[]),
    (v_portal_id, 'Teresina', 'teresina', 'PI', false, 37, array['teresina', 'piaui', 'piauí']::text[]),
    (v_portal_id, 'Recife', 'recife', 'PE', false, 38, array['recife', 'pernambuco']::text[]),
    (v_portal_id, 'São Luís', 'sao-luis', 'MA', false, 39, array['sao luis', 'são luís', 'maranhao', 'maranhão']::text[]),
    (v_portal_id, 'João Pessoa', 'joao-pessoa', 'PB', false, 40, array['joao pessoa', 'joão pessoa', 'paraiba', 'paraíba']::text[]),
    (v_portal_id, 'Belém', 'belem', 'PA', false, 41, array['belem', 'belém', 'para', 'pará']::text[]),
    (v_portal_id, 'Macapá', 'macapa', 'AP', false, 42, array['macapa', 'macapá', 'amapa', 'amapá']::text[]),
    (v_portal_id, 'Natal', 'natal', 'RN', false, 43, array['natal', 'rio grande do norte', 'rn']::text[]),
    (v_portal_id, 'Rio Branco', 'rio-branco', 'AC', false, 44, array['rio branco', 'acre']::text[]),
    (v_portal_id, 'Manaus', 'manaus', 'AM', false, 45, array['manaus', 'amazonas']::text[]),
    (v_portal_id, 'Boa Vista', 'boa-vista', 'RR', false, 46, array['boa vista', 'roraima']::text[]),
    (v_portal_id, 'Porto Velho', 'porto-velho', 'RO', false, 47, array['porto velho', 'rondonia', 'rondônia']::text[]),
    (v_portal_id, 'Maceió', 'maceio', 'AL', false, 48, array['maceio', 'maceió', 'alagoas']::text[])
  on conflict (portal_id, slug) do nothing;

  -- 3. Obter IDs das Categorias
  select id into v_cat_geral from public.categorias where portal_id = v_portal_id and slug = 'geral' limit 1;
  if v_cat_geral is null then
    select id into v_cat_geral from public.categorias where portal_id = v_portal_id limit 1;
  end if;

  select coalesce(id, v_cat_geral) into v_cat_cidades from public.categorias where portal_id = v_portal_id and slug = 'cidades' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_brasil from public.categorias where portal_id = v_portal_id and slug = 'brasil' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_internacional from public.categorias where portal_id = v_portal_id and slug = 'internacional' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_politica from public.categorias where portal_id = v_portal_id and slug = 'politica' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_economia from public.categorias where portal_id = v_portal_id and slug = 'economia' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_esportes from public.categorias where portal_id = v_portal_id and slug = 'esportes' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_entretenimento from public.categorias where portal_id = v_portal_id and slug = 'entretenimento' limit 1;
  select coalesce(id, v_cat_geral) into v_cat_educacao from public.categorias where portal_id = v_portal_id and slug = 'educacao' limit 1;

  -- 4. Obter IDs das Cidades
  select id into v_cid_barueri from public.cidades where portal_id = v_portal_id and slug = 'barueri' limit 1;
  select id into v_cid_cotia from public.cidades where portal_id = v_portal_id and slug = 'cotia' limit 1;
  select id into v_cid_sp from public.cidades where portal_id = v_portal_id and slug = 'sao-paulo' limit 1;
  select id into v_cid_uberlandia from public.cidades where portal_id = v_portal_id and slug = 'uberlandia' limit 1;
  select id into v_cid_assis from public.cidades where portal_id = v_portal_id and slug = 'assis' limit 1;
  select id into v_cid_guarulhos from public.cidades where portal_id = v_portal_id and slug = 'guarulhos' limit 1;
  select id into v_cid_maringa from public.cidades where portal_id = v_portal_id and slug = 'maringa' limit 1;
  select id into v_cid_umuarama from public.cidades where portal_id = v_portal_id and slug = 'umuarama' limit 1;
  select id into v_cid_maceio from public.cidades where portal_id = v_portal_id and slug = 'maceio' limit 1;
  select id into v_cid_uberaba from public.cidades where portal_id = v_portal_id and slug = 'uberaba' limit 1;
  select id into v_cid_araguari from public.cidades where portal_id = v_portal_id and slug = 'araguari' limit 1;
  select id into v_cid_bh from public.cidades where portal_id = v_portal_id and slug = 'belo-horizonte' limit 1;
  select id into v_cid_curitiba from public.cidades where portal_id = v_portal_id and slug = 'curitiba' limit 1;
  select id into v_cid_poa from public.cidades where portal_id = v_portal_id and slug = 'porto-alegre' limit 1;
  select id into v_cid_riogrande from public.cidades where portal_id = v_portal_id and slug = 'rio-grande' limit 1;
  select id into v_cid_floripa from public.cidades where portal_id = v_portal_id and slug = 'florianopolis' limit 1;
  select id into v_cid_goiania from public.cidades where portal_id = v_portal_id and slug = 'goiania' limit 1;
  select id into v_cid_brasilia from public.cidades where portal_id = v_portal_id and slug = 'brasilia' limit 1;
  select id into v_cid_rj from public.cidades where portal_id = v_portal_id and slug = 'rio-de-janeiro' limit 1;
  select id into v_cid_vitoria from public.cidades where portal_id = v_portal_id and slug = 'vitoria' limit 1;
  select id into v_cid_salvador from public.cidades where portal_id = v_portal_id and slug = 'salvador' limit 1;
  select id into v_cid_aracaju from public.cidades where portal_id = v_portal_id and slug = 'aracaju' limit 1;
  select id into v_cid_cuiaba from public.cidades where portal_id = v_portal_id and slug = 'cuiaba' limit 1;
  select id into v_cid_campo_grande from public.cidades where portal_id = v_portal_id and slug = 'campo-grande' limit 1;
  select id into v_cid_palmas from public.cidades where portal_id = v_portal_id and slug = 'palmas' limit 1;
  select id into v_cid_belem from public.cidades where portal_id = v_portal_id and slug = 'belem' limit 1;
  select id into v_cid_macapa from public.cidades where portal_id = v_portal_id and slug = 'macapa' limit 1;
  select id into v_cid_rio_branco from public.cidades where portal_id = v_portal_id and slug = 'rio-branco' limit 1;
  select id into v_cid_manaus from public.cidades where portal_id = v_portal_id and slug = 'manaus' limit 1;
  select id into v_cid_boa_vista from public.cidades where portal_id = v_portal_id and slug = 'boa-vista' limit 1;
  select id into v_cid_porto_velho from public.cidades where portal_id = v_portal_id and slug = 'porto-velho' limit 1;
  select id into v_cid_fortaleza from public.cidades where portal_id = v_portal_id and slug = 'fortaleza' limit 1;
  select id into v_cid_teresina from public.cidades where portal_id = v_portal_id and slug = 'teresina' limit 1;
  select id into v_cid_recife from public.cidades where portal_id = v_portal_id and slug = 'recife' limit 1;
  select id into v_cid_sao_luis from public.cidades where portal_id = v_portal_id and slug = 'sao-luis' limit 1;
  select id into v_cid_joao_pessoa from public.cidades where portal_id = v_portal_id and slug = 'joao-pessoa' limit 1;
  select id into v_cid_natal from public.cidades where portal_id = v_portal_id and slug = 'natal' limit 1;

  -- 5. Inserir Fontes RSS (apenas as que ainda não constam no banco)
  insert into public.fontes_rss (
    portal_id,
    nome,
    veiculo,
    url_feed,
    categoria_padrao_id,
    cidade_padrao_id,
    ativo,
    intervalo_minutos,
    max_itens_por_execucao,
    publicar_automatico
  )
  select
    v_portal_id,
    t.nome,
    t.veiculo,
    t.url_feed,
    coalesce(t.cat_id, v_cat_geral),
    t.cid_id,
    true,
    15,
    20,
    true
  from (
    values
      -- São Paulo, Alphaville, Cotia e Região
      ('Folha de Alphaville', 'Folha de Alphaville', 'https://folhadealphaville.com.br/', v_cat_cidades, v_cid_barueri),
      ('Giro S/A - Alphaville e Barueri', 'Giro S/A', 'https://girosa.com.br/cidade/alphaville-barueri/', v_cat_cidades, v_cid_barueri),
      ('Alphaville Notícias', 'Alphaville Notícias', 'https://www.alphavillenoticias.com.br/', v_cat_cidades, v_cid_barueri),
      ('Gazeta de Alphaville', 'Gazeta de Alphaville', 'https://www.gazetadealphaville.com.br/', v_cat_cidades, v_cid_barueri),
      ('Jornal Cotia Agora', 'Cotia Agora', 'https://jornalcotiaagora.com.br/', v_cat_cidades, v_cid_cotia),
      ('Portal Viva - Cotia e Granja Viana', 'Portal Viva', 'https://www.portalviva.com.br/', v_cat_cidades, v_cid_cotia),
      ('Jornal de Assis', 'Jornal de Assis', 'https://www.jornaldeassis.com.br/noticias', v_cat_cidades, v_cid_assis),
      ('Assis City', 'Assis City', 'https://www.assiscity.com/', v_cat_cidades, v_cid_assis),
      ('Jornal de Guarulhos', 'Jornal de Guarulhos', 'https://www.jornaldeguarulhos.com.br/', v_cat_cidades, v_cid_guarulhos),
      ('Guarulhos Hoje', 'Guarulhos Hoje', 'https://www.guarulhoshoje.com.br/', v_cat_cidades, v_cid_guarulhos),
      ('Diário de Guarulhos', 'Diário de Guarulhos', 'https://diariodeguarulhos.com/', v_cat_cidades, v_cid_guarulhos),
      ('Governo do Estado de São Paulo', 'SP Notícias', 'https://www.saopaulo.com.br/noticias/', v_cat_cidades, v_cid_sp),
      ('G1 São Paulo e Região', 'G1 São Paulo', 'https://g1.globo.com/sp/sao-paulo/', v_cat_cidades, v_cid_sp),
      ('Estado de São Paulo', 'Estado de São Paulo', 'https://estadodesaopaulo.com.br/', v_cat_cidades, v_cid_sp),

      -- Minas Gerais e Triângulo Mineiro
      ('Diário de Uberlândia', 'Diário de Uberlândia', 'https://diariodeuberlandia.com.br/', v_cat_cidades, v_cid_uberlandia),
      ('Jornal Correio de Uberlândia', 'Correio de Uberlândia', 'https://jornalcorreiodeuberlandia.com.br/', v_cat_cidades, v_cid_uberlandia),
      ('Uberlândia Notícia', 'Uberlândia Notícia', 'https://uberlandianoticia.com.br/', v_cat_cidades, v_cid_uberlandia),
      ('Paranaíba Mais', 'Paranaíba Mais', 'https://paranaibamais.com.br/', v_cat_cidades, v_cid_uberlandia),
      ('Jornal de Uberaba', 'Jornal de Uberaba', 'https://www.jornaldeuberaba.com.br/', v_cat_cidades, v_cid_uberaba),
      ('Gazeta do Triângulo', 'Gazeta do Triângulo', 'https://gazetadotriangulo.com.br/', v_cat_cidades, v_cid_araguari),
      ('Portal Uai - Minas Gerais', 'Uai', 'https://www.uai.com.br/', v_cat_cidades, v_cid_bh),

      -- Paraná
      ('Jornal de Maringá', 'Jornal de Maringá', 'https://jornaldemaringa.com.br/', v_cat_cidades, v_cid_maringa),
      ('O Maringá', 'O Maringá', 'https://omaringa.com.br/', v_cat_cidades, v_cid_maringa),
      ('O Diário de Maringá', 'O Diário de Maringá', 'https://odiariodemaringa.com.br/', v_cat_cidades, v_cid_maringa),
      ('Portal da Cidade Umuarama', 'Portal da Cidade', 'https://umuarama.portaldacidade.com/noticias', v_cat_cidades, v_cid_umuarama),
      ('Paraná Portal', 'Paraná Portal', 'https://www.paranaportal.com/', v_cat_cidades, v_cid_curitiba),
      ('RIC Mais - Paraná', 'RIC Mais', 'https://ric.com.br/ultimas-noticias/', v_cat_cidades, v_cid_curitiba),

      -- Rio Grande do Sul e Santa Catarina
      ('POA 24 Horas', 'POA 24 Horas', 'https://poa24horas.com.br/', v_cat_cidades, v_cid_poa),
      ('Agora RS - Porto Alegre', 'Agora RS', 'https://agorars.com/rs/porto-alegre/', v_cat_cidades, v_cid_poa),
      ('Folha de Porto Alegre', 'Folha de Porto Alegre', 'https://folhadeportoalegre.com/', v_cat_cidades, v_cid_poa),
      ('Tribuna de Porto Alegre', 'Tribuna de Porto Alegre', 'https://tribunadeportoalegre.com.br/', v_cat_cidades, v_cid_poa),
      ('Plantão Gaúcho', 'Plantão Gaúcho', 'https://plantaogaucho.com.br/', v_cat_cidades, v_cid_poa),
      ('Grupo Oceano - Rio Grande', 'Grupo Oceano', 'https://www.grupooceano.com.br/noticias', v_cat_cidades, v_cid_riogrande),
      ('R7 Rio Grande do Sul', 'R7 RS', 'https://noticias.r7.com/rio-grande-do-sul/', v_cat_cidades, v_cid_poa),
      ('SCC10 - Santa Catarina', 'SCC10', 'https://scc10.com.br/', v_cat_cidades, v_cid_floripa),
      ('NSC Total - Santa Catarina', 'NSC Total', 'https://www.nsctotal.com.br/', v_cat_cidades, v_cid_floripa),
      ('Folha do Estado SC', 'Folha do Estado SC', 'https://folhadoestadosc.com.br/', v_cat_cidades, v_cid_floripa),

      -- Goiás e Distrito Federal
      ('Mais Goiás', 'Mais Goiás', 'https://www.maisgoias.com.br/', v_cat_cidades, v_cid_goiania),
      ('Diário de Goiás', 'Diário de Goiás', 'https://diariodegoias.com.br/ultimas-noticias/', v_cat_cidades, v_cid_goiania),
      ('Diário de Goiânia', 'Diário de Goiânia', 'https://diariodegoiania.com/', v_cat_cidades, v_cid_goiania),
      ('Folha de Brasília', 'Folha de Brasília', 'https://folhadebrasilia.com/', v_cat_cidades, v_cid_brasilia),
      ('A Notícia Brasília', 'A Notícia Brasília', 'https://anoticiabrasilia.com.br/', v_cat_cidades, v_cid_brasilia),

      -- Rio de Janeiro e Espírito Santo
      ('Portal Rio de Janeiro', 'Portal RJ', 'https://portalriodejaneiro.com/ultimas-noticias', v_cat_cidades, v_cid_rj),
      ('Rio Portal', 'Rio Portal', 'https://rioportal.com.br/', v_cat_cidades, v_cid_rj),
      ('R7 Rio de Janeiro', 'R7 Rio', 'https://noticias.r7.com/rio-de-janeiro/?estado=rj', v_cat_cidades, v_cid_rj),
      ('ES365 - Espírito Santo', 'ES365', 'https://es365.com.br/', v_cat_cidades, v_cid_vitoria),
      ('Folha Vitória', 'Folha Vitória', 'https://www.folhavitoria.com.br/', v_cat_cidades, v_cid_vitoria),

      -- Bahia, Sergipe e Alagoas
      ('Portal Notícias Bahia', 'Portal Bahia', 'https://portalnoticiasbahia.com.br/', v_cat_cidades, v_cid_salvador),
      ('Bahia Notícia', 'Bahia Notícia', 'https://bahianoticia.com.br/', v_cat_cidades, v_cid_salvador),
      ('Sergipe Atual', 'Sergipe Atual', 'https://www.sergipeatual.com.br/', v_cat_cidades, v_cid_aracaju),
      ('Jornal de Sergipe', 'Jornal de Sergipe', 'https://jornaldesergipe.com.br/', v_cat_cidades, v_cid_aracaju),
      ('Tribuna Hoje - Alagoas', 'Tribuna Hoje', 'https://tribunahoje.jor.br/', v_cat_cidades, v_cid_maceio),

      -- Centro-Oeste: MT e MS
      ('Agora MT', 'Agora MT', 'https://www.agoramt.com.br/', v_cat_cidades, v_cid_cuiaba),
      ('MT Notícia', 'MT Notícia', 'https://mtenoticia.com.br/', v_cat_cidades, v_cid_cuiaba),
      ('Portal Mato Grosso', 'Portal Mato Grosso', 'https://portalmatogrosso.com.br/', v_cat_cidades, v_cid_cuiaba),
      ('Portal de Notícias MS', 'Portal MS', 'https://portaldenoticiasms.com.br/', v_cat_cidades, v_cid_campo_grande),
      ('Portal MS - Mato Grosso do Sul', 'Portal MS', 'https://portalms.com.br/', v_cat_cidades, v_cid_campo_grande),
      ('MS Notícias', 'MS Notícias', 'https://www.msnoticias.com.br/', v_cat_cidades, v_cid_campo_grande),

      -- Norte: TO, PA, AP, AC, AM, RR, RO
      ('TO Notícia', 'TO Notícia', 'https://tonoticia.com.br/', v_cat_cidades, v_cid_palmas),
      ('O Tocantins', 'O Tocantins', 'https://otocantins.com.br/', v_cat_cidades, v_cid_palmas),
      ('Portal Pará', 'Portal Pará', 'https://www.portalpara.com.br/', v_cat_cidades, v_cid_belem),
      ('Portal Amapá', 'Portal Amapá', 'https://portalamapa.com.br/', v_cat_cidades, v_cid_macapa),
      ('A Gazeta do Amapá', 'A Gazeta do Amapá', 'https://agazetadoamapa.com.br/', v_cat_cidades, v_cid_macapa),
      ('Portal Acre', 'Portal Acre', 'https://portalacre.com.br/', v_cat_cidades, v_cid_rio_branco),
      ('Notícia do Amazonas', 'Notícia do Amazonas', 'https://noticiadoamazonas.com.br/', v_cat_cidades, v_cid_manaus),
      ('O Amazonense', 'O Amazonense', 'https://oamazones.com.br/', v_cat_cidades, v_cid_manaus),
      ('Roraima On', 'Roraima On', 'https://roraimaon.com/', v_cat_cidades, v_cid_boa_vista),
      ('Roraima em Foco', 'Roraima em Foco', 'https://roraimaemfoco.com.br/', v_cat_cidades, v_cid_boa_vista),
      ('Portal de Rondônia', 'Portal de Rondônia', 'https://portalderondonia.com.br/', v_cat_cidades, v_cid_porto_velho),
      ('O Portal RO', 'O Portal RO', 'https://www.oportalro.com/', v_cat_cidades, v_cid_porto_velho),

      -- Nordeste: CE, PI, PE, MA, PB, RN
      ('Portal de Notícias CE', 'Portal CE', 'https://portaldenoticiasce.com.br/', v_cat_cidades, v_cid_fortaleza),
      ('Portal Ceará', 'Portal Ceará', 'https://portalceara.jor.br/', v_cat_cidades, v_cid_fortaleza),
      ('A Notícia do Ceará', 'A Notícia do Ceará', 'https://anoticiadoceara.com.br/', v_cat_cidades, v_cid_fortaleza),
      ('CE 24h', 'CE 24h', 'https://ce24h.com.br/', v_cat_cidades, v_cid_fortaleza),
      ('O Cearense', 'O Cearense', 'https://ocearense.com.br/', v_cat_cidades, v_cid_fortaleza),
      ('Piauí Notícias', 'Piauí Notícias', 'https://piauinoticias.com/', v_cat_cidades, v_cid_teresina),
      ('180 Graus', '180 Graus', 'https://180graus.com/', v_cat_cidades, v_cid_teresina),
      ('Notícias Piauí', 'Notícias Piauí', 'https://www.noticiaspiaui.com/', v_cat_cidades, v_cid_teresina),
      ('Portal R10', 'Portal R10', 'https://www.portalr10.com/', v_cat_cidades, v_cid_teresina),
      ('Teresina Ponto Com', 'Teresina Ponto Com', 'https://teresinapontocom.com.br/', v_cat_cidades, v_cid_teresina),
      ('Pernambuco Notícias', 'Pernambuco Notícias', 'https://pernambuconoticias.com.br/', v_cat_cidades, v_cid_recife),
      ('Portal de Pernambuco', 'Portal de Pernambuco', 'https://portaldepernambuco.com.br/', v_cat_cidades, v_cid_recife),
      ('Imirante - Maranhão', 'Imirante', 'https://imirante.com/', v_cat_cidades, v_cid_sao_luis),
      ('Portal do Maranhão', 'Portal do Maranhão', 'https://portaldomaranhao.com.br/noticias/maranhao/', v_cat_cidades, v_cid_sao_luis),
      ('Paraíba Online', 'Paraíba Online', 'https://paraibaonline.com.br/', v_cat_cidades, v_cid_joao_pessoa),
      ('Jornal da Paraíba', 'Jornal da Paraíba', 'https://jornaldaparaiba.com.br/', v_cat_cidades, v_cid_joao_pessoa),
      ('Tribuna do Norte', 'Tribuna do Norte', 'https://tribunadonorte.com.br/', v_cat_cidades, v_cid_natal),
      ('Portal do RN', 'Portal do RN', 'https://portaldorn.com/', v_cat_cidades, v_cid_natal),

      -- Nacionais e Veículos Tradicionais
      ('SBT News', 'SBT News', 'https://sbtnews.sbt.com.br/', v_cat_brasil, null),
      ('UOL Notícias', 'UOL', 'https://www.uol.com.br/', v_cat_brasil, null),
      ('UOL Notícias Diárias', 'UOL', 'https://noticias.uol.com.br/', v_cat_brasil, null),
      ('Jovem Pan News', 'Jovem Pan', 'https://jovempan.com.br/', v_cat_brasil, null),
      ('Revista Veja', 'Veja', 'https://veja.abril.com.br/', v_cat_brasil, null),
      ('Estadão - Últimas Notícias', 'Estadão', 'https://www.estadao.com.br/ultimas/', v_cat_brasil, null),
      ('Revista IstoÉ', 'IstoÉ', 'https://istoe.com.br/', v_cat_brasil, null),

      -- Economia, Negócios e Empreendedorismo
      ('Exame', 'Exame', 'https://exame.com/', v_cat_economia, null),
      ('G1 Empreendedorismo', 'G1', 'https://g1.globo.com/empreendedorismo/', v_cat_economia, null),
      ('InfoMoney Negócios', 'InfoMoney', 'https://www.infomoney.com.br/negocios/', v_cat_economia, null),
      ('Forbes Brasil', 'Forbes Brasil', 'https://forbes.com.br/', v_cat_economia, null),
      ('Brasil Novas Ideias', 'Brasil Novas Ideias', 'https://brasilnovasideias.com.br/', v_cat_economia, null),
      ('Valor Econômico', 'Valor Econômico', 'https://valor.globo.com/', v_cat_economia, null),

      -- Tecnologia
      ('TecMundo', 'TecMundo', 'https://tecmundo.net/', v_cat_geral, null),
      ('Canaltech', 'Canaltech', 'https://canaltech.com.br/ultimas/', v_cat_geral, null),

      -- Esportes
      ('ge.globo - Esportes', 'ge.globo', 'https://ge.globo.com/', v_cat_esportes, null),
      ('Lance! - Notícias do Esporte', 'Lance!', 'https://www.lance.com.br/', v_cat_esportes, null),
      ('ESPN Brasil', 'ESPN Brasil', 'https://www.espn.com.br/', v_cat_esportes, null),

      -- Entretenimento e Famosos
      ('Revista Caras', 'Caras', 'https://caras.com.br/', v_cat_entretenimento, null),
      ('IstoÉ Gente', 'IstoÉ', 'https://istoe.com.br/gente', v_cat_entretenimento, null),

      -- Educação
      ('Veja Educação', 'Veja', 'https://veja.abril.com.br/noticias-sobre/educacao/', v_cat_educacao, null),
      ('Informe Educação', 'Informe Educação', 'https://www.informeeducacao.com.br/', v_cat_educacao, null),

      -- Turismo
      ('Diário do Turismo', 'Diário do Turismo', 'https://diariodoturismo.com.br/', v_cat_geral, null),
      ('MG Turismo', 'MG Turismo', 'https://mgturismo.com.br/', v_cat_geral, null),
      ('VoeNews Turismo', 'VoeNews', 'https://voenews.com.br/', v_cat_geral, null),

      -- Internacional
      ('BBC News Brasil', 'BBC Brasil', 'https://www.bbc.com/portuguese', v_cat_internacional, null),
      ('CNN Brasil - México', 'CNN Brasil', 'https://www.cnnbrasil.com.br/tudo-sobre/mexico/', v_cat_internacional, null),
      ('Veja - México', 'Veja', 'https://veja.abril.com.br/noticias-sobre/mexico/', v_cat_internacional, null)
  ) as t(nome, veiculo, url_feed, cat_id, cid_id)
  where not exists (
    select 1 from public.fontes_rss f where f.url_feed = t.url_feed
  );

  raise notice 'Novo catálogo de portais cadastrado com sucesso!';
end $$;


-- ==============================================================================
-- MIGRATION: 20261024000001_novas_editorias_temas.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261024000001_novas_editorias_temas.sql
-- DESCRIÇÃO: Cadastra novas editorias solicitadas: Empreendedorismo, Negócios,
--            Turismo, Gastronomia, Beleza e Estética, vinculando palavras-chave,
--            cores e ordem no menu para destaque imediato no portal.
-- ==============================================================================

do $$
declare
  v_portal_id uuid;
begin
  select id into v_portal_id from public.portais order by created_at asc limit 1;
  if v_portal_id is null then
    v_portal_id := 'a0000000-0000-0000-0000-000000000001';
  end if;

  insert into public.categorias (
    id,
    portal_id,
    nome,
    slug,
    pai_id,
    exibir_menu,
    exibir_home,
    ordem_menu,
    ordem_home,
    cor,
    palavras_chave
  ) values
    (
      'c0000000-0000-0000-0000-000000000019',
      v_portal_id,
      'Empreendedorismo',
      'empreendedorismo',
      null,
      true,
      true,
      5,
      5,
      '#059669',
      array['empreendedorismo', 'empreendedor', 'startup', 'startups', 'pitch', 'venture capital', 'aceleradora', 'incubadora', 'franquia', 'franquias', 'pequenas empresas', 'pme', 'mei', 'modelo de negocio', 'inovacao']::text[]
    ),
    (
      'c0000000-0000-0000-0000-000000000020',
      v_portal_id,
      'Negócios',
      'negocios',
      null,
      true,
      true,
      6,
      6,
      '#0284c7',
      array['negócios', 'negocios', 'mercado corporativo', 'fusao', 'aquisicao', 'm&a', 'faturamento', 'receita', 'lucro', 'ebitda', 'b2b', 'varejo', 'supply chain', 'logistica', 'ceo', 'cfo', 'governanca', 'executivo']::text[]
    ),
    (
      'c0000000-0000-0000-0000-000000000021',
      v_portal_id,
      'Turismo',
      'turismo',
      null,
      true,
      true,
      9,
      9,
      '#0d9488',
      array['turismo', 'viagem', 'viagens', 'hotel', 'hoteis', 'pousada', 'resort', 'voo', 'passagem aerea', 'passagens aereas', 'ecoturismo', 'destino', 'roteiro de viagem', 'pontos turisticos', 'hospedagem', 'milhas']::text[]
    ),
    (
      'c0000000-0000-0000-0000-000000000022',
      v_portal_id,
      'Gastronomia',
      'gastronomia',
      null,
      true,
      true,
      10,
      10,
      '#ea580c',
      array['gastronomia', 'culinaria', 'restaurante', 'restaurantes', 'chef', 'prato', 'receita', 'receitas', 'cardapio', 'vinho', 'vinhos', 'enologia', 'sommelier', 'bar', 'bares', 'cafe', 'cafes', 'cafeteria', 'sobremesa', 'jantar', 'almoco', 'gourmet']::text[]
    ),
    (
      'c0000000-0000-0000-0000-000000000023',
      v_portal_id,
      'Beleza',
      'beleza',
      null,
      true,
      true,
      12,
      12,
      '#ec4899',
      array['beleza', 'maquiagem', 'cosmeticos', 'cabelo', 'cabelos', 'cuidados com a pele', 'skincare', 'batom', 'unhas', 'esmalte', 'perfume', 'perfumes', 'fragrancia', 'tendencias de beleza']::text[]
    ),
    (
      'c0000000-0000-0000-0000-000000000024',
      v_portal_id,
      'Estética',
      'estetica',
      null,
      true,
      true,
      13,
      13,
      '#a855f7',
      array['estetica', 'estética', 'harmonizacao facial', 'botox', 'preenchimento', 'dermatologia', 'clinica estetica', 'procedimento estetico', 'peeling', 'massoterapia', 'depilacao a laser', 'rejuvenescimento', 'colageno', 'bem-estar']::text[]
    )
  on conflict (portal_id, slug) do update set
    nome = excluded.nome,
    cor = excluded.cor,
    exibir_menu = excluded.exibir_menu,
    exibir_home = excluded.exibir_home,
    ordem_menu = excluded.ordem_menu,
    ordem_home = excluded.ordem_home,
    palavras_chave = excluded.palavras_chave;
end $$;


-- ==============================================================================
-- MIGRATION: 20261024000002_sistema_classificados.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261024000002_sistema_classificados.sql
-- DESCRIÇÃO: Cria a tabela de classificados para anúncios de vendas, aluguel,
--            trocas, veículos, imóveis, serviços e empregos com controle de
--            exibição em páginas, destaques na home e permissões para colunistas e admin.
-- ==============================================================================

create table if not exists public.classificados (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.portais(id) on delete cascade,
  autor_id uuid not null references public.profiles(id) on delete cascade,
  origem_tipo text not null default 'colunista' check (origem_tipo in ('admin', 'colunista')),
  
  -- Informações Principais do Anúncio
  titulo text not null,
  slug text not null,
  descricao text not null,
  tipo text not null default 'venda' check (tipo in ('venda', 'aluguel', 'troca', 'servico', 'emprego', 'outro')),
  categoria text not null default 'geral' check (categoria in (
    'imoveis', 'veiculos', 'servicos', 'negocios', 'eletronicos', 'empregos', 'agro', 'geral'
  )),
  preco numeric(12,2) default 0.00,
  preco_sob_consulta boolean default false,
  
  -- Imagens
  imagem_principal text not null,
  galeria_fotos text[] default array[]::text[],
  
  -- Localização
  cidade_id uuid references public.cidades(id) on delete set null,
  cidade_nome text,
  bairro text,
  uf varchar(2) default 'SP',
  
  -- Contatos e Conversão Direta
  contato_nome text not null,
  contato_whatsapp text not null,
  contato_telefone text,
  contato_email text,
  link_externo text,
  
  -- Regras de Exibição Solicitadas
  destaque_home boolean default false,
  destaque_classificados boolean default false,
  paginas_exibicao text[] default array['classificados']::text[],
  
  -- Status e Métricas
  status text not null default 'ativo' check (status in ('ativo', 'pausado', 'vendido', 'expirado')),
  visualizacoes int default 0,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Índices de consulta rápida
create index if not exists idx_classificados_status on public.classificados(status);
create index if not exists idx_classificados_destaque_home on public.classificados(destaque_home) where status = 'ativo';
create index if not exists idx_classificados_autor on public.classificados(autor_id);
create index if not exists idx_classificados_created_at on public.classificados(created_at desc);

-- Trigger para updated_at automático
create or replace trigger tr_classificados_updated_at
  before update on public.classificados
  for each row execute function public.set_updated_at();

-- Habilitar Row Level Security
alter table public.classificados enable row level security;

-- 1. Leitura pública de classificados ativos (ou do próprio autor / admin)
create policy "Classificados: Leitura pública de ativos"
  on public.classificados for select
  using (status = 'ativo' or autor_id = auth.uid() or public.current_role() = 'admin');

-- 2. Inserção por colunista ou admin
create policy "Classificados: Inserção por colunista ou admin"
  on public.classificados for insert
  with check (
    (autor_id = auth.uid() and public.current_role() in ('admin', 'colunista'))
    or public.current_role() = 'admin'
  );

-- 3. Atualização pelo próprio autor ou admin
create policy "Classificados: Atualização pelo dono ou admin"
  on public.classificados for update
  using (autor_id = auth.uid() or public.current_role() = 'admin')
  with check (autor_id = auth.uid() or public.current_role() = 'admin');

-- 4. Exclusão pelo próprio autor ou admin
create policy "Classificados: Exclusão pelo dono ou admin"
  on public.classificados for delete
  using (autor_id = auth.uid() or public.current_role() = 'admin');


-- ==============================================================================
-- MIGRATION: 20261026000001_cidades_prioritarias.sql
-- ==============================================================================

-- Migração: Adicionar cidades prioritárias com foco regional e ênfase editorial
-- Cotia, Uberlândia, Uberaba, São Paulo, Assis, Londrina, Maringá, Araguari, Alphaville, Barueri, Guarulhos,
-- Ribeirão Preto, São José do Rio Preto, Sorocaba, Porto Alegre, Umuarama, Campo Grande, Presidente Prudente,
-- Marília, Ourinhos, Pacaembu, Teresina, Salvador (Bahia), Praia Grande, Caldas Novas, Goiânia.

do $$
declare
  v_portal_id uuid;
begin
  select id into v_portal_id from public.portais limit 1;
  if v_portal_id is null then
    v_portal_id := 'a0000000-0000-0000-0000-000000000001'::uuid;
  end if;

  -- 1. Inserir ou atualizar cidades prioritárias com destaque_menu = true
  insert into public.cidades (portal_id, nome, slug, uf, destaque_menu, ordem, palavras_chave)
  values
    (v_portal_id, 'Cotia', 'cotia', 'SP', true, 1, array['cotia', 'granja viana', 'caucaia do alto', 'cotiano']),
    (v_portal_id, 'São Paulo', 'sao-paulo', 'SP', true, 2, array['são paulo', 'sao paulo', 'capital paulista', 'sp capital', 'paulistano']),
    (v_portal_id, 'Barueri', 'barueri', 'SP', true, 3, array['barueri', 'alphaville', 'tambore', 'tamboré']),
    (v_portal_id, 'Alphaville', 'alphaville', 'SP', true, 4, array['alphaville', 'alphaville sp', 'tambore', 'tamboré', 'barueri e alphaville']),
    (v_portal_id, 'Assis', 'assis', 'SP', true, 5, array['assis', 'regiao de assis', 'assis sp']),
    (v_portal_id, 'Guarulhos', 'guarulhos', 'SP', true, 6, array['guarulhos', 'cumbica', 'cecap']),
    (v_portal_id, 'Ribeirão Preto', 'ribeirao-preto', 'SP', true, 7, array['ribeirao preto', 'ribeirão preto', 'regiao de ribeirao']),
    (v_portal_id, 'São José do Rio Preto', 'sao-jose-do-rio-preto', 'SP', true, 8, array['sao jose do rio preto', 'são josé do rio preto', 'rio preto sp']),
    (v_portal_id, 'Sorocaba', 'sorocaba', 'SP', true, 9, array['sorocaba', 'sorocabano', 'regiao de sorocaba']),
    (v_portal_id, 'Presidente Prudente', 'presidente-prudente', 'SP', true, 10, array['presidente prudente', 'prudente sp', 'oeste paulista']),
    (v_portal_id, 'Marília', 'marilia', 'SP', true, 11, array['marilia', 'marília', 'regiao de marilia']),
    (v_portal_id, 'Ourinhos', 'ourinhos', 'SP', true, 12, array['ourinhos', 'ourinhos sp']),
    (v_portal_id, 'Pacaembu', 'pacaembu', 'SP', true, 13, array['pacaembu', 'pacaembu sp', 'alta paulista']),
    (v_portal_id, 'Praia Grande', 'praia-grande', 'SP', true, 14, array['praia grande', 'praia grande sp', 'baixada santista']),
    (v_portal_id, 'Uberlândia', 'uberlandia', 'MG', true, 15, array['uberlandia', 'uberlândia', 'triangulo mineiro']),
    (v_portal_id, 'Uberaba', 'uberaba', 'MG', true, 16, array['uberaba', 'triangulo mineiro']),
    (v_portal_id, 'Araguari', 'araguari', 'MG', true, 17, array['araguari', 'triangulo mineiro']),
    (v_portal_id, 'Londrina', 'londrina', 'PR', true, 18, array['londrina', 'londrinense', 'norte do parana', 'norte paranaense']),
    (v_portal_id, 'Maringá', 'maringa', 'PR', true, 19, array['maringa', 'maringá', 'norte do parana']),
    (v_portal_id, 'Umuarama', 'umuarama', 'PR', true, 20, array['umuarama', 'capital da amizade']),
    (v_portal_id, 'Goiânia', 'goiania', 'GO', true, 21, array['goiania', 'goiânia', 'capital goiana']),
    (v_portal_id, 'Caldas Novas', 'caldas-novas', 'GO', true, 22, array['caldas novas', 'caldas novas go', 'aguas termais']),
    (v_portal_id, 'Campo Grande', 'campo-grande', 'MS', true, 23, array['campo grande', 'mato grosso do sul', 'ms']),
    (v_portal_id, 'Porto Alegre', 'porto-alegre', 'RS', true, 24, array['porto alegre', 'poa', 'gaucho', 'capital gaucha']),
    (v_portal_id, 'Teresina', 'teresina', 'PI', true, 25, array['teresina', 'piaui', 'piauí']),
    (v_portal_id, 'Salvador', 'salvador', 'BA', true, 26, array['salvador', 'bahia', 'soteropolitano'])
  on conflict (portal_id, slug) do update set
    nome = excluded.nome,
    uf = excluded.uf,
    destaque_menu = true,
    ordem = excluded.ordem,
    palavras_chave = excluded.palavras_chave,
    updated_at = now();
end $$;


-- ==============================================================================
-- MIGRATION: 20261027000001_tabela_revistas.sql
-- ==============================================================================

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


-- ==============================================================================
-- MIGRATION: 20261030000001_cura_imagens_truncadas.sql
-- ==============================================================================

-- =============================================================================
-- MIGRATION: 20261030000001_cura_imagens_truncadas.sql
-- DESCRIÇÃO: Corrige registros existentes na tabela materias que ficaram com
--            URL de imagem do Cloudflare Image Resizing truncada sem caminho
--            do arquivo (ex: https://lncimg.lance.com.br/cdn-cgi/image/width=1200)
-- =============================================================================

update public.materias
set imagem_url = case (abs(hashtext(id::text)) % 3)
  when 0 then 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200'
  when 1 then 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1200'
  else 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=1200'
end
where imagem_url = 'https://lncimg.lance.com.br/cdn-cgi/image/width=1200'
   or imagem_url ~* '/cdn-cgi/image/[^/]+$';



-- ==============================================================================
-- MIGRATION: 20261031000001_mensalidade_colunista_250.sql
-- ==============================================================================

-- =============================================================================
-- MIGRATION: 20261031000001_mensalidade_colunista_250.sql
-- DESCRIÇÃO: Atualiza o valor oficial da mensalidade de colunista para R$ 250,00
--            e garante comissão recorrente de 20% (R$ 50,00/mês por indicado).
-- =============================================================================

update public.configuracoes
set valor = '250.00'::jsonb
where chave = 'colunista_mensalidade_valor';

update public.configuracoes
set valor = '20.00'::jsonb
where chave = 'afiliados_comissao_percentual';



-- ==============================================================================
-- MIGRATION: 20261031000002_checkout_colunista_mercadopago.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261031000002_checkout_colunista_mercadopago.sql
-- DESCRIÇÃO: Função SECURITY DEFINER para ativação automática de colunista após
--            aprovação de pagamento no Mercado Pago (R$ 250,00/mês) e crédito
--            automático de R$ 50,00 (20%) ao colunista indicador.
-- ==============================================================================

create or replace function public.ativar_colunista_pago(
  p_colunista_id uuid,
  p_mp_payment_id text,
  p_valor_pago numeric default 250.00,
  p_forma_pagamento text default 'pix',
  p_cidade_id uuid default null,
  p_nome_coluna text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_portal_id uuid;
  v_nome text;
  v_indicado_por_id uuid;
  v_assinatura_id uuid;
  v_coluna_id uuid;
  v_nome_coluna_final text;
  v_slug_coluna text;
  v_percentual numeric(5,2) := 20.00;
  v_valor_comissao numeric(10,2);
  v_mes_ref text;
  v_prox_vencimento date;
begin
  -- 1. Obter dados do colunista e portal
  select portal_id, nome, indicado_por_id
    into v_portal_id, v_nome, v_indicado_por_id
  from public.profiles
  where id = p_colunista_id;

  if v_portal_id is null then
    select id into v_portal_id from public.portais limit 1;
  end if;

  -- 2. Ativar perfil do colunista imediatamente
  update public.profiles
  set status = 'ativo',
      role = 'colunista',
      updated_at = now()
  where id = p_colunista_id;

  v_prox_vencimento := (current_date + interval '30 days')::date;
  v_mes_ref := to_char(now(), 'YYYY-MM');

  -- 3. Criar ou atualizar assinatura mensal em assinaturas_colunistas
  select id into v_assinatura_id
  from public.assinaturas_colunistas
  where colunista_id = p_colunista_id
  limit 1;

  if v_assinatura_id is not null then
    update public.assinaturas_colunistas
    set status = 'ativa',
        valor_mensal = coalesce(p_valor_pago, 250.00),
        mp_payment_id = p_mp_payment_id,
        forma_pagamento = coalesce(p_forma_pagamento, 'pix'),
        proximo_vencimento = v_prox_vencimento,
        ultimo_pagamento = now(),
        updated_at = now()
    where id = v_assinatura_id;
  else
    insert into public.assinaturas_colunistas (
      portal_id,
      colunista_id,
      valor_mensal,
      mp_payment_id,
      status,
      forma_pagamento,
      proximo_vencimento,
      ultimo_pagamento
    ) values (
      v_portal_id,
      p_colunista_id,
      coalesce(p_valor_pago, 250.00),
      p_mp_payment_id,
      'ativa',
      coalesce(p_forma_pagamento, 'pix'),
      v_prox_vencimento,
      now()
    ) returning id into v_assinatura_id;
  end if;

  -- 4. Garantir que o colunista tenha uma coluna ativa criada
  select id into v_coluna_id
  from public.colunas
  where dono_id = p_colunista_id
  limit 1;

  if v_coluna_id is not null then
    update public.colunas
    set status = 'ativa',
        cidade_id = coalesce(p_cidade_id, cidade_id),
        updated_at = now()
    where dono_id = p_colunista_id;
  else
    v_nome_coluna_final := coalesce(nullif(trim(p_nome_coluna), ''), 'Coluna ' || coalesce(v_nome, 'Empire'));
    v_slug_coluna := lower(regexp_replace(
      translate(v_nome_coluna_final, 'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn'),
      '[^a-zA-Z0-9]+', '-', 'g'
    )) || '-' || substr(p_colunista_id::text, 1, 4);

    insert into public.colunas (
      portal_id,
      dono_id,
      cidade_id,
      nome,
      slug,
      descricao,
      status,
      aceita_anuncios
    ) values (
      v_portal_id,
      p_colunista_id,
      p_cidade_id,
      v_nome_coluna_final,
      v_slug_coluna,
      'Coluna oficial no Portal Empire Cidades.',
      'ativa',
      true
    ) returning id into v_coluna_id;
  end if;

  -- 5. Creditar comissão recorrente de 20% (R$ 50,00) ao indicador (se houver e não duplicado)
  if v_indicado_por_id is not null and p_mp_payment_id is not null then
    if not exists (
      select 1 from public.comissoes_afiliados where mp_payment_id = p_mp_payment_id
    ) then
      v_valor_comissao := round((coalesce(p_valor_pago, 250.00) * v_percentual) / 100.0, 2);

      update public.profiles
      set saldo_afiliado = coalesce(saldo_afiliado, 0.00) + v_valor_comissao
      where id = v_indicado_por_id;

      insert into public.comissoes_afiliados (
        afiliado_id,
        indicado_id,
        assinatura_id,
        mp_payment_id,
        mes_referencia,
        valor_mensalidade,
        percentual_comissao,
        valor_comissao,
        status
      ) values (
        v_indicado_por_id,
        p_colunista_id,
        v_assinatura_id,
        p_mp_payment_id,
        v_mes_ref,
        coalesce(p_valor_pago, 250.00),
        v_percentual,
        v_valor_comissao,
        'creditado'
      );
    end if;
  end if;

  return jsonb_build_object(
    'sucesso', true,
    'colunista_id', p_colunista_id,
    'assinatura_id', v_assinatura_id,
    'coluna_id', v_coluna_id
  );
end;
$$;

grant execute on function public.ativar_colunista_pago(uuid, text, numeric, text, uuid, text)
  to anon, authenticated, service_role;



-- ==============================================================================
-- MIGRATION: 20261104000001_add_endereco_to_profiles.sql
-- ==============================================================================

-- Adicionar campos de endereço completo na tabela profiles para dados de colunistas e equipe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uf text;



-- ==============================================================================
-- MIGRATION: 20261107000001_colunistas_seguidores_trial.sql
-- ==============================================================================

-- =============================================================================
-- MIGRATION: Tabela de Seguidores de Colunistas e Leitores VIP (Trial 90 Dias)
-- =============================================================================

create table if not exists public.colunistas_seguidores (
  id uuid primary key default gen_random_uuid(),
  coluna_id uuid not null references public.colunas(id) on delete cascade,
  nome text not null,
  whatsapp text not null,
  email text,
  plano_trial boolean default true,
  status text default 'ativo',
  created_at timestamptz default now() not null
);

create index if not exists idx_colunistas_seguidores_coluna on public.colunistas_seguidores(coluna_id);
create index if not exists idx_colunistas_seguidores_whatsapp on public.colunistas_seguidores(whatsapp);

alter table public.colunistas_seguidores enable row level security;

create policy "Permitir inserção pública de seguidores"
  on public.colunistas_seguidores for insert
  with check (true);

create policy "Permitir leitura de seguidores pelo dono da coluna ou admin"
  on public.colunistas_seguidores for select
  using (
    exists (
      select 1 from public.colunas
      where colunas.id = colunistas_seguidores.coluna_id
      and (colunas.dono_id = auth.uid() or public.current_role() = 'admin')
    )
  );

-- Garantir leitura pública dos perfis de autores e colunistas
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Profiles: Leitura pública de autores e colunistas'
  ) then
    create policy "Profiles: Leitura pública de autores e colunistas"
      on public.profiles for select
      using (role in ('admin', 'editor', 'colunista'));
  end if;
end $$;



-- ==============================================================================
-- SEED INICIAL DE DADOS DO SISTEMA
-- ==============================================================================

-- ==============================================================================
-- SEED INICIAL DO PORTAL EMPIRE
-- Popula portal padrão, editorias hierárquicas, cidades, formatos de anúncio,
-- configurações da plataforma e catálogo de fontes RSS dos principais veículos.
-- ==============================================================================

-- 1. Portal Principal
insert into public.portais (
  id,
  nome,
  slug,
  dominio,
  cor_primaria,
  descricao_seo,
  redes_sociais,
  config
) values (
  'a0000000-0000-0000-0000-000000000001',
  'Portal Empire',
  'portal-empire',
  'portalempire.com.br',
  '#2563eb',
  'O seu portal diário de notícias locais, cobertura regional, colunas e captação em tempo real.',
  '{"instagram": "https://instagram.com/portalempire", "facebook": "https://facebook.com/portalempire", "youtube": "https://youtube.com/@portalempire"}'::jsonb,
  '{"tv_ao_vivo_ativa": false}'::jsonb
) on conflict (slug) do update set
  nome = excluded.nome,
  cor_primaria = excluded.cor_primaria,
  descricao_seo = excluded.descricao_seo;

-- 2. Categorias (Editorias)
-- Notícias (Pai)
insert into public.categorias (id, portal_id, nome, slug, pai_id, exibir_menu, exibir_home, ordem_menu, ordem_home, cor, palavras_chave)
values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Notícias', 'noticias', null, true, true, 1, 1, '#1e293b', array['noticia', 'urgente', 'aconteceu', 'fatos']::text[])
on conflict (portal_id, slug) do nothing;

-- Sub-notícias (Geral, Brasil, Internacional)
insert into public.categorias (id, portal_id, nome, slug, pai_id, exibir_menu, exibir_home, ordem_menu, ordem_home, cor, palavras_chave)
values
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Geral', 'geral', 'c0000000-0000-0000-0000-000000000001', true, false, 1, 0, '#334155', array['geral', 'cotidiano', 'sociedade']::text[]),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Brasil', 'brasil', 'c0000000-0000-0000-0000-000000000001', true, false, 2, 0, '#059669', array['brasil', 'nacional', 'pais']::text[]),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Internacional', 'internacional', 'c0000000-0000-0000-0000-000000000001', true, false, 3, 0, '#0284c7', array['mundo', 'internacional', 'exterior', 'eua', 'europa', 'oriente']::text[])
on conflict (portal_id, slug) do nothing;

-- Demais Editorias
insert into public.categorias (id, portal_id, nome, slug, pai_id, exibir_menu, exibir_home, ordem_menu, ordem_home, cor, palavras_chave)
values
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Política', 'politica', null, true, true, 2, 2, '#dc2626', array['politica', 'eleicoes', 'congresso', 'senado', 'camara', 'stf', 'governo', 'presidente', 'deputado', 'ministro']::text[]),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Governo', 'governo', null, true, false, 3, 0, '#b91c1c', array['governo', 'prefeitura', 'decreto', 'diario oficial', 'secretaria']::text[]),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Economia', 'economia', null, true, true, 4, 3, '#16a34a', array['economia', 'mercado', 'inflacao', 'dolar', 'bolsa', 'selic', 'pib', 'financas', 'imposto']::text[]),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Agronegócio', 'agronegocio', null, true, true, 5, 4, '#65a30d', array['agro', 'safra', 'agricultura', 'pecuaria', 'campo', 'soja', 'milho', 'gado', 'produtor rural']::text[]),
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Cidades', 'cidades', null, true, true, 6, 5, '#ea580c', array['cidade', 'bairro', 'rua', 'obras', 'transito', 'transporte', 'comunidade']::text[]),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Polícia', 'policia', null, true, true, 7, 6, '#475569', array['policia', 'crime', 'preso', 'prisao', 'assalto', 'investigacao', 'delegacia', 'operacao', 'seguranca']::text[]),
  ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Esportes', 'esportes', null, true, true, 8, 7, '#0284c7', array['esporte', 'futebol', 'campeonato', 'jogo', 'gol', 'brasileirao', 'libertadores', 'atleta', 'olimpiadas']::text[]),
  ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Cultura', 'cultura', null, true, false, 9, 0, '#9333ea', array['cultura', 'teatro', 'livro', 'exposicao', 'arte', 'museu', 'literatura']::text[]),
  ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'Entretenimento', 'entretenimento', null, true, true, 10, 8, '#d946ef', array['famosos', 'celebridades', 'filme', 'serie', 'cinema', 'show', 'musica', 'novela', 'bbb']::text[]),
  ('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'Saúde', 'saude', null, true, true, 11, 9, '#0d9488', array['saude', 'hospital', 'medicina', 'vacina', 'doenca', 'sus', 'prevencao', 'tratamento', 'bem-estar']::text[]),
  ('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'Educação', 'educacao', null, true, false, 12, 0, '#4f46e5', array['educacao', 'escola', 'faculdade', 'universidade', 'enem', 'estudante', 'professor', 'ensino']::text[]),
  ('c0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'Justiça', 'justica', null, true, false, 13, 0, '#3b82f6', array['justica', 'tribunal', 'juiz', 'advogado', 'processo', 'direito', 'julgamento', 'stj', 'tjd']::text[]),
  ('c0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'Meio Ambiente', 'meio-ambiente', null, true, false, 14, 0, '#15803d', array['meio ambiente', 'sustentabilidade', 'clima', 'aquecimento', 'floresta', 'preservacao', 'natureza']::text[]),
  ('c0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'Colunas', 'colunas', null, true, true, 15, 10, '#f59e0b', array['coluna', 'opiniao', 'artigo', 'analise', 'editorial']::text[]),
  ('c0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'Empreendedorismo', 'empreendedorismo', null, true, true, 16, 5, '#059669', array['empreendedorismo', 'empreendedor', 'startup', 'startups', 'pitch', 'venture capital', 'aceleradora', 'incubadora', 'franquia', 'pme', 'mei', 'inovacao']::text[]),
  ('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'Negócios', 'negocios', null, true, true, 17, 6, '#0284c7', array['negócios', 'negocios', 'mercado corporativo', 'fusao', 'aquisicao', 'm&a', 'faturamento', 'receita', 'lucro', 'ebitda', 'b2b', 'varejo', 'ceo', 'cfo']::text[]),
  ('c0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'Turismo', 'turismo', null, true, true, 18, 9, '#0d9488', array['turismo', 'viagem', 'viagens', 'hotel', 'hoteis', 'pousada', 'resort', 'voo', 'passagem aerea', 'passagens aereas', 'ecoturismo', 'destino', 'pontos turisticos']::text[]),
  ('c0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'Gastronomia', 'gastronomia', null, true, true, 19, 10, '#ea580c', array['gastronomia', 'culinaria', 'restaurante', 'restaurantes', 'chef', 'prato', 'receita', 'receitas', 'cardapio', 'vinho', 'vinhos', 'enologia', 'gourmet']::text[]),
  ('c0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'Beleza', 'beleza', null, true, true, 20, 12, '#ec4899', array['beleza', 'maquiagem', 'cosmeticos', 'cabelo', 'cabelos', 'cuidados com a pele', 'skincare', 'batom', 'unhas', 'esmalte', 'perfume', 'fragrancia']::text[]),
  ('c0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'Estética', 'estetica', null, true, true, 21, 13, '#a855f7', array['estetica', 'estética', 'harmonizacao facial', 'botox', 'preenchimento', 'dermatologia', 'clinica estetica', 'procedimento estetico', 'peeling', 'bem-estar']::text[])
on conflict (portal_id, slug) do nothing;

-- 3. Cidades
insert into public.cidades (id, portal_id, nome, slug, uf, destaque_menu, ordem, palavras_chave)
values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'São Paulo', 'sao-paulo', 'SP', true, 1, array['são paulo', 'sao paulo', 'capital paulista', 'sp capital', 'paulistano']::text[]),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Campinas', 'campinas', 'SP', true, 2, array['campinas', 'regiao metropolitana de campinas', 'rmc']::text[]),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Cotia', 'cotia', 'SP', true, 3, array['cotia', 'granjaviana', 'granja viana', 'caucaia do alto']::text[]),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Barueri', 'barueri', 'SP', true, 4, array['barueri', 'alphaville', 'tambore']::text[]),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Osasco', 'osasco', 'SP', true, 5, array['osasco', 'cidade de osasco']::text[]),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Rio de Janeiro', 'rio-de-janeiro', 'RJ', true, 6, array['rio de janeiro', 'capital fluminense', 'carioca', 'rj capital']::text[]),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Belo Horizonte', 'belo-horizonte', 'MG', true, 7, array['belo horizonte', 'bh', 'capital mineira']::text[]),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Curitiba', 'curitiba', 'PR', true, 8, array['curitiba', 'capital paranaense', 'curitibano']::text[]),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Salvador', 'salvador', 'BA', true, 9, array['salvador', 'capital baiana', 'soteropolitano']::text[]),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Brasília', 'brasilia', 'DF', true, 10, array['brasília', 'brasilia', 'distrito federal', 'df', 'planalto central']::text[])
on conflict (portal_id, slug) do nothing;

-- 4. Formatos de Anúncio
insert into public.formatos_anuncio (id, nome, posicao, largura, altura, largura_mobile, altura_mobile, preco_minimo)
values
  ('f0000000-0000-0000-0000-000000000001', 'Super Banner Topo', 'topo', 970, 90, 320, 50, 150.00),
  ('f0000000-0000-0000-0000-000000000002', 'Retângulo Lateral', 'lateral', 300, 250, 300, 250, 80.00),
  ('f0000000-0000-0000-0000-000000000003', 'Meio de Texto', 'meio_texto', 728, 90, 300, 100, 100.00),
  ('f0000000-0000-0000-0000-000000000004', 'Banner Entre Blocos Home', 'home_entre_blocos', 970, 250, 320, 100, 120.00),
  ('f0000000-0000-0000-0000-000000000005', 'Banner Rodapé', 'rodape', 728, 90, 320, 50, 60.00)
on conflict (id) do nothing;

-- 5. Configurações Globais
insert into public.configuracoes (portal_id, chave, valor, descricao)
values
  ('a0000000-0000-0000-0000-000000000001', 'comissao_padrao_percentual', '20'::jsonb, 'Percentual padrão de comissão da plataforma sobre anúncios'),
  ('a0000000-0000-0000-0000-000000000001', 'autocadastro_colunista', 'true'::jsonb, 'Permite autocadastro de colunistas com aprovação pendente'),
  ('a0000000-0000-0000-0000-000000000001', 'aprovar_colunas_manual', 'true'::jsonb, 'Exige aprovação do administrador para novas colunas'),
  ('a0000000-0000-0000-0000-000000000001', 'captacao_ativa_global', 'true'::jsonb, 'Controle mestre liga/desliga da captação RSS')
on conflict (portal_id, chave) do update set
  valor = excluded.valor;

-- 6. Fontes RSS dos Principais Veículos (Item 6.3)
-- Validadas em 2026-10-09: 13 fontes ativas, 5 desativadas por URLs descontinuadas/erro nos servidores de origem
insert into public.fontes_rss (
  portal_id,
  nome,
  veiculo,
  url_feed,
  categoria_padrao_id,
  ativo,
  intervalo_minutos,
  max_itens_por_execucao,
  publicar_automatico
) values
  ('a0000000-0000-0000-0000-000000000001', 'G1 - Notícias Gerais', 'G1', 'https://g1.globo.com/rss/g1/', 'c0000000-0000-0000-0000-000000000002', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'G1 - Política', 'G1', 'https://g1.globo.com/rss/g1/politica/', 'c0000000-0000-0000-0000-000000000005', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'G1 - Economia', 'G1', 'https://g1.globo.com/rss/g1/economia/', 'c0000000-0000-0000-0000-000000000007', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'UOL - Notícias', 'UOL', 'https://rss.uol.com.br/feed/noticias.xml', 'c0000000-0000-0000-0000-000000000003', false, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Folha de S.Paulo - Poder', 'Folha', 'https://feeds.folha.uol.com.br/poder/rss091.xml', 'c0000000-0000-0000-0000-000000000005', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Estadão - Política', 'Estadão', 'https://www.estadao.com.br/rss/politica.xml', 'c0000000-0000-0000-0000-000000000005', false, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'CNN Brasil - Geral', 'CNN Brasil', 'https://www.cnnbrasil.com.br/feed/', 'c0000000-0000-0000-0000-000000000003', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Metrópoles - Brasil', 'Metrópoles', 'https://www.metropoles.com/feed', 'c0000000-0000-0000-0000-000000000003', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'R7 - Notícias', 'R7', 'https://noticias.r7.com/feed.xml', 'c0000000-0000-0000-0000-000000000002', false, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Terra - Notícias', 'Terra', 'https://www.terra.com.br/rss/feed/noticias/', 'c0000000-0000-0000-0000-000000000002', false, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Agência Brasil - Últimas', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', 'c0000000-0000-0000-0000-000000000003', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'BBC News Brasil', 'BBC News Brasil', 'https://feeds.bbci.co.uk/portuguese/rss.xml', 'c0000000-0000-0000-0000-000000000004', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'InfoMoney - Mercados', 'InfoMoney', 'https://www.infomoney.com.br/feed/', 'c0000000-0000-0000-0000-000000000007', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Exame - Negócios', 'Exame', 'https://exame.com/feed/', 'c0000000-0000-0000-0000-000000000007', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Canaltech', 'Canaltech', 'https://canaltech.com.br/rss/', 'c0000000-0000-0000-0000-000000000002', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'TecMundo', 'TecMundo', 'https://rss.tecmundo.com.br/feed', 'c0000000-0000-0000-0000-000000000002', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'ge.globo - Esportes', 'ge.globo', 'https://ge.globo.com/rss/ge/', 'c0000000-0000-0000-0000-000000000011', true, 15, 20, true),
  ('a0000000-0000-0000-0000-000000000001', 'Lance! - Futebol', 'Lance!', 'https://www.lance.com.br/rss/', 'c0000000-0000-0000-0000-000000000011', false, 15, 20, true);


-- ==============================================================================
-- CRIAÇÃO DO USUÁRIO ADMINISTRADOR (admin@empirecidades.com.br / admin123)
-- ==============================================================================

-- ==============================================================================
-- CRIAÇÃO / ATUALIZAÇÃO DO USUÁRIO ADMINISTRADOR NO SUPABASE
-- Login: admin@empirecidades.com.br
-- Senha: admin123
-- Rota de login administrativo: /admin/login
-- ==============================================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Garantir que a tabela profiles existe e possui as colunas necessárias pelo portal
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adiciona as colunas necessárias caso a tabela profiles venha do template padrão do Supabase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nome text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'colunista';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portal_id uuid;

-- 3. Bloco principal de criação e configuração do Administrador
DO $$
DECLARE
  v_user_id uuid;
  v_portal_id uuid := NULL;
  v_email text := 'admin@empirecidades.com.br';
  v_senha text := 'admin123';
  v_nome text := 'Administrador Empire Cidades';
  v_encrypted_password text;
BEGIN
  -- 3.1 Busca o ID do portal de forma dinâmica (se a tabela portais existir)
  IF to_regclass('public.portais') IS NOT NULL THEN
    BEGIN
      EXECUTE 'SELECT id FROM public.portais LIMIT 1' INTO v_portal_id;
    EXCEPTION WHEN OTHERS THEN
      v_portal_id := NULL;
    END;
  END IF;

  -- 3.2 Gerar hash seguro bcrypt da senha
  v_encrypted_password := crypt(v_senha, gen_salt('bf'));

  -- 3.3 Verificar se o usuário já existe em auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- Inserir novo usuário em auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_password,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nome', v_nome),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Inserir identidade em auth.identities para autenticação via email/senha
    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_user_id::text,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_email),
        'email',
        v_user_id::text,
        now(),
        now(),
        now()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

  ELSE
    -- Se o usuário já existir, atualiza a senha e confirma o e-mail
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now(),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object('nome', v_nome)
    WHERE id = v_user_id;

    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_user_id::text,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_email),
        'email',
        v_user_id::text,
        now(),
        now(),
        now()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- 3.4 Configurar perfil em public.profiles como 'admin' e 'ativo'
  INSERT INTO public.profiles (
    id,
    nome,
    slug,
    email,
    role,
    status
  ) VALUES (
    v_user_id,
    v_nome,
    'admin-empirecidades',
    v_email,
    'admin',
    'ativo'
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = excluded.nome,
    email = excluded.email,
    role = 'admin',
    status = 'ativo',
    updated_at = now();

  -- Se tiver portal_id, vincula de forma segura
  IF v_portal_id IS NOT NULL THEN
    BEGIN
      EXECUTE 'UPDATE public.profiles SET portal_id = $1 WHERE id = $2' USING v_portal_id, v_user_id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RAISE NOTICE 'Administrador configurado com sucesso! ID: %', v_user_id;
END $$;

-- 4. Compatibilidade com templates que usam full_name ou username
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
    EXECUTE 'UPDATE public.profiles SET full_name = ''Administrador Empire Cidades'' WHERE email = ''admin@empirecidades.com.br''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username') THEN
    EXECUTE 'UPDATE public.profiles SET username = ''admin-empirecidades'' WHERE email = ''admin@empirecidades.com.br''';
  END IF;
END $$;

-- 5. Exibir resultado e confirmar permissões
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.status,
  p.nome
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@empirecidades.com.br';


-- ==============================================================================
-- CONFIGURAÇÃO DOS BUCKETS DO SUPABASE STORAGE
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('anuncios', 'anuncios', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('revistas', 'revistas', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('materias', 'materias', true) ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  CREATE POLICY "Public Read Anuncios" ON storage.objects FOR SELECT USING (bucket_id = 'anuncios');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Insert Anuncios" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'anuncios');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Update Anuncios" ON storage.objects FOR UPDATE USING (bucket_id = 'anuncios');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Revistas" ON storage.objects FOR SELECT USING (bucket_id = 'revistas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Insert Revistas" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'revistas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Materias" ON storage.objects FOR SELECT USING (bucket_id = 'materias');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Insert Materias" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materias');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- FORMATOS E ESPAÇOS PUBLICITÁRIOS DA PLATAFORMA
-- ==============================================================================

INSERT INTO public.formatos_anuncio (id, nome, posicao, largura, altura, descricao, preco_base)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Super Banner Topo', 'topo', 970, 90, 'Exibido com destaque máximo no topo da página', 500.00),
  ('f0000000-0000-0000-0000-000000000002', 'Retângulo Lateral', 'lateral', 300, 250, 'Exibido na barra lateral ao lado das notícias', 350.00),
  ('f0000000-0000-0000-0000-000000000003', 'Meio de Texto', 'meio_texto', 728, 90, 'Inserido no meio da leitura das matérias', 400.00),
  ('f0000000-0000-0000-0000-000000000004', 'Banner Entre Blocos Home', 'home_entre_blocos', 970, 90, 'Banner horizontal entre editorias da página inicial', 450.00),
  ('f0000000-0000-0000-0000-000000000005', 'Banner Rodapé', 'rodape', 970, 90, 'Exibido no rodapé de todas as páginas', 250.00)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  posicao = EXCLUDED.posicao,
  largura = EXCLUDED.largura,
  altura = EXCLUDED.altura;

INSERT INTO public.espacos_anuncio (id, portal_id, formato_id, dono_tipo, nome, preco_mensal, ativo)
VALUES
  ('8547e164-919e-4564-b861-6a76f9c08773', 'a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'plataforma', 'Super Banner Topo (Geral do Portal)', 500.00, true),
  ('27006ced-cdd0-4305-930f-ba17388635cc', 'a0000000-0000-0000-0000-000000000002', 'plataforma', 'Retângulo Lateral (Geral do Portal)', 350.00, true),
  ('2171284b-18ff-4a37-b90f-318755d483cc', 'a0000000-0000-0000-0000-000000000003', 'plataforma', 'Meio de Texto (Geral do Portal)', 400.00, true),
  ('63155137-2827-4ba7-a1c7-1d0eb48bd47a', 'a0000000-0000-0000-0000-000000000004', 'plataforma', 'Banner Entre Blocos Home (Geral do Portal)', 450.00, true),
  ('e9867d96-4254-4f3e-a267-590e05093451', 'a0000000-0000-0000-0000-000000000005', 'plataforma', 'Banner Rodapé (Geral do Portal)', 250.00, true)
ON CONFLICT (id) DO NOTHING;

-- Seed do Usuário Colunista (Agência P4D) e da Coluna Belo Horizonte em Foco
DO $$
DECLARE
  v_colunista_id uuid := '2d4280d1-25cc-4eb2-99d5-4ca44c9f8785';
  v_coluna_id uuid := '77a825a3-db96-49a0-9e60-e11d6b4aee9e';
  v_anunciante_id uuid := '3f6fcfd2-ef7f-4390-aa05-fd70c77e55c7';
  v_espaco_topo uuid := 'bef42427-6666-40e0-a760-144ad1553f27';
  v_espaco_rodape uuid := '77b59a41-51a4-4ecb-9df7-90e68f9c0029';
  v_cidade_id uuid;
  v_enc_pass text;
BEGIN
  -- 1. Obter ID da cidade de Belo Horizonte
  SELECT id INTO v_cidade_id FROM public.cidades WHERE slug = 'belo-horizonte' LIMIT 1;

  -- 2. Inserir usuário colunista em auth.users se não existir
  v_enc_pass := crypt('admin123', gen_salt('bf'));
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_colunista_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_colunista_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'agenciap4d123@gmail.com', v_enc_pass, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"nome": "Agência P4D - Marketing Digital"}'::jsonb,
      now(), now()
    );
  END IF;

  -- 3. Inserir ou atualizar perfil
  INSERT INTO public.profiles (
    id, portal_id, nome, slug, email, role, status
  ) VALUES (
    v_colunista_id, 'a0000000-0000-0000-0000-000000000001',
    'Agência P4D - Marketing Digital', 'agencia-p4d-marketing-digital',
    'agenciap4d123@gmail.com', 'colunista', 'ativo'
  ) ON CONFLICT (id) DO UPDATE SET status = 'ativo', role = 'colunista';

  -- 4. Inserir a coluna
  INSERT INTO public.colunas (
    id, portal_id, dono_id, cidade_id, nome, slug, descricao, status, aceita_anuncios
  ) VALUES (
    v_coluna_id, 'a0000000-0000-0000-0000-000000000001', v_colunista_id, v_cidade_id,
    'belo horizonte em foco', 'belo-horizonte-em-foco', 'Notícias e acontecimentos de Belo Horizonte e região metropolitana.',
    'ativa', true
  ) ON CONFLICT (id) DO NOTHING;

  -- 5. Inserir espaços da coluna
  INSERT INTO public.espacos_anuncio (
    id, portal_id, coluna_id, formato_id, dono_tipo, nome, preco_mensal, ativo
  ) VALUES 
    (v_espaco_topo, 'a0000000-0000-0000-0000-000000000001', v_coluna_id, 'f0000000-0000-0000-0000-000000000001', 'coluna', 'Super Banner Topo - belo horizonte em foco', 500.00, true),
    (v_espaco_rodape, 'a0000000-0000-0000-0000-000000000001', v_coluna_id, 'f0000000-0000-0000-0000-000000000005', 'coluna', 'Banner Rodapé - belo horizonte em foco', 250.00, true)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Inserir anunciante
  INSERT INTO public.anunciantes (
    id, portal_id, dono_id, nome, email, telefone
  ) VALUES (
    v_anunciante_id, 'a0000000-0000-0000-0000-000000000001', v_colunista_id,
    'Empire Rádio & TV', 'contato@empirecidades.com.br', '11999999999'
  ) ON CONFLICT (id) DO NOTHING;

  -- 7. Inserir anúncio do banner
  INSERT INTO public.anuncios (
    id, espaco_id, anunciante_id, dono_id, titulo,
    imagem_desktop_url, link_destino, inicio_em, fim_em, status, valor
  ) VALUES (
    '3f0b8284-c33c-45ee-a835-bbd435c80767', v_espaco_topo, v_anunciante_id, v_colunista_id,
    'Empire Rádio & TV [paginas:todas]',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=970',
    'https://www.empireflixvip.com/radio', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ativo', 500.00
  ) ON CONFLICT (id) DO NOTHING;
END $$;
