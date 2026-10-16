import { normalizarUrl, gerarHashUrl, limparResumo, extrairImagem } from "../lib/captacao/normalizar";
import { classificarMateria } from "../lib/captacao/classificar";
import { parseFeedUrl } from "../lib/captacao/parser";

async function testarModuloCaptacao() {
  console.log("\n🧪 TESTE DO MÓDULO DE CAPTAÇÃO RSS (ETAPA 5)\n");

  let falhas = 0;
  let sucessos = 0;

  function assert(cond: boolean, desc: string) {
    if (cond) {
      console.log(`  ✅ ${desc}`);
      sucessos++;
    } else {
      console.error(`  ❌ FALHA: ${desc}`);
      falhas++;
    }
  }

  // 1. Normalização de URL e SHA256
  console.log("1. Testando normalização de URL e hash SHA-256:");
  const urlComTracking = "https://g1.globo.com/politica/noticia/2026/10/09/materia.ghtml?utm_source=rss&utm_medium=feed&fbclid=12345#secao";
  const urlLimpa = normalizarUrl(urlComTracking);
  assert(
    urlLimpa === "https://g1.globo.com/politica/noticia/2026/10/09/materia.ghtml",
    `URL limpa corretamente de utm, fbclid e hash: ${urlLimpa}`
  );

  const hash1 = gerarHashUrl(urlComTracking);
  const hash2 = gerarHashUrl("https://g1.globo.com/politica/noticia/2026/10/09/materia.ghtml");
  assert(hash1 === hash2 && hash1.length === 64, `Hashes idênticos para URLs com tracking (${hash1.slice(0, 12)}...)`);

  // 2. Limpeza de HTML e resumo
  console.log("\n2. Testando limpeza de resumo e corte de ~400 caracteres:");
  const htmlSujo = `<p>O <strong>presidente</strong> anunciou novas medidas econômicas nesta sexta-feira (&quot;Plano Real 3.0&quot;) &amp; investimentos em infraestrutura. <style>p{color:red}</style><script>alert(1)</script></p>`;
  const resumoLimpo = limparResumo(htmlSujo, 400);
  assert(
    !resumoLimpo.includes("<") &&
    resumoLimpo.includes('"Plano Real 3.0"') &&
    resumoLimpo.includes("& investimentos"),
    `HTML e entidades limpas: "${resumoLimpo}"`
  );

  const textoLongo = "Palavra ".repeat(70);
  const resumoCortado = limparResumo(textoLongo, 100);
  assert(
    resumoCortado.length <= 104 && resumoCortado.endsWith("..."),
    `Resumo truncado sem quebrar palavras: "${resumoCortado}" (${resumoCortado.length} chars)`
  );

  // 3. Extração de Imagens
  console.log("\n3. Testando extração de imagens em múltiplas estruturas:");
  const itemEnclosure = {
    enclosure: { url: "https://s2.glbimg.com/foto.jpg", type: "image/jpeg" },
  };
  assert(
    extrairImagem(itemEnclosure) === "https://s2.glbimg.com/foto.jpg",
    "Extraiu imagem de enclosure"
  );

  const itemMediaContent = {
    "media:content": { $: { url: "https://midia.com/banner.png" } },
  };
  assert(
    extrairImagem(itemMediaContent) === "https://midia.com/banner.png",
    "Extraiu imagem de media:content"
  );

  const itemHtml = {
    description: '<p>Notícia sem tags de media mas com <img src="https://cdn.site.com/artigo.webp" alt="Foto" /></p>',
  };
  assert(
    extrairImagem(itemHtml) === "https://cdn.site.com/artigo.webp",
    "Extraiu imagem de tag <img> no HTML da description"
  );

  // 4. Classificação automática por palavras-chave
  console.log("\n4. Testando classificação de cidade e editoria:");
  const mockCidades = [
    { id: "cid-1", nome: "Barueri", slug: "barueri", palavras_chave: ["alphaville", "tamboré", "barueri"] },
    { id: "cid-2", nome: "Osasco", slug: "osasco", palavras_chave: ["osasco", "calçadão de osasco"] },
  ];
  const mockCategorias = [
    { id: "cat-geral", nome: "Geral", slug: "geral", palavras_chave: [] },
    { id: "cat-pol", nome: "Política", slug: "politica", palavras_chave: ["congresso", "senado", "eleições", "stf"] },
    { id: "cat-econ", nome: "Economia", slug: "economia", palavras_chave: ["dólar", "inflação", "selic", "mercado financeiro"] },
  ];

  const classif1 = classificarMateria({
    titulo: "Prefeitura de Barueri inaugura novo hospital em Alphaville",
    resumo: "Obras foram concluídas nesta semana com investimento municipal.",
    cidades: mockCidades,
    categorias: mockCategorias,
    categoriaPadraoId: "cat-geral",
  });
  assert(
    classif1.cidade_id === "cid-1",
    `Cidade classificada com sucesso para Barueri (id: ${classif1.cidade_id})`
  );

  const classif2 = classificarMateria({
    titulo: "Copom decide cortar a taxa Selic em reunião do Banco Central",
    resumo: "Decisão afeta o mercado financeiro e expectativas de inflação.",
    cidades: mockCidades,
    categorias: mockCategorias,
    categoriaPadraoId: "cat-geral",
  });
  assert(
    classif2.categoria_id === "cat-econ",
    `Categoria refinada automaticamente para Economia (id: ${classif2.categoria_id})`
  );

  // 5. Teste de isolamento de erros (feed quebrado não afeta feed válido)
  console.log("\n5. Testando isolamento de erros em parsing:");
  try {
    const feedValido = await parseFeedUrl("https://g1.globo.com/rss/g1/politica/");
    assert((feedValido.items?.length || 0) > 0, `Feed válido carregou ${feedValido.items?.length} itens`);
  } catch (err) {
    assert(false, `Falha no feed válido: ${err}`);
  }

  try {
    await parseFeedUrl("https://url-inexistente-123456789.com/feed.xml");
    assert(false, "Deveria ter lançado erro para feed inexistente");
  } catch {
    assert(true, "Feed inexistente capturado com erro isolado sem crash");
  }

  console.log("\n=========================================");
  console.log(`🏁 RESULTADO: ${sucessos} sucessos / ${falhas} falhas`);
  console.log("=========================================\n");

  if (falhas > 0) process.exit(1);
}

testarModuloCaptacao().catch((err) => {
  console.error("Erro fatal no teste:", err);
  process.exit(1);
});
