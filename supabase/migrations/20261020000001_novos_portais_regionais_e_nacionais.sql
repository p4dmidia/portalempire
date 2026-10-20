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
