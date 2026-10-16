import type { FonteRssData } from "@/lib/portal/queries";
import { Rss } from "lucide-react";

interface FaixaFontesProps {
  fontes: FonteRssData[];
}

export function FaixaFontes({ fontes }: FaixaFontesProps) {
  if (!fontes || fontes.length === 0) return null;

  // Extrai nomes únicos dos veículos
  const veiculos = Array.from(new Set(fontes.map((f) => f.veiculo)));

  return (
    <div className="my-10 border-y border-slate-200 dark:border-slate-800 py-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
          <Rss className="w-3.5 h-3.5 text-primary" />
          <span>Nossas Fontes e Cobertura em Tempo Real</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {veiculos.map((v) => (
            <span
              key={v}
              className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
