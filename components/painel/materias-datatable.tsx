"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategoriaData, CidadeData, MateriaData } from "@/lib/portal/queries";
import { ImageWithFallback } from "@/components/portal/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { formatarDataCurta } from "@/lib/utils/date-format";
import { calcularVisualizacoesRealistas } from "@/lib/portal/views-realistas";

interface MateriasDataTableProps {
  initialMaterias: MateriaData[];
  initialTotal?: number;
  categorias: CategoriaData[];
  cidades: CidadeData[];
  userRole: string;
  autorId?: string;
}

export function MateriasDataTable({
  initialMaterias,
  initialTotal,
  categorias,
  cidades,
  userRole,
  autorId,
}: MateriasDataTableProps) {
  const router = useRouter();

  // Estados dos dados e paginação
  const [materias, setMaterias] = useState<MateriaData[]>(initialMaterias);
  const [total, setTotal] = useState<number>(
    initialTotal ?? initialMaterias.length
  );
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(25);

  // Estados dos filtros
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [filterCidade, setFilterCidade] = useState("todas");
  const [filterOrigem, setFilterOrigem] = useState("todas");

  // Estados de feedback e carregamento
  const [isSearching, setIsSearching] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sincronizar com initialMaterias quando o servidor revalidar
  useEffect(() => {
    setMaterias(initialMaterias);
    if (initialTotal !== undefined) {
      setTotal(initialTotal);
    }
  }, [initialMaterias, initialTotal]);

  const isFirstRender = useRef(true);

  // --------------------------------------------------------------------------
  // BUSCA SERVER-SIDE DIRETAMENTE NO BANCO DE DADOS (10.000+ MATÉRIAS)
  // --------------------------------------------------------------------------
  const carregarMaterias = useCallback(
    async (
      buscaTermo: string,
      statusVal: string,
      catVal: string,
      cidVal: string,
      origemVal: string,
      pagina: number
    ) => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (buscaTermo.trim()) params.set("search", buscaTermo.trim());
        if (statusVal !== "todos") params.set("status", statusVal);
        if (catVal !== "todas") params.set("categoria", catVal);
        if (cidVal !== "todas") params.set("cidade", cidVal);
        if (origemVal !== "todas") params.set("origem", origemVal);
        if (autorId) params.set("autor_id", autorId);
        params.set("page", String(pagina));
        params.set("limit", String(limit));

        const res = await fetch(`/api/materias?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Erro ao buscar matérias no servidor.");
        }

        setMaterias((json.materias || []) as MateriaData[]);
        setTotal(json.total || 0);
      } catch (err: unknown) {
        console.error("Erro na busca de matérias:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [autorId, limit]
  );

  // Debounce automático de busca (350ms) ao alterar qualquer filtro ou busca
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      carregarMaterias(
        search,
        filterStatus,
        filterCategoria,
        filterCidade,
        filterOrigem,
        page
      );
    }, 350);

    return () => clearTimeout(timer);
  }, [
    search,
    filterStatus,
    filterCategoria,
    filterCidade,
    filterOrigem,
    page,
    carregarMaterias,
  ]);

  const handleLimparFiltros = () => {
    setSearch("");
    setFilterStatus("todos");
    setFilterCategoria("todas");
    setFilterCidade("todas");
    setFilterOrigem("todas");
    setPage(1);
    carregarMaterias("", "todos", "todas", "todas", "todas", 1);
  };

  const temFiltroAtivo =
    search.trim() !== "" ||
    filterStatus !== "todos" ||
    filterCategoria !== "todas" ||
    filterCidade !== "todas" ||
    filterOrigem !== "todas";

  // --------------------------------------------------------------------------
  // AÇÕES SOBRE MATÉRIA (Excluir, Destaque, Publicar/Despublicar)
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string, titulo: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a matéria "${titulo}"?`)) {
      return;
    }

    setLoadingActionId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/materias/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir matéria.");
      }

      setFeedback({ type: "success", message: "Matéria excluída com sucesso." });
      setMaterias((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro na exclusão";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleToggleDestaque = async (materia: MateriaData) => {
    const novoDestaque = !materia.destaque;
    setLoadingActionId(materia.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/materias/${materia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destaque: novoDestaque,
          tempo_destaque: novoDestaque ? "24h" : "sem_limite",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar destaque.");
      }

      setFeedback({
        type: "success",
        message: `Destaque da matéria "${materia.titulo.slice(0, 35)}..." ${
          novoDestaque ? "ativado (24h)" : "desativado"
        } com sucesso.`,
      });

      setMaterias((prev) =>
        prev.map((m) =>
          m.id === materia.id
            ? {
                ...m,
                destaque: novoDestaque,
                conteudo: {
                  ...((m.conteudo as Record<string, unknown> | null) || {}),
                  tempo_destaque: novoDestaque ? "24h" : "sem_limite",
                },
              }
            : m
        )
      );
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar destaque";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleToggleStatus = async (materia: MateriaData) => {
    const novoStatus =
      materia.status === "publicado" ? "despublicado" : "publicado";
    setLoadingActionId(materia.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/materias/${materia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar status.");
      }

      setFeedback({
        type: "success",
        message: `Matéria ${
          novoStatus === "publicado" ? "publicada" : "despublicada"
        } com sucesso.`,
      });

      setMaterias((prev) =>
        prev.map((m) => (m.id === materia.id ? { ...m, status: novoStatus } : m))
      );
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro na alteração";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoadingActionId(null);
    }
  };

  const statusVariants: Record<
    string,
    "success" | "warning" | "destructive" | "secondary"
  > = {
    publicado: "success",
    agendado: "warning",
    despublicado: "destructive",
    rascunho: "secondary",
  };

  // Cálculos de paginação
  const totalPages = Math.ceil(total / limit) || 1;
  const registroInicio = total === 0 ? 0 : (page - 1) * limit + 1;
  const registroFim = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {userRole === "admin" ? "Todas as Matérias do Portal" : "Minhas Matérias"}
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie publicações, agendamentos, edições e matérias autorais.
          </p>
        </div>

        <Link
          href={
            userRole === "colunista"
              ? "/painel/colunista/artigos/novo"
              : "/painel/editor/materias/nova"
          }
        >
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            {userRole === "colunista" ? "Novo Artigo" : "Nova Matéria"}
          </Button>
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Barra de Filtros Completa com Busca no Banco */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Campo de Busca com Feedback Visual de Carregamento */}
            <div className="relative flex-1 w-full">
              {isSearching ? (
                <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
              ) : (
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              )}
              <Input
                placeholder="Buscar por título, resumo ou slug em todo o portal..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros em linha */}
            <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center">
              {/* Filtro de Origem (Essencial para separar matérias do admin de RSS) */}
              <div className="w-44">
                <Select
                  value={filterOrigem}
                  onChange={(e) => {
                    setFilterOrigem(e.target.value);
                    setPage(1);
                  }}
                  title="Origem da Matéria"
                >
                  <option value="todas">Origem: Todas</option>
                  <option value="manual">✍️ Próprias / Autorais</option>
                  <option value="captacao">📡 Captação RSS</option>
                </Select>
              </div>

              {/* Filtro de Status */}
              <div className="w-36">
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  title="Status"
                >
                  <option value="todos">Todos Status</option>
                  <option value="publicado">Publicado</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="agendado">Agendado</option>
                  <option value="despublicado">Despublicado</option>
                </Select>
              </div>

              {/* Filtro de Editoria */}
              <div className="w-36">
                <Select
                  value={filterCategoria}
                  onChange={(e) => {
                    setFilterCategoria(e.target.value);
                    setPage(1);
                  }}
                  title="Editoria"
                >
                  <option value="todas">Todas Editorias</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Filtro de Cidade */}
              <div className="w-36">
                <Select
                  value={filterCidade}
                  onChange={(e) => {
                    setFilterCidade(e.target.value);
                    setPage(1);
                  }}
                  title="Cidade"
                >
                  <option value="todas">Todas Cidades</option>
                  {cidades.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Botão de Limpar Filtros */}
              {temFiltroAtivo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLimparFiltros}
                  className="text-xs text-muted-foreground hover:text-slate-900 dark:hover:text-white gap-1 px-2 h-9"
                  title="Limpar todos os filtros"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Contador de Resultados e Status de Busca */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              {isSearching ? (
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Pesquisando no banco de dados...
                </span>
              ) : temFiltroAtivo ? (
                <span>
                  Encontradas <strong>{total.toLocaleString("pt-BR")}</strong> matérias com os filtros selecionados
                </span>
              ) : (
                <span>
                  Total no portal: <strong>{total.toLocaleString("pt-BR")}</strong> matérias cadastradas
                </span>
              )}
            </span>

            {filterOrigem === "manual" && (
              <Badge variant="outline" className="text-[11px] gap-1 text-primary border-primary/30">
                <Sparkles className="w-3 h-3" /> Exibindo apenas matérias autorais / manuais
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Matérias */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Matéria</th>
                <th className="px-4 py-4">Editoria / Origem</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Publicado Em</th>
                <th className="px-4 py-4 text-center">Visualizações</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {materias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {isSearching ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Carregando resultados...</span>
                      </div>
                    ) : (
                      "Nenhuma matéria encontrada com os filtros informados."
                    )}
                  </td>
                </tr>
              ) : (
                materias.map((mat) => {
                  const isLoading = loadingActionId === mat.id;

                  return (
                    <tr
                      key={mat.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            {mat.imagem_url ? (
                              <ImageWithFallback
                                src={mat.imagem_url}
                                contexto={mat.titulo}
                                alt={mat.titulo}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                              {mat.titulo}
                              {mat.destaque && (() => {
                                const meta = (mat.conteudo as Record<string, unknown> | null) || null;
                                const tempo = meta?.tempo_destaque as string;
                                const rotulo = tempo && tempo !== "sem_limite"
                                  ? `Destaque (${tempo})`
                                  : "Destaque";
                                return (
                                  <span
                                    className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0"
                                    title={tempo && tempo !== "sem_limite" ? `Destaque temporário: expira em ${tempo}` : "Destaque fixo manual"}
                                  >
                                    <Star className="w-2.5 h-2.5 fill-current" /> {rotulo}
                                  </span>
                                );
                              })()}
                              {mat.urgente && (
                                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-1.5 py-0.2 rounded">
                                  Urgente
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              /materia/{mat.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {mat.categoria?.nome || "-"}
                          </span>
                          {mat.origem !== "captacao" ? (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                              Autoral
                            </Badge>
                          ) : (
                            <span className="text-[9px] text-slate-400">
                              RSS
                            </span>
                          )}
                        </div>
                        {mat.cidade && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {mat.cidade.nome}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={statusVariants[mat.status] || "secondary"}
                          className="uppercase text-[10px]"
                        >
                          {mat.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {mat.publicado_em
                          ? formatarDataCurta(mat.publicado_em, true)
                          : formatarDataCurta(mat.created_at, true)}
                      </td>

                      <td className="px-4 py-4 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
                        {calcularVisualizacoesRealistas(mat).toLocaleString("pt-BR")}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {mat.status === "publicado" && (
                              <a
                                href={`/materia/${mat.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Ver no Portal"
                              >
                                <Globe className="w-4 h-4" />
                              </a>
                            )}

                            {userRole === "admin" ? (
                              <button
                                type="button"
                                onClick={() => handleToggleDestaque(mat)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  mat.destaque
                                    ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                                    : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                                title={
                                  mat.destaque
                                    ? "Remover do Destaque da Capa"
                                    : "Colocar em Destaque no Topo da Capa (24h)"
                                }
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    mat.destaque ? "fill-amber-400 text-amber-500" : ""
                                  }`}
                                />
                              </button>
                            ) : mat.destaque ? (
                              <span
                                className="p-1.5 rounded-lg text-amber-500 bg-amber-50 dark:bg-amber-950/40 inline-flex items-center cursor-help"
                                title="Em Destaque Ativo na Capa (Padrão de 4 horas)"
                              >
                                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                              </span>
                            ) : null}

                            <Link
                              href={`/painel/editor/materias/${mat.id}`}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              title="Editar Matéria"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(mat)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors text-xs font-semibold"
                              title={
                                mat.status === "publicado"
                                  ? "Despublicar Matéria"
                                  : "Publicar Matéria"
                              }
                            >
                              {mat.status === "publicado" ? "Despublicar" : "Publicar"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(mat.id, mat.titulo)}
                              className="p-1.5 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Excluir Matéria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginação Real */}
        {total > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Mostrando <strong>{registroInicio}</strong> a <strong>{registroFim}</strong> de{" "}
              <strong>{total.toLocaleString("pt-BR")}</strong> matérias
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isSearching}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </Button>

              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                Página {page} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isSearching}
                className="h-8 gap-1 text-xs"
              >
                Próxima
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
