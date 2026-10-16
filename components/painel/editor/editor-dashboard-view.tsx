"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  TrendingUp,
  PlusCircle,
  Clock,
  CheckCircle2,
  FileEdit,
  ArrowUpRight,
  RefreshCw,
  Rss,
} from "lucide-react";

interface EditorDashboardData {
  metricas: {
    hoje: number;
    semana: number;
    total: number;
    totalVisualizacoes: number;
    porStatus: {
      publicado: number;
      rascunho: number;
      agendado: number;
      despublicado: number;
    };
  };
  topMaterias: Array<{
    id: string;
    titulo: string;
    slug: string;
    visualizacoes: number;
    publicado_em: string;
    status: string;
    categoria?: { nome: string; cor: string | null } | null;
  }>;
}

export function EditorDashboardView() {
  const [data, setData] = useState<EditorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const res = await fetch("/api/editor/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard do editor:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { metricas, topMaterias } = data || {
    metricas: {
      hoje: 0,
      semana: 0,
      total: 0,
      totalVisualizacoes: 0,
      porStatus: { publicado: 0, rascunho: 0, agendado: 0, despublicado: 0 },
    },
    topMaterias: [],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Meu Painel Editorial</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              Editor
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe o desempenho, audiência e status das suas matérias e produções jornalísticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Link href="/painel/editor/materias/nova">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Escrever Matéria
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de KPIs do Editor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hoje */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Produção Hoje
            </span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metricas.hoje}{" "}
              <span className="text-xs font-normal text-slate-500">publicada(s)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <strong>{metricas.semana}</strong> matérias nos últimos 7 dias
            </p>
          </div>
        </div>

        {/* Card 2: Visualizações */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Suas Visualizações
            </span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metricas.totalVisualizacoes.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Leituras totais nos seus artigos
            </p>
          </div>
        </div>

        {/* Card 3: Rascunhos / Em Edição */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rascunhos
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
              <FileEdit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metricas.porStatus.rascunho}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Matérias aguardando publicação
            </p>
          </div>
        </div>

        {/* Card 4: Agendadas */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Agendadas
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metricas.porStatus.agendado}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Disparos programados no cron
            </p>
          </div>
        </div>
      </div>

      {/* Seção 2: Top Matérias do Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Suas Matérias Mais Lidas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Seus textos de maior audiência</p>
            </div>

            <Link
              href="/painel/editor/materias"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Ver todas as minhas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topMaterias.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Nenhuma matéria publicada ainda.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topMaterias.map((mat, idx) => (
                <div key={mat.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-black text-slate-400 w-4 text-right">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <a
                        href={`/materia/${mat.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-900 dark:text-white hover:text-primary line-clamp-1"
                      >
                        {mat.titulo}
                      </a>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        {mat.categoria && (
                          <span
                            className="font-medium px-1.5 py-0.2 rounded text-[10px]"
                            style={{
                              backgroundColor: `${mat.categoria.cor || "#2563eb"}15`,
                              color: mat.categoria.cor || "#2563eb",
                            }}
                          >
                            {mat.categoria.nome}
                          </span>
                        )}
                        <span>
                          {mat.publicado_em
                            ? new Date(mat.publicado_em).toLocaleDateString("pt-BR")
                            : "Rascunho"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 font-mono font-bold text-slate-700 dark:text-slate-300">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {mat.visualizacoes.toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo de Status Editorial */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Status da Sua Produção
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Publicadas no Ar</span>
              </div>
              <span className="font-mono font-black text-emerald-800 dark:text-emerald-200">
                {metricas.porStatus.publicado}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
                <FileEdit className="w-4 h-4" />
                <span>Rascunhos Salvos</span>
              </div>
              <span className="font-mono font-black text-amber-800 dark:text-amber-200">
                {metricas.porStatus.rascunho}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Agendadas para Lançamento</span>
              </div>
              <span className="font-mono font-black text-blue-800 dark:text-blue-200">
                {metricas.porStatus.agendado}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/painel/editor/captadas">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                <Rss className="w-3.5 h-3.5 text-amber-500" />
                Ver Notícias Captadas (RSS)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
