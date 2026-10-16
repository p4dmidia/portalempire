import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getColunaBySlug, getMaterias, getPortalData } from "@/lib/portal/queries";
import { CardMateria } from "@/components/portal/CardMateria";
import { AdSlot } from "@/components/portal/AdSlot";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { User, MapPin, Sparkles, ArrowLeft } from "lucide-react";

export const revalidate = 60;

interface ColunaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ColunaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [coluna, portal] = await Promise.all([
    getColunaBySlug(slug),
    getPortalData(),
  ]);

  if (!coluna) return { title: "Coluna Não Encontrada" };

  return {
    title: `${coluna.nome} — Coluna de ${coluna.dono?.nome || "Opinião"} | ${portal?.nome || "Portal Empire"}`,
    description:
      coluna.descricao ||
      `Leia os artigos da coluna ${coluna.nome} no ${portal?.nome || "Portal Empire"}.`,
  };
}

export default async function ColunaDetalhePage({ params }: ColunaPageProps) {
  const { slug } = await params;
  const coluna = await getColunaBySlug(slug);

  if (!coluna) {
    notFound();
  }

  const [materias, maisLidas] = await Promise.all([
    getMaterias({ colunaSlug: slug, limit: 12 }),
    getMaterias({ ordenarPor: "visualizacoes", limit: 5 }),
  ]);

  const autor = coluna.dono;

  return (
    <div className="space-y-8">
      {/* Navegação de Retorno */}
      <div>
        <Link
          href="/colunas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Ver todas as colunas
        </Link>
      </div>

      {/* Cartão de Destaque da Coluna & Colunista */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-400/80 bg-slate-100 shrink-0 shadow-md">
            {autor?.foto_url ? (
              <Image
                src={autor.foto_url}
                alt={autor.nome}
                fill
                className="object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-slate-400 m-auto mt-6" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Coluna Oficial
              </span>
              {coluna.cidade && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {coluna.cidade.nome} - {coluna.cidade.uf}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {coluna.nome}
            </h1>

            <p className="text-sm font-semibold text-slate-500">
              Por <Link href={`/autor/${autor?.slug}`} className="text-primary hover:underline">{autor?.nome}</Link>
            </p>

            {coluna.descricao && (
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed pt-1">
                {coluna.descricao}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Espaço de Anúncio da Coluna */}
      <AdSlot posicao="topo" colunaId={coluna.id} />

      {/* Artigos da Coluna + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Artigos Publicados nesta Coluna
            </h2>
          </div>

          {materias.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">Nenhum artigo publicado ainda nesta coluna.</p>
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
          <AdSlot posicao="lateral" colunaId={coluna.id} />
        </div>
      </div>
    </div>
  );
}
