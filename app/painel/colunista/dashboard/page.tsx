import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Columns,
  FileText,
  Eye,
  PenTool,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default async function ColunistaDashboardPage() {
  const profile = await requireRole(["colunista", "admin"]);
  const supabase = await createClient();

  let totalColunas = 0;
  let totalArtigos = 0;
  let colunas: Array<{ id: string; nome: string; slug: string; status: string }> = [];
  let artigos: Array<{ id: string; titulo: string; slug: string; visualizacoes: number | null; status: string; publicado_em: string | null }> = [];
  let isAssinaturaAtiva = false;

  try {
    const [colunasRes, artigosRes, assinaturaRes] = await Promise.all([
      supabase
        .from("colunas")
        .select("id, nome, slug, status, cidade:cidades(nome)", { count: "exact" })
        .eq("dono_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("materias")
        .select("id, titulo, slug, visualizacoes, status, publicado_em, coluna:colunas(nome)", { count: "exact" })
        .eq("autor_id", profile.id)
        .not("coluna_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("assinaturas_colunistas")
        .select("status, proximo_vencimento, valor_mensal")
        .eq("colunista_id", profile.id)
        .maybeSingle(),
    ]);

    colunas = (colunasRes.data as typeof colunas) || [];
    totalColunas = colunasRes.count || colunas.length;
    artigos = (artigosRes.data as typeof artigos) || [];
    totalArtigos = artigosRes.count || artigos.length;
    isAssinaturaAtiva = assinaturaRes?.data?.status === "ativa";
  } catch (err) {
    console.error("[ColunistaDashboard] Erro ao carregar métricas:", err);
  }

  const totalVisualizacoes = artigos.reduce((acc, a) => acc + (a.visualizacoes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel do Colunista
          </h1>
          <p className="text-sm text-slate-500">
            Olá, <strong>{profile.nome}</strong>. Acompanhe suas colunas, artigos e alcance editorial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/painel/colunista/assinatura">
            <Button variant="outline" size="sm" className="gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Minha Assinatura
            </Button>
          </Link>

          <Link href="/painel/colunista/colunas">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Columns className="w-4 h-4" />
              Minhas Colunas
            </Button>
          </Link>

          <Link href="/painel/colunista/artigos/novo">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <PenTool className="w-4 h-4" />
              Novo Artigo
            </Button>
          </Link>
        </div>
      </div>

      {/* Banner de Assinatura Pendente/Atrasada (se não estiver ativa) */}
      {!isAssinaturaAtiva && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Assinatura de Colunista Pendente</div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                Ative seu plano mensal para manter sua coluna indexada e liberar os 20% recorrentes no Programa de Afiliados.
              </div>
            </div>
          </div>
          <Link href="/painel/colunista/assinatura" className="shrink-0">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
              Pagar Mensalidade &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <Columns className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalColunas || 0}
            </div>
            <div className="text-xs text-slate-500">Colunas Criadas</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalArtigos || 0}
            </div>
            <div className="text-xs text-slate-500">Artigos Publicados</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalVisualizacoes}
            </div>
            <div className="text-xs text-slate-500">Visualizações Totais</div>
          </div>
        </div>
      </div>

      {/* Banner Programa de Afiliados */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-blue-800/40">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/20">
            <Sparkles className="w-3 h-3" /> Programa de Afiliados Ativo
          </div>
          <h3 className="font-bold text-lg">Indique colunistas e ganhe 20% recorrente todo mês</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Cada novo colunista que você indicar para o Portal Empire gera 20% da mensalidade dele creditado diretamente no seu saldo em conta.
          </p>
        </div>
        <Link href="/painel/colunista/afiliados">
          <Button className="bg-white text-blue-950 hover:bg-blue-50 font-bold shrink-0 shadow-sm">
            Ver Meus Ganhos & Link &rarr;
          </Button>
        </Link>
      </div>

      {/* Seção de Colunas Recentes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Columns className="w-4 h-4 text-amber-500" />
            Suas Colunas
          </h2>
          <Link
            href="/painel/colunista/colunas"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Gerenciar todas &rarr;
          </Link>
        </div>

        {!colunas || colunas.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Nenhuma coluna cadastrada ainda.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {colunas.map((col) => (
              <div
                key={col.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {col.nome}
                  </span>
                  <span className="text-slate-400 ml-2">
                    /{col.slug}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {col.status === "ativa" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      <Clock className="w-3 h-3" /> Aguardando moderação
                    </span>
                  )}

                  {col.status === "ativa" && (
                    <a
                      href={`/coluna/${col.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-0.5"
                    >
                      Ver <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção de Artigos Recentes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Últimos Artigos Publicados
          </h2>
          <Link
            href="/painel/colunista/artigos"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Ver todos &rarr;
          </Link>
        </div>

        {!artigos || artigos.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Nenhum artigo publicado ainda.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {artigos.map((art) => (
              <div
                key={art.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-4">
                  <a
                    href={`/materia/${art.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 dark:text-white hover:text-primary line-clamp-1"
                  >
                    {art.titulo}
                  </a>
                  <span className="text-[11px] text-slate-400">
                    {art.publicado_em
                      ? new Date(art.publicado_em).toLocaleDateString("pt-BR")
                      : "Rascunho"}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" /> {art.visualizacoes || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
