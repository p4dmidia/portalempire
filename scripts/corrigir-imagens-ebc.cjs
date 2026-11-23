const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const IMAGENS_EDITORIAIS = {
  policia: [
    "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200",
  ],
  clima: [
    "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=1200", // Chuva torrencial
    "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80&w=1200", // Temporal e nuvens escuras
    "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&q=80&w=1200", // Tempestade e raios
  ],
  economia: [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200", // Bolsa de valores / Dólar
  ],
  educacao: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200",
  ],
  esportes: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200",
  ],
  politica: [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&q=80&w=1200",
  ],
  sociedade: [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200",
  ],
  brasil: [
    "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1200",
  ],
};

function escolherImagemEditorial(titulo) {
  const t = (titulo || "").toLowerCase();
  let pool = IMAGENS_EDITORIAIS.brasil;

  if (t.includes("temporal") || t.includes("chuva") || t.includes("tempestade") || t.includes("enchente") || t.includes("clima")) {
    pool = IMAGENS_EDITORIAIS.clima;
  } else if (t.includes("dolar") || t.includes("mercado") || t.includes("cbs") || t.includes("reforma") || t.includes("invest") || t.includes("sebrae") || t.includes("empreend") || t.includes("financeir") || t.includes("receita") || t.includes("economia")) {
    pool = IMAGENS_EDITORIAIS.economia;
  } else if (t.includes("escola") || t.includes("estud") || t.includes("olitef") || t.includes("matematica") || t.includes("professor") || t.includes("enem") || t.includes("educac") || t.includes("ensino") || t.includes("universidade")) {
    pool = IMAGENS_EDITORIAIS.educacao;
  } else if (t.includes("jogo") || t.includes("fifa") || t.includes("convocada") || t.includes("futebol") || t.includes("judo") || t.includes("atleta") || t.includes("esporte") || t.includes("flamengo") || t.includes("palmeiras") || t.includes("vela")) {
    pool = IMAGENS_EDITORIAIS.esportes;
  } else if (t.includes("pf") || t.includes("policia") || t.includes("crime") || t.includes("preso") || t.includes("homicidio") || t.includes("stf") || t.includes("justica") || t.includes("inquerito") || t.includes("condenado")) {
    pool = IMAGENS_EDITORIAIS.policia;
  } else if (t.includes("lgbti") || t.includes("parada") || t.includes("negros") || t.includes("mulher") || t.includes("social") || t.includes("comunidade") || t.includes("cultura") || t.includes("streaming") || t.includes("filme")) {
    pool = IMAGENS_EDITORIAIS.sociedade;
  } else if (t.includes("lula") || t.includes("bolsonaro") || t.includes("senado") || t.includes("camara") || t.includes("governo") || t.includes("politica") || t.includes("ministr")) {
    pool = IMAGENS_EDITORIAIS.politica;
  }

  // Hash simples para selecionar com consistência
  let hash = 0;
  for (let i = 0; i < t.length; i++) hash = (hash * 31 + t.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

async function run() {
  console.log("=== INICIANDO CURA DE IMAGENS QUEBRADAS/EBC.PNG ===");

  const authClient = createClient(supabaseUrl, anonKey);
  const { data: authData } = await authClient.auth.signInWithPassword({
    email: "admin@empirecidades.com.br",
    password: "admin123",
  });

  const token = authData?.session?.access_token;
  const clientOptions = token
    ? { global: { headers: { Authorization: `Bearer ${token}` } } }
    : {};

  const keyToUse = (!serviceKey || serviceKey.includes("dummy")) ? anonKey : serviceKey;
  const supabase = createClient(supabaseUrl, keyToUse, clientOptions);

  // 1. Buscar matérias com ebc.png
  const { data: materias, error } = await supabase
    .from("materias")
    .select("id, titulo, url_original, imagem_url")
    .ilike("imagem_url", "%ebc.png%");

  if (error) {
    console.error("Erro ao buscar matérias:", error);
    return;
  }

  console.log(`Encontradas ${materias.length} matérias com ebc.png para corrigir.`);

  // 2. Buscar feed da Agência Brasil para mapear fotos de destaque reais se existirem
  const feedUrls = [
    "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
    "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml",
    "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml",
    "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml",
    "https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml",
    "https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml",
  ];

  const mapFotosFeed = new Map();

  for (const fUrl of feedUrls) {
    try {
      const res = await fetch(fUrl);
      const text = await res.text();
      // Match de itens com link e imagem-destaque
      const itemMatches = text.match(/<item>[\s\S]*?<\/item>/gi) || [];
      for (const itemXml of itemMatches) {
        const linkMatch = itemXml.match(/<link>([^<]+)<\/link>/i);
        const imgMatch = itemXml.match(/<imagem-destaque>([^<]+)<\/imagem-destaque>/i);
        if (linkMatch && imgMatch) {
          const l = linkMatch[1].trim();
          const img = imgMatch[1].trim();
          if (img && !img.includes("ebc.png") && !img.includes(".svg")) {
            mapFotosFeed.set(l, img);
          }
        }
      }
    } catch (e) {
      // Ignora erro no feed secundário
    }
  }

  console.log(`Mapeadas ${mapFotosFeed.size} imagens oficiais diretas dos feeds.`);

  // 3. Atualizar cada matéria
  let totalAtualizadas = 0;
  for (const m of materias) {
    let novaFoto = mapFotosFeed.get(m.url_original);

    if (!novaFoto) {
      novaFoto = escolherImagemEditorial(m.titulo);
    }

    const { error: updErr } = await supabase
      .from("materias")
      .update({ imagem_url: novaFoto })
      .eq("id", m.id);

    if (!updErr) {
      totalAtualizadas++;
      console.log(`[OK] ${m.titulo.substring(0, 45)}... -> ${novaFoto.substring(0, 60)}...`);
    } else {
      console.error(`[ERRO] ${m.titulo}:`, updErr.message);
    }
  }

  console.log(`\n🎉 Finalizado com sucesso! ${totalAtualizadas} matérias corrigidas com fotos em alta definição.`);
}

run();
