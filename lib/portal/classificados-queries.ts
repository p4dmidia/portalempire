import { createClient } from "@/lib/supabase/server";
export * from "./classificados-types";
import type { ClassificadoData } from "./classificados-types";

// Anúncios demonstrativos de alta conversão para initial render elegante
export const CLASSIFICADOS_DEMO: ClassificadoData[] = [
  {
    id: "cls-00000000-0001",
    titulo: "Casa Alto Padrão em Alphaville com 4 Suítes e Piscina Aquecida",
    slug: "casa-alto-padrao-alphaville-4-suites",
    descricao: "Maravilhosa residência em condomínio fechado de altíssimo padrão. 580m² de área construída, 4 suítes com closet, espaço gourmet completo, automação residencial e paisagismo impecável. Estuda permuta parcial por imóvel comercial.",
    tipo: "venda",
    categoria: "imoveis",
    preco: 4200000,
    preco_sob_consulta: false,
    imagem_principal: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
    galeria_fotos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200"
    ],
    cidade_nome: "Barueri",
    bairro: "Alphaville Residencial 1",
    uf: "SP",
    contato_nome: "Corretor Roberto Silveira",
    contato_whatsapp: "11987654321",
    contato_telefone: "1134567890",
    destaque_home: true,
    destaque_classificados: true,
    paginas_exibicao: ["todas", "home", "classificados", "economia"],
    status: "ativo",
    visualizacoes: 1420,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    autor: { nome: "Roberto Silveira Imóveis", role: "colunista" }
  },
  {
    id: "cls-00000000-0002",
    titulo: "BMW X5 xDrive45e Híbrida 2024 - Único Dono com 14.000 km",
    slug: "bmw-x5-xdrive45e-hibrida-2024",
    descricao: "Veículo em estado de 0km. Cor Branco Mineral com interior em couro Merino Tartufo. Teto solar panorâmico Sky Lounge, pacote M Sport completo e garantia de fábrica até 2027. Revisões todas feitas na concessionária.",
    tipo: "venda",
    categoria: "veiculos",
    preco: 589000,
    preco_sob_consulta: false,
    imagem_principal: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
    galeria_fotos: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"
    ],
    cidade_nome: "São Paulo",
    bairro: "Jardins",
    uf: "SP",
    contato_nome: "Empire Motors Motors Premium",
    contato_whatsapp: "11999887766",
    destaque_home: true,
    destaque_classificados: true,
    paginas_exibicao: ["todas", "home", "classificados"],
    status: "ativo",
    visualizacoes: 980,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    autor: { nome: "Empire Motors Motors", role: "admin" }
  },
  {
    id: "cls-00000000-0003",
    titulo: "Passo Ponto Comercial de Café & Bistrô Consolidado no Centro",
    slug: "passo-ponto-comercial-cafe-bistro-centro",
    descricao: "Excelente oportunidade comercial em operação há 6 anos, faturamento médio mensal comprovado de R$ 95 mil, carteira ativa de clientes e equipe treinada. Espaço de 140m² montado com maquinário italiano e estoque completo.",
    tipo: "venda",
    categoria: "negocios",
    preco: 260000,
    preco_sob_consulta: false,
    imagem_principal: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    cidade_nome: "Cotia",
    bairro: "Granja Viana",
    uf: "SP",
    contato_nome: "Marcos Vinícius Gestão Comercial",
    contato_whatsapp: "11981234567",
    destaque_home: false,
    destaque_classificados: true,
    paginas_exibicao: ["classificados", "economia", "negocios"],
    status: "ativo",
    visualizacoes: 740,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    autor: { nome: "Redação Empire Cidades", role: "admin" }
  },
  {
    id: "cls-00000000-0004",
    titulo: "Consultoria em Gestão Tributária e Blindagem Patrimonial para PMEs",
    slug: "consultoria-gestao-tributaria-blindagem-patrimonial",
    descricao: "Atendimento especializado para empresários, holdings familiares e clínicas médicas. Redução lícita de carga tributária e recuperação de créditos fiscais com mais de 20 anos de expertise no mercado nacional.",
    tipo: "servico",
    categoria: "servicos",
    preco: 0,
    preco_sob_consulta: true,
    imagem_principal: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200",
    cidade_nome: "Uberlândia",
    bairro: "Tibery",
    uf: "MG",
    contato_nome: "Dr. André Lourenço Advocacia Empresarial",
    contato_whatsapp: "34991234567",
    destaque_home: true,
    destaque_classificados: true,
    paginas_exibicao: ["todas", "home", "classificados", "economia"],
    status: "ativo",
    visualizacoes: 610,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    autor: { nome: "Dr. André Lourenço", role: "colunista" }
  },
  {
    id: "cls-00000000-0005",
    titulo: "Galpão Logístico Industrial para Locação - 2.500m² Pé Direito 12m",
    slug: "galpao-logistico-industrial-locacao-2500m",
    descricao: "Galpão modular de alta performance, 6 docas com niveladores automáticos, piso industrial nivelado a laser com capacidade para 6 ton/m², vestiários, refeitório e ampla área de manobra para carretas.",
    tipo: "aluguel",
    categoria: "imoveis",
    preco: 62500,
    preco_sob_consulta: false,
    imagem_principal: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
    cidade_nome: "Guarulhos",
    bairro: "Cumbica",
    uf: "SP",
    contato_nome: "Logística Brasil Empreendimentos",
    contato_whatsapp: "11976543210",
    destaque_home: false,
    destaque_classificados: false,
    paginas_exibicao: ["classificados", "economia"],
    status: "ativo",
    visualizacoes: 480,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    autor: { nome: "Redação Empire Cidades", role: "admin" }
  },
  {
    id: "cls-00000000-0006",
    titulo: "Troco Trator John Deere 6100J por Caminhonete Hilux ou Ranger",
    slug: "troco-trator-john-deere-6100j-por-caminhonete",
    descricao: "Trator ano 2021 com apenas 1.850 horas trabalhadas. Único dono, com cabine original climatizada, piloto automático e todas as revisões em dia na concessionária. Aceito caminhonete diesel 4x4 de menor ou igual valor na troca.",
    tipo: "troca",
    categoria: "agro",
    preco: 340000,
    preco_sob_consulta: false,
    imagem_principal: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200",
    cidade_nome: "Assis",
    bairro: "Zona Rural",
    uf: "SP",
    contato_nome: "Agropecuária Santa Fé",
    contato_whatsapp: "18998765432",
    destaque_home: true,
    destaque_classificados: true,
    paginas_exibicao: ["todas", "home", "classificados"],
    status: "ativo",
    visualizacoes: 890,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    autor: { nome: "Agropecuária Santa Fé", role: "colunista" }
  }
];

export interface FiltrosClassificados {
  tipo?: string;
  categoria?: string;
  cidadeSlug?: string;
  busca?: string;
  destaqueHome?: boolean;
  destaqueClassificados?: boolean;
  pagina?: string;
  limit?: number;
  offset?: number;
}

/**
 * Busca classificados ativos no banco de dados com fallback nos dados de demonstração
 */
export async function getClassificados(filtros: FiltrosClassificados = {}): Promise<ClassificadoData[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("classificados")
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf),
        autor:profiles(id, nome, role, foto_url)
      `)
      .eq("status", "ativo")
      .order("destaque_classificados", { ascending: false })
      .order("created_at", { ascending: false });

    if (filtros.tipo && filtros.tipo !== "todos") {
      query = query.eq("tipo", filtros.tipo);
    }

    if (filtros.categoria && filtros.categoria !== "todos") {
      query = query.eq("categoria", filtros.categoria);
    }

    if (filtros.destaqueHome) {
      query = query.eq("destaque_home", true);
    }

    if (filtros.destaqueClassificados) {
      query = query.eq("destaque_classificados", true);
    }

    if (filtros.pagina && filtros.pagina !== "todas") {
      query = query.or(`paginas_exibicao.cs.{${filtros.pagina}},paginas_exibicao.cs.{todas}`);
    }

    if (filtros.busca && filtros.busca.trim()) {
      const termo = filtros.busca.trim();
      query = query.or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%,cidade_nome.ilike.%${termo}%`);
    }

    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data as unknown as ClassificadoData[];
    }
  } catch (err) {
    console.warn("[Portal Empire] Classificados do banco inacessíveis, utilizando catálogo dinâmico:", err);
  }

  // Filtragem no catálogo demonstrativo caso o banco ainda não tenha registros
  let itens = [...CLASSIFICADOS_DEMO];

  if (filtros.tipo && filtros.tipo !== "todos") {
    itens = itens.filter((i) => i.tipo === filtros.tipo);
  }

  if (filtros.categoria && filtros.categoria !== "todos") {
    itens = itens.filter((i) => i.categoria === filtros.categoria);
  }

  if (filtros.destaqueHome) {
    itens = itens.filter((i) => i.destaque_home);
  }

  if (filtros.destaqueClassificados) {
    itens = itens.filter((i) => i.destaque_classificados);
  }

  if (filtros.pagina && filtros.pagina !== "todas") {
    itens = itens.filter(
      (i) => i.paginas_exibicao.includes(filtros.pagina!) || i.paginas_exibicao.includes("todas")
    );
  }

  if (filtros.busca && filtros.busca.trim()) {
    const b = filtros.busca.toLowerCase().trim();
    itens = itens.filter(
      (i) =>
        i.titulo.toLowerCase().includes(b) ||
        i.descricao.toLowerCase().includes(b) ||
        (i.cidade_nome && i.cidade_nome.toLowerCase().includes(b))
    );
  }

  if (filtros.limit) {
    itens = itens.slice(0, filtros.limit);
  }

  return itens;
}

/**
 * Busca anúncios de classificados para destaque na Home do portal
 */
export async function getClassificadosDestaqueHome(limit = 6): Promise<ClassificadoData[]> {
  return getClassificados({ destaqueHome: true, limit });
}

/**
 * Busca anúncios para serem exibidos em uma página específica do portal
 */
export async function getClassificadosPorPagina(pagina: string, limit = 4): Promise<ClassificadoData[]> {
  return getClassificados({ pagina, limit });
}

/**
 * Busca um único classificado pelo slug
 */
export async function getClassificadoBySlug(slug: string): Promise<ClassificadoData | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("classificados")
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf),
        autor:profiles(id, nome, role, foto_url)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (data) return data as unknown as ClassificadoData;
  } catch (err) {
    console.warn(`[Portal Empire] Erro ao buscar classificado ${slug}:`, err);
  }

  return CLASSIFICADOS_DEMO.find((c) => c.slug === slug) || null;
}
