import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { CIDADES_CATALOGO } from "@/lib/captacao/catalogo-portais";

// Cache em memória com TTL de 60s para eliminar requisições repetidas ao Supabase
const MEM_CACHE = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000;

function getCached<T>(key: string): T | null {
  const item = MEM_CACHE.get(key);
  if (item && Date.now() < item.expiresAt) {
    return item.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): T {
  MEM_CACHE.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

export interface PortalData {
  id: string;
  nome: string;
  slug: string;
  dominio: string | null;
  logo_url: string | null;
  cor_primaria: string;
  descricao_seo: string | null;
  redes_sociais: Record<string, string> | null;
  youtube_live_url: string | null;
  config: Record<string, unknown> | null;
}

export interface CategoriaData {
  id: string;
  portal_id: string;
  nome: string;
  slug: string;
  pai_id: string | null;
  exibir_menu: boolean;
  exibir_home: boolean;
  ordem_menu: number;
  ordem_home: number;
  cor: string | null;
  palavras_chave: string[];
  subcategorias?: CategoriaData[];
}

export interface CidadeData {
  id: string;
  portal_id: string;
  nome: string;
  slug: string;
  uf: string;
  destaque_menu: boolean;
  ordem: number;
  palavras_chave: string[];
}

export type Categoria = CategoriaData;
export type Cidade = CidadeData;

export interface MateriaData {
  id: string;
  portal_id: string;
  autor_id: string | null;
  coluna_id: string | null;
  categoria_id: string;
  cidade_id: string | null;
  titulo: string;
  slug: string;
  subtitulo: string | null;
  resumo: string | null;
  conteudo: unknown;
  conteudo_html: string | null;
  imagem_url: string | null;
  imagem_credito: string | null;
  origem: "manual" | "captacao";
  fonte_id: string | null;
  fonte_nome: string | null;
  url_original: string | null;
  status: "rascunho" | "publicado" | "despublicado" | "agendado";
  publicado_em: string | null;
  urgente: boolean;
  destaque: boolean;
  tags: string[];
  visualizacoes: number;
  seo_titulo: string | null;
  seo_descricao: string | null;
  created_at: string;
  autor?: {
    id: string;
    nome: string;
    slug: string;
    foto_url: string | null;
    bio: string | null;
  } | null;
  categoria?: {
    id: string;
    nome: string;
    slug: string;
    cor: string | null;
  } | null;
  cidade?: {
    id: string;
    nome: string;
    slug: string;
    uf: string;
  } | null;
  coluna?: {
    id: string;
    nome: string;
    slug: string;
    capa_url: string | null;
  } | null;
}

export interface ColunaData {
  id: string;
  portal_id: string;
  dono_id: string;
  cidade_id: string | null;
  nome: string;
  slug: string;
  descricao: string | null;
  capa_url: string | null;
  status: "pendente" | "ativa" | "suspensa";
  aceita_anuncios: boolean;
  created_at: string;
  dono?: {
    id: string;
    nome: string;
    slug: string;
    email?: string | null;
    foto_url: string | null;
    bio: string | null;
  } | null;
  cidade?: {
    id: string;
    nome: string;
    slug: string;
    uf: string;
  } | null;
}

export interface ShortData {
  id: string;
  youtube_id: string;
  titulo: string;
  ordem: number;
}

export interface FonteRssData {
  id: string;
  nome: string;
  veiculo: string;
}

/**
 * Busca os dados de configuração do portal principal (com cache).
 */
export const getPortalData = cache(async (): Promise<PortalData | null> => {
  const cached = getCached<PortalData | null>("portal_data");
  if (cached !== null) return cached;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("portais").select("*").limit(1).maybeSingle();
    if (error) {
      console.error("[Portal Empire] Erro ao buscar portal:", error.message || error);
      return null;
    }
    const result = data as PortalData | null;
    if (result) setCached("portal_data", result);
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar portal:", msg);
    return null;
  }
});

export const CATEGORIAS_PADRAO_SISTEMA: CategoriaData[] = [
  {
    id: "c0000000-0000-0000-0000-000000000019",
    portal_id: "a0000000-0000-0000-0000-000000000001",
    nome: "Empreendedorismo",
    slug: "empreendedorismo",
    pai_id: null,
    exibir_menu: true,
    exibir_home: true,
    ordem_menu: 5,
    ordem_home: 5,
    cor: "#059669",
    palavras_chave: ["empreendedorismo", "startup", "pitch", "franquia", "pme", "mei", "inovacao"],
  },
  {
    id: "c0000000-0000-0000-0000-000000000020",
    portal_id: "a0000000-0000-0000-0000-000000000001",
    nome: "Negócios",
    slug: "negocios",
    pai_id: null,
    exibir_menu: true,
    exibir_home: true,
    ordem_menu: 6,
    ordem_home: 6,
    cor: "#0284c7",
    palavras_chave: ["negocios", "mercado", "m&a", "varejo", "ceo", "cfo", "empresas"],
  },
  {
    id: "c0000000-0000-0000-0000-000000000021",
    portal_id: "a0000000-0000-0000-0000-000000000001",
    nome: "Turismo",
    slug: "turismo",
    pai_id: null,
    exibir_menu: true,
    exibir_home: true,
    ordem_menu: 9,
    ordem_home: 9,
    cor: "#0d9488",
    palavras_chave: ["turismo", "viagem", "viagens", "hotel", "resort", "passagens", "destinos"],
  },
  {
    id: "c0000000-0000-0000-0000-000000000022",
    portal_id: "a0000000-0000-0000-0000-000000000001",
    nome: "Gastronomia",
    slug: "gastronomia",
    pai_id: null,
    exibir_menu: true,
    exibir_home: true,
    ordem_menu: 10,
    ordem_home: 10,
    cor: "#ea580c",
    palavras_chave: ["gastronomia", "culinaria", "restaurante", "chef", "receitas", "vinho", "gourmet"],
  },
  {
    id: "c0000000-0000-0000-0000-000000000023",
    portal_id: "a0000000-0000-0000-0000-000000000001",
    nome: "Beleza",
    slug: "beleza",
    pai_id: null,
    exibir_menu: true,
    exibir_home: true,
    ordem_menu: 12,
    ordem_home: 12,
    cor: "#ec4899",
    palavras_chave: ["beleza", "maquiagem", "cosmeticos", "skincare", "cabelos", "tendencias de beleza"],
  },
  {
    id: "c0000000-0000-0000-0000-000000000024",
    portal_id: "a0000000-0000-0000-0000-000000000001",
    nome: "Estética",
    slug: "estetica",
    pai_id: null,
    exibir_menu: true,
    exibir_home: true,
    ordem_menu: 13,
    ordem_home: 13,
    cor: "#a855f7",
    palavras_chave: ["estetica", "harmonizacao", "botox", "clinica estetica", "cuidados corporais", "spa"],
  },
];

/**
 * Busca todas as categorias organizadas com suas subcategorias (com cache).
 */
export const getCategorias = cache(async (): Promise<CategoriaData[]> => {
  const cached = getCached<CategoriaData[]>("categorias_data");
  if (cached) return cached;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("ordem_menu", { ascending: true });

    if (error) {
      console.error("[Portal Empire] Erro ao buscar categorias:", error.message || error);
    }

    const bancoCategorias: CategoriaData[] = (data || []) as CategoriaData[];
    const slugsExistentes = new Set(bancoCategorias.map((c) => c.slug));

    // Incorpora temas oficiais faltantes para garantir presença imediata no portal
    const categoriasCompletas: CategoriaData[] = [...bancoCategorias];
    for (const padrao of CATEGORIAS_PADRAO_SISTEMA) {
      if (!slugsExistentes.has(padrao.slug)) {
        categoriasCompletas.push(padrao);
      }
    }

    const principais = categoriasCompletas.filter((c) => !c.pai_id);

    const resultado = principais.map((pai) => ({
      ...pai,
      subcategorias: categoriasCompletas.filter((sub) => sub.pai_id === pai.id),
    }));

    setCached("categorias_data", resultado);
    return resultado;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar categorias:", msg);
    return CATEGORIAS_PADRAO_SISTEMA;
  }
});

/**
 * Busca uma categoria ou subcategoria específica pelo slug.
 */
export async function getCategoriaBySlug(slug: string): Promise<CategoriaData | null> {
  try {
    const supabase = await createClient();
    const { data: categoria, error: catError } = await supabase
      .from("categorias")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (categoria) {
      // Se for categoria pai, buscar suas subcategorias
      const { data: subcategorias } = await supabase
        .from("categorias")
        .select("*")
        .eq("pai_id", categoria.id)
        .order("ordem_menu", { ascending: true });

      return {
        ...(categoria as CategoriaData),
        subcategorias: (subcategorias || []) as CategoriaData[],
      };
    }

    // Fallback caso ainda não tenha sido inserida no Postgres
    const fallback = CATEGORIAS_PADRAO_SISTEMA.find((c) => c.slug === slug);
    if (fallback) {
      return fallback;
    }

    return null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Portal Empire] Falha ao buscar categoria ${slug}:`, msg);
    return CATEGORIAS_PADRAO_SISTEMA.find((c) => c.slug === slug) || null;
  }
}

import { SLUGS_CIDADES_PRIORITARIAS } from "@/lib/portal/cidades-constantes";
export { SLUGS_CIDADES_PRIORITARIAS };

/**
 * Busca cidades em destaque para o menu, blocos e listagem com garantia de presença das prioritárias (com cache).
 */
export const getCidades = cache(async (): Promise<CidadeData[]> => {
  const cached = getCached<CidadeData[]>("cidades_data");
  if (cached) return cached;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cidades")
      .select("*")
      .order("ordem", { ascending: true });

    const cidadesDb = (data || []) as CidadeData[];
    const slugsExistentes = new Set(cidadesDb.map((c) => c.slug));

    // Garante que todas as cidades do catálogo estejam presentes mesmo se o banco ainda não as tiver inserido
    const cidadesExtras: CidadeData[] = [];
    CIDADES_CATALOGO.forEach((item, idx) => {
      if (!slugsExistentes.has(item.slug)) {
        cidadesExtras.push({
          id: `extra-${item.slug}`,
          portal_id: "a0000000-0000-0000-0000-000000000001",
          nome: item.nome,
          slug: item.slug,
          uf: item.uf,
          destaque_menu: SLUGS_CIDADES_PRIORITARIAS.has(item.slug),
          ordem: SLUGS_CIDADES_PRIORITARIAS.has(item.slug) ? idx + 1 : 100 + idx,
          palavras_chave: item.palavras_chave,
        });
      }
    });

    const todas = [...cidadesDb, ...cidadesExtras].map((c) => ({
      ...c,
      destaque_menu: SLUGS_CIDADES_PRIORITARIAS.has(c.slug) || c.destaque_menu,
    }));

    // Ordenação: prioritárias primeiro, depois alfabética
    const resultado = todas.sort((a, b) => {
      const aPrio = SLUGS_CIDADES_PRIORITARIAS.has(a.slug);
      const bPrio = SLUGS_CIDADES_PRIORITARIAS.has(b.slug);
      if (aPrio && !bPrio) return -1;
      if (!aPrio && bPrio) return 1;
      return a.nome.localeCompare(b.nome);
    });

    setCached("cidades_data", resultado);
    return resultado;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar cidades:", msg);
    return [];
  }
});

/**
 * Busca matérias com paginação e filtros.
 */
export async function getMaterias(options?: {
  limit?: number;
  offset?: number;
  categoriaSlug?: string;
  cidadeSlug?: string;
  colunaSlug?: string;
  autorSlug?: string;
  destaque?: boolean;
  urgente?: boolean;
  search?: string;
  ordenarPor?: "publicado_em" | "visualizacoes";
}): Promise<MateriaData[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("materias")
      .select(
        `
        id,
        portal_id,
        autor_id,
        coluna_id,
        categoria_id,
        cidade_id,
        titulo,
        slug,
        subtitulo,
        resumo,
        imagem_url,
        imagem_credito,
        origem,
        fonte_id,
        fonte_nome,
        url_original,
        status,
        publicado_em,
        urgente,
        destaque,
        tags,
        visualizacoes,
        seo_titulo,
        seo_descricao,
        created_at,
        categoria:categorias(id, nome, slug, cor),
        cidade:cidades(id, nome, slug, uf),
        coluna:colunas(id, nome, slug, capa_url),
        autor:profiles(id, nome, slug, foto_url, bio)
      `
      )
      .eq("status", "publicado");

    if (options?.destaque !== undefined) {
      query = query.eq("destaque", options.destaque);
    }

    if (options?.urgente !== undefined) {
      query = query.eq("urgente", options.urgente);
    }

    if (options?.categoriaSlug) {
      // Buscar categoria e subcategorias
      const { data: cat } = await supabase
        .from("categorias")
        .select("id")
        .eq("slug", options.categoriaSlug)
        .maybeSingle();

      if (cat) {
        const { data: subcats } = await supabase
          .from("categorias")
          .select("id")
          .eq("pai_id", cat.id);

        const catIds = [cat.id, ...(subcats || []).map((s) => s.id)];
        query = query.in("categoria_id", catIds);
      } else {
        const catFallback = CATEGORIAS_PADRAO_SISTEMA.find((c) => c.slug === options.categoriaSlug);
        if (catFallback) {
          const termos = catFallback.palavras_chave.slice(0, 4);
          const keywordConditions = termos
            .map((t) => `titulo.ilike.%${t}%,resumo.ilike.%${t}%`)
            .join(",");
          query = query.or(`tags.cs.{${options.categoriaSlug}},${keywordConditions}`);
        }
      }
    }

    if (options?.cidadeSlug) {
      const { data: cid } = await supabase
        .from("cidades")
        .select("id")
        .eq("slug", options.cidadeSlug)
        .maybeSingle();
      if (cid) {
        query = query.eq("cidade_id", cid.id);
      } else {
        const cidFallback = CIDADES_CATALOGO.find((c) => c.slug === options.cidadeSlug);
        if (cidFallback) {
          const termos = cidFallback.palavras_chave.slice(0, 3);
          const keywordConditions = termos
            .map((t) => `titulo.ilike.%${t}%,resumo.ilike.%${t}%`)
            .join(",");
          query = query.or(keywordConditions);
        }
      }
    }

    if (options?.colunaSlug) {
      const { data: col } = await supabase
        .from("colunas")
        .select("id")
        .eq("slug", options.colunaSlug)
        .maybeSingle();
      if (col) {
        query = query.eq("coluna_id", col.id);
      }
    }

    if (options?.autorSlug) {
      const { data: aut } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", options.autorSlug)
        .maybeSingle();
      if (aut) {
        query = query.eq("autor_id", aut.id);
      }
    }

    if (options?.search) {
      query = query.textSearch("titulo", options.search, {
        type: "websearch",
        config: "portuguese",
      });
    }

    const orderField = options?.ordenarPor === "visualizacoes" ? "visualizacoes" : "publicado_em";
    query = query.order(orderField, { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[Portal Empire] Erro ao buscar matérias:", error.message || error);
      return [];
    }

    return (data || []) as unknown as MateriaData[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar matérias:", msg);
    return [];
  }
}

/**
 * Otimização de Alta Performance para a Home:
 * Busca as matérias mais recentes do portal em uma ÚNICA requisição e as distribui
 * entre as categorias ativas da Home, eliminando 10 a 15 consultas individuais ao Supabase.
 */
export async function getMateriasPorCategoriasHome(
  categoriasHome: CategoriaData[],
  limitPorCat = 4
): Promise<Array<{ categoria: CategoriaData; materias: MateriaData[] }>> {
  if (categoriasHome.length === 0) return [];

  // Busca um lote otimizado de matérias recentes publicadas no portal (apenas 1 requisição)
  const materiasPool = await getMaterias({ limit: 60 });

  const mapaResultado = new Map<string, MateriaData[]>();
  categoriasHome.forEach((c) => mapaResultado.set(c.id, []));

  // 1ª Passagem: Distribuição por categoria_id
  for (const m of materiasPool) {
    if (m.categoria_id && mapaResultado.has(m.categoria_id)) {
      const lista = mapaResultado.get(m.categoria_id)!;
      if (lista.length < limitPorCat) {
        lista.push(m);
      }
    }
  }

  // 2ª Passagem: Fallback por palavras-chave/slug da categoria para categorias com poucas matérias
  for (const cat of categoriasHome) {
    const lista = mapaResultado.get(cat.id)!;
    if (lista.length < limitPorCat) {
      const termos = [
        cat.slug.toLowerCase(),
        ...(cat.palavras_chave || []).map((p) => p.toLowerCase()),
      ];

      for (const m of materiasPool) {
        if (lista.length >= limitPorCat) break;
        if (lista.some((existente) => existente.id === m.id)) continue;

        const match =
          m.tags?.some((tag) => termos.some((t) => tag.toLowerCase().includes(t))) ||
          termos.some(
            (t) =>
              m.titulo.toLowerCase().includes(t) ||
              (m.resumo && m.resumo.toLowerCase().includes(t))
          );

        if (match) {
          lista.push(m);
        }
      }
    }
  }

  return categoriasHome.map((cat) => ({
    categoria: cat,
    materias: mapaResultado.get(cat.id) || [],
  }));
}

/**
 * Busca uma matéria específica pelo slug.
 */
export async function getMateriaBySlug(slug: string): Promise<MateriaData | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("materias")
      .select(
        `
        *,
        categoria:categorias(id, nome, slug, cor),
        cidade:cidades(id, nome, slug, uf),
        coluna:colunas(id, nome, slug, capa_url),
        autor:profiles(id, nome, slug, foto_url, bio)
      `
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`[Portal Empire] Erro ao buscar matéria ${slug}:`, error.message || error);
      return null;
    }

    return data as unknown as MateriaData | null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Portal Empire] Falha ao buscar matéria ${slug}:`, msg);
    return null;
  }
}

/**
 * Busca todas as colunas ativas com autor e cidade (com cache).
 */
export const getColunasAtivas = cache(async (cidadeSlug?: string): Promise<ColunaData[]> => {
  const cacheKey = `colunas_${cidadeSlug || "todas"}`;
  const cached = getCached<ColunaData[]>(cacheKey);
  if (cached) return cached;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("colunas")
      .select(
        `
        *,
        dono:profiles(id, nome, slug, foto_url, bio),
        cidade:cidades(id, nome, slug, uf)
      `
      )
      .eq("status", "ativa");

    if (cidadeSlug) {
      const { data: cid } = await supabase
        .from("cidades")
        .select("id")
        .eq("slug", cidadeSlug)
        .maybeSingle();
      if (cid) {
        query = query.eq("cidade_id", cid.id);
      }
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("[Portal Empire] Erro ao buscar colunas ativas:", error.message || error);
      return [];
    }

    const resultado = (data || []) as unknown as ColunaData[];
    setCached(cacheKey, resultado);
    return resultado;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar colunas ativas:", msg);
    return [];
  }
});

/**
 * Busca uma coluna pelo slug.
 */
export async function getColunaBySlug(slug: string): Promise<ColunaData | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("colunas")
      .select(
        `
        *,
        dono:profiles(id, nome, slug, foto_url, bio),
        cidade:cidades(id, nome, slug, uf)
      `
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`[Portal Empire] Erro ao buscar coluna ${slug}:`, error.message || error);
      return null;
    }

    return data as unknown as ColunaData | null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Portal Empire] Falha ao buscar coluna ${slug}:`, msg);
    return null;
  }
}

/**
 * Busca perfil público de um autor/colunista pelo slug.
 */
export async function getAutorBySlug(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("autores_publicos")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`[Portal Empire] Erro ao buscar autor ${slug}:`, error.message || error);
      return null;
    }

    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Portal Empire] Falha ao buscar autor ${slug}:`, msg);
    return null;
  }
}

/**
 * Busca fontes RSS ativas para a faixa de fontes.
 */
export async function getFontesRssAtivas(): Promise<FonteRssData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("fontes_rss")
      .select("id, nome, veiculo")
      .eq("ativo", true);

    if (error) {
      console.error("[Portal Empire] Erro ao buscar fontes RSS:", error.message || error);
      return [];
    }

    return (data || []) as FonteRssData[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar fontes RSS:", msg);
    return [];
  }
}

/**
 * Busca vídeos Shorts cadastrados.
 */
export async function getShorts(): Promise<ShortData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shorts")
      .select("id, youtube_id, titulo, ordem")
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("[Portal Empire] Erro ao buscar shorts:", error.message || error);
      return [];
    }

    return (data || []) as ShortData[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar shorts:", msg);
    return [];
  }
}

/**
 * Busca as configurações gerais do portal como um mapa chave-valor.
 */
export async function getConfiguracoes(): Promise<Record<string, unknown>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("configuracoes").select("chave, valor");
    if (error) {
      console.error("[Portal Empire] Erro ao buscar configurações:", error.message || error);
      return {};
    }
    const configMap: Record<string, unknown> = {};
    (data || []).forEach((c) => {
      configMap[c.chave] = c.valor;
    });
    return configMap;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar configurações:", msg);
    return {};
  }
}

/**
 * Busca a ordem dos blocos da Home.
 */
export async function getOrdemBlocosHome(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "ordem_blocos_home")
      .maybeSingle();

    if (error) {
      console.error("[Portal Empire] Erro ao buscar ordem dos blocos:", error.message || error);
    }

    if (data?.valor && Array.isArray(data.valor)) {
      return data.valor as string[];
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar ordem dos blocos:", msg);
  }

  // Padrão
  return [
    "destaques",
    "grade_cards",
    "recentes_mais_lidas",
    "carrossel_rapidas",
    "cidades",
    "shorts_tv",
    "editorias",
    "colunistas",
    "faixa_fontes",
  ];
}

