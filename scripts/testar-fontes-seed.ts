import { parseFeedUrl } from "../lib/captacao/parser";

const fontes = [
  { nome: "G1 - Notícias Gerais", veiculo: "G1", url: "https://g1.globo.com/rss/g1/" },
  { nome: "G1 - Política", veiculo: "G1", url: "https://g1.globo.com/rss/g1/politica/" },
  { nome: "G1 - Economia", veiculo: "G1", url: "https://g1.globo.com/rss/g1/economia/" },
  { nome: "UOL - Notícias", veiculo: "UOL", url: "https://rss.uol.com.br/feed/noticias.xml" },
  { nome: "Folha de S.Paulo - Poder", veiculo: "Folha", url: "https://feeds.folha.uol.com.br/poder/rss091.xml" },
  { nome: "Estadão - Política", veiculo: "Estadão", url: "https://www.estadao.com.br/rss/politica.xml" },
  { nome: "CNN Brasil - Geral", veiculo: "CNN Brasil", url: "https://www.cnnbrasil.com.br/feed/" },
  { nome: "Metrópoles - Brasil", veiculo: "Metrópoles", url: "https://www.metropoles.com/feed" },
  { nome: "R7 - Notícias", veiculo: "R7", url: "https://noticias.r7.com/feed.xml" },
  { nome: "Terra - Notícias", veiculo: "Terra", url: "https://www.terra.com.br/rss/feed/noticias/" },
  { nome: "Agência Brasil - Últimas", veiculo: "Agência Brasil", url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml" },
  { nome: "BBC News Brasil", veiculo: "BBC News Brasil", url: "https://feeds.bbci.co.uk/portuguese/rss.xml" },
  { nome: "InfoMoney - Mercados", veiculo: "InfoMoney", url: "https://www.infomoney.com.br/feed/" },
  { nome: "Exame - Negócios", veiculo: "Exame", url: "https://exame.com/feed/" },
  { nome: "Canaltech", veiculo: "Canaltech", url: "https://canaltech.com.br/rss/" },
  { nome: "TecMundo", veiculo: "TecMundo", url: "https://rss.tecmundo.com.br/feed" },
  { nome: "ge.globo - Esportes", veiculo: "ge.globo", url: "https://ge.globo.com/rss/ge/" },
  { nome: "Lance! - Futebol", veiculo: "Lance!", url: "https://www.lance.com.br/rss/" },
];

async function testarTodasFontes() {
  console.log(`\n🔍 Testando ${fontes.length} fontes RSS do seed...\n`);
  
  let validas = 0;
  let invalidas = 0;
  const relatorio: Array<{ nome: string; url: string; status: string; itens: number; erro?: string }> = [];

  for (const fonte of fontes) {
    process.stdout.write(`⏳ Testando: ${fonte.nome.padEnd(30)} `);
    try {
      const feed = await parseFeedUrl(fonte.url);
      const totalItens = feed.items?.length || 0;
      if (totalItens > 0) {
        console.log(`✅ OK (${totalItens} itens)`);
        validas++;
        relatorio.push({ nome: fonte.nome, url: fonte.url, status: "OK", itens: totalItens });
      } else {
        console.log(`⚠️ Vazio (0 itens)`);
        validas++;
        relatorio.push({ nome: fonte.nome, url: fonte.url, status: "VAZIO", itens: 0 });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`❌ ERRO: ${msg}`);
      invalidas++;
      relatorio.push({ nome: fonte.nome, url: fonte.url, status: "ERRO", itens: 0, erro: msg });
    }
  }

  console.log("\n=========================================");
  console.log(`📊 RESUMO: ${validas} válidas / ${invalidas} com erro`);
  console.log("=========================================\n");

  return relatorio;
}

testarTodasFontes().catch(console.error);
