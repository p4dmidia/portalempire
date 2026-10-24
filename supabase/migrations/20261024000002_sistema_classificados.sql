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
