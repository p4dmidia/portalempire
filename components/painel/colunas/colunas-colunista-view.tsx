"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Columns,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  PenTool,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ImageIcon,
} from "lucide-react";
import { ColunaFormDialog } from "./coluna-form-dialog";
import type { CidadeData, ColunaData } from "@/lib/portal/queries";

interface ColunasColunistaViewProps {
  initialColunas: ColunaData[];
  cidades: CidadeData[];
  userId: string;
  userRole: string;
}

export function ColunasColunistaView({
  initialColunas,
  cidades,
  userId,
  userRole,
}: ColunasColunistaViewProps) {
  const router = useRouter();
  const [colunas, setColunas] = useState<ColunaData[]>(initialColunas);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColuna, setSelectedColuna] = useState<ColunaData | null>(null);

  const refreshData = async () => {
    try {
      const res = await fetch("/api/colunas");
      const data = await res.json();
      if (data.data) {
        setColunas(data.data);
      }
    } catch {
      router.refresh();
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a coluna "${nome}"?`)) return;
    try {
      const res = await fetch(`/api/colunas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir coluna.");
      setColunas((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Columns className="w-6 h-6" />
            </div>
            Minhas Colunas
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie suas colunas de opinião, cobertura municipal e espaços de monetização.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/painel/colunista/artigos/novo">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <PenTool className="w-4 h-4 text-primary" />
              Escrever Artigo
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => {
              setSelectedColuna(null);
              setModalOpen(true);
            }}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Coluna
          </Button>
        </div>
      </div>

      {/* Grid de Colunas */}
      {colunas.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
            <Columns className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Você ainda não tem nenhuma coluna cadastrada
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Crie sua primeira coluna para começar a publicar análises, crônicas e artigos de opinião com seu nome e cidade no portal.
          </p>
          <Button
            onClick={() => {
              setSelectedColuna(null);
              setModalOpen(true);
            }}
            className="mt-2 gap-1.5"
          >
            <Plus className="w-4 h-4" /> Criar Minha Primeira Coluna
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colunas.map((col) => {
            const isAtiva = col.status === "ativa";
            const isPendente = col.status === "pendente";
            const isSuspensa = col.status === "suspensa";

            return (
              <div
                key={col.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-amber-400/50 transition-all"
              >
                <div>
                  {/* Capa */}
                  <div className="relative aspect-[21/9] w-full bg-slate-100 dark:bg-slate-800">
                    {col.capa_url ? (
                      <Image
                        src={col.capa_url}
                        alt={col.nome}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isAtiva && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> Ativa no Portal
                        </span>
                      )}
                      {isPendente && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
                          <Clock className="w-3 h-3" /> Aguardando Aprovação
                        </span>
                      )}
                      {isSuspensa && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm">
                          <XCircle className="w-3 h-3" /> Suspensa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      {col.cidade && (
                        <span className="inline-flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {col.cidade.nome} - {col.cidade.uf}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-slate-400">
                        /{col.slug}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {col.nome}
                    </h3>

                    {col.descricao && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {col.descricao}
                      </p>
                    )}

                    {isPendente && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-normal mt-2">
                        Esta coluna está em análise pela equipe editorial. Assim que aprovada, aparecerá na página de colunas e na home.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer com ações */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {isAtiva && (
                      <a
                        href={`/coluna/${col.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Ver no portal <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isAtiva && (
                      <Link href={`/painel/colunista/artigos/novo`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-slate-600 hover:text-primary gap-1"
                          title="Escrever artigo para esta coluna"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900"
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
                      className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleExcluir(col.id, col.nome)}
                      title="Excluir Coluna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ColunaFormDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        coluna={selectedColuna}
        cidades={cidades}
        userId={userId}
        userRole={userRole}
        onSuccess={refreshData}
      />
    </div>
  );
}
