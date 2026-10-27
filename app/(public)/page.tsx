import type { Metadata } from "next";
import Link from "next/link";
import {
  getPortalData,
  getCategorias,
  getCidades,
  getMaterias,
  getMateriasPorCategoriasHome,
  getColunasAtivas,
  getShorts,
} from "@/lib/portal/queries";
import { getClassificadosDestaqueHome } from "@/lib/portal/classificados-queries";
import { TopHeroMagazine } from "@/components/portal/TopHeroMagazine";
import { FaixaUltimasNoticias } from "@/components/portal/FaixaUltimasNoticias";
import { BlocoEditoria } from "@/components/portal/BlocoEditoria";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { ClassificadosHomeSection } from "@/components/portal/ClassificadosHomeSection";
import { BlocoCidadesEstadosHome } from "@/components/portal/BlocoCidadesEstadosHome";
import { BlocoTvAoVivoHome } from "@/components/portal/BlocoTvAoVivoHome";
import { CardRadioAoVivo } from "@/components/portal/CardRadioAoVivo";
import { CarrosselEmpireFlix } from "@/components/portal/CarrosselEmpireFlix";
import { AdSlot } from "@/components/portal/AdSlot";
import { MapPin, Video, ChevronRight, MessageCircle } from "lucide-react";

export const revalidate = 60; // ISR: 60 segundos de revalidação

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPortalData();
  return {
    title: portal?.nome ? `${portal.nome} — Portal de Notícias Regionais` : "Empire Cidades",
    description:
      portal?.descricao_seo ||
      "Portal de notícias completo com captação em tempo real, colunistas de cidades e cobertura regional.",
    openGraph: {
      title: portal?.nome || "Empire Cidades",
      description: portal?.descricao_seo || "Notícias em tempo real da sua região",
      type: "website",
      locale: "pt_BR",
    },
  };
}

export default async function PortalHomePage() {
  const [
    portal,
    todasCategorias,
    cidades,
    destaquesRaw,
    recentesRaw,
    maisLidas,
    colunas,
    shorts,
    classificadosDestaque,
  ] = await Promise.all([
    getPortalData(),
    getCategorias(),
    getCidades(),
    getMaterias({ destaque: true, limit: 8 }),
    getMaterias({ limit: 30 }),
    getMaterias({ ordenarPor: "visualizacoes", limit: 6 }),
    getColunasAtivas(),
    getShorts(),
    getClassificadosDestaqueHome(4),
  ]);

  // Se houver poucas matérias em destaque, preenche com as mais recentes
  const destaques =
    destaquesRaw.length >= 6
      ? destaquesRaw
      : [...destaquesRaw, ...recentesRaw.slice(0, Math.max(0, 6 - destaquesRaw.length))];

  // Matérias para a coluna do meio do hero
  const manchetes = recentesRaw.slice(2, 10);

  // Matérias para o bloco "As Mais Recentes" no canto direito do hero
  const maisRecentesHero =
    recentesRaw.slice(10, 16).length >= 4
      ? recentesRaw.slice(10, 16)
      : recentesRaw.slice(0, 5);

  // Faixa de carrossel horizontal "Últimas de Empire Cidades"
  const ultimasCarrossel = recentesRaw.slice(0, 10);

  // Editorias com exibir_home = true, ordenadas por ordem_home
  const categoriasHome = [...todasCategorias]
    .filter((c) => c.exibir_home)
    .sort((a, b) => (a.ordem_home || 0) - (b.ordem_home || 0));

  // Matérias para cada editoria (em lote otimizado: 1 única consulta em vez de 15)
  const materiasPorCategoria = await getMateriasPorCategoriasHome(categoriasHome, 4);

  return (
    <div className="space-y-10">
      {/* 1. Publicidade Topo */}
      <AdSlot posicao="topo" />

      {/* 2. Top Hero Magazine: 3 Colunas Exatas da Referência */}
      <TopHeroMagazine
        destaques={destaques}
        manchetes={manchetes}
        recentes={maisRecentesHero}
      />

      {/* 3. Faixa Horizontal: Últimas de Empire Cidades (com scroll ‹ e ›) */}
      <FaixaUltimasNoticias
        materias={ultimasCarrossel}
        titulo="Últimas de Empire Cidades"
      />

      {/* 4. Banner Entre Blocos */}
      <div className="my-6">
        <AdSlot posicao="home_entre_blocos" />
      </div>

      {/* 4.1 Vitrine de Classificados em Destaque na Home */}
      <ClassificadosHomeSection classificados={classificadosDestaque} />

      {/* 4.2 Cobertura Nacional de Notícias por Estado e Município (Foco e Destaques Prioritários) */}
      <BlocoCidadesEstadosHome cidades={cidades} />

      {/* 5. Corpo Principal: Blocos de Editorias + Rail Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Principal (Editorias de Notícias) */}
        <div className="lg:col-span-8 space-y-2 min-w-0">
          {materiasPorCategoria.map(
            ({ categoria, materias }) =>
              materias.length > 0 && (
                <BlocoEditoria
                  key={categoria.id}
                  categoria={categoria}
                  materias={materias}
                />
              )
          )}
        </div>

        {/* Rail Lateral: Mais Lidas, TV ao Vivo, Colunistas, Anúncio */}
        <aside className="lg:col-span-4 space-y-6 min-w-0">
          {/* Mais Lidas com Ranking */}
          <SidebarMaisLidas materias={maisLidas} />

          {/* TV ao Vivo (se cadastrada) */}
          {portal?.youtube_live_url && (
            <div className="bg-[#111622] text-white rounded-xl p-4 shadow-md space-y-3 border border-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  TV ao Vivo · Transmissão Regional
                </h3>
              </div>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                <iframe
                  src={portal.youtube_live_url}
                  title="TV ao Vivo"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Colunistas da Região */}
          {colunas.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="border-b-2 border-[#c8102e] pb-2">
                <h3 className="text-[14px] font-black uppercase tracking-wide text-slate-900 dark:text-white">
                  ★ Colunistas da Região
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {colunas.slice(0, 4).map((col) => (
                  <Link
                    key={col.id}
                    href={`/coluna/${col.slug}`}
                    className="flex items-center gap-3 py-2.5 group hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-1 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#111622] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {col.capa_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={col.capa_url} alt={col.nome} className="w-full h-full object-cover" />
                      ) : (
                        col.nome.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#c8102e] transition-colors truncate">
                        {col.nome}
                      </h4>
                      {col.cidade && (
                        <span className="text-[10.5px] text-slate-400 block">
                          {col.cidade.nome} - {col.cidade.uf}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Banner Publicidade Lateral */}
          <AdSlot posicao="lateral" />

          {/* Widget WhatsApp VIP */}
          <a
            href={portal?.redes_sociais?.whatsapp || "https://wa.me/?text=Quero%20receber%20noticias%20do%20Empire%20Cidades"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold p-4 rounded-xl shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-black block leading-snug">
                Receba Notícias no WhatsApp
              </span>
              <span className="text-[11px] text-white/90 font-medium">
                Participe do nosso canal exclusivo
              </span>
            </div>
          </a>
        </aside>
      </div>

      {/* 6. Vídeos Rápidos (Shorts) */}
      {shorts.length > 0 && (
        <section className="my-10 bg-slate-100/60 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <Video className="w-5 h-5 text-[#c8102e]" />
            <h2 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">
              Vídeos Rápidos (Shorts)
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {shorts.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative shadow-md"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${item.youtube_id}`}
                  title={item.titulo}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. TV Ao Vivo — Transmissão da TV Empire */}
      <BlocoTvAoVivoHome />

      {/* 7.1 Rádio Ao Vivo — Transmissão Oficial */}
      <CardRadioAoVivo />

      {/* 8. Carrossel Apresentadores EmpireFlix (Estilo Netflix) */}
      <CarrosselEmpireFlix />
    </div>
  );
}
