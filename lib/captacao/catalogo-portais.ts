export interface CidadeCatalogo {
  nome: string;
  slug: string;
  uf: string;
  palavras_chave: string[];
}

export interface FonteCatalogo {
  nome: string;
  veiculo: string;
  url_feed: string;
  categoria_slug: string;
  cidade_slug?: string;
}

export const CIDADES_CATALOGO: CidadeCatalogo[] = [
  { nome: "Uberlândia", slug: "uberlandia", uf: "MG", palavras_chave: ["uberlandia", "uberlândia", "triangulo mineiro"] },
  { nome: "Assis", slug: "assis", uf: "SP", palavras_chave: ["assis", "regiao de assis", "assis sp"] },
  { nome: "Guarulhos", slug: "guarulhos", uf: "SP", palavras_chave: ["guarulhos", "cumbica", "cecap"] },
  { nome: "Maringá", slug: "maringa", uf: "PR", palavras_chave: ["maringa", "maringá", "norte do parana"] },
  { nome: "Umuarama", slug: "umuarama", uf: "PR", palavras_chave: ["umuarama", "capital da amizade"] },
  { nome: "Uberaba", slug: "uberaba", uf: "MG", palavras_chave: ["uberaba", "triangulo mineiro"] },
  { nome: "Araguari", slug: "araguari", uf: "MG", palavras_chave: ["araguari", "triangulo mineiro"] },
  { nome: "Porto Alegre", slug: "porto-alegre", uf: "RS", palavras_chave: ["porto alegre", "poa", "gaucho", "capital gaucha"] },
  { nome: "Goiânia", slug: "goiania", uf: "GO", palavras_chave: ["goiania", "goiânia", "capital goiana"] },
  { nome: "Florianópolis", slug: "florianopolis", uf: "SC", palavras_chave: ["florianopolis", "florianópolis", "floripa", "santa catarina"] },
  { nome: "Rio Grande", slug: "rio-grande", uf: "RS", palavras_chave: ["rio grande", "cidade de rio grande"] },
  { nome: "Vitória", slug: "vitoria", uf: "ES", palavras_chave: ["vitoria", "vitória", "espirito santo", "capixaba"] },
  { nome: "Cuiabá", slug: "cuiaba", uf: "MT", palavras_chave: ["cuiaba", "cuiabá", "mato grosso", "pantanal"] },
  { nome: "Campo Grande", slug: "campo-grande", uf: "MS", palavras_chave: ["campo grande", "mato grosso do sul", "ms"] },
  { nome: "Palmas", slug: "palmas", uf: "TO", palavras_chave: ["palmas", "tocantins"] },
  { nome: "Aracaju", slug: "aracaju", uf: "SE", palavras_chave: ["aracaju", "sergipe"] },
  { nome: "Fortaleza", slug: "fortaleza", uf: "CE", palavras_chave: ["fortaleza", "ceara", "ceará"] },
  { nome: "Teresina", slug: "teresina", uf: "PI", palavras_chave: ["teresina", "piaui", "piauí"] },
  { nome: "Recife", slug: "recife", uf: "PE", palavras_chave: ["recife", "pernambuco"] },
  { nome: "São Luís", slug: "sao-luis", uf: "MA", palavras_chave: ["sao luis", "são luís", "maranhao", "maranhão"] },
  { nome: "João Pessoa", slug: "joao-pessoa", uf: "PB", palavras_chave: ["joao pessoa", "joão pessoa", "paraiba", "paraíba"] },
  { nome: "Belém", slug: "belem", uf: "PA", palavras_chave: ["belem", "belém", "para", "pará"] },
  { nome: "Macapá", slug: "macapa", uf: "AP", palavras_chave: ["macapa", "macapá", "amapa", "amapá"] },
  { nome: "Natal", slug: "natal", uf: "RN", palavras_chave: ["natal", "rio grande do norte", "rn"] },
  { nome: "Rio Branco", slug: "rio-branco", uf: "AC", palavras_chave: ["rio branco", "acre"] },
  { nome: "Manaus", slug: "manaus", uf: "AM", palavras_chave: ["manaus", "amazonas"] },
  { nome: "Boa Vista", slug: "boa-vista", uf: "RR", palavras_chave: ["boa vista", "roraima"] },
  { nome: "Porto Velho", slug: "porto-velho", uf: "RO", palavras_chave: ["porto velho", "rondonia", "rondônia"] },
  { nome: "Maceió", slug: "maceio", uf: "AL", palavras_chave: ["maceio", "maceió", "alagoas"] },
];

export const FONTES_CATALOGO: FonteCatalogo[] = [
  // Região Metropolitana de SP e Interior SP
  { nome: "Folha de Alphaville", veiculo: "Folha de Alphaville", url_feed: "https://folhadealphaville.com.br/", categoria_slug: "cidades", cidade_slug: "barueri" },
  { nome: "Giro S/A - Alphaville e Barueri", veiculo: "Giro S/A", url_feed: "https://girosa.com.br/cidade/alphaville-barueri/", categoria_slug: "cidades", cidade_slug: "barueri" },
  { nome: "Alphaville Notícias", veiculo: "Alphaville Notícias", url_feed: "https://www.alphavillenoticias.com.br/", categoria_slug: "cidades", cidade_slug: "barueri" },
  { nome: "Gazeta de Alphaville", veiculo: "Gazeta de Alphaville", url_feed: "https://www.gazetadealphaville.com.br/", categoria_slug: "cidades", cidade_slug: "barueri" },
  { nome: "Jornal Cotia Agora", veiculo: "Cotia Agora", url_feed: "https://jornalcotiaagora.com.br/", categoria_slug: "cidades", cidade_slug: "cotia" },
  { nome: "Portal Viva - Cotia e Granja Viana", veiculo: "Portal Viva", url_feed: "https://www.portalviva.com.br/", categoria_slug: "cidades", cidade_slug: "cotia" },
  { nome: "Jornal de Assis", veiculo: "Jornal de Assis", url_feed: "https://www.jornaldeassis.com.br/noticias", categoria_slug: "cidades", cidade_slug: "assis" },
  { nome: "Assis City", veiculo: "Assis City", url_feed: "https://www.assiscity.com/", categoria_slug: "cidades", cidade_slug: "assis" },
  { nome: "Jornal de Guarulhos", veiculo: "Jornal de Guarulhos", url_feed: "https://www.jornaldeguarulhos.com.br/", categoria_slug: "cidades", cidade_slug: "guarulhos" },
  { nome: "Guarulhos Hoje", veiculo: "Guarulhos Hoje", url_feed: "https://www.guarulhoshoje.com.br/", categoria_slug: "cidades", cidade_slug: "guarulhos" },
  { nome: "Diário de Guarulhos", veiculo: "Diário de Guarulhos", url_feed: "https://diariodeguarulhos.com/", categoria_slug: "cidades", cidade_slug: "guarulhos" },
  { nome: "Governo do Estado de São Paulo", veiculo: "SP Notícias", url_feed: "https://www.saopaulo.com.br/noticias/", categoria_slug: "cidades", cidade_slug: "sao-paulo" },
  { nome: "G1 São Paulo e Região", veiculo: "G1 São Paulo", url_feed: "https://g1.globo.com/sp/sao-paulo/", categoria_slug: "cidades", cidade_slug: "sao-paulo" },
  { nome: "Estado de São Paulo", veiculo: "Estado de São Paulo", url_feed: "https://estadodesaopaulo.com.br/", categoria_slug: "cidades", cidade_slug: "sao-paulo" },

  // Minas Gerais e Triângulo Mineiro
  { nome: "Diário de Uberlândia", veiculo: "Diário de Uberlândia", url_feed: "https://diariodeuberlandia.com.br/", categoria_slug: "cidades", cidade_slug: "uberlandia" },
  { nome: "Jornal Correio de Uberlândia", veiculo: "Correio de Uberlândia", url_feed: "https://jornalcorreiodeuberlandia.com.br/", categoria_slug: "cidades", cidade_slug: "uberlandia" },
  { nome: "Uberlândia Notícia", veiculo: "Uberlândia Notícia", url_feed: "https://uberlandianoticia.com.br/", categoria_slug: "cidades", cidade_slug: "uberlandia" },
  { nome: "Paranaíba Mais", veiculo: "Paranaíba Mais", url_feed: "https://paranaibamais.com.br/", categoria_slug: "cidades", cidade_slug: "uberlandia" },
  { nome: "Jornal de Uberaba", veiculo: "Jornal de Uberaba", url_feed: "https://www.jornaldeuberaba.com.br/", categoria_slug: "cidades", cidade_slug: "uberaba" },
  { nome: "Gazeta do Triângulo", veiculo: "Gazeta do Triângulo", url_feed: "https://gazetadotriangulo.com.br/", categoria_slug: "cidades", cidade_slug: "araguari" },
  { nome: "Portal Uai - Minas Gerais", veiculo: "Uai", url_feed: "https://www.uai.com.br/", categoria_slug: "cidades", cidade_slug: "belo-horizonte" },

  // Paraná
  { nome: "Jornal de Maringá", veiculo: "Jornal de Maringá", url_feed: "https://jornaldemaringa.com.br/", categoria_slug: "cidades", cidade_slug: "maringa" },
  { nome: "O Maringá", veiculo: "O Maringá", url_feed: "https://omaringa.com.br/", categoria_slug: "cidades", cidade_slug: "maringa" },
  { nome: "O Diário de Maringá", veiculo: "O Diário de Maringá", url_feed: "https://odiariodemaringa.com.br/", categoria_slug: "cidades", cidade_slug: "maringa" },
  { nome: "Portal da Cidade Umuarama", veiculo: "Portal da Cidade", url_feed: "https://umuarama.portaldacidade.com/noticias", categoria_slug: "cidades", cidade_slug: "umuarama" },
  { nome: "Paraná Portal", veiculo: "Paraná Portal", url_feed: "https://www.paranaportal.com/", categoria_slug: "cidades", cidade_slug: "curitiba" },
  { nome: "RIC Mais - Paraná", veiculo: "RIC Mais", url_feed: "https://ric.com.br/ultimas-noticias/", categoria_slug: "cidades", cidade_slug: "curitiba" },

  // Rio Grande do Sul e Santa Catarina
  { nome: "POA 24 Horas", veiculo: "POA 24 Horas", url_feed: "https://poa24horas.com.br/", categoria_slug: "cidades", cidade_slug: "porto-alegre" },
  { nome: "Agora RS - Porto Alegre", veiculo: "Agora RS", url_feed: "https://agorars.com/rs/porto-alegre/", categoria_slug: "cidades", cidade_slug: "porto-alegre" },
  { nome: "Folha de Porto Alegre", veiculo: "Folha de Porto Alegre", url_feed: "https://folhadeportoalegre.com/", categoria_slug: "cidades", cidade_slug: "porto-alegre" },
  { nome: "Tribuna de Porto Alegre", veiculo: "Tribuna de Porto Alegre", url_feed: "https://tribunadeportoalegre.com.br/", categoria_slug: "cidades", cidade_slug: "porto-alegre" },
  { nome: "Plantão Gaúcho", veiculo: "Plantão Gaúcho", url_feed: "https://plantaogaucho.com.br/", categoria_slug: "cidades", cidade_slug: "porto-alegre" },
  { nome: "Grupo Oceano - Rio Grande", veiculo: "Grupo Oceano", url_feed: "https://www.grupooceano.com.br/noticias", categoria_slug: "cidades", cidade_slug: "rio-grande" },
  { nome: "R7 Rio Grande do Sul", veiculo: "R7 RS", url_feed: "https://noticias.r7.com/rio-grande-do-sul/", categoria_slug: "cidades", cidade_slug: "porto-alegre" },
  { nome: "SCC10 - Santa Catarina", veiculo: "SCC10", url_feed: "https://scc10.com.br/", categoria_slug: "cidades", cidade_slug: "florianopolis" },
  { nome: "NSC Total - Santa Catarina", veiculo: "NSC Total", url_feed: "https://www.nsctotal.com.br/", categoria_slug: "cidades", cidade_slug: "florianopolis" },
  { nome: "Folha do Estado SC", veiculo: "Folha do Estado SC", url_feed: "https://folhadoestadosc.com.br/", categoria_slug: "cidades", cidade_slug: "florianopolis" },

  // Goiás e Distrito Federal
  { nome: "Mais Goiás", veiculo: "Mais Goiás", url_feed: "https://www.maisgoias.com.br/", categoria_slug: "cidades", cidade_slug: "goiania" },
  { nome: "Diário de Goiás", veiculo: "Diário de Goiás", url_feed: "https://diariodegoias.com.br/ultimas-noticias/", categoria_slug: "cidades", cidade_slug: "goiania" },
  { nome: "Diário de Goiânia", veiculo: "Diário de Goiânia", url_feed: "https://diariodegoiania.com/", categoria_slug: "cidades", cidade_slug: "goiania" },
  { nome: "Folha de Brasília", veiculo: "Folha de Brasília", url_feed: "https://folhadebrasilia.com/", categoria_slug: "cidades", cidade_slug: "brasilia" },
  { nome: "A Notícia Brasília", veiculo: "A Notícia Brasília", url_feed: "https://anoticiabrasilia.com.br/", categoria_slug: "cidades", cidade_slug: "brasilia" },

  // Rio de Janeiro e Espírito Santo
  { nome: "Portal Rio de Janeiro", veiculo: "Portal RJ", url_feed: "https://portalriodejaneiro.com/ultimas-noticias", categoria_slug: "cidades", cidade_slug: "rio-de-janeiro" },
  { nome: "Rio Portal", veiculo: "Rio Portal", url_feed: "https://rioportal.com.br/", categoria_slug: "cidades", cidade_slug: "rio-de-janeiro" },
  { nome: "R7 Rio de Janeiro", veiculo: "R7 Rio", url_feed: "https://noticias.r7.com/rio-de-janeiro/?estado=rj", categoria_slug: "cidades", cidade_slug: "rio-de-janeiro" },
  { nome: "ES365 - Espírito Santo", veiculo: "ES365", url_feed: "https://es365.com.br/", categoria_slug: "cidades", cidade_slug: "vitoria" },
  { nome: "Folha Vitória", veiculo: "Folha Vitória", url_feed: "https://www.folhavitoria.com.br/", categoria_slug: "cidades", cidade_slug: "vitoria" },

  // Bahia, Sergipe e Alagoas
  { nome: "Portal Notícias Bahia", veiculo: "Portal Bahia", url_feed: "https://portalnoticiasbahia.com.br/", categoria_slug: "cidades", cidade_slug: "salvador" },
  { nome: "Bahia Notícia", veiculo: "Bahia Notícia", url_feed: "https://bahianoticia.com.br/", categoria_slug: "cidades", cidade_slug: "salvador" },
  { nome: "Sergipe Atual", veiculo: "Sergipe Atual", url_feed: "https://www.sergipeatual.com.br/", categoria_slug: "cidades", cidade_slug: "aracaju" },
  { nome: "Jornal de Sergipe", veiculo: "Jornal de Sergipe", url_feed: "https://jornaldesergipe.com.br/", categoria_slug: "cidades", cidade_slug: "aracaju" },
  { nome: "Tribuna Hoje - Alagoas", veiculo: "Tribuna Hoje", url_feed: "https://tribunahoje.jor.br/", categoria_slug: "cidades", cidade_slug: "maceio" },

  // Centro-Oeste: Mato Grosso e Mato Grosso do Sul
  { nome: "Agora MT", veiculo: "Agora MT", url_feed: "https://www.agoramt.com.br/", categoria_slug: "cidades", cidade_slug: "cuiaba" },
  { nome: "MT Notícia", veiculo: "MT Notícia", url_feed: "https://mtenoticia.com.br/", categoria_slug: "cidades", cidade_slug: "cuiaba" },
  { nome: "Portal Mato Grosso", veiculo: "Portal Mato Grosso", url_feed: "https://portalmatogrosso.com.br/", categoria_slug: "cidades", cidade_slug: "cuiaba" },
  { nome: "Portal de Notícias MS", veiculo: "Portal MS", url_feed: "https://portaldenoticiasms.com.br/", categoria_slug: "cidades", cidade_slug: "campo-grande" },
  { nome: "Portal MS - Mato Grosso do Sul", veiculo: "Portal MS", url_feed: "https://portalms.com.br/", categoria_slug: "cidades", cidade_slug: "campo-grande" },
  { nome: "MS Notícias", veiculo: "MS Notícias", url_feed: "https://www.msnoticias.com.br/", categoria_slug: "cidades", cidade_slug: "campo-grande" },

  // Norte: Tocantins, Pará, Amapá, Acre, Amazonas, Roraima e Rondônia
  { nome: "TO Notícia", veiculo: "TO Notícia", url_feed: "https://tonoticia.com.br/", categoria_slug: "cidades", cidade_slug: "palmas" },
  { nome: "O Tocantins", veiculo: "O Tocantins", url_feed: "https://otocantins.com.br/", categoria_slug: "cidades", cidade_slug: "palmas" },
  { nome: "Portal Pará", veiculo: "Portal Pará", url_feed: "https://www.portalpara.com.br/", categoria_slug: "cidades", cidade_slug: "belem" },
  { nome: "Portal Amapá", veiculo: "Portal Amapá", url_feed: "https://portalamapa.com.br/", categoria_slug: "cidades", cidade_slug: "macapa" },
  { nome: "A Gazeta do Amapá", veiculo: "A Gazeta do Amapá", url_feed: "https://agazetadoamapa.com.br/", categoria_slug: "cidades", cidade_slug: "macapa" },
  { nome: "Portal Acre", veiculo: "Portal Acre", url_feed: "https://portalacre.com.br/", categoria_slug: "cidades", cidade_slug: "rio-branco" },
  { nome: "Notícia do Amazonas", veiculo: "Notícia do Amazonas", url_feed: "https://noticiadoamazonas.com.br/", categoria_slug: "cidades", cidade_slug: "manaus" },
  { nome: "O Amazonense", veiculo: "O Amazonense", url_feed: "https://oamazones.com.br/", categoria_slug: "cidades", cidade_slug: "manaus" },
  { nome: "Roraima On", veiculo: "Roraima On", url_feed: "https://roraimaon.com/", categoria_slug: "cidades", cidade_slug: "boa-vista" },
  { nome: "Roraima em Foco", veiculo: "Roraima em Foco", url_feed: "https://roraimaemfoco.com.br/", categoria_slug: "cidades", cidade_slug: "boa-vista" },
  { nome: "Portal de Rondônia", veiculo: "Portal de Rondônia", url_feed: "https://portalderondonia.com.br/", categoria_slug: "cidades", cidade_slug: "porto-velho" },
  { nome: "O Portal RO", veiculo: "O Portal RO", url_feed: "https://www.oportalro.com/", categoria_slug: "cidades", cidade_slug: "porto-velho" },

  // Nordeste: Ceará, Piauí, Pernambuco, Maranhão, Paraíba e RN
  { nome: "Portal de Notícias CE", veiculo: "Portal CE", url_feed: "https://portaldenoticiasce.com.br/", categoria_slug: "cidades", cidade_slug: "fortaleza" },
  { nome: "Portal Ceará", veiculo: "Portal Ceará", url_feed: "https://portalceara.jor.br/", categoria_slug: "cidades", cidade_slug: "fortaleza" },
  { nome: "A Notícia do Ceará", veiculo: "A Notícia do Ceará", url_feed: "https://anoticiadoceara.com.br/", categoria_slug: "cidades", cidade_slug: "fortaleza" },
  { nome: "CE 24h", veiculo: "CE 24h", url_feed: "https://ce24h.com.br/", categoria_slug: "cidades", cidade_slug: "fortaleza" },
  { nome: "O Cearense", veiculo: "O Cearense", url_feed: "https://ocearense.com.br/", categoria_slug: "cidades", cidade_slug: "fortaleza" },
  { nome: "Piauí Notícias", veiculo: "Piauí Notícias", url_feed: "https://piauinoticias.com/", categoria_slug: "cidades", cidade_slug: "teresina" },
  { nome: "180 Graus", veiculo: "180 Graus", url_feed: "https://180graus.com/", categoria_slug: "cidades", cidade_slug: "teresina" },
  { nome: "Notícias Piauí", veiculo: "Notícias Piauí", url_feed: "https://www.noticiaspiaui.com/", categoria_slug: "cidades", cidade_slug: "teresina" },
  { nome: "Portal R10", veiculo: "Portal R10", url_feed: "https://www.portalr10.com/", categoria_slug: "cidades", cidade_slug: "teresina" },
  { nome: "Teresina Ponto Com", veiculo: "Teresina Ponto Com", url_feed: "https://teresinapontocom.com.br/", categoria_slug: "cidades", cidade_slug: "teresina" },
  { nome: "Pernambuco Notícias", veiculo: "Pernambuco Notícias", url_feed: "https://pernambuconoticias.com.br/", categoria_slug: "cidades", cidade_slug: "recife" },
  { nome: "Portal de Pernambuco", veiculo: "Portal de Pernambuco", url_feed: "https://portaldepernambuco.com.br/", categoria_slug: "cidades", cidade_slug: "recife" },
  { nome: "Imirante - Maranhão", veiculo: "Imirante", url_feed: "https://imirante.com/", categoria_slug: "cidades", cidade_slug: "sao-luis" },
  { nome: "Portal do Maranhão", veiculo: "Portal do Maranhão", url_feed: "https://portaldomaranhao.com.br/noticias/maranhao/", categoria_slug: "cidades", cidade_slug: "sao-luis" },
  { nome: "Paraíba Online", veiculo: "Paraíba Online", url_feed: "https://paraibaonline.com.br/", categoria_slug: "cidades", cidade_slug: "joao-pessoa" },
  { nome: "Jornal da Paraíba", veiculo: "Jornal da Paraíba", url_feed: "https://jornaldaparaiba.com.br/", categoria_slug: "cidades", cidade_slug: "joao-pessoa" },
  { nome: "Tribuna do Norte", veiculo: "Tribuna do Norte", url_feed: "https://tribunadonorte.com.br/", categoria_slug: "cidades", cidade_slug: "natal" },
  { nome: "Portal do RN", veiculo: "Portal do RN", url_feed: "https://portaldorn.com/", categoria_slug: "cidades", cidade_slug: "natal" },

  // Nacionais: Geral, Notícias, Política e Brasil
  { nome: "SBT News", veiculo: "SBT News", url_feed: "https://sbtnews.sbt.com.br/", categoria_slug: "brasil" },
  { nome: "UOL Notícias", veiculo: "UOL", url_feed: "https://www.uol.com.br/", categoria_slug: "brasil" },
  { nome: "UOL Notícias Diárias", veiculo: "UOL", url_feed: "https://noticias.uol.com.br/", categoria_slug: "brasil" },
  { nome: "Jovem Pan News", veiculo: "Jovem Pan", url_feed: "https://jovempan.com.br/", categoria_slug: "brasil" },
  { nome: "Revista Veja", veiculo: "Veja", url_feed: "https://veja.abril.com.br/", categoria_slug: "brasil" },
  { nome: "Estadão - Últimas Notícias", veiculo: "Estadão", url_feed: "https://www.estadao.com.br/ultimas/", categoria_slug: "brasil" },
  { nome: "Revista IstoÉ", veiculo: "IstoÉ", url_feed: "https://istoe.com.br/", categoria_slug: "brasil" },

  // Economia, Negócios e Empreendedorismo
  { nome: "Exame", veiculo: "Exame", url_feed: "https://exame.com/", categoria_slug: "economia" },
  { nome: "G1 Empreendedorismo", veiculo: "G1", url_feed: "https://g1.globo.com/empreendedorismo/", categoria_slug: "economia" },
  { nome: "InfoMoney Negócios", veiculo: "InfoMoney", url_feed: "https://www.infomoney.com.br/negocios/", categoria_slug: "economia" },
  { nome: "Forbes Brasil", veiculo: "Forbes Brasil", url_feed: "https://forbes.com.br/", categoria_slug: "economia" },
  { nome: "Brasil Novas Ideias", veiculo: "Brasil Novas Ideias", url_feed: "https://brasilnovasideias.com.br/", categoria_slug: "economia" },
  { nome: "Valor Econômico", veiculo: "Valor Econômico", url_feed: "https://valor.globo.com/", categoria_slug: "economia" },

  // Tecnologia e Ciência
  { nome: "TecMundo", veiculo: "TecMundo", url_feed: "https://tecmundo.net/", categoria_slug: "geral" },
  { nome: "Canaltech", veiculo: "Canaltech", url_feed: "https://canaltech.com.br/ultimas/", categoria_slug: "geral" },

  // Esportes
  { nome: "ge.globo - Esportes", veiculo: "ge.globo", url_feed: "https://ge.globo.com/", categoria_slug: "esportes" },
  { nome: "Lance! - Notícias do Esporte", veiculo: "Lance!", url_feed: "https://www.lance.com.br/", categoria_slug: "esportes" },
  { nome: "ESPN Brasil", veiculo: "ESPN Brasil", url_feed: "https://www.espn.com.br/", categoria_slug: "esportes" },

  // Cultura, Entretenimento e Famosos
  { nome: "Revista Caras", veiculo: "Caras", url_feed: "https://caras.com.br/", categoria_slug: "entretenimento" },
  { nome: "IstoÉ Gente", veiculo: "IstoÉ", url_feed: "https://istoe.com.br/gente", categoria_slug: "entretenimento" },

  // Educação
  { nome: "Veja Educação", veiculo: "Veja", url_feed: "https://veja.abril.com.br/noticias-sobre/educacao/", categoria_slug: "educacao" },
  { nome: "Informe Educação", veiculo: "Informe Educação", url_feed: "https://www.informeeducacao.com.br/", categoria_slug: "educacao" },

  // Turismo e Viagens
  { nome: "Diário do Turismo", veiculo: "Diário do Turismo", url_feed: "https://diariodoturismo.com.br/", categoria_slug: "geral" },
  { nome: "MG Turismo", veiculo: "MG Turismo", url_feed: "https://mgturismo.com.br/", categoria_slug: "geral" },
  { nome: "VoeNews Turismo", veiculo: "VoeNews", url_feed: "https://voenews.com.br/", categoria_slug: "geral" },

  // Internacional
  { nome: "BBC News Brasil", veiculo: "BBC Brasil", url_feed: "https://www.bbc.com/portuguese", categoria_slug: "internacional" },
  { nome: "CNN Brasil - México", veiculo: "CNN Brasil", url_feed: "https://www.cnnbrasil.com.br/tudo-sobre/mexico/", categoria_slug: "internacional" },
  { nome: "Veja - México", veiculo: "Veja", url_feed: "https://veja.abril.com.br/noticias-sobre/mexico/", categoria_slug: "internacional" },
];
