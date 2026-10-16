import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, UserRole } from "./types";

/**
 * Retorna o usuário autenticado da sessão atual.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Retorna o perfil completo do usuário autenticado no banco de dados.
 */
export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as Profile;
}

/**
 * Garante que o usuário está autenticado e possui um dos roles permitidos.
 * Se não autenticado -> redireciona para /login.
 * Se status pendente/bloqueado -> redireciona para tela específica.
 * Se role não permitido -> lança erro ou redireciona para /painel.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<Profile> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  if (profile.status === "pendente") {
    redirect("/aguardando-aprovacao");
  }

  if (profile.status === "bloqueado") {
    redirect("/bloqueado");
  }

  if (!allowedRoles.includes(profile.role) && profile.role !== "admin") {
    redirect("/painel");
  }

  return profile;
}
