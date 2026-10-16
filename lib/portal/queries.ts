import { createClient } from "@/lib/supabase/server";

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
 * Busca os dados de configuração do portal principal.
 */
export async function getPortalData(): Promise<PortalData | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("portais").select("*").limit(1).maybeSingle();
    if (error) {
      console.error("[Portal Empire] Erro ao buscar portal:", error.message || error);
      return null;
    }
    return data as PortalData | null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar portal:", msg);
    return null;
  }
}

/**
 * Busca todas as categorias organizadas com suas subcategorias.
 */
export async function getCategorias(): Promise<CategoriaData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("ordem_menu", { ascending: true });

    if (error) {
      console.error("[Portal Empire] Erro ao buscar categorias:", error.message || error);
      return [];
    }

    if (!data) return [];

    const todas = data as CategoriaData[];
    const principais = todas.filter((c) => !c.pai_id);

    return principais.map((pai) => ({
      ...pai,
      subcategorias: todas.filter((sub) => sub.pai_id === pai.id),
    }));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar categorias:", msg);
    return [];
  }
}

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

    if (catError) {
      console.error(`[Portal Empire] Erro ao buscar categoria ${slug}:`, catError.message || catError);
      return null;
    }

    if (!categoria) return null;

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Portal Empire] Falha ao buscar categoria ${slug}:`, msg);
    return null;
  }
}

/**
 * Busca cidades em destaque para o menu e listagem.
 */
export async function getCidades(): Promise<CidadeData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cidades")
      .select("*")
      .order("ordem", { ascending: true });

    if (error) {
      console.error("[Portal Empire] Erro ao buscar cidades:", error.message || error);
      return [];
    }

    return (data || []) as CidadeData[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar cidades:", msg);
    return [];
  }
}

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
        *,
        categoria:categorias(id, nome, slug, cor),
        cidade:cidades(id, nome, slug, uf),
        coluna:colunas(id, nome, slug, capa_url),
        autor:profiles(id, nome, slug, foto_url, bio)
      `
      )
      .eq("status", "publicado")
      .or(`publicado_em.is.null,publicado_em.lte.${new Date().toISOString()}`);

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
 * Busca todas as colunas ativas com autor e cidade.
 */
export async function getColunasAtivas(cidadeSlug?: string): Promise<ColunaData[]> {
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

    return (data || []) as unknown as ColunaData[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Portal Empire] Falha de conexão ao buscar colunas ativas:", msg);
    return [];
  }
}

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

