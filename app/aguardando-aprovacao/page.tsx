"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard, LogOut, RefreshCw } from "lucide-react";

export default function AguardandoAprovacaoPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleRefresh = () => {
    router.push("/painel");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Ative sua Licença de Colunista
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Seu cadastro foi localizado! Para liberar imediatamente seu acesso ao{" "}
          <strong>Escritório do Colunista</strong>, conclua a ativação da sua assinatura mensal (R$ 250,00/mês) via PIX ou Cartão no Mercado Pago.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/checkout/colunista" className="w-full">
            <Button className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              <CreditCard className="w-4 h-4" />
              Concluir Pagamento e Ativar Agora (R$ 250,00)
            </Button>
          </Link>

          <Button
            onClick={handleRefresh}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Já paguei! Verificar Liberação
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
