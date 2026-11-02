"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";

function RetornoCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    searchParams.get("paymentId") ||
    "";
  const statusParam =
    searchParams.get("status") ||
    searchParams.get("collection_status") ||
    searchParams.get("pagamento") ||
    "";
  const colunistaId =
    searchParams.get("external_reference") ||
    searchParams.get("colunista_id") ||
    "";
  const emailParam = searchParams.get("email") || "";

  const [estado, setEstado] = useState<"verificando" | "aprovado" | "pendente">(
    "verificando"
  );

  useEffect(() => {
    let ativo = true;

    async function confirmar() {
      try {
        if (paymentId) {
          const res = await fetch(
            `/api/checkout/colunista/status?paymentId=${encodeURIComponent(
              paymentId
            )}&colunistaId=${encodeURIComponent(colunistaId)}`
          );
          const data = await res.json();

          if (!ativo) return;

          if (
            data?.aprovado ||
            statusParam === "approved" ||
            statusParam === "sucesso"
          ) {
            setEstado("aprovado");
            try {
              const supabase = createClient();
              await supabase.auth.signOut();
            } catch {}

            setTimeout(() => {
              router.push(
                `/login?pagamento=aprovado&email=${encodeURIComponent(
                  emailParam
                )}&redirect=/painel/colunista/dashboard`
              );
            }, 2200);
            return;
          }
        } else if (statusParam === "approved" || statusParam === "sucesso") {
          setEstado("aprovado");
          setTimeout(() => {
            router.push(
              `/login?pagamento=aprovado&email=${encodeURIComponent(
                emailParam
              )}&redirect=/painel/colunista/dashboard`
            );
          }, 2200);
          return;
        }

        if (ativo) {
          setEstado("pendente");
        }
      } catch {
        if (ativo) {
          setEstado("pendente");
        }
      }
    }

    confirmar();
    return () => {
      ativo = false;
    };
  }, [paymentId, colunistaId, statusParam, emailParam, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl space-y-5">
        {estado === "verificando" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Validando seu Pagamento no Mercado Pago...
            </h1>
            <p className="text-sm text-slate-600">
              Aguarde alguns instantes enquanto ativamos sua conta e liberamos seu Escritório do Colunista.
            </p>
          </>
        )}

        {estado === "aprovado" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
              Pagamento Aprovado · Conta Ativada
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Bem-vindo(a) à Equipe de Colunistas Empire!
            </h1>
            <p className="text-sm text-slate-600">
              Sua conta e sua coluna foram ativadas com sucesso. Redirecionando para a tela de Login do Escritório do Colunista...
            </p>
            <Link
              href={`/login?pagamento=aprovado&email=${encodeURIComponent(
                emailParam
              )}&redirect=/painel/colunista/dashboard`}
              className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md"
            >
              Ir para o Login do Escritório
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}

        {estado === "pendente" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Pagamento em Processamento
            </h1>
            <p className="text-sm text-slate-600">
              Assim que o Mercado Pago confirmar a compensação do seu pagamento, sua conta será liberada automaticamente.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={`/login?email=${encodeURIComponent(emailParam)}`}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm"
              >
                Acessar Tela de Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/checkout/colunista"
                className="text-xs text-slate-500 hover:text-slate-900 underline"
              >
                Voltar para o Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RetornoCheckoutColunistaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <RetornoCheckoutContent />
    </Suspense>
  );
}
