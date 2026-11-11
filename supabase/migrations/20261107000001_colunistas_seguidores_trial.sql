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

