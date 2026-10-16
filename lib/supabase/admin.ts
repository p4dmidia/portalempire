import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com Service Role Key (Apenas para uso no Servidor)
 * Usado exclusivamente em Cron jobs, Webhooks e operações administrativas privilegiadas.
 * NUNCA importar ou expor em Client Components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey.includes("dummy")) {
    serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY/ANON_KEY devem estar definidas nas variáveis de ambiente."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const getSupabaseAdmin = createAdminClient;
