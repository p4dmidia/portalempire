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
