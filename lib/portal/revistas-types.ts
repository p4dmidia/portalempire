export interface RevistaData {
  id: string;
  portal_id?: string | null;
  titulo: string;
  subtitulo?: string | null;
  slug: string;
  capa_url: string;
  link_url: string;
  cidade?: string | null;
  estado?: string | null;
  escritor?: string | null;
  categoria: string;
  tipo_acesso: string; // Ex: 'GRATUITA', 'EDIÇÃO ESPECIAL', 'EXCLUSIVA'
  data_publicacao: string; // YYYY-MM-DD
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  visualizacoes: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FiltrosRevistas {
  busca?: string;
  cidade?: string;
  escritor?: string;
  categoria?: string;
  destaque?: boolean;
  limit?: number;
}

export const CATEGORIAS_REVISTAS = [
  "Todas",
  "Entretenimento",
  "Diversos",
  "Negócios",
  "Moda & Beleza",
  "Gastronomia",
  "Turismo",
  "Agronegócio",
  "Tecnologia",
  "Saúde",
] as const;

export const TIPOS_ACESSO_REVISTAS = [
  "GRATUITA",
  "EDIÇÃO ESPECIAL",
  "EXCLUSIVA",
  "ASSINANTE",
] as const;
