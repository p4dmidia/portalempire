import Link from "next/link";
import { Tv, ArrowRight, MapPin, Sparkles } from "lucide-react";

export function TotensFaixaHome() {
  return (
    <section className="my-6 rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 text-white shadow-xl p-6 sm:p-8 relative">
      {/* Detalhes luminosos sutis */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>Mídia Digital Out of Home — Totens Empire</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Divulgue sua marca nos pontos mais estratégicos da sua cidade
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Painéis e totens digitais de alta visibilidade em shoppings, galerias, clínicas e academias.
            Vídeos em 4K de 15 segundos para conectar sua empresa a milhares de consumidores todos os dias.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inserções em 4K</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Localização Geográfica Estratégica</span>
            </span>
            <span>•</span>
            <span className="text-slate-300">Atendimento Direto com o Franqueado</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/totens"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 text-center cursor-pointer"
          >
            <span>Ver Totens Disponíveis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
