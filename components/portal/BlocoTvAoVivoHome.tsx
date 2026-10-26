import { Tv, Radio, Sparkles } from "lucide-react";

export function BlocoTvAoVivoHome() {
  return (
    <section className="my-10 bg-gradient-to-b from-[#0b0f19] to-[#111625] text-white rounded-3xl p-5 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Detalhes de iluminação de fundo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c8102e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho do Bloco TV Ao Vivo */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute" />
              <span className="ml-1.5">No Ar · Ao Vivo</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Transmissão Digital HD 24h</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Tv className="w-7 h-7 text-[#c8102e]" />
            <span>TV Empire — Programação ao Vivo</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Acompanhe nossa programação exclusiva em tempo real: jornalismo regional, coberturas especiais, política, economia e entrevistas com grandes personalidades.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Sinal Ao Vivo
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Streaming Conectado
            </span>
          </div>
        </div>
      </div>

      {/* Player de TV com o iframe em proporção 16:9 responsivo */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="relative overflow-hidden w-full pt-[56.25%] rounded-2xl bg-black shadow-2xl border border-white/15 group">
          <iframe
            width="560"
            height="300"
            referrerPolicy="origin"
            src="https://webtv.bitstreaming.info:2000/VideoPlayer/empiremagazine?autoplay=1"
            className="absolute top-0 left-0 bottom-0 right-0 w-full h-full border-0"
            scrolling="no"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Rodapé informativo do player */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Transmissão oficial Empire Magazine & Empire Cidades</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Dica: clique no botão de tela cheia no player para expandir a transmissão
          </span>
        </div>
      </div>
    </section>
  );
}
