"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Code2,
  RefreshCw,
  User,
} from "lucide-react";

interface AuditLog {
  id: string;
  usuario_id: string | null;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  dados: Record<string, unknown>;
  created_at: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
}

export function AuditoriaView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Modal payload JSON
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const carregarLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (search) params.set("search", search);
      if (dataInicio) params.set("data_inicio", dataInicio);
      if (dataFim) params.set("data_fim", dataFim);

      const res = await fetch(`/api/admin/auditoria?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
        setTotalPages(json.totalPages || 1);
        setTotalLogs(json.total || 0);
      }
    } catch (err) {
      console.error("Erro ao carregar auditoria:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, dataInicio, dataFim]);

  useEffect(() => {
    carregarLogs();
  }, [carregarLogs]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    carregarLogs();
  };

  const handleClearFilters = () => {
    setSearch("");
    setDataInicio("");
    setDataFim("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Trilha de Auditoria & Conformidade
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro cronológico e imutável de todas as ações administrativas, alterações e eventos de segurança.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => carregarLogs()}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Barra de Filtros */}
      <form
        onSubmit={handleFilter}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Buscar
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ação, tabela, ID do registro..."
              className="pl-9 h-10 text-xs"
            />
          </div>
        </div>

        <div className="w-40 space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> De
          </label>
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        <div className="w-40 space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Até
          </label>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" className="h-10 text-xs">
            Filtrar
          </Button>
          {(search || dataInicio || dataFim) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-10 text-xs"
            >
              Limpar
            </Button>
          )}
        </div>
      </form>

      {/* Tabela de Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Usuário</th>
                <th className="py-3.5 px-4">Ação Executada</th>
                <th className="py-3.5 px-4">Entidade</th>
                <th className="py-3.5 px-4">Registro ID</th>
                <th className="py-3.5 px-4 text-right">Dados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>

                    <td className="py-3 px-4">
                      {log.usuario ? (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[140px]">
                              {log.usuario.nome}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                              {log.usuario.email}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sistema / Automático</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        {log.acao}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                      {log.entidade}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[10px] truncate max-w-[120px]">
                      {log.entidade_id || "—"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-7 text-[10px] px-2 gap-1"
                      >
                        <Code2 className="w-3 h-3" />
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total de {totalLogs} evento(s) registrado(s)</span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold px-2">
              {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Visualizador de Dados JSON */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Detalhes do Evento de Auditoria
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ação: <strong className="text-slate-700 dark:text-slate-200">{selectedLog.acao}</strong> |{" "}
                  Data: {new Date(selectedLog.created_at).toLocaleString("pt-BR")}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payload / Dados Registrados:
              </span>
              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-96 border border-slate-800">
                {JSON.stringify(selectedLog.dados || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedLog(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
