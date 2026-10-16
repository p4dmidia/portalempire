import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getColunasAtivas, getCidades, getPortalData } from "@/lib/portal/queries";
import { User, MapPin, Sparkles, ChevronRight } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPortalData();
  return {
    title: `Colunistas e Colunas Municipais — ${portal?.nome || "Portal Empire"}`,
    description: "Opinião, análises, artigos de especialistas e bastidores das cidades.",
  };
}

export default async function ColunasIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const { cidade } = await searchParams;
  const [colunas, cidades] = await Promise.all([
    getColunasAtivas(cidade),
    getCidades(),
  ]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Opinião & Cobertura Especial</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Nossas Colunas & Colunistas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Artigos exclusivos, visão crítica e análise dos principais acontecimentos das cidades.
        </p>

        {/* Filtro por Cidade */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400">Filtrar por cidade:</span>
          <Link
            href="/colunas"
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              !cidade
                ? "bg-primary text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Todas
          </Link>
          {cidades.map((cid) => (
            <Link
              key={cid.id}
              href={`/colunas?cidade=${cid.slug}`}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                cidade === cid.slug
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cid.nome}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid de Colunas */}
      {colunas.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-400">Nenhuma coluna ativa encontrada para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colunas.map((col) => {
            const autor = col.dono;
            return (
              <Link
                key={col.id}
                href={`/coluna/${col.slug}`}
                className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-400/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/80 bg-slate-100 shrink-0">
                      {autor?.foto_url ? (
                        <Image
                          src={autor.foto_url}
                          alt={autor.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400 m-auto mt-3" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                        {col.nome}
                      </h2>
                      <span className="text-xs text-slate-500">
                        Por <strong>{autor?.nome || "Colunista"}</strong>
                      </span>
                    </div>
                  </div>

                  {col.cidade && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full font-semibold mb-3">
                      <MapPin className="w-3 h-3" /> {col.cidade.nome} - {col.cidade.uf}
                    </span>
                  )}

                  {col.descricao && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {col.descricao}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-500">
                  <span>Ler artigos da coluna</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
