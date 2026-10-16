"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";

export default function BloqueadoPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-destructive/20 shadow-xl text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Acesso Suspenso
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Sua conta foi temporariamente bloqueada por um administrador da plataforma.
          Entre em contato com a equipe editorial para mais detalhes.
        </p>

        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}
