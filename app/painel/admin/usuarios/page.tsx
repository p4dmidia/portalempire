import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminUsuariosClient } from "@/components/painel/admin-usuarios-client";
import type { Profile } from "@/lib/auth/types";

export default async function AdminUsuariosPage() {
  const currentAdmin = await requireRole(["admin"]);

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar lista de usuários: ${error.message}`);
  }

  return (
    <AdminUsuariosClient
      initialProfiles={(profiles || []) as Profile[]}
      currentAdminId={currentAdmin.id}
    />
  );
}
