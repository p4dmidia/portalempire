import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CardMateria } from "@/components/portal/CardMateria";
import { Rss } from "lucide-react";
import type { MateriaData } from "@/lib/portal/queries";

export default async function EditorCaptadasPage() {
  await requireRole(["admin", "editor"]);
  const supabaseAdmin = createAdminClient();

  const { data: captadas } = await supabaseAdmin
    .from("materias")
    .select(
      `
      *,
      categoria:categorias(id, nome, slug, cor),
      cidade:cidades(id, nome, slug, uf)
    `
    )
    .eq("origem", "captacao")
    .order("publicado_em", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Rss className="w-6 h-6 text-primary" />
          Fila de Notícias Captadas (RSS)
        </h1>
        <p className="text-sm text-slate-500">
          Notícias importadas automaticamente dos feeds dos principais veículos jornalísticos.
        </p>
      </div>

      {!captadas || captadas.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-400">Nenhuma matéria captada via RSS no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(captadas as unknown as MateriaData[]).map((mat) => (
            <CardMateria key={mat.id} materia={mat} variacao="medio" />
          ))}
        </div>
      )}
    </div>
  );
}
