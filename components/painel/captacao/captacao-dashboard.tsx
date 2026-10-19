"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Rss,
  Play,
  FlaskConical,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  Search,
  Settings,
  History,
  FileText,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { FonteFormDialog, type FonteRSS } from "./fonte-form-dialog";
import { TestarFeedDialog } from "./testar-feed-dialog";
import { EditarMateriaCaptadaDialog, type MateriaCaptada } from "./editar-materia-captada-dialog";
import type { Categoria, Cidade } from "@/lib/portal/queries";
import Image from "next/image";

interface LogCaptacao {
  id: string;
  iniciado_em: string;
  finalizado_em: string | null;
  itens_lidos: number;
  itens_novos: number;
  itens_duplicados: number;
  status: string;
  erro: string | null;
  fonte?: { id: string; nome: string; veiculo: string };
}

interface ItemCaptado {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  imagem_url: string | null;
  imagem_credito: string | null;
  fonte_nome: string | null;
  url_original: string | null;
  status: string;
  publicado_em: string | null;
  created_at: string;
  categoria?: { id: string; nome: string; slug: string };
  cidade?: { id: string; nome: string; slug: string } | null;
  fonte?: { id: string; nome: string; veiculo: string } | null;
}

interface CaptacaoDashboardProps {
  initialFontes: FonteRSS[];
  initialLogs: LogCaptacao[];
  initialMaterias: ItemCaptado[];
  initialConfig: {
    captacao_ativa_global: boolean;
    captacao_arquivar_dias: number;
  };
  categorias: Categoria[];
  cidades: Cidade[];
}

export function CaptacaoDashboard({
  initialFontes,
  initialLogs,
  initialMaterias,
  initialConfig,
  categorias,
  cidades,
}: CaptacaoDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fontes, setFontes] = useState<FonteRSS[]>(initialFontes);
  const [logs, setLogs] = useState<LogCaptacao[]>(initialLogs);
  const [materias, setMaterias] = useState<ItemCaptado[]>(initialMaterias);
  const [config, setConfig] = useState(initialConfig);

  // Modals state
  const [fonteModalOpen, setFonteModalOpen] = useState(false);
  const [selectedFonte, setSelectedFonte] = useState<FonteRSS | null>(null);

  const [testarModalOpen, setTestarModalOpen] = useState(false);
  const [testarUrl, setTestarUrl] = useState("");
  const [testarVeiculo, setTestarVeiculo] = useState("");

  const [editMateriaModalOpen, setEditMateriaModalOpen] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState<MateriaCaptada | null>(null);

  // Filters state
  const [filtroFonteLog, setFiltroFonteLog] = useState("");
  const [filtroStatusLog, setFiltroStatusLog] = useState("");
  const [filtroMateriaStatus, setFiltroMateriaStatus] = useState("");
  const [filtroMateriaBusca, setFiltroMateriaBusca] = useState("");

  // Loading actions
  const [executandoGlobal, setExecutandoGlobal] = useState(false);
  const [executandoFonteId, setExecutandoFonteId] = useState<string | null>(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const refreshData = async () => {
    startTransition(() => {
      router.refresh();
    });

    try {
      const [fontesRes, logsRes, materiasRes, configRes] = await Promise.all([
        fetch("/api/admin/captacao/fontes").then((r) => r.json()),
        fetch("/api/admin/captacao/logs").then((r) => r.json()),
        fetch("/api/admin/captacao/materias").then((r) => r.json()),
        fetch("/api/admin/captacao/config").then((r) => r.json()),
      ]);

      if (fontesRes.data) setFontes(fontesRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      if (materiasRes.data) setMaterias(materiasRes.data);
      if (configRes.data) setConfig(configRes.data);
    } catch {
      // Ignorar erro silencioso
    }
  };

  const handleExecutarTudo = async () => {
    setExecutandoGlobal(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const res = await fetch("/api/admin/captacao/executar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forcar: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao executar captação.");

      const d = data.data;
      const deletadasInfo =
        d.materias_deletadas_antigas && d.materias_deletadas_antigas > 0
          ? ` | ${d.materias_deletadas_antigas} matérias antigas (> 7 dias) excluídas do banco e site`
          : "";
      setMensagemSucesso(
        `Captação finalizada! ${d.fontes_processadas} fontes processadas, ${d.total_novos} matérias novas importadas (${d.total_duplicados} duplicadas ignoradas, ${d.total_erros} erros)${deletadasInfo}.`
      );
      await refreshData();
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao executar captação.");
    } finally {
      setExecutandoGlobal(false);
    }
  };

  const handleExecutarFonte = async (fonteId: string) => {
    setExecutandoFonteId(fonteId);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const res = await fetch("/api/admin/captacao/executar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fonte_id: fonteId, forcar: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao executar fonte.");

      const detalhe = data.data?.detalhes?.[0];
      if (detalhe) {
        if (detalhe.sucesso) {
          setMensagemSucesso(
            `Fonte "${detalhe.nome}" executada com sucesso! ${detalhe.itens_novos} novos itens importados (${detalhe.itens_duplicados} já existentes).`
          );
        } else {
          setMensagemErro(`Erro na fonte "${detalhe.nome}": ${detalhe.erro}`);
        }
      }
      await refreshData();
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao executar.");
    } finally {
      setExecutandoFonteId(null);
    }
  };

  const handleToggleAtivoFonte = async (fonte: FonteRSS) => {
    try {
      const novoStatus = !fonte.ativo;
      const res = await fetch(`/api/admin/captacao/fontes/${fonte.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: novoStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status da fonte.");
      setFontes((prev) =>
        prev.map((f) => (f.id === fonte.id ? { ...f, ativo: novoStatus } : f))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar.");
    }
  };

  const handleExcluirFonte = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja remover a fonte RSS "${nome}"?`)) return;
    try {
      const res = await fetch(`/api/admin/captacao/fontes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir fonte.");
      setFontes((prev) => prev.filter((f) => f.id !== id));
      setMensagemSucesso(`Fonte "${nome}" excluída com sucesso.`);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  };

  const handleSalvarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoConfig(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const res = await fetch("/api/admin/captacao/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar configurações.");
      setMensagemSucesso("Configurações de captação atualizadas com sucesso!");
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvandoConfig(false);
    }
  };

  const handleToggleStatusMateria = async (materia: ItemCaptado) => {
    const novoStatus = materia.status === "publicado" ? "rascunho" : "publicado";
    try {
      const res = await fetch(`/api/admin/captacao/materias/${materia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error("Erro ao alterar status.");
      setMaterias((prev) =>
        prev.map((m) => (m.id === materia.id ? { ...m, status: novoStatus } : m))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao alterar status.");
    }
  };

  const handleExcluirMateria = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta matéria captada?")) return;
    try {
      const res = await fetch(`/api/admin/captacao/materias/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir matéria.");
      setMaterias((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  };

  // Filtragem de logs
  const logsFiltrados = logs.filter((log) => {
    if (filtroFonteLog && log.fonte?.id !== filtroFonteLog) return false;
    if (filtroStatusLog && log.status !== filtroStatusLog) return false;
    return true;
  });

  // Filtragem de matérias captadas
  const materiasFiltradas = materias.filter((mat) => {
    if (filtroMateriaStatus && mat.status !== filtroMateriaStatus) return false;
    if (
      filtroMateriaBusca &&
      !mat.titulo.toLowerCase().includes(filtroMateriaBusca.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Rss className="w-6 h-6" />
            </div>
            Gestão de Captação RSS
          </h1>
          <p className="text-sm text-slate-500">
            Orquestração automática de notícias, validação de feeds, deduplicação por hash e classificação regional.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isPending}
            className="gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTestarUrl("");
              setTestarVeiculo("");
              setTestarModalOpen(true);
            }}
            className="gap-1.5"
          >
            <FlaskConical className="w-4 h-4 text-primary" />
            Testar Feed
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExecutarTudo}
            disabled={executandoGlobal}
            className="gap-1.5 shadow-sm"
          >
            {executandoGlobal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando Feeds...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Executar Agora
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alertas globais de feedback */}
      {mensagemSucesso && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button
            onClick={() => setMensagemSucesso(null)}
            className="text-xs font-semibold hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {mensagemErro && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-800 dark:text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button
            onClick={() => setMensagemErro(null)}
            className="text-xs font-semibold hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Status banner global */}
      {!config.captacao_ativa_global && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 flex items-center gap-2.5 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Atenção:</strong> A captação automática via cron está atualmente <strong>desativada globalmente</strong>. Apenas execuções manuais forçadas pelo painel serão executadas.
          </span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="fontes" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <TabsTrigger value="fontes" className="gap-2">
            <Rss className="w-4 h-4" />
            Fontes RSS ({fontes.length})
          </TabsTrigger>
          <TabsTrigger value="materias" className="gap-2">
            <FileText className="w-4 h-4" />
            Matérias Captadas ({materias.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="w-4 h-4" />
            Logs de Execução ({logs.length})
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="gap-2">
            <Settings className="w-4 h-4" />
            Configuração & Cron
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FONTES RSS */}
        <TabsContent value="fontes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Fontes de Notícias Configuradas
              </h2>
              <p className="text-xs text-slate-500">
                Gerencie os feeds RSS/Atom dos veículos. O sistema checa automaticamente a cada intervalo configurado.
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedFonte(null);
                setFonteModalOpen(true);
              }}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nova Fonte RSS
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium text-xs border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Veículo & Nome</th>
                    <th className="py-3.5 px-4">Editoria / Cidade</th>
                    <th className="py-3.5 px-4">Intervalo / Max</th>
                    <th className="py-3.5 px-4">Última Execução</th>
                    <th className="py-3.5 px-4">Importadas</th>
                    <th className="py-3.5 px-4 text-center">Ativo</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {fontes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Nenhuma fonte RSS cadastrada. Clique em &quot;Nova Fonte RSS&quot; para adicionar.
                      </td>
                    </tr>
                  ) : (
                    fontes.map((fonte) => {
                      const isExecutando = executandoFonteId === fonte.id;
                      const hasError = fonte.ultimo_status === "erro";
                      const isOk = fonte.ultimo_status === "ok";

                      return (
                        <tr
                          key={fonte.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            {isExecutando ? (
                              <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-xs">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Coletando</span>
                              </div>
                            ) : hasError ? (
                              <div
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                title={fonte.ultimo_erro || "Erro na última execução"}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Erro</span>
                              </div>
                            ) : isOk ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Ativa</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pendente</span>
                              </div>
                            )}
                          </td>

                          {/* Veiculo & Nome */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {fonte.nome}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                              <span className="font-medium text-slate-500">{fonte.veiculo}</span>
                              <span>•</span>
                              <a
                                href={fonte.url_feed}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate max-w-[200px] hover:text-primary hover:underline flex items-center gap-0.5"
                                title={fonte.url_feed}
                              >
                                {fonte.url_feed}
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          </td>

                          {/* Editoria / Cidade */}
                          <td className="py-3 px-4 text-xs">
                            <div className="font-medium">
                              {categorias.find((c) => c.id === fonte.categoria_padrao_id)?.nome || "Geral"}
                            </div>
                            <div className="text-slate-400">
                              {cidades.find((c) => c.id === fonte.cidade_padrao_id)?.nome || "Automático"}
                            </div>
                          </td>

                          {/* Intervalo / Max */}
                          <td className="py-3 px-4 text-xs">
                            <div>{fonte.intervalo_minutos || 15} min</div>
                            <div className="text-slate-400">Máx {fonte.max_itens_por_execucao || 20} itens</div>
                          </td>

                          {/* Última Execução */}
                          <td className="py-3 px-4 text-xs">
                            {fonte.ultima_execucao ? (
                              <>
                                <div>{new Date(fonte.ultima_execucao).toLocaleDateString("pt-BR")}</div>
                                <div className="text-slate-400">
                                  {new Date(fonte.ultima_execucao).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-400">Nunca</span>
                            )}
                          </td>

                          {/* Importadas */}
                          <td className="py-3 px-4 font-mono text-xs">
                            {fonte.total_importadas || 0}
                          </td>

                          {/* Ativo */}
                          <td className="py-3 px-4 text-center">
                            <Switch
                              checked={fonte.ativo}
                              onCheckedChange={() => handleToggleAtivoFonte(fonte)}
                            />
                          </td>

                          {/* Ações */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs gap-1 text-slate-600 hover:text-primary"
                                onClick={() => {
                                  setTestarUrl(fonte.url_feed);
                                  setTestarVeiculo(fonte.veiculo);
                                  setTestarModalOpen(true);
                                }}
                                title="Testar Feed"
                              >
                                <FlaskConical className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs gap-1 text-slate-600 hover:text-primary"
                                onClick={() => handleExecutarFonte(fonte.id!)}
                                disabled={isExecutando}
                                title="Executar esta fonte agora"
                              >
                                {isExecutando ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900"
                                onClick={() => {
                                  setSelectedFonte(fonte);
                                  setFonteModalOpen(true);
                                }}
                                title="Editar Fonte"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleExcluirFonte(fonte.id!, fonte.nome)}
                                title="Excluir Fonte"
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
        </TabsContent>

        {/* TAB 2: MATÉRIAS CAPTADAS */}
        <TabsContent value="materias" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Buscar matérias captadas..."
                  className="pl-9 h-10"
                  value={filtroMateriaBusca}
                  onChange={(e) => setFiltroMateriaBusca(e.target.value)}
                />
              </div>

              <select
                value={filtroMateriaStatus}
                onChange={(e) => setFiltroMateriaStatus(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Todos os status</option>
                <option value="publicado">Publicadas</option>
                <option value="rascunho">Rascunho / Ocultas</option>
                <option value="arquivado">Arquivadas</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Mostrando {materiasFiltradas.length} matérias
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium text-xs border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Notícia</th>
                    <th className="py-3.5 px-4">Veículo</th>
                    <th className="py-3.5 px-4">Editoria / Cidade</th>
                    <th className="py-3.5 px-4">Publicado em</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {materiasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Nenhuma matéria captada encontrada com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    materiasFiltradas.map((mat) => (
                      <tr
                        key={mat.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Imagem + Título */}
                        <td className="py-3 px-4 max-w-md">
                          <div className="flex gap-3 items-center">
                            {mat.imagem_url ? (
                              <div className="relative w-14 h-10 shrink-0 rounded-md overflow-hidden bg-slate-100">
                                <Image
                                  src={mat.imagem_url}
                                  alt={mat.titulo}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-10 shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Rss className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <a
                                href={`/materia/${mat.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-slate-900 dark:text-white line-clamp-1 hover:text-primary transition-colors text-xs sm:text-sm"
                              >
                                {mat.titulo}
                              </a>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {mat.resumo || "Sem resumo"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Veículo */}
                        <td className="py-3 px-4 text-xs font-medium">
                          {mat.fonte_nome || "RSS"}
                        </td>

                        {/* Editoria / Cidade */}
                        <td className="py-3 px-4 text-xs">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {mat.categoria?.nome || "Geral"}
                          </div>
                          <div className="text-slate-400">
                            {mat.cidade?.nome || "Sem cidade"}
                          </div>
                        </td>

                        {/* Publicado em */}
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {mat.publicado_em
                            ? new Date(mat.publicado_em).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatusMateria(mat)}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                              mat.status === "publicado"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                                : mat.status === "arquivado"
                                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
                            }`}
                            title="Clique para alternar Publicado / Rascunho"
                          >
                            {mat.status}
                          </button>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {mat.url_original && (
                              <a
                                href={mat.url_original}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-primary rounded-md"
                                title="Ver no veículo original"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900"
                              onClick={() => {
                                setSelectedMateria(mat as unknown as MateriaCaptada);
                                setEditMateriaModalOpen(true);
                              }}
                              title="Editar Categoria / Cidade"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleExcluirMateria(mat.id)}
                              title="Excluir Matéria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: LOGS DE CAPTAÇÃO */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Histórico de Execuções e Auditoria
              </h2>
              <p className="text-xs text-slate-500">
                Registros de cada execução de feed com total de lidos, novos, duplicados e possíveis erros.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filtroFonteLog}
                onChange={(e) => setFiltroFonteLog(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-xs"
              >
                <option value="">Todas as fontes</option>
                {fontes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>

              <select
                value={filtroStatusLog}
                onChange={(e) => setFiltroStatusLog(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-xs"
              >
                <option value="">Todos os status</option>
                <option value="sucesso">Sucesso</option>
                <option value="erro">Erro</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium text-xs border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Iniciado em</th>
                    <th className="py-3.5 px-4">Fonte</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Lidos</th>
                    <th className="py-3.5 px-4 text-center">Novos</th>
                    <th className="py-3.5 px-4 text-center">Duplicados</th>
                    <th className="py-3.5 px-4">Detalhes / Erro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {logsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Nenhum log de captação registrado.
                      </td>
                    </tr>
                  ) : (
                    logsFiltrados.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-xs font-mono text-slate-500">
                          {new Date(log.iniciado_em).toLocaleString("pt-BR")}
                        </td>

                        <td className="py-3 px-4 text-xs font-medium text-slate-900 dark:text-white">
                          {log.fonte?.nome || "Fonte Excluída"}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {log.status === "sucesso" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Sucesso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                              <XCircle className="w-3 h-3" /> Erro
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs">{log.itens_lidos}</td>
                        <td className="py-3 px-4 text-center font-mono text-xs font-bold text-emerald-600">
                          +{log.itens_novos}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                          {log.itens_duplicados}
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                          {log.erro ? (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {log.erro}
                            </span>
                          ) : (
                            <span className="text-slate-400">Executado com sucesso</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: CONFIGURAÇÕES GLOBAIS E CRON */}
        <TabsContent value="configuracoes" className="space-y-6">
          <form onSubmit={handleSalvarConfig} className="space-y-6 max-w-3xl">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Parâmetros Globais do Módulo de Captação
              </h3>

              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="captacao_ativa" className="font-semibold text-sm">
                    Liga / Desliga Global da Captação RSS
                  </Label>
                  <p className="text-xs text-slate-500">
                    Se desativado, o endpoint de cron periódico não processará nenhum feed (apenas execuções manuais forçadas).
                  </p>
                </div>
                <Switch
                  id="captacao_ativa"
                  checked={config.captacao_ativa_global}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, captacao_ativa_global: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivar_dias" className="font-semibold text-sm">
                  Exclusão e Limpeza Automática do Banco de Dados (Retenção em Dias)
                </Label>
                <p className="text-xs text-slate-500">
                  Matérias captadas via RSS com mais de N dias serão automaticamente deletadas permanentemente do banco de dados e do site para economizar espaço e otimizar a velocidade. Recomendado: 7 dias (1 semana).
                </p>
                <Input
                  id="arquivar_dias"
                  type="number"
                  min={1}
                  max={365}
                  value={config.captacao_arquivar_dias}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      captacao_arquivar_dias: Number(e.target.value),
                    }))
                  }
                  className="max-w-xs"
                />
              </div>

              <Button type="submit" disabled={salvandoConfig} className="gap-2">
                {salvandoConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </div>
          </form>

          {/* Documentação do Cron */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 max-w-3xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Como Funciona a Execução Agendada (Cron)
            </h4>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>1. Vercel Cron (Configurado no repositório):</strong> O arquivo <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">vercel.json</code> já está configurado para disparar <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">POST /api/cron/captacao</code> a cada 5 minutos com o header de autenticação <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Authorization: Bearer CRON_SECRET</code>.
              </p>

              <p>
                <strong>2. Alternativa nativa Supabase (pg_cron + pg_net):</strong> Caso prefira executar o cron diretamente pelo banco PostgreSQL, basta executar o seguinte SQL no painel do Supabase:
              </p>

              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono leading-normal">
{`-- Ativar extensões pg_cron e pg_net no Supabase
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Agendar chamada HTTP a cada 5 minutos
select cron.schedule(
  'executar-captacao-rss',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://seu-portal.vercel.app/api/cron/captacao',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || 'SEU_CRON_SECRET',
      'Content-Type', 'application/json'
    )
  );
  $$
);`}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <FonteFormDialog
        open={fonteModalOpen}
        onOpenChange={setFonteModalOpen}
        fonte={selectedFonte}
        categorias={categorias}
        cidades={cidades}
        onSuccess={refreshData}
      />

      <TestarFeedDialog
        open={testarModalOpen}
        onOpenChange={setTestarModalOpen}
        initialUrl={testarUrl}
        initialVeiculo={testarVeiculo}
      />

      <EditarMateriaCaptadaDialog
        open={editMateriaModalOpen}
        onOpenChange={setEditMateriaModalOpen}
        materia={selectedMateria}
        categorias={categorias}
        cidades={cidades}
        onSuccess={refreshData}
      />
    </div>
  );
}
