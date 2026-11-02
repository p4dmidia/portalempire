import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
export * from "./revistas-types";
import type { RevistaData, FiltrosRevistas } from "./revistas-types";
export { REVISTAS_DEMO } from "./revistas-demo";
import { REVISTAS_DEMO } from "./revistas-demo";
import { obterRevistasLocais } from "./revistas-storage";

export async function getRevistas(filtros: FiltrosRevistas = {}): Promise<RevistaData[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("revistas")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("data_publicacao", { ascending: false });

    if (filtros.destaque) {
      query = query.eq("destaque", true);
    }

    if (filtros.categoria && filtros.categoria !== "Todas") {
      query = query.ilike("categoria", `%${filtros.categoria}%`);
    }

    if (filtros.cidade && filtros.cidade !== "Todas") {
      query = query.ilike("cidade", `%${filtros.cidade}%`);
    }

    if (filtros.escritor && filtros.escritor !== "Todos") {
      query = query.ilike("escritor", `%${filtros.escritor}%`);
    }

    if (filtros.busca && filtros.busca.trim()) {
      const termo = filtros.busca.trim();
      query = query.or(
        `titulo.ilike.%${termo}%,subtitulo.ilike.%${termo}%,cidade.ilike.%${termo}%,escritor.ilike.%${termo}%,categoria.ilike.%${termo}%`
      );
    }

    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data as RevistaData[];
    }
  } catch (err) {
    console.warn("[Portal Empire] Tabela de revistas do banco inacessível, utilizando storage resiliente:", err);
  }

  // Fallback no storage local resiliente (mantém edições cadastradas no painel mesmo sem tabela remota)
  let itens = obterRevistasLocais();

  if (filtros.destaque) {
    itens = itens.filter((r) => r.destaque && r.ativo);
  } else {
    itens = itens.filter((r) => r.ativo);
  }

  if (filtros.categoria && filtros.categoria !== "Todas") {
    itens = itens.filter(
      (r) => r.categoria.toLowerCase() === filtros.categoria!.toLowerCase()
    );
  }

  if (filtros.cidade && filtros.cidade !== "Todas") {
    itens = itens.filter(
      (r) => r.cidade?.toLowerCase() === filtros.cidade!.toLowerCase()
    );
  }

  if (filtros.escritor && filtros.escritor !== "Todos") {
    itens = itens.filter(
      (r) => r.escritor?.toLowerCase().includes(filtros.escritor!.toLowerCase())
    );
  }

  if (filtros.busca && filtros.busca.trim()) {
    const termo = filtros.busca.toLowerCase().trim();
    itens = itens.filter(
      (r) =>
        r.titulo.toLowerCase().includes(termo) ||
        (r.subtitulo && r.subtitulo.toLowerCase().includes(termo)) ||
        (r.cidade && r.cidade.toLowerCase().includes(termo)) ||
        (r.escritor && r.escritor.toLowerCase().includes(termo)) ||
        r.categoria.toLowerCase().includes(termo)
    );
  }

  if (filtros.limit) {
    itens = itens.slice(0, filtros.limit);
  }

  return itens;
}

export async function getRevistasDestaque(): Promise<RevistaData[]> {
  return getRevistas({ destaque: true });
}

// Busca todas as revistas para o painel administrativo (inclui inativas)
export async function getRevistasAdmin(): Promise<RevistaData[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("revistas")
      .select("*")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as RevistaData[];
    }
  } catch (err) {
    console.warn("[Portal Empire Admin] Erro ao carregar revistas do banco:", err);
  }

  return obterRevistasLocais();
}
