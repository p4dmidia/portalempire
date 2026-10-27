/**
 * Utilitários de Otimização e Tratamento de Imagens do Portal Empire
 * 
 * Resolve problemas de:
 * 1. Miniaturas em baixa resolução capturadas via feeds RSS (?w=200, ?fit=300, etc.)
 * 2. Bloqueio e descarte de ícones genéricos de agregadores (ex: logo do Google News lh3.googleusercontent.com)
 * 3. Catálogo contextual abrangente de imagens editoriais em alta resolução (1200px+) por tema/editoria
 * 4. URLs com vírgula ou srcset concatenado (ex: "url1.webp,url2.jpg")
 * 5. Valores inválidos em og:image ("None", "null", etc.)
 * 6. Entidades HTML não decodificadas em URLs (&amp;)
 */

export const IMAGENS_EDITORIAIS_POR_TEMA: Record<string, string[]> = {
  policia: [
    "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=1200", // Viatura policial e giroflex à noite
    "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&q=80&w=1200", // Investigação e segurança pública
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", // Balança da justiça e direito
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200", // Palácio do governo e tribunal
  ],
  entretenimento: [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200", // Palco de show iluminado e festival
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200", // Show musical ao vivo e público
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200", // Cinema e artes cênicas
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200", // Música, estúdio e instrumentos
  ],
  transito: [
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1200", // Ônibus urbano e transporte coletivo
    "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1200", // Rodovia e trânsito de veículos
  ],
  justica: [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", // Balança da justiça
    "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&q=80&w=1200", // Tribunal e plenário jurídico
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1200", // Livros de direito e toga
  ],
  internacional: [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200", // Globo terrestre e mapas
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200", // Diplomacia e sede de governo
  ],
  agro: [
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200", // Campo agrícola ensolarado
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200", // Plantação de soja/milho
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200", // Trator e máquinas agrícolas
  ],
  economia: [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200", // Mercado financeiro e gráficos
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200", // Prédios corporativos e negócios
    "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200", // Reunião executiva e contratos
  ],
  cidades: [
    "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200", // Vista aérea urbana moderna
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200", // Centro da cidade movimentado
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1200", // Arquitetura urbana e praças
  ],
  politica: [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200", // Palácio do governo e parlamento
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200", // Balança da justiça e direito
    "https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&q=80&w=1200", // Plenário e debates
  ],
  esportes: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200", // Estádio iluminado
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1200", // Campo de futebol
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=1200", // Ação esportiva
  ],
  saude: [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200", // Hospital e estetoscópio
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200", // Cuidados médicos e ciência
  ],
  gastronomia: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200", // Restaurante e alta gastronomia
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200", // Prato gourmet do chef
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200", // Vinho e enologia
  ],
  turismo: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200", // Viagem, passaporte e turismo
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200", // Destino turístico, praia e sol
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200", // Resort e hotelaria
  ],
  beleza: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200", // Maquiagem e cosméticos
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200", // Skincare e cuidados de beleza
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=1200", // Produtos de beleza e batom
  ],
  estetica: [
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200", // Clínica estética e tratamento facial
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200", // Spa, bem-estar e massoterapia
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1200", // Dermatologia e procedimentos
  ],
  empreendedorismo: [
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200", // Startups, inovação e coworking
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200", // Equipe empreendedora
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200", // Estratégia e negócios
  ],
  negocios: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200", // Edifício corporativo e negócios
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200", // Mesa de negócios e contratos
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200", // Liderança executiva
  ],
  educacao: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200", // Educação, livros e estudo
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200", // Universidade e campus
  ],
  tecnologia: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200", // Tecnologia e chips
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200", // Inteligência Artificial e dados
  ],
  geral: [
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200", // Notícias e imprensa jornalística
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200", // Coletiva de imprensa e microfones
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200", // Sala de redação jornalística
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200", // Jornal impresso e café
  ],
};

export const IMAGEM_FALLBACK_PADRAO = IMAGENS_EDITORIAIS_POR_TEMA.geral[0];

/**
 * Retorna uma foto editorial contextual de alta resolução baseada no título ou editoria.
 */
export function obterImagemEditorialContextual(textoOuTema?: string): string {
  if (!textoOuTema) return IMAGEM_FALLBACK_PADRAO;
  const t = textoOuTema.toLowerCase();

  let lista: string[] = IMAGENS_EDITORIAIS_POR_TEMA.geral;

  if (
    t.includes("polic") ||
    t.includes("crime") ||
    t.includes("preso") ||
    t.includes("prisao") ||
    t.includes("delegad") ||
    t.includes("assalto") ||
    t.includes("furto") ||
    t.includes("homicid") ||
    t.includes("droga") ||
    t.includes("apreens") ||
    t.includes("tiroteio") ||
    t.includes("ocorrenc") ||
    t.includes(" pm ") ||
    t.includes("batalhao") ||
    t.includes("polícia") ||
    t.includes("disparo") ||
    t.includes("armas") ||
    t.includes("golpe") ||
    t.includes("estelionato") ||
    t.includes("violenc") ||
    t.includes("inquerito")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.policia;
  } else if (
    t.includes("entreten") ||
    t.includes("show") ||
    t.includes("musica") ||
    t.includes("música") ||
    t.includes("cantor") ||
    t.includes("cantora") ||
    t.includes("atriz") ||
    t.includes("ator") ||
    t.includes("cinema") ||
    t.includes("filme") ||
    t.includes("famos") ||
    t.includes("fama") ||
    t.includes("celebridad") ||
    t.includes("festival") ||
    t.includes("rock") ||
    t.includes("novela") ||
    t.includes(" tv ") ||
    t.includes("teatro") ||
    t.includes("arte") ||
    t.includes("cultura") ||
    t.includes("banda") ||
    t.includes("série") ||
    t.includes("concerto") ||
    t.includes("vitor kley")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.entretenimento;
  } else if (
    t.includes("onibus") ||
    t.includes("ônibus") ||
    t.includes("acidente") ||
    t.includes("rodovia") ||
    t.includes("capot") ||
    t.includes("tomba") ||
    t.includes("colisao") ||
    t.includes("colisão") ||
    t.includes("batida") ||
    t.includes("estrada") ||
    t.includes("engarrafamento") ||
    t.includes("transito") ||
    t.includes("trânsito")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.transito;
  } else if (
    t.includes("justic") ||
    t.includes("justiça") ||
    t.includes("tribunal") ||
    t.includes("stf") ||
    t.includes("stj") ||
    t.includes("tse") ||
    t.includes("tre-") ||
    t.includes("juiz") ||
    t.includes("juiza") ||
    t.includes("desembargador") ||
    t.includes("processo") ||
    t.includes("advogad") ||
    t.includes("vara") ||
    t.includes(" reu ") ||
    t.includes("liminar") ||
    t.includes("habeas") ||
    t.includes("mandado")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.justica;
  } else if (
    t.includes("internac") ||
    t.includes("mundo") ||
    t.includes(" eua ") ||
    t.includes("china") ||
    t.includes("europa") ||
    t.includes("guerra") ||
    t.includes("diplomacia") ||
    t.includes("exterior") ||
    t.includes("geopolit")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.internacional;
  } else if (
    t.includes("gastro") ||
    t.includes("culin") ||
    t.includes("restaurante") ||
    t.includes("receita") ||
    t.includes("chef") ||
    t.includes("vinho") ||
    t.includes("enolog") ||
    t.includes("sabor") ||
    t.includes("prato") ||
    t.includes("gourmet")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.gastronomia;
  } else if (
    t.includes("turis") ||
    t.includes("viage") ||
    t.includes("viagem") ||
    t.includes("hotel") ||
    t.includes("pousada") ||
    t.includes("resort") ||
    t.includes("voo") ||
    t.includes("passagem aerea") ||
    t.includes("aeroporto") ||
    t.includes("destino")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.turismo;
  } else if (
    t.includes("estet") ||
    t.includes("estética") ||
    t.includes("harmonizacao") ||
    t.includes("botox") ||
    t.includes("procedimento estetico") ||
    t.includes("spa") ||
    t.includes("massoterapia") ||
    t.includes("peeling")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.estetica;
  } else if (
    t.includes("belez") ||
    t.includes("maquiagem") ||
    t.includes("cosmetic") ||
    t.includes("skincare") ||
    t.includes("batom") ||
    t.includes("unhas") ||
    t.includes("perfume") ||
    t.includes("cabelo")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.beleza;
  } else if (
    t.includes("empreend") ||
    t.includes("startup") ||
    t.includes("pitch") ||
    t.includes("franquia") ||
    t.includes("incubadora") ||
    t.includes("aceleradora") ||
    t.includes("pme") ||
    t.includes("mei") ||
    t.includes("pequenas empresas")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.empreendedorismo;
  } else if (
    t.includes("negoc") ||
    t.includes("negócio") ||
    t.includes("m&a") ||
    t.includes("fusao") ||
    t.includes("corporat") ||
    t.includes("varejo") ||
    t.includes("supply chain") ||
    t.includes("ebitda") ||
    t.includes("ceo") ||
    t.includes("cfo")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.negocios;
  } else if (
    t.includes("educa") ||
    t.includes("escola") ||
    t.includes("faculdade") ||
    t.includes("universidade") ||
    t.includes("enem") ||
    t.includes("estudante") ||
    t.includes("professor") ||
    t.includes("aluno")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.educacao;
  } else if (
    t.includes("agro") ||
    t.includes("soja") ||
    t.includes("milho") ||
    t.includes("safra") ||
    t.includes("cafeicultura") ||
    t.includes("pecuaria") ||
    t.includes("campo")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.agro;
  } else if (
    t.includes("econ") ||
    t.includes("financ") ||
    t.includes("mercado") ||
    t.includes("dolar") ||
    t.includes("dólar") ||
    t.includes("juros") ||
    t.includes("acao") ||
    t.includes("recuperacao judicial") ||
    t.includes("b2b")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.economia;
  } else if (
    t.includes("polit") ||
    t.includes("governo") ||
    t.includes("prefeito") ||
    t.includes("prefeitura") ||
    t.includes("camara") ||
    t.includes("câmara") ||
    t.includes("eleicao") ||
    t.includes("eleição") ||
    t.includes("lei") ||
    t.includes("plenario") ||
    t.includes("deputad") ||
    t.includes("senador") ||
    t.includes("lula") ||
    t.includes("bolsonaro")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.politica;
  } else if (
    t.includes("esport") ||
    t.includes("futebol") ||
    t.includes("gol") ||
    t.includes("corinthians") ||
    t.includes("palmeiras") ||
    t.includes("flamengo") ||
    t.includes("copa") ||
    t.includes("campeonato") ||
    t.includes("atleta")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.esportes;
  } else if (
    t.includes("saude") ||
    t.includes("saúde") ||
    t.includes("vacina") ||
    t.includes("hospital") ||
    t.includes("medico") ||
    t.includes("médico") ||
    t.includes("dengue") ||
    t.includes("doenca") ||
    t.includes("doença") ||
    t.includes("remedio") ||
    t.includes("medicamento")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.saude;
  } else if (
    t.includes("tec") ||
    t.includes("ia ") ||
    t.includes("inteligencia artificial") ||
    t.includes("celular") ||
    t.includes("software") ||
    t.includes("chatgpt") ||
    t.includes("smartphone") ||
    t.includes("app ")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.tecnologia;
  } else if (
    t.includes("cidade") ||
    t.includes("maringa") ||
    t.includes("uberlandia") ||
    t.includes("assis") ||
    t.includes("guarulhos") ||
    t.includes("porto alegre") ||
    t.includes("joao pessoa") ||
    t.includes("joão pessoa") ||
    t.includes("salvador") ||
    t.includes("bairro") ||
    t.includes("rua") ||
    t.includes("obra") ||
    t.includes("morador")
  ) {
    lista = IMAGENS_EDITORIAIS_POR_TEMA.cidades;
  }

  // Seleciona deterministicamente pelo tamanho do texto para dar variedade harmônica na página
  const index = Math.abs(textoOuTema.length) % lista.length;
  return lista[index];
}

/**
 * Limpa e otimiza a URL da imagem para garantir a máxima resolução e qualidade possíveis.
 * Corrige URLs com vírgula (srcset concatenado), rejeita ícones/placeholders de agregadores
 * e aplica fallback editorial contextual de alta qualidade.
 */
export function otimizarUrlImagem(url?: string | null, contexto?: string): string {
  if (!url || typeof url !== "string") {
    return obterImagemEditorialContextual(contexto);
  }

  let limpa = url.replace(/&amp;/g, "&").trim();

  // Corrige URLs compostas por vírgula (ex: "url.webp,url.jpg" ou "url1.webp, https://url2.jpg")
  if (
    limpa.includes(",") &&
    (limpa.includes(",http") || limpa.includes(", http") || (limpa.match(/https?:\/\//g) || []).length > 1)
  ) {
    const partes = limpa
      .split(",")
      .map((p) => p.trim().split(/\s+/)[0])
      .filter(Boolean);
    const valida = partes.find(
      (p) =>
        (p.startsWith("http://") || p.startsWith("https://")) &&
        !p.includes("googleusercontent.com") &&
        !p.includes("placeholder")
    );
    if (valida) {
      limpa = valida;
    } else {
      return obterImagemEditorialContextual(contexto);
    }
  }

  // Rejeita valores nulos em formato texto ou strings vazias
  if (
    limpa === "None" ||
    limpa === "null" ||
    limpa === "undefined" ||
    limpa === "none" ||
    (!limpa.startsWith("http://") && !limpa.startsWith("https://") && !limpa.startsWith("/"))
  ) {
    return obterImagemEditorialContextual(contexto);
  }

  // Rejeita placeholders genéricos, ícones do Google News, avatares e imagem genérica legada de jornal
  const u = limpa.toLowerCase();
  if (
    u.includes("googleusercontent.com") ||
    u.includes("gstatic.com") ||
    u.includes("google.com/images") ||
    u.includes("news.google.com") ||
    u.includes("default-image") ||
    u.includes("placeholder") ||
    u.includes("fallbackimage") ||
    u.includes("logo-original") ||
    u.includes("avatar") ||
    u.includes("1x1") ||
    u.includes("pixel") ||
    u.includes("tracking") ||
    u.includes("beacon") ||
    u.includes("gravatar") ||
    u.includes("photo-1504711434969")
  ) {
    return obterImagemEditorialContextual(contexto);
  }

  // 1. CNN Brasil: remove parâmetros de redimensionamento miniatura (?w=200, ?w=193&h=...)
  if (limpa.includes("cnnbrasil.com.br")) {
    limpa = limpa.replace(/\?w=\d+.*$/i, "");
    limpa = limpa.replace(/\?.*(crop|quality|resize)=.*$/i, "");
  }

  // 2. InfoMoney: remove ?fit=300%2C200&quality=70... para entregar a foto original de alta resolução
  if (limpa.includes("infomoney.com.br")) {
    limpa = limpa.replace(/\?fit=\d+%2C\d+.*$/i, "");
    limpa = limpa.replace(/\?.*quality=\d+.*$/i, "");
  }

  // 3. Imagens da Globo/G1: se tiver thumbnail de largura baixa (ex: /300x0/ ou /200x0/ ou /x240/), atualiza para 1200x0
  if (limpa.includes("glbimg.com")) {
    limpa = limpa.replace(/\/\d{2,3}x\d{0,4}\//i, "/1200x0/");
    limpa = limpa.replace(/\/x\d{2,3}\//i, "/1200x0/");
  }

  // 4. Amazon: substitui miniatura SL300/SL500 por SL1200
  if (limpa.includes("media-amazon.com")) {
    limpa = limpa.replace(/\._SL\d{2,3}_\./i, "._SL1200_.");
  }

  // 5. WordPress em geral: remove sufixos de miniatura pequena (-150x150, -300x200, -300x169)
  limpa = limpa.replace(/(-\d{2,3}x\d{2,3})(\.(jpe?g|png|webp|avif))/i, "$2");

  // 6. Remove parâmetros genéricos de thumbnail miniatura que forçam menos de 500px
  if (/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(?:&|$)/i.test(limpa)) {
    limpa = limpa.replace(/[?&](?:w|width|size|resize|thumb)=(?:[1-4]\d{2}|\d{1,2})(&|$)/i, "$1");
    limpa = limpa.replace(/[?&]$/, "");
  }

  return limpa || obterImagemEditorialContextual(contexto);
}
