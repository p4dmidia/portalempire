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
