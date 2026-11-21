export type StatusTotem = "ativo" | "inativo" | "em_manutencao";

export interface Totem {
  id: string;
  portal_id?: string | null;
  cidade_id?: string | null;
  cidade_nome: string;
  estado: string;
  nome: string; // Ex: Totem 01 - Galeria Center UDI
  slug: string;
  estabelecimento_nome: string; // Ex: Galeria Center UDI
  tipo_estabelecimento: string; // Ex: Galeria, Shopping Center, Academia, Clínica, etc.
  cep?: string | null;
  endereco: string;
  bairro: string;
  descricao_ponto: string; // Ex: Dentro da galeria, em área de grande circulação
  circulacao_estimada: string; // Ex: 25.000 pessoas/mês
  circulacao_numero?: number;
  perfil_publico?: string[]; // Ex: ["Consumidores", "Famílias", "Profissionais"]
  modelo_equipamento?: string; // Ex: Totem Digital Vertical 55 polegadas
  tamanho_tela?: string; // Ex: 55 polegadas 4K Ultra HD
  formato_publicidade?: string; // Ex: 20 slots de 15 segundos
  slots_disponiveis?: number;
  slots_total?: number;
  duracao_slot_segundos?: number;
  recursos_extras?: string[]; // Ex: ["Com carregador de celular", "Tela touch"]
  foto_url: string;
  galeria_fotos?: string[];
  google_maps_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  franqueado_nome: string;
  franqueado_telefone?: string | null;
  franqueado_whatsapp: string;
  franqueado_email?: string | null;
  franqueado_user_id?: string | null;
  destaque: boolean;
  status: StatusTotem;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface TotemSolicitacao {
  id: string;
  totem_id: string;
  nome_contato: string;
  empresa?: string | null;
  whatsapp: string;
  email?: string | null;
  cidade?: string | null;
  mensagem?: string | null;
  status: "pendente" | "em_atendimento" | "fechado" | "cancelado";
  created_at: string;
  totem?: Totem | null;
}

export interface CidadeComTotens {
  cidade_nome: string;
  estado: string;
  total_totens: number;
  foto_url?: string;
}

export const TIPOS_ESTABELECIMENTO = [
  { id: "todos", label: "Todos os Tipos" },
  { id: "Shopping Center", label: "Shopping Center" },
  { id: "Galeria", label: "Galeria Comercial" },
  { id: "Academia", label: "Academia & Fitness" },
  { id: "Clínica & Saúde", label: "Clínica & Saúde" },
  { id: "Restaurante & Bar", label: "Restaurante & Bar" },
  { id: "Supermercado", label: "Supermercado" },
  { id: "Hotel", label: "Hotel & Resort" },
  { id: "Aeroporto / Rodoviária", label: "Terminal / Aeroporto" },
  { id: "Comércio de Rua", label: "Comércio Geral" },
];

export const RECURSOS_PADRAO = [
  "Com carregador de celular",
  "Tela touch interativa",
  "Áudio estéreo",
  "Wi-Fi para clientes",
  "Câmera de audiência",
  "Painel dupla face",
];
