import Link from "next/link";
import type { MateriaData } from "@/lib/portal/queries";
import { TrendingUp } from "lucide-react";
import { LabelEditoria } from "./LabelEditoria";

interface SidebarMaisLidasProps {
  materias: MateriaData[];
}

export function SidebarMaisLidas({ materias }: SidebarMaisLidasProps) {
  if (!materias || materias.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-1.5 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-lg">
          <TrendingUp className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Mais Lidas da Semana
        </h3>
      </div>

      <div className="space-y-4">
        {materias.slice(0, 5).map((mat, idx) => (
          <div key={mat.id} className="flex items-start gap-3.5 group">
            <span className="text-2xl font-black text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors leading-none shrink-0 w-6">
              0{idx + 1}
            </span>

            <div className="space-y-1 min-w-0">
              {mat.categoria && (
                <LabelEditoria
                  nome={mat.categoria.nome}
                  slug={mat.categoria.slug}
                  cor={mat.categoria.cor}
                />
              )}
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                <Link href={`/materia/${mat.slug}`}>{mat.titulo}</Link>
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
