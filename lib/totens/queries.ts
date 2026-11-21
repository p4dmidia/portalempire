import { createClient } from "@supabase/supabase-js";
import type { Totem, CidadeComTotens } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Busca totens ativos com filtros opcionais
 */
export async function getTotens(cidade?: string, tipo?: string): Promise<Totem[]> {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("totens")
      .select("*")
      .eq("status", "ativo")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });

    if (cidade && cidade.toLowerCase() !== "todas" && cidade.toLowerCase() !== "todos") {
      query = query.ilike("cidade_nome", `%${cidade.trim()}%`);
    }

    if (tipo && tipo.toLowerCase() !== "todos") {
      query = query.eq("tipo_estabelecimento", tipo);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Aviso ao buscar totens:", error.message);
      return [];
    }

    return (data || []) as Totem[];
  } catch (err) {
    console.warn("Erro ao buscar totens:", err);
    return [];
  }
}

/**
 * Busca um totem específico por slug
 */
export async function getTotemBySlug(slug: string): Promise<Totem | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("totens")
      .select("*")
      .eq("slug", slug)
      .eq("status", "ativo")
      .maybeSingle();

    if (error || !data) return null;
    return data as Totem;
  } catch {
    return null;
  }
}

/**
 * Agrupa cidades que possuem totens instalados para o carrossel/seletor
 */
export async function getCidadesComTotens(): Promise<CidadeComTotens[]> {
  try {
    const totens = await getTotens();
    const map = new Map<string, CidadeComTotens>();

    for (const t of totens) {
      const chave = `${t.cidade_nome}/${t.estado}`;
      if (!map.has(chave)) {
        map.set(chave, {
          cidade_nome: t.cidade_nome,
          estado: t.estado,
          total_totens: 1,
          foto_url: t.foto_url,
        });
      } else {
        const item = map.get(chave)!;
        item.total_totens += 1;
      }
    }

    return Array.from(map.values());
  } catch {
    return [];
  }
}
