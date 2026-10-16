import type { Metadata } from "next";
import { getPortalData } from "@/lib/portal/queries";
import { Megaphone, Users, Target, TrendingUp } from "lucide-react";
import { AnuncieForm } from "@/components/portal/AnuncieForm";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPortalData();
  return {
    title: `Mídia Kit & Anuncie — ${portal?.nome || "Portal Empire"}`,
    description: "Divulgue sua marca para milhares de leitores qualificados na sua região.",
  };
}

export default async function AnunciePage() {
  const portal = await getPortalData();

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Hero Comercial */}
      <div className="text-center space-y-4 py-8 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Megaphone className="w-4 h-4" />
          <span>Mídia Kit & Publicidade</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Anuncie sua Marca no {portal?.nome || "Portal Empire"}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Conecte sua empresa a leitores engajados e com alto poder de decisão nas principais cidades da região.
        </p>
      </div>

      {/* Estatísticas e Diferenciais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/40 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">+500.000</h3>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Visualizações Mensais</p>
          <p className="text-xs text-slate-400">Audiência orgânica qualificada e regionalizada.</p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Segmentação</h3>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Por Cidade e Editoria</p>
          <p className="text-xs text-slate-400">Anuncie especificamente na coluna da sua cidade.</p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Relatórios</h3>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Métricas em Tempo Real</p>
          <p className="text-xs text-slate-400">Acompanhe impressões, cliques e CTR diariamente.</p>
        </div>
      </div>

      {/* Formatos de Anúncio Disponíveis */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Formatos Publicitários Disponíveis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Super Banner Topo</h4>
              <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">970 x 90 px</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Posicionamento nobre no topo de todas as páginas ou colunas, garantindo máxima visibilidade inicial.
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Retângulo Lateral</h4>
              <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">300 x 250 px</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exibido na barra lateral ao lado das notícias mais lidas e matérias principais com alto tempo de permanência.
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Meio de Texto (In-Article)</h4>
              <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">728 x 90 px</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inserido estrategicamente no corpo do artigo ou coluna, capturando a atenção do leitor durante o texto.
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Banner Entre Blocos</h4>
              <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">970 x 250 px</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Formato gigante e de grande impacto visual distribuído entre os blocos editoriais da página inicial.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Contato Comercial */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-md">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Fale com Nosso Departamento Comercial
            </h3>
            <p className="text-xs text-slate-500">
              Preencha o formulário abaixo para receber nossa proposta personalizada e tabela de valores.
            </p>
          </div>

          <AnuncieForm portalNome={portal?.nome} />
        </div>
      </div>
    </div>
  );
}
