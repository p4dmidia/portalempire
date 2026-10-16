import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCategorias, getCidades } from "@/lib/portal/queries";
import { MateriaForm } from "@/components/painel/materia-form";
import type { ColunaData } from "@/lib/portal/queries";

export default async function ColunistaNovoArtigoPage() {
  const profile = await requireRole(["colunista", "admin"]);
  const supabase = await createClient();

  const [categorias, cidades, { data: colunas }] = await Promise.all([
    getCategorias(),
    getCidades(),
    supabase
      .from("colunas")
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf)
      `)
      .eq("dono_id", profile.id)
      .eq("status", "ativa")
      .order("nome", { ascending: true }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Escrever Artigo de Coluna
        </h1>
        <p className="text-sm text-slate-500">
          Redija sua análise, crônica ou opinião e vincule a uma de suas colunas ativas.
        </p>
      </div>

      <MateriaForm
        categorias={categorias}
        cidades={cidades}
        colunas={(colunas || []) as unknown as ColunaData[]}
        userId={profile.id}
        userRole={profile.role}
      />
    </div>
  );
}
