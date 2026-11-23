-- ==============================================================================
-- MIGRATION: Empire Talentos & Celebridades
-- ==============================================================================

-- 1. Tabela de Talentos
create table if not exists public.talentos (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid references public.portais(id) on delete set null,
  nome text not null,
  slug text unique not null,
  titulo_profissional text not null,
  whatsapp text,
  categoria text not null default 'apresentadores',
  segmentos text[] default '{}',
  foto_url text not null,
  foto_capa_url text,
  foto_capa_posicao_y integer default 50,
  cidade_id uuid references public.cidades(id) on delete set null,
  cidade_nome text default 'Uberlândia',
  estado text default 'MG',
  cidades_atendidas text default 'Nacional e Internacional',
  bio_curta text not null,
  bio_completa text,
  seguidores_total text default '+ 100 mil seguidores',
  redes_sociais jsonb default '{"instagram": "", "youtube": "", "tiktok": "", "linkedin": ""}'::jsonb,
  servicos text[] default '{}',
  modalidades text[] default '{"Presencial", "Online/Remoto"}',
  videos jsonb default '[]'::jsonb,
  galeria_fotos text[] default '{}',
  programas_tv text[] default '{}',
  verificado boolean default true,
  destaque_home boolean default true,
  ordem integer default 0,
  status text default 'ativo',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Trigger para updated_at em talentos
create or replace function public.set_talentos_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_talentos_updated_at on public.talentos;
create trigger tr_talentos_updated_at
  before update on public.talentos
  for each row execute function public.set_talentos_updated_at();

-- Índices para consultas eficientes
create index if not exists idx_talentos_status_ordem on public.talentos (status, ordem, created_at desc);
create index if not exists idx_talentos_categoria on public.talentos (categoria);
create index if not exists idx_talentos_slug on public.talentos (slug);
create index if not exists idx_talentos_cidade on public.talentos (cidade_nome);

-- 2. Tabela de Solicitações de Orçamento (Leads Comerciais)
create table if not exists public.talentos_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  talento_id uuid references public.talentos(id) on delete cascade not null,
  nome_cliente text not null,
  empresa text,
  whatsapp text not null,
  email text,
  servico_desejado text not null,
  modalidade text default 'Presencial',
  cidade_evento text,
  data_prevista text,
  descricao_briefing text,
  status text default 'pendente', -- pendente, em_atendimento, proposta_enviada, fechado, cancelado
  valor_estimado numeric(12,2),
  notas_comerciais text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Trigger para updated_at em talentos_solicitacoes
create or replace function public.set_talentos_solicitacoes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_talentos_solicitacoes_updated_at on public.talentos_solicitacoes;
create trigger tr_talentos_solicitacoes_updated_at
  before update on public.talentos_solicitacoes
  for each row execute function public.set_talentos_solicitacoes_updated_at();

create index if not exists idx_talentos_solic_talento_id on public.talentos_solicitacoes (talento_id);
create index if not exists idx_talentos_solic_status on public.talentos_solicitacoes (status, created_at desc);

-- 3. Políticas de Segurança (Row Level Security - RLS)
alter table public.talentos enable row level security;
alter table public.talentos_solicitacoes enable row level security;

-- Talentos: Leitura pública para ativos ou admin
drop policy if exists "talentos_select_policy" on public.talentos;
create policy "talentos_select_policy" on public.talentos
  for select using (
    status = 'ativo' or
    (auth.uid() is not null and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ))
  );

-- Talentos: Escrita apenas para admin
drop policy if exists "talentos_admin_insert" on public.talentos;
create policy "talentos_admin_insert" on public.talentos
  for insert with check (
    auth.uid() is not null and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "talentos_admin_update" on public.talentos;
create policy "talentos_admin_update" on public.talentos
  for update using (
    auth.uid() is not null and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "talentos_admin_delete" on public.talentos;
create policy "talentos_admin_delete" on public.talentos
  for delete using (
    auth.uid() is not null and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Solicitações: Inserção pública permitida (visitantes solicitando orçamentos)
drop policy if exists "solicitacoes_insert_public" on public.talentos_solicitacoes;
create policy "solicitacoes_insert_public" on public.talentos_solicitacoes
  for insert with check (true);

-- Solicitações: Admin tem acesso total de leitura e atualização
drop policy if exists "solicitacoes_admin_all" on public.talentos_solicitacoes;
create policy "solicitacoes_admin_all" on public.talentos_solicitacoes
  for all using (
    auth.uid() is not null and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. Inserção de dados iniciais (Seed dos 4 talentos da referência visual)
insert into public.talentos (
  nome,
  slug,
  titulo_profissional,
  categoria,
  segmentos,
  foto_url,
  cidade_nome,
  estado,
  cidades_atendidas,
  bio_curta,
  bio_completa,
  seguidores_total,
  redes_sociais,
  servicos,
  modalidades,
  verificado,
  destaque_home,
  ordem,
  status
) values
(
  'Leandro D''Ambrosio',
  'leandro-d-ambrosio',
  'Apresentador | Palestrante | Empreendedor | Autor',
  'apresentadores',
  array['Comunicação', 'Negócios', 'Sustentabilidade', 'Empreendedorismo'],
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
  'Uberlândia',
  'MG',
  'Nacional e Internacional',
  'Especialista em comunicação, negócios e sustentabilidade. Atua na TV, eventos, palestras e campanhas publicitárias.',
  'Leandro D''Ambrosio é comunicador, apresentador de televisão, escritor e palestrante com sólida trajetória no ecossistema corporativo e de mídia. Com vasta experiência diante das câmeras e nos palcos dos principais fóruns de inovação e liderança do Brasil, une credibilidade jornalística e carisma para potencializar marcas, programas e solenidades de grande porte.',
  '+ 2,5 milhões de seguidores',
  '{"instagram": "https://instagram.com", "linkedin": "https://linkedin.com", "youtube": "https://youtube.com"}'::jsonb,
  array['Comerciais de TV', 'Palestras', 'Cerimoniais', 'Programas de TV', 'Cobertura de Eventos', 'Campanhas Publicitárias'],
  array['Presencial', 'Online/Remoto'],
  true,
  true,
  1,
  'ativo'
),
(
  'Franciele Cunha',
  'franciele-cunha',
  'Apresentadora | Beauty Expert | Influenciadora',
  'influenciadores',
  array['Estética', 'Beleza', 'Bem-estar', 'Moda', 'Estilo de Vida'],
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  'Uberlândia',
  'MG',
  'Nacional',
  'Referência em estética, beleza e bem-estar. Apresenta o programa Além da Estética e atua em campanhas e eventos.',
  'Franciele Cunha é uma das maiores vozes do segmento de estética avançada, bem-estar e autocuidado no interior mineiro e nas redes sociais. Apresentadora do programa Além da Estética na TV Empire, sua comunicação autêntica e sofisticada conecta marcas a um público qualificado e de alto engajamento.',
  '+ 1,1 milhão de seguidores',
  '{"instagram": "https://instagram.com", "tiktok": "https://tiktok.com", "youtube": "https://youtube.com"}'::jsonb,
  array['Apresentações em TV', 'Campanhas publicitárias', 'Cerimoniais e eventos', 'Conteúdo digital (Influencer)', 'Presença VIP'],
  array['Presencial', 'Online/Remoto'],
  true,
  true,
  2,
  'ativo'
),
(
  'Kamilla Salgado',
  'kamilla-salgado',
  'Miss Mundo 2010 | Apresentadora | Palestrante',
  'celebridades',
  array['Moda & Beleza', 'Eventos VIP', 'Televisão', 'Publicidade'],
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'São Paulo',
  'SP',
  'Nacional e Internacional',
  'Miss Mundo 2010, empresária e comunicadora. Presença marcante em eventos, campanhas e ações de marcas.',
  'Kamilla Salgado conquistou projeção nacional e internacional como Miss Mundo Brasil 2010 e consolidou sua carreira na televisão, reality shows e mercado publicitário. Com perfil elegante e cativante, é requisitada pelas maiores marcas de varejo, moda, turismo e estética para campanhas de alcance massivo.',
  '+ 2,8 milhões de seguidores',
  '{"instagram": "https://instagram.com", "youtube": "https://youtube.com", "tiktok": "https://tiktok.com"}'::jsonb,
  array['Presença VIP', 'Apresentações e cerimoniais', 'Campanhas publicitárias', 'Palestras motivacionais', 'Ações com Influenciadores'],
  array['Presencial', 'Online/Remoto'],
  true,
  true,
  3,
  'ativo'
),
(
  'Welligton Formiga',
  'welligton-formiga',
  'Apresentador | Analista Político | Comunicador',
  'apresentadores',
  array['Política', 'Comunicação', 'Debates', 'Jornalismo', 'Economia'],
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'Brasília',
  'DF',
  'Nacional',
  'Comunicador e analista político. Apresenta programa de conteúdo político com credibilidade e grande audiência.',
  'Welligton Formiga é jornalista, analista político e apresentador com atuação destacada na cobertura de bastidores de poder, políticas públicas e cenários econômicos. Com linguagem direta e independente, comanda debates eleitorais, mediações corporativas e programas de grande repercussão.',
  '+ 850 mil seguidores',
  '{"instagram": "https://instagram.com", "youtube": "https://youtube.com", "twitter": "https://twitter.com"}'::jsonb,
  array['Programa de TV (conteúdo político)', 'Debates e mediações', 'Comerciais e campanhas', 'Palestras e eventos corporativos'],
  array['Presencial', 'Online/Remoto'],
  true,
  true,
  4,
  'ativo'
)
on conflict (slug) do nothing;
