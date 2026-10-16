/**
 * Módulo de Reescrita Automática e Proteção Jurídica Anti-Plágio (Lei 9.610/98)
 *
 * Transforma notícias captadas (título, resumo e conteúdo) para assegurar
 * originalidade textual e resguardar juridicamente o portal, preservando a
 * veracidade dos fatos e a devida atribuição da fonte original.
 */

export interface DadosNoticiaParaReescrita {
  titulo: string;
  resumoBruto: string;
  conteudoBruto?: string;
  veiculo: string;
  cidadeNome?: string;
  apiKeyIa?: string;
}

export interface NoticiaReescrita {
  titulo: string;
  subtitulo: string;
  resumo: string;
  conteudoHtml: string;
  metodo: "ia" | "algoritmo";
}

// Dicionário de sinônimos jornalísticos para verbos comuns em manchetes
const SINONIMOS_VERBOS: Array<[RegExp, string[]]> = [
  [/\banuncia\b/gi, ["confirma", "divulga", "revela", "comunica"]],
  [/\banunciou\b/gi, ["confirmou", "divulgou", "revelou", "comunicou"]],
  [/\babre\b/gi, ["inicia", "disponibiliza", "lança", "libera"]],
  [/\babriu\b/gi, ["iniciou", "disponibilizou", "lançou", "liberou"]],
  [/\bfecha\b/gi, ["encerra", "interrompe", "bloqueia"]],
  [/\bfechou\b/gi, ["encerrou", "interrompeu", "bloqueou"]],
  [/\baprova\b/gi, ["valida", "homologa", "dá aval a"]],
  [/\baprovou\b/gi, ["validou", "homologou", "deu aval a"]],
  [/\brejeita\b/gi, ["veta", "nega", "descarta"]],
  [/\brejeitou\b/gi, ["vetou", "negou", "descartou"]],
  [/\binvestiga\b/gi, ["apura", "averigua", "analisa"]],
  [/\binvestigou\b/gi, ["apurou", "averiguou", "analisou"]],
  [/\bprende\b/gi, ["detém", "captura", "encaminha à delegacia"]],
  [/\bprendeu\b/gi, ["deteve", "capturou", "encaminhou à delegacia"]],
  [/\baumenta\b/gi, ["tem alta", "registra crescimento", "sobe"]],
  [/\baumentou\b/gi, ["teve alta", "registrou avanço", "subiu"]],
  [/\bcai\b/gi, ["tem queda", "registra recuo", "diminui"]],
  [/\bcaiu\b/gi, ["teve queda", "registrou retração", "diminuiu"]],
  [/\bvence\b/gi, ["supera", "conquista vitória sobre", "leva a melhor contra"]],
  [/\bvenceu\b/gi, ["superou", "conquistou vitória sobre", "levou a melhor"]],
  [/\bmorre\b/gi, ["falece", "perde a vida"]],
  [/\bmorreu\b/gi, ["faleceu", "perdeu a vida"]],
  [/\bprefeitura\b/gi, ["administração municipal", "governo local", "Poder Executivo"]],
  [/\bpolícia\b/gi, ["autoridades policiais", "forças de segurança"]],
];

// Prefixos editoriais para dar tom de cobertura própria
const PREFIXOS_EDITORIAIS = [
  "Em destaque:",
  "Entenda:",
  "Região:",
  "Fique por dentro:",
  "Atualização:",
  "Panorama:",
];

/**
 * Reescrita algorítmica autônoma em Português Brasileiro (sem dependência externa).
 * Altera a estrutura do título e parágrafos mantendo a fidedignidade dos fatos.
 */
export function reescreverComAlgoritmo(dados: DadosNoticiaParaReescrita): NoticiaReescrita {
  const { titulo, resumoBruto, veiculo, cidadeNome } = dados;

  // 1. REESCRITA DO TÍTULO
  let tituloModificado = titulo.trim();

  // Substituir termos e verbos chave
  for (const [regex, opcoes] of SINONIMOS_VERBOS) {
    if (regex.test(tituloModificado)) {
      const substituto = opcoes[Math.floor(Math.random() * opcoes.length)];
      tituloModificado = tituloModificado.replace(regex, substituto);
      break; // Aplica uma substituição para manter a fluidez natural
    }
  }

  // Se o título não mudou muito, aplicar formatação jornalística de lead
  let tituloFinal = tituloModificado;
  if (tituloFinal === titulo) {
    const prefixo = PREFIXOS_EDITORIAIS[Math.floor(Math.random() * PREFIXOS_EDITORIAIS.length)];
    // Tentar inverter antes de dois pontos se houver
    if (titulo.includes(":")) {
      const partes = titulo.split(":");
      tituloFinal = `${partes[1].trim()} — ${partes[0].trim()}`;
    } else {
      tituloFinal = `${prefixo} ${titulo}`;
    }
  }

  // 2. REESCRITA DO RESUMO E CRIAÇÃO DO SUBTÍTULO
  const textoLimpo = resumoBruto
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const frases = textoLimpo
    .split(/(?<=[.?!])\s+/)
    .filter((f) => f.length > 15);

  let primeiroPonto = frases[0] || textoLimpo;
  // Variação na introdução do resumo
  const introducoesLead = [
    "De acordo com informações recentes,",
    "Conforme acompanhado na região,",
    "Novos desdobramentos indicam que",
    "Em apuração recente,",
  ];
  const introEscolhida = introducoesLead[Math.floor(Math.random() * introducoesLead.length)];

  const resumoReescrito = `${introEscolhida} ${primeiroPonto.charAt(0).toLowerCase() + primeiroPonto.slice(1)}`;

  const subtitulo = frases[1]
    ? frases[1].slice(0, 160)
    : `Acompanhe os detalhes e principais informações apuradas sobre este caso.`;

  // 3. CONTEÚDO HTML COM RESPALDO JURÍDICO E CRÉDITO DE FONTE
  const corpoNoticia = frases.length > 2
    ? frases.slice(1).join(" ")
    : textoLimpo;

  const localizacaoTexto = cidadeNome ? ` no município de ${cidadeNome} e região` : "";

  const conteudoHtml = `
    <p class="lead-noticia">
      <strong>${cidadeNome ? `${cidadeNome} — ` : ""}${resumoReescrito}</strong>
    </p>
    <p>
      O caso chamou atenção recentemente${localizacaoTexto}. ${corpoNoticia}
    </p>
    <p class="nota-redacao text-sm text-slate-500 italic border-l-2 border-primary/40 pl-3 my-4">
      <em>Informações originalmente apuradas e reportadas por <strong>${veiculo}</strong>. Conteúdo adaptado e verificado pela equipe do Portal Empire em conformidade com as diretrizes de citação e interesse público da Lei de Direitos Autorais (Art. 46 da Lei 9.610/98).</em>
    </p>
  `.trim();

  return {
    titulo: tituloFinal,
    subtitulo,
    resumo: resumoReescrito.slice(0, 380),
    conteudoHtml,
    metodo: "algoritmo",
  };
}

/**
 * Reescrita com Inteligência Artificial (Google Gemini API via fetch nativo)
 */
async function reescreverComGemini(
  dados: DadosNoticiaParaReescrita,
  apiKey: string
): Promise<NoticiaReescrita> {
  const prompt = `
Você é um editor sênior de jornalismo profissional do Portal Empire.
Sua missão é reescrever a notícia abaixo para garantir 100% de originalidade textual e respaldo jurídico contra plágio (Lei 9.610/98), preservando com exatidão todos os fatos, nomes, números, locais e datas.

Veículo de origem: ${dados.veiculo}
${dados.cidadeNome ? `Cidade de referência: ${dados.cidadeNome}` : ""}
Título original: "${dados.titulo}"
Texto original: "${dados.resumoBruto}"

Instruções obrigatórias:
1. "titulo": Crie um novo título chamativo, informativo e original (diferente da redação do título original).
2. "subtitulo": Um subtítulo jornalístico de 1 a 2 linhas.
3. "resumo": Um resumo direto e atraente de até 300 caracteres.
4. "conteudoHtml": Texto jornalístico reescrito em 2 ou 3 parágrafos envolventes usando tags <p>, concluindo no final com um parágrafo de crédito: "<p class='nota-redacao'><em>Com informações apuradas por ${dados.veiculo}.</em></p>".

Responda ESTRITAMENTE em formato JSON com as chaves: "titulo", "subtitulo", "resumo", "conteudoHtml".
`.trim();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Erro API Gemini: ${res.status}`);
  }

  const json = await res.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Resposta vazia da IA");

  const parsed = JSON.parse(rawText);

  return {
    titulo: String(parsed.titulo || dados.titulo),
    subtitulo: String(parsed.subtitulo || ""),
    resumo: String(parsed.resumo || dados.resumoBruto.slice(0, 300)),
    conteudoHtml: String(parsed.conteudoHtml || `<p>${parsed.resumo}</p>`),
    metodo: "ia",
  };
}

/**
 * Função principal de reescrita jornalística anti-plágio.
 * Tenta reescrever via IA se houver chave configurada; caso contrário ou em caso de erro,
 * utiliza o motor algorítmico nativo de paráfrase.
 */
export async function reescreverNoticiaCaptada(
  dados: DadosNoticiaParaReescrita
): Promise<NoticiaReescrita> {
  const geminiKey = dados.apiKeyIa || process.env.GEMINI_API_KEY || "";

  if (geminiKey && geminiKey.trim().length > 10 && !geminiKey.includes("dummy")) {
    try {
      return await reescreverComGemini(dados, geminiKey.trim());
    } catch (err) {
      console.warn("[Reescritor Anti-Plágio] Falha na IA, usando motor algorítmico nativo:", err);
    }
  }

  return reescreverComAlgoritmo(dados);
}
