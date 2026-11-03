import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase Dedicado para Leitura Pública (Server Components, ISR e Edge CDN).
 * 
 * ATENÇÃO: NUNCA importe cookies() ou headers() neste cliente.
 * Ele utiliza apenas a chave anônima pública (NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * Isso garante que o Next.js 15 e a Vercel CDN sirvam as páginas estáticas em cache (ISR),
 * com tempo de resposta de 15ms e sem consumir horas de execução de Serverless Functions.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export function getPublicSupabase() {
  return supabasePublic;
}

