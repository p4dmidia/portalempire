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
