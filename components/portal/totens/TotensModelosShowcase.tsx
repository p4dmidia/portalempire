"use client";

import Image from "next/image";
import {
  BatteryCharging,
  Tv,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Cpu,
  Wifi,
  Zap,
  Building2,
} from "lucide-react";
import {
  MODELOS_TOTENS_EMPIRE,
  type TipoModeloTotem,
} from "@/lib/totens/types";

interface TotensModelosShowcaseProps {
  modeloAtivo?: TipoModeloTotem | "todos";
  onFiltrarModelo?: (modelo: TipoModeloTotem | "todos") => void;
  whatsappPadrao?: string;
}

export function TotensModelosShowcase({
  modeloAtivo = "todos",
  onFiltrarModelo,
  whatsappPadrao = "34988676886",
}: TotensModelosShowcaseProps) {
  const getWhatsAppUrl = (nomeModelo: string, preco: string) => {
    const rawNumber = whatsappPadrao.replace(/\D/g, "");
    const numeroFinal =
      rawNumber.length === 10 || rawNumber.length === 11
        ? `55${rawNumber}`
        : rawNumber || "5534988676886";
    const texto = `Olá! Tenho interesse em anunciar no ${nomeModelo} (${preco}/mês) do Grupo Empire Totens. Gostaria de receber mais informações e locais disponíveis!`;
    return `https://wa.me/${numeroFinal}?text=${encodeURIComponent(texto)}`;
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-12 sm:py-16 overflow-hidden border-y border-amber-500/20">
      {/* Luz ambiente de fundo (dourada) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1440px] mx-auto px-4 relative z-10 space-y-10">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Mídia Digital Indoor — Nossos Modelos de Totens</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Sua marca em destaque,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
              onde o seu público está!
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Conheça os dois modelos de totens digitais do <strong>Grupo Empire</strong> instalados
            em pontos nobres das cidades. Escolha a melhor proposta para o seu negócio:
          </p>
        </div>

        {/* Grid dos Dois Modelos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch">
          {/* CARD 1: Totem com Carregador de Celular */}
          <div
            className={`relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden p-6 sm:p-8 backdrop-blur-md ${
              modeloAtivo === "totem_carregador"
                ? "bg-slate-900/90 border-amber-400 ring-2 ring-amber-400 shadow-2xl shadow-amber-500/10"
                : "bg-slate-900/60 border-slate-700/80 hover:border-amber-400/60 hover:shadow-xl"
            }`}
          >
            {/* Tag superior */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wide">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                <span>Maior Permanência</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Uso Coletivo & Comercial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Imagem do Totem */}
              <div className="sm:col-span-5 relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center p-2">
                <Image
                  src="/images/totem-carregador.jpg"
                  alt="Totem com Carregador de Celular Empire"
                  fill
                  className="object-contain p-2 hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Conteúdo & Preço */}
              <div className="sm:col-span-7 space-y-3">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Totem com Carregador de Celular
                </h3>

                {/* Box de Preço */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-400/30">
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-amber-300">
                    Valor de Anúncio
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">R$ 250,00</span>
                    <span className="text-xs text-slate-300 font-semibold">/ mês</span>
                  </div>
                </div>

                {/* Lista de Recursos */}
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Estação de recarga com múltiplos cabos para clientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Público para e fixa a atenção enquanto recarrega</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Exibição de vídeos de 15s em rotação contínua</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Excelente retorno para comércio local e serviços</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ações do Card 1 */}
            <div className="pt-6 mt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onFiltrarModelo?.("totem_carregador")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 hover:border-amber-400/50 cursor-pointer"
              >
                <span>Ver Locais com Este Modelo</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <a
                href={getWhatsAppUrl("Totem com Carregador de Celular", "R$ 250,00")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contratar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* CARD 2: Totem Interativo Maior (Indoor) */}
          <div
            className={`relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden p-6 sm:p-8 backdrop-blur-md ${
              modeloAtivo === "totem_interativo_maior"
                ? "bg-slate-900/90 border-amber-400 ring-2 ring-amber-400 shadow-2xl shadow-amber-500/10"
                : "bg-slate-900/60 border-amber-500/40 hover:border-amber-400 hover:shadow-xl shadow-lg"
            }`}
          >
            {/* Tag superior em destaque */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[11px] font-black uppercase tracking-wide shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mais Imponente • Tela Ampla</span>
              </span>
              <span className="text-xs text-amber-300 font-bold">Premium Indoor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Imagem do Totem */}
              <div className="sm:col-span-5 relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center p-1">
                <Image
                  src="/images/totem-interativo-maior.jpg"
                  alt="Totem Interativo Maior Indoor Empire"
                  fill
                  className="object-cover rounded-xl hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Conteúdo & Preço */}
              <div className="sm:col-span-7 space-y-3">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Totem Interativo Maior <span className="text-amber-400 text-base font-bold">(Indoor)</span>
                </h3>

                {/* Box de Preço */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-transparent border border-amber-400/50 shadow-inner">
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-amber-300">
                    Valor de Anúncio
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">R$ 350,00</span>
                    <span className="text-xs text-slate-300 font-semibold">/ mês</span>
                  </div>
                </div>

                {/* Lista de Recursos */}
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Tela 43&quot; Touch Screen</strong> de alta definição (Full HD)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Sistema Android 11 de alta performance e áudio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Máximo impacto visual em galerias, shoppings e clínicas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Design monólito elegante com acabamento prata/preto</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ações do Card 2 */}
            <div className="pt-6 mt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onFiltrarModelo?.("totem_interativo_maior")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 hover:border-amber-400/50 cursor-pointer"
              >
                <span>Ver Locais com Este Modelo</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <a
                href={getWhatsAppUrl("Totem Interativo Maior (Indoor)", "R$ 350,00")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contratar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Faixa de Especificações Técnicas Unificadas (Do Flyer Oficial) */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-5 shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            <div className="flex flex-col items-center justify-center gap-1.5 p-2">
              <Tv className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white">Tela 43&quot; Touch</span>
              <span className="text-[10.5px] text-slate-400">Full HD (1920x1080)</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1.5 p-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white">Android 11</span>
              <span className="text-[10.5px] text-slate-400">Processamento Rápido</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1.5 p-2">
              <Wifi className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white">Wi-Fi & Bluetooth</span>
              <span className="text-[10.5px] text-slate-400">Multimídia Contínua</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1.5 p-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white">Energia Bivolt</span>
              <span className="text-[10.5px] text-slate-400">110V e 220V Automático</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ideal para <strong>lojas, clínicas, academias, galerias e shoppings</strong>!</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <span>Atendimento Comercial:</span>
              <a
                href={getWhatsAppUrl("Totens Empire", "Comercial")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>(34) 98867-6886</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
