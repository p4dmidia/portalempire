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
