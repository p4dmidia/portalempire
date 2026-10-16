"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { MateriaData } from "@/lib/portal/queries";

interface TopHeroMagazineProps {
  destaques: MateriaData[];
  manchetes: MateriaData[];
  recentes: MateriaData[];
}

export function TopHeroMagazine({
  destaques,
  manchetes,
  recentes,
}: TopHeroMagazineProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Lista de matérias para o carrossel do Hero principal (até 4 slides)
  const slidesHero = destaques.slice(0, 4);

  // Auto-play do carrossel a cada 6 segundos
  useEffect(() => {
    if (slidesHero.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slidesHero.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slidesHero.length]);

  const slideAtual = slidesHero[activeSlide] || destaques[0];

  // Matérias abaixo do hero (2 sub-cards lado a lado)
  const subHeroCards = destaques.slice(4, 6).length >= 2
    ? destaques.slice(4, 6)
    : manchetes.slice(0, 2);

  // Manchetes do meio (coluna 2 - 5 matérias)
  const manchetesMeio = manchetes.slice(2, 7);

  // Mais recentes (coluna 3 - 5 matérias)
  const maisRecentes = recentes.slice(0, 5);

  const formatarData = (dataStr?: string | null) => {
    if (!dataStr) return "Hoje";
    try {
      return format(new Date(dataStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Hoje";
    }
  };

  const extrairAutor = (mat: MateriaData) => {
    if (mat.autor?.nome) return mat.autor.nome;
    if (mat.fonte_nome) return mat.fonte_nome;
    return "Marcelo Henrique de Carvalho";
  };

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            COLUNA 1: HERO PRINCIPAL COM SLIDES + 2 SUB-CARDS ABAIXO
           ======================================================== */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4 min-w-0">
          {/* Card Hero Grande */}
          {slideAtual && (
            <div className="relative rounded-xl overflow-hidden shadow-md group aspect-[16/10] bg-slate-900">
              <Link href={`/materia/${slideAtual.slug}`} className="block w-full h-full relative">
                <Image
                  src={
                    slideAtual.imagem_url ||
                    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200"
                  }
                  alt={slideAtual.titulo}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />

                {/* Gradiente estilo cinema da referência */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

                {/* Conteúdo sobre a foto */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end text-white">
                  {slideAtual.categoria && (
                    <span className="inline-block bg-[#c8102e] text-white text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded w-max mb-2.5 shadow-sm">
                      {slideAtual.categoria.nome}
                    </span>
                  )}

                  <h2 className="text-lg sm:text-2xl font-extrabold leading-snug line-clamp-3 text-white group-hover:text-amber-200 transition-colors drop-shadow-md">
                    {slideAtual.titulo}
                  </h2>

                  <span className="text-[12px] text-white/80 font-medium mt-2">
                    Por {extrairAutor(slideAtual)}
                  </span>
                </div>
              </Link>

              {/* Indicadores / Dots do carrossel estilo referência */}
              {slidesHero.length > 1 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-20">
                  {slidesHero.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeSlide === i
                          ? "w-7 bg-white shadow"
                          : "w-3 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2 Sub-cards Lado a Lado Abaixo do Hero */}
          {subHeroCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subHeroCards.map((mat) => (
                <Link
                  key={mat.id}
                  href={`/materia/${mat.slug}`}
                  className="group block bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={
                        mat.imagem_url ||
                        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600"
                      }
                      alt={mat.titulo}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    {mat.categoria && (
                      <span className="inline-block bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded mb-1.5">
                        {mat.categoria.nome}
                      </span>
                    )}
                    <h3 className="font-bold text-[13.5px] leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-[#c8102e] transition-colors">
                      {mat.titulo}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            COLUNA 2: MANCHETES DO MEIO (LISTA COM THUMB 112px)
           ======================================================== */}
        <div className="lg:col-span-3 xl:col-span-4 divide-y divide-slate-100 dark:divide-slate-800 min-w-0">
          {manchetesMeio.map((mat, idx) => (
            <Link
              key={mat.id}
              href={`/materia/${mat.slug}`}
              className={`group flex items-start gap-3 py-3.5 first:pt-0 hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors rounded-lg px-1`}
            >
              {/* Thumbnail 112px */}
              <div className="relative w-24 h-16 sm:w-28 sm:h-20 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                <Image
                  src={
                    mat.imagem_url ||
                    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=300"
                  }
                  alt={mat.titulo}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="120px"
                />
              </div>

              {/* Informações da matéria */}
              <div className="flex-1 min-w-0">
                {mat.categoria && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c8102e] block leading-none mb-1">
                    {mat.categoria.nome}
                  </span>
                )}
                <h3 className="font-bold text-[13.5px] leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-[#c8102e] transition-colors">
                  {mat.titulo}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1.5 truncate">
                  <b className="text-slate-700 dark:text-slate-300 font-semibold">
                    Por {extrairAutor(mat)}
                  </b>{" "}
                  · {formatarData(mat.publicado_em)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ========================================================
            COLUNA 3: AS MAIS RECENTES (CARD BRANCO COM BORDA)
           ======================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 min-w-0">
          <aside className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b-2 border-[#c8102e] pb-2 mb-3">
              <h2 className="text-[15px] font-black uppercase tracking-wide text-slate-900 dark:text-white">
                As Mais Recentes
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {maisRecentes.map((mat) => (
                <Link
                  key={mat.id}
                  href={`/materia/${mat.slug}`}
                  className="group flex items-start gap-3 py-3 first:pt-1 last:pb-1 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors rounded-lg px-1"
                >
                  {/* Thumbnail 76px */}
                  <div className="relative w-20 h-14 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                    <Image
                      src={
                        mat.imagem_url ||
                        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=240"
                      }
                      alt={mat.titulo}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {mat.categoria && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c8102e] block leading-none mb-1">
                        {mat.categoria.nome}
                      </span>
                    )}
                    <h3 className="font-bold text-[13px] leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-[#c8102e] transition-colors">
                      {mat.titulo}
                    </h3>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block mt-1 truncate">
                      <b className="text-slate-700 dark:text-slate-300 font-semibold">
                        Por {extrairAutor(mat)}
                      </b>{" "}
                      · {formatarData(mat.publicado_em)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
