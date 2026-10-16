import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCidades } from "@/lib/portal/queries";
import { ColunasAdminView } from "@/components/painel/colunas/colunas-admin-view";
import type { ColunaData } from "@/lib/portal/queries";

export default async function AdminColunasPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();

  const [cidades, { data: colunas }] = await Promise.all([
    getCidades(),
    supabase
      .from("colunas")
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf),
        dono:profiles(id, nome, email, foto_url, slug)
      `)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <ColunasAdminView
      initialColunas={(colunas || []) as unknown as ColunaData[]}
      cidades={cidades}
      userId={profile.id}
    />
  );
}
