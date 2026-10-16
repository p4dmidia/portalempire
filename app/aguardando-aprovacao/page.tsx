"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, RefreshCw } from "lucide-react";

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
          Aguardando Aprovação
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Seu cadastro foi realizado e está aguardando a aprovação de um administrador do Portal Empire.
          Assim que sua conta for ativada, você terá acesso completo ao painel de colunista.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={handleRefresh} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Verificar Novamente
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
