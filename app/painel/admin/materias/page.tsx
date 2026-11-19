import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCategorias, getCidades } from "@/lib/portal/queries";
import { MateriasDataTable } from "@/components/painel/materias-datatable";
import type { MateriaData } from "@/lib/portal/queries";

export default async function AdminMateriasPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();

  const [categorias, cidades, { data: materias, count }] = await Promise.all([
    getCategorias(),
    getCidades(),
    supabase
      .from("materias")
      .select(
        `
        id,
        titulo,
        slug,
        subtitulo,
        resumo,
        imagem_url,
        categoria_id,
        cidade_id,
        coluna_id,
        autor_id,
        status,
        origem,
        urgente,
        destaque,
        visualizacoes,
        publicado_em,
        created_at,
        updated_at,
        categoria:categorias(id, nome, slug, cor),
        cidade:cidades(id, nome, slug, uf),
        autor:profiles(id, nome, slug, foto_url)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(0, 24),
  ]);

  return (
    <MateriasDataTable
      initialMaterias={(materias || []) as unknown as MateriaData[]}
      initialTotal={count || 0}
      categorias={categorias}
      cidades={cidades}
      userRole={profile.role}
    />
  );
}
