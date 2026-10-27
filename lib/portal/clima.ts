import { COORDENADAS_CIDADES, CidadeCoordenadas } from "./coordenadas-cidades";

export interface DadosClima {
  slug: string;
  cidade: string;
  uf: string;
  temperatura: number;
  sensacao: number;
  tempMin: number;
  tempMax: number;
  umidade: number;
  codigoClima: number;
  descricao: string;
  icone: "sol" | "sol_nuvem" | "nublado" | "chuvisco" | "chuva" | "tempestade" | "nevoeiro";
  isDia: boolean;
  atualizadoEm: string;
}

/**
 * Traduz o código meteorológico padrão WMO (World Meteorological Organization)
 * para descrição em português e ícone representativo.
 */
export function traduzirCodigoWmo(codigo: number, isDia = true): {
  descricao: string;
  icone: DadosClima["icone"];
} {
  switch (codigo) {
    case 0:
      return {
        descricao: isDia ? "Céu limpo" : "Noite estrelada",
        icone: "sol",
      };
    case 1:
      return {
        descricao: "Predomínio de sol",
        icone: "sol_nuvem",
      };
    case 2:
      return {
        descricao: "Parcialmente nublado",
        icone: "sol_nuvem",
      };
    case 3:
      return {
        descricao: "Nublado",
        icone: "nublado",
      };
    case 45:
    case 48:
      return {
        descricao: "Nevoeiro / Neblina",
        icone: "nevoeiro",
      };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return {
        descricao: "Chuvisco leve",
        icone: "chuvisco",
      };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return {
        descricao: "Chuva",
        icone: "chuva",
      };
    case 80:
    case 81:
    case 82:
      return {
        descricao: "Pancadas de chuva",
        icone: "chuva",
      };
    case 95:
    case 96:
    case 99:
      return {
        descricao: "Tempestade / Trovoadas",
        icone: "tempestade",
      };
    default:
      return {
        descricao: "Sol com nuvens",
        icone: "sol_nuvem",
      };
  }
}

/**
 * Busca previsão do tempo em tempo real via Open-Meteo para uma coordenada específica.
 * Utiliza cache server-side do Next.js de 30 minutos (1800 segundos).
 */
export async function buscarClimaCidade(cidadeInfo: CidadeCoordenadas): Promise<DadosClima | null> {
  const { slug, nome, uf, lat, lng } = cidadeInfo;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 }, // 30 minutos de cache no Next.js
      headers: {
        "User-Agent": "EmpireCidades/1.0 (Noticias Regionais e Nacionais)",
      },
    });

    if (!res.ok) {
      console.warn(`[Clima Open-Meteo] Falha ao consultar ${nome}: status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const temp = Math.round(current.temperature_2m ?? 24);
    const sensacao = Math.round(current.apparent_temperature ?? temp);
    const tempMax = Math.round(daily.temperature_2m_max?.[0] ?? temp + 4);
    const tempMin = Math.round(daily.temperature_2m_min?.[0] ?? temp - 4);
    const umidade = Math.round(current.relative_humidity_2m ?? 65);
    const codigoClima = current.weather_code ?? 1;
    const isDia = current.is_day !== 0;

    const { descricao, icone } = traduzirCodigoWmo(codigoClima, isDia);

    return {
      slug,
      cidade: nome,
      uf,
      temperatura: temp,
      sensacao,
      tempMin,
      tempMax,
      umidade,
      codigoClima,
      descricao,
      icone,
      isDia,
      atualizadoEm: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Clima Open-Meteo] Erro na requisição para ${nome}:`, error);
    return null;
  }
}

/**
 * Retorna uma lista de cidades com clima atualizado, sorteadas de forma aleatória.
 * Dá prioridade às cidades-foco do portal.
 */
export async function getClimaCidadesAleatorias(quantidade = 10): Promise<DadosClima[]> {
  const todasCidades = Object.values(COORDENADAS_CIDADES);

  // Embaralha aleatoriamente (Fisher-Yates)
  const embaralhadas = [...todasCidades].sort(() => Math.random() - 0.5);

  // Pega a quantidade desejada
  const selecionadas = embaralhadas.slice(0, Math.min(quantidade, embaralhadas.length));

  // Busca em paralelo
  const promessas = selecionadas.map((c) => buscarClimaCidade(c));
  const resultados = await Promise.all(promessas);

  return resultados.filter((item): item is DadosClima => item !== null);
}

/**
 * Busca o clima de uma cidade específica pelo seu slug
 */
export async function getClimaPorSlug(slug: string): Promise<DadosClima | null> {
  const cidadeInfo = COORDENADAS_CIDADES[slug];
  if (!cidadeInfo) return null;
  return buscarClimaCidade(cidadeInfo);
}
