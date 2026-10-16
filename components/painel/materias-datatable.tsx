"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CategoriaData, CidadeData, MateriaData } from "@/lib/portal/queries";
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
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MateriasDataTableProps {
  initialMaterias: MateriaData[];
  categorias: CategoriaData[];
  cidades: CidadeData[];
  userRole: string;
}

export function MateriasDataTable({
  initialMaterias,
  categorias,
  cidades,
  userRole,
}: MateriasDataTableProps) {
  const router = useRouter();
  const [materias, setMaterias] = useState<MateriaData[]>(initialMaterias);

  useEffect(() => {
    setMaterias(initialMaterias);
  }, [initialMaterias]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [filterCidade, setFilterCidade] = useState("todas");
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filtered = materias.filter((m) => {
    const matchesSearch =
      m.titulo.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase()) ||
      (m.resumo && m.resumo.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === "todos" || m.status === filterStatus;
    const matchesCategoria =
      filterCategoria === "todas" || m.categoria_id === filterCategoria;
    const matchesCidade =
      filterCidade === "todas" || m.cidade_id === filterCidade;

    return matchesSearch && matchesStatus && matchesCategoria && matchesCidade;
  });

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
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro na exclusão";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleToggleStatus = async (materia: MateriaData) => {
    const novoStatus = materia.status === "publicado" ? "despublicado" : "publicado";
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
        message: `Matéria ${novoStatus === "publicado" ? "publicada" : "despublicada"} com sucesso.`,
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

  const statusVariants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    publicado: "success",
    agendado: "warning",
    despublicado: "destructive",
    rascunho: "secondary",
  };

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

      {/* Barra de Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por título, resumo ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="w-36">
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="todos">Todos os Status</option>
                <option value="publicado">Publicado</option>
                <option value="rascunho">Rascunho</option>
                <option value="agendado">Agendado</option>
                <option value="despublicado">Despublicado</option>
              </Select>
            </div>

            <div className="w-36">
              <Select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                <option value="todas">Todas Editorias</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-36">
              <Select value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)}>
                <option value="todas">Todas Cidades</option>
                {cidades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
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
                <th className="px-4 py-4">Editoria</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Publicado Em</th>
                <th className="px-4 py-4 text-center">Visualizações</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma matéria encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((mat) => {
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
                              <Image
                                src={mat.imagem_url}
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
                              {mat.destaque && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                                  Destaque
                                </span>
                              )}
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
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {mat.categoria?.nome || "-"}
                        </span>
                        {mat.cidade && (
                          <span className="text-[11px] text-slate-400 block">
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
                          ? format(new Date(mat.publicado_em), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })
                          : "-"}
                      </td>

                      <td className="px-4 py-4 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
                        {mat.visualizacoes || 0}
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
      </div>
    </div>
  );
}
