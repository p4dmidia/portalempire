import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCategorias, getCidades } from "@/lib/portal/queries";
import { MateriasDataTable } from "@/components/painel/materias-datatable";
import type { MateriaData } from "@/lib/portal/queries";

export default async function ColunistaArtigosPage() {
  const profile = await requireRole(["colunista", "admin"]);
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
        coluna:colunas(id, nome, slug),
        autor:profiles(id, nome, slug, foto_url)
      `
      )
      .eq("autor_id", profile.id)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meus Artigos & Crônicas
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie e acompanhe o desempenho dos artigos publicados nas suas colunas.
        </p>
      </div>

      <MateriasDataTable
        initialMaterias={(materias || []) as unknown as MateriaData[]}
        categorias={categorias}
        cidades={cidades}
        userRole={profile.role}
      />
    </div>
  );
}
