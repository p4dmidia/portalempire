import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoriaBySlug, getMaterias, getPortalData } from "@/lib/portal/queries";
import { CardMateria } from "@/components/portal/CardMateria";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { AdSlot } from "@/components/portal/AdSlot";

export const revalidate = 60;

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [categoria, portal] = await Promise.all([
    getCategoriaBySlug(slug),
    getPortalData(),
  ]);

  if (!categoria) return { title: "Editoria Não Encontrada" };

  return {
    title: `${categoria.nome} — Notícias e Artigos | ${portal?.nome || "Portal Empire"}`,
    description: `Acompanhe as últimas notícias e reportagens de ${categoria.nome} no ${portal?.nome || "Portal Empire"}.`,
  };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params;
  const categoria = await getCategoriaBySlug(slug);

  if (!categoria) {
    notFound();
  }

  const [materias, maisLidas] = await Promise.all([
    getMaterias({ categoriaSlug: slug, limit: 12 }),
    getMaterias({ categoriaSlug: slug, ordenarPor: "visualizacoes", limit: 5 }),
  ]);

  const corBorda = categoria.cor || "#2563eb";

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Categoria */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 rounded-full" style={{ backgroundColor: corBorda }} />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Editoria
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {categoria.nome}
            </h1>
          </div>
        </div>

        {/* Subcategorias se houver */}
        {categoria.subcategorias && categoria.subcategorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Subeditorias:</span>
            {categoria.subcategorias.map((sub) => (
              <Link
                key={sub.id}
                href={`/categoria/${sub.slug}`}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                {sub.nome}
              </Link>
            ))}
          </div>
        )}
      </div>

      <AdSlot posicao="topo" />

      {/* Grid Principal + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lista de Matérias */}
        <div className="lg:col-span-8 space-y-6">
          {materias.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">Nenhuma matéria encontrada nesta editoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {materias.map((mat) => (
                <CardMateria key={mat.id} materia={mat} variacao="medio" />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <SidebarMaisLidas materias={maisLidas} />
          <AdSlot posicao="lateral" />
        </div>
      </div>
    </div>
  );
}
