import type { Metadata } from "next";
import { getMaterias, getPortalData } from "@/lib/portal/queries";
import { CardMateria } from "@/components/portal/CardMateria";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { Search } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const portal = await getPortalData();
  return {
    title: q ? `Resultados para "${q}" | ${portal?.nome || "Portal Empire"}` : "Buscar Notícias",
    description: "Pesquise matérias, reportagens e artigos no acervo do Portal Empire.",
  };
}

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const queryLimpa = q?.trim() || "";

  const [materias, maisLidas] = await Promise.all([
    queryLimpa ? getMaterias({ search: queryLimpa, limit: 20 }) : [],
    getMaterias({ ordenarPor: "visualizacoes", limit: 5 }),
  ]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Busca */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          <Search className="w-4 h-4 text-primary" />
          <span>Busca de Notícias</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {queryLimpa ? `Resultados para: "${queryLimpa}"` : "Pesquisar no Portal"}
        </h1>

        <form method="GET" action="/busca" className="mt-4 max-w-xl flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={queryLimpa}
            placeholder="Digite palavras-chave, temas, cidades ou nomes..."
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {!queryLimpa ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">Digite um termo na caixa de busca acima para pesquisar.</p>
            </div>
          ) : materias.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">
                Nenhuma notícia encontrada para &quot;<strong>{queryLimpa}</strong>&quot;.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Tente usar termos mais genéricos ou verificar a ortografia.
              </p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 pb-2">
                Encontradas <strong>{materias.length}</strong> matérias relacionadas:
              </p>
              {materias.map((mat) => (
                <CardMateria key={mat.id} materia={mat} variacao="horizontal" />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SidebarMaisLidas materias={maisLidas} />
        </div>
      </div>
    </div>
  );
}
