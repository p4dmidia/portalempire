import type { Metadata } from "next";
import Link from "next/link";
import { getClassificados } from "@/lib/portal/classificados-queries";
import { getMaterias } from "@/lib/portal/queries";
import { ClassificadosView } from "@/components/portal/ClassificadosView";
import { CardMateria } from "@/components/portal/CardMateria";
import { Newspaper, ChevronRight } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Classificados — Imóveis, Veículos, Negócios e Oportunidades | Empire Cidades",
  description:
    "Anúncios classificados da sua região. Encontre casas, apartamentos, carros, motos, pontos comerciais, prestação de serviços e vagas de emprego com contato direto no WhatsApp.",
  keywords: [
    "classificados",
    "imóveis alphaville",
    "carros são paulo",
    "veículos",
    "vendas",
    "aluguel",
    "negócios",
    "oportunidades",
    "serviços",
  ],
};

export default async function ClassificadosPage() {
  const [classificados, ultimasNoticias] = await Promise.all([
    getClassificados(),
    getMaterias({ limit: 4 }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-[1300px] mx-auto px-4 py-8 space-y-16">
        {/* Conteúdo Principal de Anúncios e Filtros */}
        <ClassificadosView initialClassificados={classificados} />

        {/* Rodapé: Notícias da Região conforme solicitado */}
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
                  Fique por dentro dos principais acontecimentos enquanto navega pelos anúncios
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8102e] hover:underline"
            >
              <span>Ver todas as notícias</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ultimasNoticias.map((materia) => (
              <CardMateria key={materia.id} materia={materia} variacao="medio" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
