/**
 * Coordenadas geográficas (Latitude e Longitude) das principais cidades e capitais brasileiras,
 * com foco nas 26 cidades prioritárias do Portal Empire.
 */

export interface CidadeCoordenadas {
  slug: string;
  nome: string;
  uf: string;
  lat: number;
  lng: number;
}

export const COORDENADAS_CIDADES: Record<string, CidadeCoordenadas> = {
  // --- 26 Cidades Prioritárias ---
  "cotia": { slug: "cotia", nome: "Cotia", uf: "SP", lat: -23.6036, lng: -46.9192 },
  "uberlandia": { slug: "uberlandia", nome: "Uberlândia", uf: "MG", lat: -18.9186, lng: -48.2772 },
  "uberaba": { slug: "uberaba", nome: "Uberaba", uf: "MG", lat: -19.7483, lng: -47.9319 },
  "sao-paulo": { slug: "sao-paulo", nome: "São Paulo", uf: "SP", lat: -23.5505, lng: -46.6333 },
  "assis": { slug: "assis", nome: "Assis", uf: "SP", lat: -22.6617, lng: -50.4186 },
  "londrina": { slug: "londrina", nome: "Londrina", uf: "PR", lat: -23.3045, lng: -51.1696 },
  "maringa": { slug: "maringa", nome: "Maringá", uf: "PR", lat: -23.4205, lng: -51.9333 },
  "araguari": { slug: "araguari", nome: "Araguari", uf: "MG", lat: -18.6483, lng: -48.1883 },
  "alphaville": { slug: "alphaville", nome: "Alphaville", uf: "SP", lat: -23.4989, lng: -46.8522 },
  "barueri": { slug: "barueri", nome: "Barueri", uf: "SP", lat: -23.5114, lng: -46.8764 },
  "guarulhos": { slug: "guarulhos", nome: "Guarulhos", uf: "SP", lat: -23.4542, lng: -46.5333 },
  "ribeirao-preto": { slug: "ribeirao-preto", nome: "Ribeirão Preto", uf: "SP", lat: -21.1767, lng: -47.8108 },
  "sao-jose-do-rio-preto": { slug: "sao-jose-do-rio-preto", nome: "São José do Rio Preto", uf: "SP", lat: -20.8197, lng: -49.3797 },
  "sorocaba": { slug: "sorocaba", nome: "Sorocaba", uf: "SP", lat: -23.5015, lng: -47.4526 },
  "porto-alegre": { slug: "porto-alegre", nome: "Porto Alegre", uf: "RS", lat: -30.0346, lng: -51.2177 },
  "umuarama": { slug: "umuarama", nome: "Umuarama", uf: "PR", lat: -23.7667, lng: -53.3167 },
  "campo-grande": { slug: "campo-grande", nome: "Campo Grande", uf: "MS", lat: -20.4697, lng: -54.6201 },
  "presidente-prudente": { slug: "presidente-prudente", nome: "Presidente Prudente", uf: "SP", lat: -22.1256, lng: -51.3889 },
  "marilia": { slug: "marilia", nome: "Marília", uf: "SP", lat: -22.2139, lng: -49.9458 },
  "ourinhos": { slug: "ourinhos", nome: "Ourinhos", uf: "SP", lat: -22.9789, lng: -49.8706 },
  "pacaembu": { slug: "pacaembu", nome: "Pacaembu", uf: "SP", lat: -21.5639, lng: -51.2722 },
  "teresina": { slug: "teresina", nome: "Teresina", uf: "PI", lat: -5.0919, lng: -42.8034 },
  "salvador": { slug: "salvador", nome: "Salvador", uf: "BA", lat: -12.9777, lng: -38.5016 },
  "praia-grande": { slug: "praia-grande", nome: "Praia Grande", uf: "SP", lat: -24.0058, lng: -46.4028 },
  "caldas-novas": { slug: "caldas-novas", nome: "Caldas Novas", uf: "GO", lat: -17.7444, lng: -48.6256 },
  "goiania": { slug: "goiania", nome: "Goiânia", uf: "GO", lat: -16.6869, lng: -49.2648 },

  // --- Capitais e Regiões Adicionais ---
  "rio-de-janeiro": { slug: "rio-de-janeiro", nome: "Rio de Janeiro", uf: "RJ", lat: -22.9068, lng: -43.1729 },
  "belo-horizonte": { slug: "belo-horizonte", nome: "Belo Horizonte", uf: "MG", lat: -19.9167, lng: -43.9345 },
  "curitiba": { slug: "curitiba", nome: "Curitiba", uf: "PR", lat: -25.4284, lng: -49.2733 },
  "brasilia": { slug: "brasilia", nome: "Brasília", uf: "DF", lat: -15.7975, lng: -47.8919 },
  "campinas": { slug: "campinas", nome: "Campinas", uf: "SP", lat: -22.9056, lng: -47.0608 },
  "santos": { slug: "santos", nome: "Santos", uf: "SP", lat: -23.9608, lng: -46.3336 },
  "osasco": { slug: "osasco", nome: "Osasco", uf: "SP", lat: -23.5325, lng: -46.7917 },
  "florianopolis": { slug: "florianopolis", nome: "Florianópolis", uf: "SC", lat: -27.5954, lng: -48.5480 },
  "recife": { slug: "recife", nome: "Recife", uf: "PE", lat: -8.0476, lng: -34.8770 },
  "fortaleza": { slug: "fortaleza", nome: "Fortaleza", uf: "CE", lat: -3.7172, lng: -38.5433 },
  "manaus": { slug: "manaus", nome: "Manaus", uf: "AM", lat: -3.1190, lng: -60.0217 },
  "belem": { slug: "belem", nome: "Belém", uf: "PA", lat: -1.4558, lng: -48.4902 },
  "cuiaba": { slug: "cuiaba", nome: "Cuiabá", uf: "MT", lat: -15.6014, lng: -56.0979 },
  "natal": { slug: "natal", nome: "Natal", uf: "RN", lat: -5.7945, lng: -35.2110 },
  "vitoria": { slug: "vitoria", nome: "Vitória", uf: "ES", lat: -20.3155, lng: -40.3128 },
};

/**
 * Retorna as coordenadas de uma cidade pelo slug, ou fallback padrão (São Paulo).
 */
export function getCoordenadasCidade(slug: string): CidadeCoordenadas | null {
  return COORDENADAS_CIDADES[slug] || null;
}
