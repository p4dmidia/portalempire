"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Columns,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  User,
  MapPin,
  ImageIcon,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { ColunaFormDialog } from "./coluna-form-dialog";
import type { CidadeData, ColunaData } from "@/lib/portal/queries";

interface ColunasAdminViewProps {
  initialColunas: ColunaData[];
  cidades: CidadeData[];
  userId: string;
}

export function ColunasAdminView({
  initialColunas,
  cidades,
  userId,
}: ColunasAdminViewProps) {
  const router = useRouter();
  const [colunas, setColunas] = useState<ColunaData[]>(initialColunas);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColuna, setSelectedColuna] = useState<ColunaData | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const res = await fetch("/api/colunas?todas=true");
      const data = await res.json();
      if (data.data) {
        setColunas(data.data);
      }
    } catch {
      router.refresh();
    }
  };

  const handleMudarStatus = async (id: string, novoStatus: "ativa" | "suspensa" | "pendente") => {
    try {
      const res = await fetch(`/api/admin/colunas/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao mudar status.");

      setColunas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c))
      );
      setMensagemSucesso(`Coluna atualizada para "${novoStatus}".`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar status.");
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a coluna "${nome}"? Todos os artigos associados continuarão no sistema desvinculados.`)) return;
    try {
      const res = await fetch(`/api/colunas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao excluir coluna.");
      }
      setColunas((prev) => prev.filter((c) => c.id !== id));
      setMensagemSucesso(`Coluna "${nome}" excluída com sucesso.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  };

  const colunasFiltradas = colunas.filter((col) => {
    if (filtroStatus && col.status !== filtroStatus) return false;
    if (filtroCidade && col.cidade_id !== filtroCidade) return false;
    if (
      filtroBusca &&
      !col.nome.toLowerCase().includes(filtroBusca.toLowerCase()) &&
      !col.dono?.nome?.toLowerCase().includes(filtroBusca.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Columns className="w-6 h-6" />
            </div>
            Gestão de Colunas & Colunistas
          </h1>
          <p className="text-sm text-slate-500">
            Aprovação, suspensão e moderação das colunas de opinião e cobertura municipal do portal.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedColuna(null);
            setModalOpen(true);
          }}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Nova Coluna
        </Button>
      </div>

      {mensagemSucesso && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="hover:underline">
            Fechar
          </button>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Buscar por coluna ou autor..."
              className="pl-9 h-10 text-xs"
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-xs"
          >
            <option value="">Todos os status</option>
            <option value="ativa">Ativas</option>
            <option value="pendente">Pendentes de Aprovação</option>
            <option value="suspensa">Suspensas</option>
          </select>

          <select
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-xs"
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.uf})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 self-end sm:self-auto">
          {colunasFiltradas.length} colunas encontradas
        </span>
      </div>

      {/* Tabela de Colunas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium text-xs border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Coluna</th>
                <th className="py-3.5 px-4">Colunista / Autor</th>
                <th className="py-3.5 px-4">Cidade</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Anúncios</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {colunasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhuma coluna encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                colunasFiltradas.map((col) => {
                  const autor = col.dono;
                  const isAtiva = col.status === "ativa";
                  const isPendente = col.status === "pendente";
                  const isSuspensa = col.status === "suspensa";

                  return (
                    <tr
                      key={col.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Coluna (Capa + Nome) */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          {col.capa_url ? (
                            <div className="relative w-14 h-9 rounded-md overflow-hidden bg-slate-100 shrink-0">
                              <Image
                                src={col.capa_url}
                                alt={col.nome}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4 opacity-40" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {col.nome}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 truncate">
                              /coluna/{col.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Autor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-100 shrink-0">
                            {autor?.foto_url ? (
                              <Image
                                src={autor.foto_url}
                                alt={autor.nome || "Autor"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-slate-400 m-auto mt-1.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-xs text-slate-900 dark:text-white">
                              {autor?.nome || "Sem nome"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {autor?.email || ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cidade */}
                      <td className="py-3 px-4 text-xs">
                        {col.cidade ? (
                          <span className="inline-flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {col.cidade.nome} - {col.cidade.uf}
                          </span>
                        ) : (
                          <span className="text-slate-400">Geral</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isAtiva && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Ativa
                          </span>
                        )}
                        {isPendente && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                        {isSuspensa && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            <XCircle className="w-3 h-3" /> Suspensa
                          </span>
                        )}
                      </td>

                      {/* Anúncios */}
                      <td className="py-3 px-4 text-center text-xs">
                        {col.aceita_anuncios ? (
                          <span className="text-emerald-600 font-semibold">Sim</span>
                        ) : (
                          <span className="text-slate-400">Não</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPendente && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs font-semibold text-emerald-600 border-emerald-300 hover:bg-emerald-50 gap-1"
                              onClick={() => handleMudarStatus(col.id, "ativa")}
                              title="Aprovar Coluna"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Aprovar
                            </Button>
                          )}

                          {isAtiva && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1"
                              onClick={() => handleMudarStatus(col.id, "suspensa")}
                              title="Suspender Coluna"
                            >
                              <Ban className="w-3.5 h-3.5" /> Suspender
                            </Button>
                          )}

                          {isSuspensa && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                              onClick={() => handleMudarStatus(col.id, "ativa")}
                              title="Reativar Coluna"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reativar
                            </Button>
                          )}

                          <a
                            href={`/coluna/${col.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-primary rounded-md"
                            title="Ver no portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
                            onClick={() => {
                              setSelectedColuna(col);
                              setModalOpen(true);
                            }}
                            title="Editar Coluna"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleExcluir(col.id, col.nome)}
                            title="Excluir Coluna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ColunaFormDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        coluna={selectedColuna}
        cidades={cidades}
        userId={userId}
        userRole="admin"
        onSuccess={refreshData}
      />
    </div>
  );
}
