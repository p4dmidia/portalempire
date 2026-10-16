import Link from "next/link";
import Image from "next/image";
import type { ColunaData } from "@/lib/portal/queries";
import { User, MapPin, ChevronRight, Sparkles } from "lucide-react";

interface ColunistasCarrosselProps {
  colunas: ColunaData[];
}

export function ColunistasCarrossel({ colunas }: ColunistasCarrosselProps) {
  if (!colunas || colunas.length === 0) return null;

  return (
    <section className="my-12 bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Vozes Regionais
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            Nossos Colunistas
          </h2>
        </div>

        <Link
          href="/colunas"
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 group uppercase tracking-wider"
        >
          <span>Ver todos</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {colunas.slice(0, 4).map((col) => {
          const autor = col.dono;
          return (
            <Link
              key={col.id}
              href={`/coluna/${col.slug}`}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:scale-[1.02] group"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/80 mb-3 bg-slate-700">
                {autor?.foto_url ? (
                  <Image
                    src={autor.foto_url}
                    alt={autor.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-400 m-auto mt-4" />
                )}
              </div>

              <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                {col.nome}
              </h3>

              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Por {autor?.nome || "Colunista"}
              </p>

              {col.cidade && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 mt-2 bg-amber-400/10 px-2.5 py-0.5 rounded-full font-medium">
                  <MapPin className="w-3 h-3" /> {col.cidade.nome} - {col.cidade.uf}
                </span>
              )}

              {col.descricao && (
                <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {col.descricao}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
