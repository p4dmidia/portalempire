import type { Metadata } from "next";
import Link from "next/link";
import { getCidades, getPortalData } from "@/lib/portal/queries";
import { MapPin, ChevronRight } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPortalData();
  return {
    title: `Cidades e Regiões Cobertas — ${portal?.nome || "Portal Empire"}`,
    description: "Cobertura jornalística regionalizada nas principais cidades do estado.",
  };
}

export default async function CidadesIndexPage() {
  const [cidades, portal] = await Promise.all([
    getCidades(),
    getPortalData(),
  ]);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Cobertura Municipal</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Cidades Cobertas pelo {portal?.nome || "Portal Empire"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Selecione seu município para ler notícias locais, obras, trânsito, política e artigos de colunistas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cidades.map((cid) => (
          <Link
            key={cid.id}
            href={`/cidade/${cid.slug}`}
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Estado {cid.uf}
                </span>
                {cid.destaque_menu && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Destaque
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors mt-2">
                {cid.nome}
              </h2>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-primary font-semibold">
              <span>Acessar cobertura</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
