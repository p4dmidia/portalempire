"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { MateriaData } from "@/lib/portal/queries";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { otimizarUrlImagem } from "@/lib/portal/image-utils";

interface FaixaUltimasNoticiasProps {
  materias: MateriaData[];
  titulo?: string;
}

export function FaixaUltimasNoticias({
  materias,
  titulo = "Últimas de Empire Cidades",
}: FaixaUltimasNoticiasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!materias || materias.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

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
      {/* Cabeçalho da Faixa */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-2.5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#c8102e]" />
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {titulo}
          </h2>
        </div>

        {/* Setas de navegação ‹ e › */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-[#c8102e] hover:text-white hover:border-[#c8102e] transition-colors shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Próximo"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-[#c8102e] hover:text-white hover:border-[#c8102e] transition-colors shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trilho de Cards Horizontais com Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 -mx-1 px-1"
      >
        {materias.map((mat) => (
          <Link
            key={mat.id}
            href={`/materia/${mat.slug}`}
            className="group flex-none w-[250px] sm:w-[270px] bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            {/* Imagem Superior */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={otimizarUrlImagem(mat.imagem_url)}
                alt={mat.titulo}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="270px"
              />
            </div>

            {/* Corpo do Card */}
            <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
              <div>
                {mat.categoria && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c8102e] block mb-1">
                    {mat.categoria.nome}
                  </span>
                )}
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
