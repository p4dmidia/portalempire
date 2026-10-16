"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Rss,
  DollarSign,
  Megaphone,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  Settings,
  Palette,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";


interface AdminDashboardData {
  materias: {
    hoje: number;
    semana: number;
    totalVisualizacoes: number;
    topMaterias: Array<{
      id: string;
      titulo: string;
      slug: string;
      visualizacoes: number;
      publicado_em: string;
      origem: string;
      categoria?: { nome: string; cor: string | null } | null;
    }>;
  };
  captacao: {
    fontesTotal: number;
    fontesAtivas: number;
    fontesComErro: number;
    totalImportadas: number;
    ultimoLog: {
      id: string;
      iniciado_em: string;
      status: string;
      itens_lidos: number;
      itens_novos: number;
      erro?: string | null;
      fonte?: { nome: string } | null;
    } | null;
  };
  financeiro: {
    receitaMesTotal: number;
    comissaoMesTotal: number;
    liquidoColunistasMes: number;
    totalPedidosMes: number;
  };
  publicidade: {
    anunciosAtivos: number;
    anunciosAguardando: number;
    totalAnuncios: number;
    totalImpressoes: number;
    totalCliques: number;
  };
  usuarios: {
    total: number;
    pendentes: number;
    porRole: {
      admin: number;
      editor: number;
      colunista: number;
      anunciante: number;
    };
  };
}

export function AdminDashboardView() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard admin:", err);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    materias = { hoje: 0, semana: 0, totalVisualizacoes: 0, topMaterias: [] },
    captacao = { fontesTotal: 0, fontesAtivas: 0, fontesComErro: 0, totalImportadas: 0, ultimoLog: null },
    financeiro = { receitaMesTotal: 0, comissaoMesTotal: 0, liquidoColunistasMes: 0, totalPedidosMes: 0 },
    publicidade = { anunciosAtivos: 0, anunciosAguardando: 0, totalAnuncios: 0, totalImpressoes: 0, totalCliques: 0 },
    usuarios = { total: 0, pendentes: 0, porRole: { admin: 0, editor: 0, colunista: 0, anunciante: 0 } },
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Visão Geral do Portal</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Métricas editoriais, captação RSS em tempo real, receita publicitária e equipe.
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

          <Link
            href="/painel/editor/materias/nova"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-colors h-8"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Matéria
          </Link>
        </div>
      </div>

      {/* Grid de KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Matérias */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Produção Editorial
            </span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {materias.hoje}{" "}
              <span className="text-xs font-normal text-slate-500">hoje</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <strong>{materias.semana}</strong> publicadas nesta semana
            </p>
          </div>
        </div>

        {/* Card 2: Visualizações */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Alcance Total
            </span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {materias.totalVisualizacoes.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualizações acumuladas de páginas
            </p>
          </div>
        </div>

        {/* Card 3: Receita do Mês */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Receita do Mês
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              R$ {financeiro.receitaMesTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Comissão portal: <strong>R$ {financeiro.comissaoMesTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
            </p>
          </div>
        </div>

        {/* Card 4: Captação RSS */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Captação RSS
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
              <Rss className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {captacao.totalImportadas.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong>{captacao.fontesAtivas}</strong> fontes ativas de {captacao.fontesTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Seção 2: Top Matérias + Status Captação + Publicidade */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top Matérias Mais Lidas (7 colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Matérias Mais Lidas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Top conteúdos com maior engajamento</p>
            </div>

            <Link
              href="/painel/admin/materias"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {materias.topMaterias.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Nenhuma matéria publicada ainda.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {materias.topMaterias.map((mat, idx) => (
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
                            : "—"}
                        </span>
                        {mat.origem === "captacao" && (
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                            RSS
                          </span>
                        )}
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

        {/* Resumo de Publicidade & Captação (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Anúncios */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-500" />
                Publicidade no Ar
              </h2>
              <Link
                href="/painel/admin/anuncios"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Gerenciar &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400">Anúncios Ativos</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {publicidade.anunciosAtivos}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400">Aguardando Pgto</span>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {publicidade.anunciosAguardando}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400">Impressões Totais</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {publicidade.totalImpressoes.toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[11px] text-slate-400">Cliques Registrados</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {publicidade.totalCliques.toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          </div>

          {/* Card Status da Captação */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rss className="w-4 h-4 text-amber-500" />
                Status do Crawler RSS
              </h2>
              <Link
                href="/painel/admin/captacao"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Configurar &rarr;
              </Link>
            </div>

            {captacao.ultimoLog ? (
              <div className="text-xs space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Última execução:
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(captacao.ultimoLog.iniciado_em).toLocaleTimeString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  {captacao.ultimoLog.status === "sucesso" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> Sucesso ({captacao.ultimoLog.itens_novos} novas)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-600 text-[11px]">
                      <AlertCircle className="w-3 h-3" /> Falha no feed
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Nenhum log de captação gravado ainda.</p>
            )}
          </div>

          {/* Card Equipe & Usuários */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Equipe & Usuários ({usuarios.total})
              </h2>
              <Link
                href="/painel/admin/usuarios"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Gerenciar &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Admins</span>
                <span className="font-bold font-mono">{usuarios.porRole.admin}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Editores</span>
                <span className="font-bold font-mono">{usuarios.porRole.editor}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Colunistas</span>
                <span className="font-bold font-mono">{usuarios.porRole.colunista}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Anunciantes</span>
                <span className="font-bold font-mono">{usuarios.porRole.anunciante}</span>
              </div>
            </div>
            {usuarios.pendentes > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold text-center">
                ⚠ {usuarios.pendentes} usuário(s) aguardando aprovação
              </p>
            )}
          </div>
        </div>
      </div>


      {/* Seção 3: Atalhos Rápidos de Gestão */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold">Personalização e Gestão Global</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Altere cores, logomarca, redes sociais, ordem dos blocos da Home, configurações de comissão e audite logs sem mexer em código.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/painel/admin/aparencia"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-sm"
            >
              <Palette className="w-4 h-4 text-primary" />
              Aparência & Home
            </Link>

            <Link
              href="/painel/admin/configuracoes"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              Configurações
            </Link>

            <Link
              href="/painel/admin/auditoria"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-slate-300" />
              Auditoria
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-slate-300" />
              Portal Público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
