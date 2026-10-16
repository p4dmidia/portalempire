"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global capturado:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-red-950/50 text-red-500">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-500">
              Erro Crítico
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Falha de Inicialização
            </h1>
            <p className="text-xs text-slate-400">
              Ocorreu um erro na carga estrutural da página. Por favor, tente recarregar a aplicação.
            </p>
          </div>

          <div className="pt-2">
            <Button onClick={() => reset()} size="sm" className="gap-1.5 shadow-md">
              <RefreshCw className="w-4 h-4" />
              Recarregar Aplicação
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
