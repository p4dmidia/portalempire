"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { RevistaData } from "@/lib/portal/revistas-types";

interface CarrosselRevistasProps {
  revistas: RevistaData[];
  tituloSecao?: string;
}

export function CarrosselRevistas({
  revistas,
  tituloSecao = "Últimas publicações",
}: CarrosselRevistasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  if (!revistas || revistas.length === 0) return null;

  return (
    <section className="relative w-full bg-white dark:bg-slate-900 py-8 sm:py-12 px-4 sm:px-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden my-6">
      <div className="relative max-w-[1440px] mx-auto space-y-6">
        {/* Topo do Carrossel */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tituloSecao}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Revistas anteriores"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Próximas revistas"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Trilho de Cards de Revistas com Scroll Horizontal */}
        <div
          ref={scrollRef}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-2 -mx-2 px-2"
        >
          {revistas.map((rev) => {
            const dataFormatada = rev.data_publicacao
              ? new Date(rev.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")
              : "";

            return (
              <a
                key={rev.id}
                href={rev.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col shrink-0 w-[240px] sm:w-[270px] md:w-[290px] p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#c8102e]/40 transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
              >
                {/* Capa da Revista (Aspecto 3:4) */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md">
                  <Image
                    src={rev.capa_url}
                    alt={rev.titulo}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 240px, (max-width: 768px) 270px, 290px"
                    unoptimized
                  />

                  {/* Gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Ícone de abrir revista no hover */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>

                {/* Informações Abaixo da Capa */}
                <div className="pt-3.5 space-y-1.5 text-left">
                  {/* Linha 1: Data de publicação + Badge Verde GRATUITA */}
                  <div className="flex items-center gap-2">
                    {dataFormatada && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                        {dataFormatada}
                      </span>
                    )}
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                      {rev.tipo_acesso || "GRATUITA"}
                    </span>
                  </div>

                  {/* Linha 2: Título da Revista */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#c8102e] transition-colors">
                    {rev.titulo}
                  </h3>

                  {/* Linha 3: Subtítulo / Nome da Edição / Cidade */}
                  {rev.subtitulo && (
                    <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 line-clamp-1">
                      {rev.subtitulo}
                    </div>
                  )}

                  {/* Linha 4: Categoria em Destaque */}
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#c8102e]">
                    {rev.categoria || "DIVERSOS"}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
