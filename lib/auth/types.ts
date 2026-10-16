export type UserRole = "admin" | "editor" | "colunista" | "anunciante";
export type UserStatus = "pendente" | "ativo" | "bloqueado";

export interface Profile {
  id: string;
  portal_id: string | null;
  nome: string;
  slug: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  foto_url: string | null;
  bio: string | null;
  redes_sociais: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    website?: string;
    [key: string]: string | undefined;
  } | null;
  asaas_wallet_id: string | null;
  cpf_cnpj: string | null;
  telefone: string | null;
  codigo_afiliado?: string | null;
  indicado_por_id?: string | null;
  saldo_afiliado?: number;
  chave_pix?: string | null;
  tipo_chave_pix?: string | null;
  created_at: string;
  updated_at: string;
}
