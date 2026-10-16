"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado pela camada de aplicação:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600">
          <AlertTriangle className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-600">
            Erro 500 · Falha Temporária
          </span>
          <h1 className="text-2xl font-black tracking-tight">
            Algo inesperado aconteceu
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nossa equipe técnica foi notificada automaticamente. Você pode tentar recarregar este conteúdo ou retornar à página inicial.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} size="sm" className="gap-1.5 shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>

          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Home className="w-4 h-4" />
              Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
