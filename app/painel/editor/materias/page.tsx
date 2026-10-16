import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCategorias, getCidades } from "@/lib/portal/queries";
import { MateriasDataTable } from "@/components/painel/materias-datatable";
import type { MateriaData } from "@/lib/portal/queries";

export default async function EditorMateriasPage() {
  const profile = await requireRole(["admin", "editor", "colunista"]);
  const supabase = await createClient();

  const [categorias, cidades, { data: materias }] = await Promise.all([
    getCategorias(),
    getCidades(),
    supabase
      .from("materias")
      .select(
        `
        *,
        categoria:categorias(id, nome, slug, cor),
        cidade:cidades(id, nome, slug, uf),
        autor:profiles(id, nome, slug, foto_url)
      `
      )
      .eq("autor_id", profile.id)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <MateriasDataTable
      initialMaterias={(materias || []) as unknown as MateriaData[]}
      categorias={categorias}
      cidades={cidades}
      userRole={profile.role}
    />
  );
}
