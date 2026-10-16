"use client";

import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssinaturaInfo {
  id?: string;
  status?: string;
  valor_mensal?: number;
  proximo_vencimento?: string;
  ultimo_pagamento?: string;
  forma_pagamento?: string;
}

interface ColunistaAssinaturaViewProps {
  initialAssinatura: AssinaturaInfo | null;
  valorMensalidade: number;
  userNome: string;
}

export function ColunistaAssinaturaView({
  initialAssinatura,
  valorMensalidade,
  userNome,
}: ColunistaAssinaturaViewProps) {
  const assinatura = initialAssinatura;
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const isAtiva = assinatura?.status === "ativa";
  const isAtrasada = assinatura?.status === "atrasada";
  const isPendente = !assinatura || assinatura.status === "pendente";

  const handlePagarMensalidade = async () => {
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/colunista/assinatura", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar checkout do Mercado Pago.");
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("Link de pagamento não retornado.");
      }
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao processar pagamento.");
      setLoading(false);
    }
  };

  const formatarData = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          Minha Assinatura de Colunista
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Olá, <strong>{userNome}</strong>. Acompanhe o status da sua coluna, vencimentos e realize pagamentos via Mercado Pago.
        </p>
      </div>

      {erro && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Status Atual do Plano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Status da sua Coluna
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Plano Colunista Oficial
              </div>
            </div>

            <div>
              {isAtiva && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Assinatura Ativa
                </span>
              )}
              {isAtrasada && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300/40">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Mensalidade Pendente / Atrasada
                </span>
              )}
              {isPendente && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Aguardando Ativação
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div className="text-xs text-slate-500">Valor Mensal</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                R$ {valorMensalidade.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400">por mês</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Próximo Vencimento
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {formatarData(assinatura?.proximo_vencimento)}
              </div>
              <div className="text-[11px] text-slate-400">
                {isAtiva ? "Renovação garantida" : "Aguardando pagamento"}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500">Último Pagamento</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {formatarData(assinatura?.ultimo_pagamento)}
              </div>
              <div className="text-[11px] text-slate-400">Via Mercado Pago</div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handlePagarMensalidade}
              disabled={loading}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 shadow-md shadow-emerald-500/20 gap-2"
            >
              {loading ? (
                <>Processando...</>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  {isAtiva ? "Antecipar / Renovar Mensalidade" : "Pagar Mensalidade com Mercado Pago (PIX / Cartão)"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            <p className="text-[11px] text-slate-400 mt-2">
              Pagamentos processados com segurança pelo Mercado Pago. Confirmação instantânea via PIX.
            </p>
          </div>
        </div>

        {/* Card Benefícios */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900/40 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5" /> Benefícios da Assinatura
            </div>

            <h3 className="text-lg font-bold">O que está incluído no seu plano:</h3>

            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Coluna Oficial</strong> indexada no Google com sua foto e biografia</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Publicação ilimitada de análises e artigos de opinião</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Espaços publicitários para faturar com anúncios locais</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Programa de Afiliados:</strong> Ganhe 20% recorrente todo mês ao indicar outros colunistas</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
            Dúvidas ou suporte? Entre em contato diretamente com a administração do Portal.
          </div>
        </div>
      </div>
    </div>
  );
}
