import type { Metadata } from "next";
import Link from "next/link";
import { getRevistas } from "@/lib/portal/revistas-queries";
import { getMaterias } from "@/lib/portal/queries";
import { RevistasBuscaView } from "@/components/portal/revistas/RevistasBuscaView";
import { CardMateria } from "@/components/portal/CardMateria";
import { Newspaper, ChevronRight, BookOpen } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Revistas Empire Magazine — Edições Regionais e Especiais | Empire Cidades",
  description:
    "Confira as publicações digitais da Empire Magazine com matérias exclusivas, comércio regional, moda, gastronomia, agronegócio e cobertura das principais cidades.",
  keywords: [
    "revistas",
    "empire magazine",
    "revista digital",
    "edições especiais",
    "carmópolis de minas",
    "ribeirão preto",
    "25 de março",
    "brás",
    "moda",
    "negócios",
    "notícias regionais",
  ],
};

export default async function RevistasPublicPage() {
  const [revistas, ultimasNoticias] = await Promise.all([
    getRevistas(),
    getMaterias({ limit: 4 }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Banner Elegante (Fundo Branco com Tipografia Nítida) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/40 text-[#c8102e] font-black text-xs uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Empire Magazine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Revistas & Publicações Digitais
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Leia online as edições especiais da Empire Magazine com cobertura dos polos regionais, personalidades, empreendedorismo, moda e tendências.
              </p>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-[#c8102e] transition-colors">
                Início
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 dark:text-white font-bold">Revistas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Carrossel e Busca */}
      <div className="max-w-[1440px] mx-auto px-4 py-8 space-y-16">
        <RevistasBuscaView initialRevistas={revistas} />

        {/* Notícias do Portal no Rodapé */}
        {ultimasNoticias.length > 0 && (
          <section className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#c8102e] text-white flex items-center justify-center shadow-md">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Últimas Notícias no Portal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Acompanhe em tempo real o que acontece na sua cidade e no Brasil
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8102e] hover:underline"
              >
                <span>Ver todo o portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ultimasNoticias.map((materia) => (
                <CardMateria key={materia.id} materia={materia} variacao="medio" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
