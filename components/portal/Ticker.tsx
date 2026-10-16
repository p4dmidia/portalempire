"use client";

import Link from "next/link";
import { Rss } from "lucide-react";
import type { MateriaData } from "@/lib/portal/queries";

interface TickerProps {
  materias: MateriaData[];
}

export function Ticker({ materias }: TickerProps) {
  if (!materias || materias.length === 0) return null;

  // Garante quantidade suficiente para preencher telas ultra-largas e manter o loop infinito fluido
  const baseMaterias =
    materias.length < 6
      ? Array.from({ length: Math.ceil(6 / materias.length) }, () => materias).flat()
      : materias;

  return (
    <div className="bg-[#0e131f] text-white text-[13px] border-t-2 border-[#c8102e] border-b border-white/5 py-1.5 px-4 overflow-hidden select-none">
      <div className="max-w-[1300px] mx-auto flex items-center gap-4">
        {/* Tag Urgente */}
        <div className="flex items-center gap-1.5 bg-black/40 text-white border border-white/10 font-black uppercase px-2.5 py-0.5 rounded text-[11px] shrink-0 tracking-wider z-10 shadow-sm">
          <span>URGENTE</span>
        </div>

        {/* Container do Ticker com movimento contínuo lateral e pausa ao passar o mouse */}
        <div className="flex-1 overflow-hidden relative group/ticker py-0.5">
          <div className="animate-ticker flex w-max items-center">
            {/* Bloco Primário */}
            <div className="flex items-center gap-6 shrink-0 pr-6">
              {baseMaterias.map((mat, i) => (
                <Link
                  key={`track1-${mat.id}-${i}`}
                  href={`/materia/${mat.slug}`}
                  className="inline-flex items-center gap-6 text-white/90 hover:text-white transition-colors py-0.5"
                >
                  <span className="font-medium hover:underline text-[13px] leading-none">
                    {mat.titulo}
                  </span>
                  <span className="text-white/40 select-none">•</span>
                </Link>
              ))}
            </div>

            {/* Bloco Secundário Espelhado (garante transição suave e contínua sem saltos) */}
            <div className="flex items-center gap-6 shrink-0 pr-6" aria-hidden="true">
              {baseMaterias.map((mat, i) => (
                <Link
                  key={`track2-${mat.id}-${i}`}
                  href={`/materia/${mat.slug}`}
                  tabIndex={-1}
                  className="inline-flex items-center gap-6 text-white/90 hover:text-white transition-colors py-0.5"
                >
                  <span className="font-medium hover:underline text-[13px] leading-none">
                    {mat.titulo}
                  </span>
                  <span className="text-white/40 select-none">•</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Ícone RSS / Feed à direita */}
        <Link
          href="/rss.xml"
          title="Feed RSS"
          className="hidden sm:inline-flex text-white/60 hover:text-white transition-colors shrink-0 z-10"
        >
          <Rss className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

