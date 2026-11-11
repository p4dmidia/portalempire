"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface BotaoFavoritarColunaProps {
  colunaId: string;
  colunaNome: string;
  colunaSlug: string;
  autorNome?: string;
  autorFoto?: string | null;
  cidadeNome?: string;
  capaUrl?: string | null;
  variacao?: "card" | "hero";
}

export function BotaoFavoritarColuna({
  colunaId,
  colunaNome,
  colunaSlug,
  autorNome,
  autorFoto,
  cidadeNome,
  capaUrl,
  variacao = "card",
}: BotaoFavoritarColunaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Formatar número de WhatsApp automaticamente: (XX) XXXXX-XXXX
  const formatarWhatsapp = (valor: string) => {
    const apenasDigitos = valor.replace(/\D/g, "").slice(0, 11);
    if (apenasDigitos.length <= 2) return apenasDigitos;
    if (apenasDigitos.length <= 7)
      return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2)}`;
    return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(
      2,
      7
    )}-${apenasDigitos.slice(7)}`;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatarWhatsapp(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const digitos = whatsapp.replace(/\D/g, "");
    if (digitos.length < 10) {
      setErro("Por favor, digite um número de WhatsApp válido com DDD.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/colunas/${colunaId}/seguir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          whatsapp,
          email,
          colunaNome,
          autorNome,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível registrar.");
      }

      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
      }
      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao processar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. O BOTÃO VISÍVEL NA PÁGINA */}
      {variacao === "hero" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
          title="Favoritar e acompanhar no WhatsApp com 90 dias grátis"
        >
          <Star className="w-4 h-4 fill-slate-950" />
          <span>Favoritar Colunista (90 Dias Grátis)</span>
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400/15 hover:bg-amber-400 text-amber-700 dark:text-amber-300 hover:text-slate-950 border border-amber-400/40 hover:border-amber-400 transition-all shadow-xs cursor-pointer group"
          title="Favoritar colunista e receber notificações de novos artigos"
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 group-hover:text-slate-950 group-hover:fill-slate-950 transition-colors" />
          <span>Favoritar</span>
          <span className="hidden sm:inline text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">
            90D GRÁTIS
          </span>
        </button>
      )}

      {/* 2. MODAL DE INSCRIÇÃO VIP & TRIAL 90 DIAS */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950">
                <Sparkles className="w-3.5 h-3.5" />
                <span>90 Dias de Acesso Gratuito</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Acompanhe {autorNome || colunaNome}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Favorite este colunista e receba as novidades e matérias direto no seu WhatsApp em primeira mão!
              </p>
            </div>

            {/* Preview do Colunista */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-amber-500/10 border border-amber-400/40 shrink-0">
                {autorFoto ? (
                  <Image src={autorFoto} alt={autorNome || ""} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-amber-600 text-lg">
                    {(autorNome || colunaNome).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {colunaNome}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Por {autorNome || "Colunista Licenciado"} {cidadeNome ? `• ${cidadeNome}` : ""}
                </p>
              </div>
            </div>

            {/* Benefícios do Trial */}
            <div className="space-y-2 text-xs bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 p-4 rounded-2xl text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Avisos no WhatsApp:</strong> Você recebe o link no seu celular assim que uma matéria nova for postada.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>R$ 0,00 nos primeiros 90 dias:</strong> Período de teste sem cobrança hoje. Após os 90 dias, apenas R$ 9,90/mês (cancele quando quiser com 1 clique).
                </span>
              </div>
            </div>

            {/* Estado de Sucesso com Botão de Checkout do Mercado Pago */}
            {sucesso ? (
              <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    Quase lá! Ative seus 90 Dias Grátis
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Seu contato <strong>{whatsapp}</strong> foi registrado. Agora autorize seu cartão no Mercado Pago para garantir seu acesso VIP.
                  </p>
                </div>

                <div className="p-4 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4" />
                    <span>R$ 0,00 Cobrado Hoje (Período de Teste)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    O Mercado Pago apenas valida o seu cartão sem nenhuma cobrança agora. Os <strong>R$ 9,90/mês</strong> só serão cobrados após 90 dias, se você desejar continuar.
                  </p>
                </div>

                <div className="pt-2 space-y-2.5">
                  {checkoutUrl ? (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Cadastrar Cartão no Mercado Pago ➔</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Concluído
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-1 transition-colors cursor-pointer"
                  >
                    Fechar e cadastrar cartão depois
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {erro && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-500/20 font-medium">
                    {erro}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seu WhatsApp (com DDD) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Ativando 90 Dias Grátis...</span>
                      </>
                    ) : (
                      <>
                        <span>Ativar 90 Dias Grátis no WhatsApp</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Seus dados estão protegidos. Cancele os avisos a qualquer momento.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

