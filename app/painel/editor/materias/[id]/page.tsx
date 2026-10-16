import { requireRole } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategorias, getCidades } from "@/lib/portal/queries";
import { MateriaForm } from "@/components/painel/materia-form";
import type { MateriaData } from "@/lib/portal/queries";

interface EditarMateriaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMateriaPage({
  params,
}: EditarMateriaPageProps) {
  const { id } = await params;
  const profile = await requireRole(["admin", "editor", "colunista"]);
  const supabase = await createClient();

  const [categorias, cidades, { data: materia }] = await Promise.all([
    getCategorias(),
    getCidades(),
    supabase.from("materias").select("*").eq("id", id).single(),
  ]);

  if (!materia) {
    notFound();
  }

  // Se não for admin e não for o autor da matéria -> bloqueia acesso
  if (profile.role !== "admin" && materia.autor_id !== profile.id) {
    redirect("/painel/editor/materias");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Editar Matéria
        </h1>
        <p className="text-sm text-slate-500">
          Atualize os textos, imagens, tags e status da publicação.
        </p>
      </div>

      <MateriaForm
        initialMateria={materia as unknown as MateriaData}
        categorias={categorias}
        cidades={cidades}
        userId={profile.id}
        userRole={profile.role}
      />
    </div>
  );
}
