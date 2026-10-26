/**
 * Constantes e Metadados Puros para Cidades e Regiões
 * Arquivo 100% Client-Safe (sem dependências de next/headers ou Supabase Server)
 */

export const SLUGS_CIDADES_PRIORITARIAS = new Set([
  "cotia",
  "sao-paulo",
  "barueri",
  "alphaville",
  "assis",
  "guarulhos",
  "ribeirao-preto",
  "sao-jose-do-rio-preto",
  "sorocaba",
  "presidente-prudente",
  "marilia",
  "ourinhos",
  "pacaembu",
  "praia-grande",
  "uberlandia",
  "uberaba",
  "araguari",
  "londrina",
  "maringa",
  "umuarama",
  "goiania",
  "caldas-novas",
  "campo-grande",
  "porto-alegre",
  "teresina",
  "salvador",
]);

export interface CidadeItemData {
  id: string;
  portal_id: string;
  nome: string;
  slug: string;
  uf: string;
  destaque_menu: boolean;
  ordem: number;
  palavras_chave: string[];
}
