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
