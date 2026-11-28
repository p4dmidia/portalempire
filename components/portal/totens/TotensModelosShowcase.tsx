"use client";

import Image from "next/image";
import {
  BatteryCharging,
  Tv,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Cpu,
  Wifi,
  Zap,
  Building2,
} from "lucide-react";
import type { TipoModeloTotem } from "@/lib/totens/types";

interface TotensModelosShowcaseProps {
  modeloAtivo?: TipoModeloTotem | "todos";
  onFiltrarModelo?: (modelo: TipoModeloTotem | "todos") => void;
  whatsappPadrao?: string;
}

export function TotensModelosShowcase({
  modeloAtivo = "todos",
  onFiltrarModelo,
}: TotensModelosShowcaseProps) {
  return (
    <section className="relative bg-slate-50 border-y border-slate-200 py-10 sm:py-14 text-slate-900">
      <div className="max-w-[1440px] mx-auto px-4 space-y-8">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Formatos de Mídia Indoor</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Conheça os Dois Modelos de Totens
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Painéis digitais instalados em pontos nobres de alto fluxo. Veja os formatos disponíveis na rede Empire:
          </p>
        </div>

        {/* Grid dos Dois Modelos - CARDS COM FUNDO BRANCO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
          {/* CARD 1: Totem com Carregador de Celular */}
          <div
            className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 sm:p-7 bg-white shadow-sm hover:shadow-md ${
              modeloAtivo === "totem_carregador"
                ? "border-amber-500 ring-2 ring-amber-400/40"
                : "border-slate-200 hover:border-amber-400"
            }`}
          >
            {/* Tag superior */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
                <span>Estação com Recarga</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Uso Coletivo & Comercial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center flex-1">
              {/* Imagem do Totem */}
              <div className="sm:col-span-5 relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
                <Image
                  src="/images/totem-carregador.jpg"
                  alt="Totem com Carregador de Celular Empire"
                  fill
                  className="object-contain p-2 hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Informações Técnicas */}
              <div className="sm:col-span-7 space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  Totem com Carregador de Celular
                </h3>

                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Estação de recarga com múltiplos cabos para clientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Público para e fixa a atenção enquanto recarrega</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Exibição de vídeos de 15s em rotação contínua</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Excelente retorno para comércio local e serviços</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ação: Filtrar Totens */}
            <div className="pt-5 mt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  onFiltrarModelo?.(
                    modeloAtivo === "totem_carregador" ? "todos" : "totem_carregador"
                  )
                }
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modeloAtivo === "totem_carregador"
                    ? "bg-amber-500 text-slate-950 border border-amber-600 shadow-sm"
                    : "bg-slate-100 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 text-slate-700 border border-slate-200"
                }`}
              >
                <span>
                  {modeloAtivo === "totem_carregador"
                    ? "Exibindo Totens deste Modelo (Ativo)"
                    : "Ver Totens com Este Modelo"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          </div>

          {/* CARD 2: Totem Interativo Maior (Indoor) */}
          <div
            className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 sm:p-7 bg-white shadow-sm hover:shadow-md ${
              modeloAtivo === "totem_interativo_maior"
                ? "border-amber-500 ring-2 ring-amber-400/40"
                : "border-slate-200 hover:border-amber-400"
            }`}
          >
            {/* Tag superior */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Mais Imponente • Tela Ampla</span>
              </span>
              <span className="text-xs text-amber-700 font-bold">Premium Indoor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center flex-1">
              {/* Imagem do Totem */}
              <div className="sm:col-span-5 relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-1 flex items-center justify-center">
                <Image
                  src="/images/totem-interativo-maior.jpg"
                  alt="Totem Interativo Maior Indoor Empire"
                  fill
                  className="object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Informações Técnicas */}
              <div className="sm:col-span-7 space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  Totem Interativo Maior <span className="text-amber-600 text-sm font-semibold">(Indoor)</span>
                </h3>

                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Tela 43&quot; Touch Screen</strong> de alta definição (Full HD)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Sistema Android 11 de alta performance e áudio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Máximo impacto visual em galerias, shoppings e clínicas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Design monólito elegante com acabamento prata/preto</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ação: Filtrar Totens */}
            <div className="pt-5 mt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  onFiltrarModelo?.(
                    modeloAtivo === "totem_interativo_maior" ? "todos" : "totem_interativo_maior"
                  )
                }
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modeloAtivo === "totem_interativo_maior"
                    ? "bg-amber-500 text-slate-950 border border-amber-600 shadow-sm"
                    : "bg-slate-100 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 text-slate-700 border border-slate-200"
                }`}
              >
                <span>
                  {modeloAtivo === "totem_interativo_maior"
                    ? "Exibindo Totens deste Modelo (Ativo)"
                    : "Ver Totens com Este Modelo"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Faixa de Especificações Técnicas - FUNDO BRANCO E DISCRETO */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex flex-col items-center justify-center gap-1 p-2">
              <Tv className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">Tela 43&quot; Touch</span>
              <span className="text-[11px] text-slate-500">Full HD (1920x1080)</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 p-2">
              <Cpu className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">Android 11</span>
              <span className="text-[11px] text-slate-500">Processamento Rápido</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 p-2">
              <Wifi className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">Wi-Fi & Bluetooth</span>
              <span className="text-[11px] text-slate-500">Multimídia Contínua</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 p-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">Energia Bivolt</span>
              <span className="text-[11px] text-slate-500">110V e 220V Automático</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-center text-center text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Ideal para <strong>lojas, clínicas, academias, galerias e shoppings</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
