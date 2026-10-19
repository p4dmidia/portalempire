"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CategoriaData, MateriaData } from "@/lib/portal/queries";
import { otimizarUrlImagem } from "@/lib/portal/image-utils";

interface BlocoEditoriaProps {
  categoria: CategoriaData;
  materias: MateriaData[];
}

export function BlocoEditoria({ categoria, materias }: BlocoEditoriaProps) {
  if (!materias || materias.length === 0) return null;

  const corAcento = categoria.cor || "#c8102e";

  const formatarData = (dataStr?: string | null) => {
    if (!dataStr) return "Hoje";
    try {
      return format(new Date(dataStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Hoje";
    }
  };

  return (
    <section className="my-10">
      {/* Cabeçalho do Bloco (Borda esquerda colorida + Botão VER TUDO →) */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-2.5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6" style={{ backgroundColor: corAcento }} />
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {categoria.nome}
          </h2>
        </div>

        <Link
          href={`/categoria/${categoria.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-[#c8102e] hover:text-white hover:border-[#c8102e] transition-all group"
        >
          <span>Ver tudo</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Grade Magazine de 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {materias.slice(0, 4).map((mat) => (
          <Link
            key={mat.id}
            href={`/materia/${mat.slug}`}
            className="group block bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            {/* Imagem do Card */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={otimizarUrlImagem(mat.imagem_url)}
                alt={mat.titulo}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>

            {/* Conteúdo */}
            <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
              <div>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider block mb-1"
                  style={{ color: corAcento }}
                >
                  {categoria.nome}
                </span>
                <h3 className="font-bold text-[13.5px] leading-snug line-clamp-3 text-slate-900 dark:text-white group-hover:text-[#c8102e] transition-colors">
                  {mat.titulo}
                </h3>
              </div>

              <span className="text-[11px] text-slate-400 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                {formatarData(mat.publicado_em)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
