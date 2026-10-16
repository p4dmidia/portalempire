import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCidades, getMaterias, getColunasAtivas, getPortalData } from "@/lib/portal/queries";
import { CardMateria } from "@/components/portal/CardMateria";
import { ColunistasCarrossel } from "@/components/portal/ColunistasCarrossel";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { AdSlot } from "@/components/portal/AdSlot";
import { MapPin } from "lucide-react";

export const revalidate = 60;

interface CidadePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CidadePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [cidades, portal] = await Promise.all([
    getCidades(),
    getPortalData(),
  ]);

  const cidade = cidades.find((c) => c.slug === slug);
  if (!cidade) return { title: "Cidade Não Encontrada" };

  return {
    title: `Notícias de ${cidade.nome} - ${cidade.uf} | ${portal?.nome || "Portal Empire"}`,
    description: `Últimas notícias, política, colunistas, trânsito e cobertura completa em ${cidade.nome} e região.`,
  };
}

export default async function CidadeDetalhePage({ params }: CidadePageProps) {
  const { slug } = await params;
  const cidades = await getCidades();
  const cidade = cidades.find((c) => c.slug === slug);

  if (!cidade) {
    notFound();
  }

  const [materias, colunas, maisLidas] = await Promise.all([
    getMaterias({ cidadeSlug: slug, limit: 12 }),
    getColunasAtivas(slug),
    getMaterias({ cidadeSlug: slug, ordenarPor: "visualizacoes", limit: 5 }),
  ]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Cidade */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Cobertura Local</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {cidade.nome} - {cidade.uf}
          </h1>
        </div>

        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full self-start sm:self-auto">
          {materias.length} notícias registradas
        </span>
      </div>

      <AdSlot posicao="topo" />

      {/* Colunas da Cidade se houver */}
      {colunas.length > 0 && <ColunistasCarrossel colunas={colunas} />}

      {/* Grid de Matérias da Cidade + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Notícias em {cidade.nome}
            </h2>
          </div>

          {materias.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">
                Ainda não há matérias específicas publicadas para {cidade.nome}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {materias.map((mat) => (
                <CardMateria key={mat.id} materia={mat} variacao="medio" />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SidebarMaisLidas materias={maisLidas} />
          <AdSlot posicao="lateral" />
        </div>
      </div>
    </div>
  );
}
