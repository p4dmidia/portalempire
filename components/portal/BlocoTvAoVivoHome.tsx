"use client";

import { useState } from "react";
import { Tv, Sparkles, RefreshCw, Info } from "lucide-react";

export function BlocoTvAoVivoHome() {
  const [reloadKey, setReloadKey] = useState(0);
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = () => {
    setIsReloading(true);
    setReloadKey((prev) => prev + 1);
    setTimeout(() => setIsReloading(false), 1000);
  };

  return (
    <section className="my-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      {/* Detalhes suaves de iluminação */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c8102e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho do Bloco TV Ao Vivo */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute" />
              <span className="ml-1.5">No Ar · Ao Vivo</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Tv className="w-7 h-7 text-[#c8102e]" />
            <span>TV Empire — Programação ao Vivo</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Acompanhe nossa programação exclusiva em tempo real: jornalismo regional, coberturas especiais, política, economia e entrevistas com grandes personalidades.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReload}
            disabled={isReloading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            title="Recarregar sinal da transmissão caso congele"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin text-[#c8102e]" : ""}`} />
            <span>{isReloading ? "Recarregando..." : "Recarregar Sinal"}</span>
          </button>

          <div className="text-right hidden md:block pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 block">
              Sinal Ao Vivo
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Streaming Conectado
            </span>
          </div>
        </div>
      </div>

      {/* Aviso amigável sobre interação para tocar com áudio (política do navegador) */}
      <div className="relative z-10 max-w-5xl mx-auto mb-3">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="leading-snug">
            <strong>Dica de reprodução:</strong> Se o vídeo não iniciar automaticamente, dê <strong>1 clique sobre a tela do player</strong> para liberar a transmissão e o áudio.
          </span>
        </div>
      </div>

      {/* Player de TV com o iframe em proporção 16:9 responsivo */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="relative overflow-hidden w-full pt-[56.25%] rounded-2xl bg-black shadow-lg border border-slate-300 dark:border-slate-700 group">
          <iframe
            key={reloadKey}
            width="560"
            height="300"
            referrerPolicy="origin"
            src="https://webtv.bitstreaming.info:2000/VideoPlayer/empiremagazine?autoplay=1"
            className="absolute top-0 left-0 bottom-0 right-0 w-full h-full border-0"
            scrolling="no"
            allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *"
            allowFullScreen
          />
        </div>

        {/* Rodapé informativo do player */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium">Transmissão oficial Empire Magazine & Empire Cidades</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Dica: clique no botão de tela cheia no canto inferior direito do player para expandir
          </span>
        </div>
      </div>
    </section>
  );
}
