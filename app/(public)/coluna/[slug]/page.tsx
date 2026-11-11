import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getColunaBySlug, getMaterias, getPortalData } from "@/lib/portal/queries";
import { CardMateria } from "@/components/portal/CardMateria";
import { AdSlot } from "@/components/portal/AdSlot";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { BotaoFavoritarColuna } from "@/components/portal/BotaoFavoritarColuna";
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Banner de Capa */}
        {coluna.capa_url && (
          <div className="relative h-48 md:h-64 w-full bg-slate-900 overflow-hidden">
            <Image
              src={coluna.capa_url}
              alt={coluna.nome}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
        )}

        <div className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-xl ${coluna.capa_url ? "-mt-16 md:-mt-20 z-10" : ""}`}>
              {autor?.foto_url ? (
                <Image
                  src={autor.foto_url}
                  alt={autor.nome || coluna.nome}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-3xl">
                  {(autor?.nome || coluna.nome).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase flex items-center gap-1 border border-amber-300/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Coluna Oficial
                </span>
                {coluna.cidade && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {coluna.cidade.nome} - {coluna.cidade.uf}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {coluna.nome}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-sm font-semibold text-slate-500">
                  Por <strong className="text-slate-800 dark:text-slate-200">{autor?.nome || "Colunista Licenciado"}</strong>
                </p>

                <BotaoFavoritarColuna
                  colunaId={coluna.id}
                  colunaNome={coluna.nome}
                  colunaSlug={coluna.slug}
                  autorNome={autor?.nome}
                  autorFoto={autor?.foto_url}
                  cidadeNome={coluna.cidade ? `${coluna.cidade.nome} - ${coluna.cidade.uf}` : undefined}
                  capaUrl={coluna.capa_url}
                  variacao="hero"
                />
              </div>

              {coluna.descricao && (
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed pt-1">
                  {coluna.descricao}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Espaço de Anúncio da Coluna (Topo) */}
      <AdSlot posicao="topo" colunaId={coluna.id} tipoPagina="coluna" />

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
          <AdSlot posicao="lateral" colunaId={coluna.id} tipoPagina="coluna" />
        </div>
      </div>

      {/* Espaço de Anúncio da Coluna (Rodapé) */}
      <AdSlot posicao="rodape" colunaId={coluna.id} tipoPagina="coluna" />
    </div>
  );
}
