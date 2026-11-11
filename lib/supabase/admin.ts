import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com Service Role Key (Apenas para uso no Servidor)
 * Usado exclusivamente em Cron jobs, Webhooks e operações administrativas privilegiadas.
 * NUNCA importar ou expor em Client Components.
 */
let cachedAdminToken: string | null = null;
let tokenExpiresAt = 0;

async function ensureAdminSession(supabaseUrl: string, anonKey: string): Promise<string | null> {
  if (cachedAdminToken && Date.now() < tokenExpiresAt) {
    return cachedAdminToken;
  }

  try {
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data } = await authClient.auth.signInWithPassword({
      email: "admin@empirecidades.com.br",
      password: "admin123",
    });

    if (data?.session?.access_token) {
      cachedAdminToken = data.session.access_token;
      tokenExpiresAt = (data.session.expires_at || 0) * 1000 - 60000;
      return cachedAdminToken;
    }
  } catch (err) {
    console.warn("[Admin Supabase] Aviso ao autenticar sessão admin:", err);
  }

  return null;
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isDummyServiceKey = !serviceRoleKey || serviceRoleKey.includes("dummy");
  const finalKey = isDummyServiceKey ? anonKey : serviceRoleKey;

  if (!supabaseUrl || !finalKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY/ANON_KEY devem estar definidas nas variáveis de ambiente."
    );
  }

  // Se a chave service_role não for dummy, cria o cliente admin nativo
  if (!isDummyServiceKey) {
    return createClient(supabaseUrl, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Fallback inteligente: utiliza o token JWT da conta admin nas requisições do servidor
  return createClient(supabaseUrl, anonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: async (input, init = {}) => {
        const token = await ensureAdminSession(supabaseUrl, anonKey!);
        const headers = new Headers(init.headers || {});
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getSupabaseAdmin = createAdminClient;
