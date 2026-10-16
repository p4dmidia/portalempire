export interface CidadeClassificacao {
  id: string;
  nome: string;
  slug: string;
  palavras_chave?: string[];
}

export interface CategoriaClassificacao {
  id: string;
  nome: string;
  slug: string;
  pai_id?: string | null;
  palavras_chave?: string[];
}

export interface ClassificacaoResultado {
  cidade_id: string | null;
  categoria_id: string;
  tags_sugeridas: string[];
}

/**
 * Remove acentos e caracteres especiais para comparação insensível a diacríticos.
 */
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Verifica se um termo ou palavra-chave existe no texto com limites de palavra.
 */
function contemTermo(textoNormalizado: string, termo: string): boolean {
  if (!termo || termo.trim().length === 0) return false;
  const termoNorm = normalizarTexto(termo.trim());
  if (termoNorm.length < 3) return false;

  // Usa regex com fronteira de palavra ou busca exata
  const regex = new RegExp(`(^|\\P{L})${escapeRegExp(termoNorm)}(\\P{L}|$)`, "u");
  return regex.test(textoNormalizado);
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Classifica automaticamente uma matéria captada atribuindo cidade, categoria e tags com base no conteúdo e palavras-chave cadastradas.
 */
export function classificarMateria({
  titulo,
  resumo = "",
  cidades = [],
  categorias = [],
  categoriaPadraoId,
  cidadePadraoId = null,
}: {
  titulo: string;
  resumo?: string;
  cidades?: CidadeClassificacao[];
  categorias?: CategoriaClassificacao[];
  categoriaPadraoId: string;
  cidadePadraoId?: string | null;
}): ClassificacaoResultado {
  const tituloNorm = normalizarTexto(titulo);
  const resumoNorm = normalizarTexto(resumo);

  const tagsSugeridas: string[] = [];

  // 1. Identificar Cidade
  let cidadeIdEncontrada: string | null = null;
  let pontuacaoCidade = 0;

  for (const cidade of cidades) {
    let pontos = 0;
    const termos = [cidade.nome, ...(cidade.palavras_chave || [])];

    for (const termo of termos) {
      if (contemTermo(tituloNorm, termo)) {
        pontos += 10; // Maior peso no título
        if (!tagsSugeridas.includes(cidade.nome)) tagsSugeridas.push(cidade.nome);
      } else if (contemTermo(resumoNorm, termo)) {
        pontos += 3;
        if (!tagsSugeridas.includes(cidade.nome)) tagsSugeridas.push(cidade.nome);
      }
    }

    if (pontos > pontuacaoCidade) {
      pontuacaoCidade = pontos;
      cidadeIdEncontrada = cidade.id;
    }
  }

  // 2. Identificar Categoria / Refinamento
  let categoriaIdEscolhida = categoriaPadraoId;
  let pontuacaoCategoria = 0;

  for (const cat of categorias) {
    let pontos = 0;
    const termos = [cat.nome, ...(cat.palavras_chave || [])];

    for (const termo of termos) {
      if (contemTermo(tituloNorm, termo)) {
        pontos += 10;
        if (!tagsSugeridas.includes(cat.nome)) tagsSugeridas.push(cat.nome);
      } else if (contemTermo(resumoNorm, termo)) {
        pontos += 3;
        if (!tagsSugeridas.includes(cat.nome)) tagsSugeridas.push(cat.nome);
      }
    }

    // Se for subcategoria (pai_id not null), ganha preferência em caso de pontuação próxima
    if (cat.pai_id && pontos > 0) {
      pontos += 2;
    }

    if (pontos > pontuacaoCategoria && pontos >= 5) {
      pontuacaoCategoria = pontos;
      categoriaIdEscolhida = cat.id;
    }
  }

  return {
    cidade_id: cidadeIdEncontrada || cidadePadraoId,
    categoria_id: categoriaIdEscolhida,
    tags_sugeridas: tagsSugeridas.slice(0, 5),
  };
}
