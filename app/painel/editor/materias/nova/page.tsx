import { requireRole } from "@/lib/auth";
import { getCategorias, getCidades } from "@/lib/portal/queries";
import { MateriaForm } from "@/components/painel/materia-form";

export default async function NovaMateriaPage() {
  const profile = await requireRole(["admin", "editor", "colunista"]);
  const [categorias, cidades] = await Promise.all([
    getCategorias(),
    getCidades(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Escrever Nova Matéria
        </h1>
        <p className="text-sm text-slate-500">
          Redija sua notícia, faça upload de imagens, configure SEO e publique para os leitores.
        </p>
      </div>

      <MateriaForm
        categorias={categorias}
        cidades={cidades}
        userId={profile.id}
        userRole={profile.role}
      />
    </div>
  );
}
