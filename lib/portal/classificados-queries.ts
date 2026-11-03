import { getSupabaseAdmin } from "@/lib/supabase/admin";
export * from "./classificados-types";
import type { ClassificadoData } from "./classificados-types";
export { CLASSIFICADOS_DEMO } from "./classificados-demo";
import { CLASSIFICADOS_DEMO } from "./classificados-demo";
import { obterClassificadosLocais } from "./classificados-storage";

export interface FiltrosClassificados {
  tipo?: string;
  categoria?: string;
  cidadeSlug?: string;
  busca?: string;
  destaqueHome?: boolean;
  destaqueClassificados?: boolean;
  pagina?: string;
  limit?: number;
  offset?: number;
}

/**
 * Busca classificados ativos no banco de dados com fallback nos dados de demonstração
 */
export async function getClassificados(filtros: FiltrosClassificados = {}): Promise<ClassificadoData[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("classificados")
      .select("*")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });

    if (filtros.tipo && filtros.tipo !== "todos") {
      query = query.eq("tipo", filtros.tipo);
    }

    if (filtros.categoria && filtros.categoria !== "todos") {
      query = query.eq("categoria", filtros.categoria);
    }

    if (filtros.destaqueClassificados) {
      query = query.eq("destaque_classificados", true);
    }

    // Se filtrando por página específica
    if (filtros.pagina && filtros.pagina !== "todas") {
      query = query.or(`paginas_exibicao.cs.{${filtros.pagina}},paginas_exibicao.cs.{todas}`);
    }

    // Se filtrando para Home (anúncios marcados como destaque_home OU direcionados para home/todas)
    if (filtros.destaqueHome) {
      query = query.or(`destaque_home.eq.true,paginas_exibicao.cs.{home},paginas_exibicao.cs.{todas}`);
    }

    if (filtros.busca && filtros.busca.trim()) {
      const termo = filtros.busca.trim();
      query = query.or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%,cidade_nome.ilike.%${termo}%`);
    }

    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data as unknown as ClassificadoData[];
    }

    if (error) {
      console.warn("[Portal Empire] Erro ao consultar classificados do banco:", error.message);
    }
  } catch (err) {
    console.warn("[Portal Empire] Classificados do banco inacessíveis, utilizando catálogo dinâmico:", err);
  }

  // Se o banco remoto ainda não tiver registros ou a tabela não existir, usa o storage local resiliente
  let itens = obterClassificadosLocais().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (filtros.tipo && filtros.tipo !== "todos") {
    itens = itens.filter((i) => i.tipo === filtros.tipo);
  }

  if (filtros.categoria && filtros.categoria !== "todos") {
    itens = itens.filter((i) => i.categoria === filtros.categoria);
  }

  if (filtros.destaqueHome) {
    itens = itens.filter(
      (i) => i.destaque_home || i.paginas_exibicao.includes("home") || i.paginas_exibicao.includes("todas")
    );
  }

  if (filtros.destaqueClassificados) {
    itens = itens.filter((i) => i.destaque_classificados);
  }

  if (filtros.pagina && filtros.pagina !== "todas") {
    itens = itens.filter(
      (i) => i.paginas_exibicao.includes(filtros.pagina!) || i.paginas_exibicao.includes("todas")
    );
  }

  if (filtros.busca && filtros.busca.trim()) {
    const b = filtros.busca.toLowerCase().trim();
    itens = itens.filter(
      (i) =>
        i.titulo.toLowerCase().includes(b) ||
        i.descricao.toLowerCase().includes(b) ||
        (i.cidade_nome && i.cidade_nome.toLowerCase().includes(b))
    );
  }

  if (filtros.limit) {
    itens = itens.slice(0, filtros.limit);
  }

  return itens;
}

/**
 * Busca anúncios de classificados para destaque na Home do portal
 */
export async function getClassificadosDestaqueHome(limit = 8): Promise<ClassificadoData[]> {
  return getClassificados({ destaqueHome: true, limit });
}

/**
 * Busca anúncios para serem exibidos em uma página específica do portal
 */
export async function getClassificadosPorPagina(pagina: string, limit = 4): Promise<ClassificadoData[]> {
  return getClassificados({ pagina, limit });
}

/**
 * Busca um único classificado pelo slug
 */
export async function getClassificadoBySlug(slug: string): Promise<ClassificadoData | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("classificados")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) return data as unknown as ClassificadoData;
  } catch (err) {
    console.warn(`[Portal Empire] Erro ao buscar classificado ${slug}:`, err);
  }

  return obterClassificadosLocais().find((c) => c.slug === slug) || null;
}
