import { createClient } from "@supabase/supabase-js";
import type { Talento } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

// Mantido como array vazio para retrocompatibilidade
export const TALENTOS_MOCK: Talento[] = [];

/**
 * Busca a lista pública de talentos ativos diretamente do Supabase
 */
export async function getTalentos(categoria?: string): Promise<Talento[]> {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("talentos")
      .select("*")
      .eq("status", "ativo")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });

    if (categoria && categoria !== "todos") {
      query = query.eq("categoria", categoria);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Aviso ao buscar talentos:", error.message);
      return [];
    }

    return (data || []) as Talento[];
  } catch (err) {
    console.warn("Erro ao buscar talentos:", err);
    return [];
  }
}

/**
 * Busca um talento individual ativo por slug
 */
export async function getTalentoBySlug(slug: string): Promise<Talento | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("talentos")
      .select("*")
      .eq("slug", slug)
      .eq("status", "ativo")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Talento;
  } catch {
    return null;
  }
}
