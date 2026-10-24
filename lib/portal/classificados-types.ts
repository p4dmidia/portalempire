export type TipoClassificado = "venda" | "aluguel" | "troca" | "servico" | "emprego" | "outro";

export type CategoriaClassificado =
  | "imoveis"
  | "veiculos"
  | "servicos"
  | "negocios"
  | "eletronicos"
  | "empregos"
  | "agro"
  | "geral";

export interface ClassificadoData {
  id: string;
  portal_id?: string;
  autor_id?: string;
  origem_tipo?: "admin" | "colunista";
  titulo: string;
  slug: string;
  descricao: string;
  tipo: TipoClassificado;
  categoria: CategoriaClassificado;
  preco: number;
  preco_sob_consulta: boolean;
  imagem_principal: string;
  galeria_fotos?: string[];
  cidade_id?: string | null;
  cidade_nome?: string | null;
  bairro?: string | null;
  uf?: string;
  contato_nome: string;
  contato_whatsapp: string;
  contato_telefone?: string | null;
  contato_email?: string | null;
  link_externo?: string | null;
  destaque_home: boolean;
  destaque_classificados: boolean;
  paginas_exibicao: string[];
  status: "ativo" | "pausado" | "vendido" | "expirado";
  visualizacoes: number;
  created_at: string;
  autor?: {
    nome: string;
    foto_url?: string | null;
    role?: string;
  } | null;
}

export const CATEGORIAS_CLASSIFICADOS = [
  { slug: "todos", nome: "Todos os Anúncios", icone: "Sparkles" },
  { slug: "imoveis", nome: "Imóveis", icone: "Home" },
  { slug: "veiculos", nome: "Veículos & Autos", icone: "Car" },
  { slug: "negocios", nome: "Negócios & Empresas", icone: "Briefcase" },
  { slug: "servicos", nome: "Serviços & Profissionais", icone: "Wrench" },
  { slug: "eletronicos", nome: "Eletrônicos & Tech", icone: "Laptop" },
  { slug: "empregos", nome: "Vagas & Empregos", icone: "UserCheck" },
  { slug: "agro", nome: "Agro & Máquinas", icone: "Tractor" },
  { slug: "geral", nome: "Diversos / Outros", icone: "Tag" },
];

export const TIPOS_NEGOCIACAO = [
  { valor: "todos", label: "Todos os Tipos" },
  { valor: "venda", label: "Venda" },
  { valor: "aluguel", label: "Aluguel" },
  { valor: "troca", label: "Troca / Permuta" },
  { valor: "servico", label: "Prestação de Serviço" },
  { valor: "emprego", label: "Oportunidade / Emprego" },
];

export const PAGINAS_DISPONIVEIS = [
  { valor: "todas", label: "Todas as Páginas do Portal" },
  { valor: "home", label: "Página Principal (Home)" },
  { valor: "classificados", label: "Página de Classificados" },
  { valor: "noticias", label: "Editoria de Notícias & Geral" },
  { valor: "politica", label: "Editoria de Política" },
  { valor: "economia", label: "Editoria de Economia & Negócios" },
  { valor: "cidades", label: "Editorias Regionais / Cidades" },
  { valor: "esportes", label: "Editoria de Esportes" },
  { valor: "colunas", label: "Páginas dos Colunistas" },
];
