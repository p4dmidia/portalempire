import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCidades } from "@/lib/portal/queries";
import { ColunasColunistaView } from "@/components/painel/colunas/colunas-colunista-view";
import type { ColunaData } from "@/lib/portal/queries";

export default async function ColunistaColunasPage() {
  const profile = await requireRole(["colunista", "admin"]);
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
      .eq("dono_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <ColunasColunistaView
      initialColunas={(colunas || []) as unknown as ColunaData[]}
      cidades={cidades}
      userId={profile.id}
      userRole={profile.role}
    />
  );
}
