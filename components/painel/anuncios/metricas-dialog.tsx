"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";

interface MetricaDia {
  data: string;
  impressoes: number;
  cliques: number;
  ctr: number;
}

interface MetricasData {
  anuncio_id: string;
  titulo: string;
  total_impressoes: number;
  total_cliques: number;
  ctr_geral: number;
  historico: MetricaDia[];
}

interface MetricasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anuncioId: string | null;
  anuncioTitulo?: string;
}

export function MetricasDialog({
  open,
  onOpenChange,
  anuncioId,
  anuncioTitulo,
}: MetricasDialogProps) {
  const [data, setData] = useState<MetricasData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && anuncioId) {
      setLoading(true);
      setError(null);

      fetch(`/api/anuncios/${anuncioId}/metricas`)
        .then((res) => res.json())
        .then((json) => {
          if (json.error) throw new Error(json.error);
          setData(json.data);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Erro ao carregar métricas.");
        })
        .finally(() => setLoading(false));
    }
  }, [open, anuncioId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Métricas de Desempenho
          </DialogTitle>
          <DialogDescription>
            Relatório de impressões, cliques e taxa de conversão (CTR) do anúncio &quot;{anuncioTitulo}&quot;.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-xs text-slate-400">Carregando métricas diárias...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-6 my-2">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1 font-semibold">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <span>Impressões</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {data.total_impressoes.toLocaleString("pt-BR")}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1 font-semibold">
                  <MousePointerClick className="w-4 h-4 text-primary" />
                  <span>Cliques</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {data.total_cliques.toLocaleString("pt-BR")}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1 font-semibold">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>CTR Médio</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {data.ctr_geral}%
                </div>
              </div>
            </div>

            {/* Tabela de Histórico Diário */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Histórico Diário (Últimos 30 dias)
              </h4>

              {data.historico.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  Nenhuma impressão ou clique registrado ainda para este anúncio.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3 text-center">Impressões</th>
                        <th className="py-2.5 px-3 text-center">Cliques</th>
                        <th className="py-2.5 px-3 text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.historico.map((dia) => (
                        <tr key={dia.data} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                            {new Date(dia.data + "T00:00:00").toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{dia.impressoes}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-primary">
                            {dia.cliques}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-600 font-bold">
                            {dia.ctr}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
