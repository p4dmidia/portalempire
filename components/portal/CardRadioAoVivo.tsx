"use client";

import { Radio, Volume2, ExternalLink, Headphones } from "lucide-react";

export function CardRadioAoVivo() {
  return (
    <section className="my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      {/* Detalhes suaves de iluminação */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-950/40 dark:to-amber-950/30 border border-red-200/80 dark:border-red-900/50 flex items-center justify-center shrink-0 shadow-xs group">
            <Radio className="w-7 h-7 sm:w-8 sm:h-8 text-[#c8102e] animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-red-500 absolute" />
                <span className="ml-1.5">No Ar · Rádio Ao Vivo</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Headphones className="w-3 h-3 text-amber-500" />
                <span>Transmissão 24h</span>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Rádio Empire — Sintonize Ao Vivo
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Ouça os maiores sucessos musicais, jornalismo de credibilidade, entrevistas e a melhor programação de áudio da região.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
          <a
            href="https://www.empireflixvip.com/radio"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#c8102e] hover:bg-[#a00d24] text-white font-extrabold text-sm tracking-wide shadow-xs hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <Volume2 className="w-4 h-4 text-white" />
            <span>Ouvir Rádio Ao Vivo</span>
            <ExternalLink className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
