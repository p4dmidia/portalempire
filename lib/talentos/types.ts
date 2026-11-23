export type TalentoCategoria =
  | "modelos"
  | "apresentadores"
  | "influenciadores"
  | "celebridades"
  | "palestrantes"
  | "mestres_cerimonia"
  | "jornalistas"
  | "programas_tv"
  | "criadores_conteudo";

export interface RedesSociais {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  whatsapp?: string;
  cep?: string;
  endereco?: string;
}

export interface VideoItem {
  titulo: string;
  url: string;
  tipo?: "youtube" | "vimeo" | "outro";
}

export interface Talento {
  id: string;
  portal_id?: string | null;
  nome: string;
  slug: string;
  titulo_profissional: string;
  whatsapp?: string | null;
  categoria: TalentoCategoria | string;
  segmentos: string[];
  foto_url: string;
  foto_capa_url?: string | null;
  foto_capa_posicao_y?: number | null;
  cep?: string;
  endereco?: string;
  cidade_id?: string | null;
  cidade_nome?: string;
  cidade_base?: string;
  estado?: string;
  cidades_atendidas?: string;
  bio_curta: string;
  bio_completa?: string | null;
  seguidores_total: string;
  redes_sociais: RedesSociais;
  servicos: string[];
  modalidades: string[];
  videos: VideoItem[];
  galeria_fotos: string[];
  programas_tv: string[];
  verificado: boolean;
  destaque_home: boolean;
  destaque?: boolean;
  ordem: number;
  status: "ativo" | "inativo" | "rascunho" | "pendente";
  created_at: string;
  updated_at: string;
}

export type SolicitacaoStatus =
  | "pendente"
  | "em_atendimento"
  | "proposta_enviada"
  | "fechado"
  | "cancelado";

export interface TalentoSolicitacao {
  id: string;
  talento_id: string;
  nome_cliente: string;
  empresa?: string | null;
  whatsapp: string;
  email?: string | null;
  servico_desejado: string;
  modalidade: string;
  cidade_evento?: string | null;
  data_prevista?: string | null;
  descricao_briefing?: string | null;
  status: SolicitacaoStatus;
  valor_estimado?: number | null;
  notas_comerciais?: string | null;
  created_at: string;
  updated_at: string;
  talento?: {
    id: string;
    nome: string;
    slug: string;
    foto_url: string;
    titulo_profissional: string;
    whatsapp?: string | null;
  };
}

export const CATEGORIAS_TALENTOS = [
  { id: "todos", label: "Todos os Talentos", icon: "Users" },
  { id: "modelos", label: "Modelos & Fashion", icon: "Sparkles" },
  { id: "apresentadores", label: "Apresentadores", icon: "Mic" },
  { id: "influenciadores", label: "Influenciadores", icon: "Smartphone" },
  { id: "celebridades", label: "Celebridades", icon: "Star" },
  { id: "palestrantes", label: "Palestrantes", icon: "Presentation" },
  { id: "mestres_cerimonia", label: "Mestres de Cerimônia", icon: "UserCheck" },
  { id: "jornalistas", label: "Jornalistas / Repórteres", icon: "Newspaper" },
  { id: "programas_tv", label: "Programas de TV", icon: "Tv" },
] as const;

export const SERVICOS_PADRAO = [
  "Comerciais de TV",
  "Apresentações e Cerimoniais",
  "Cobertura de Eventos",
  "Palestras",
  "Programas de TV",
  "Campanhas Publicitárias",
  "Presença VIP",
  "Ações com Influenciadores",
  "Debates e Mediações",
  "Divulgação de Marcas",
  // Opções para Modelos & Moda
  "Desfiles e Passarela",
  "Ensaios Fotográficos & Editoriais",
  "Catálogos & Lookbooks",
  "Campanhas de Moda & Vestuário",
  "Provador Fashion & Styling",
  "Campanhas de Beleza & Cosméticos",
] as const;
