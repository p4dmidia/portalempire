import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getColunasAtivas, getCidades, getPortalData } from "@/lib/portal/queries";
import { getClassificadosPorPagina } from "@/lib/portal/classificados-queries";
import { ClassificadosFaixaSection } from "@/components/portal/ClassificadosFaixaSection";
import { BotaoFavoritarColuna } from "@/components/portal/BotaoFavoritarColuna";
import {
  User,
  MapPin,
  Sparkles,
  ChevronRight,
  Award,
  Megaphone,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPortalData();
  return {
    title: `Colunistas e Colunas Municipais — ${portal?.nome || "Portal Empire"}`,
    description: "Opinião, análises, artigos de especialistas e bastidores das cidades.",
  };
}

export default async function ColunasIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const { cidade } = await searchParams;
  const [colunas, cidades, classificados] = await Promise.all([
    getColunasAtivas(cidade),
    getCidades(),
    getClassificadosPorPagina("colunas", 4),
  ]);

  return (
    <div className="space-y-10">
      {/* Cabeçalho com Botão Destaque para Página de Vendas de Colunista */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Opinião & Cobertura Especial</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Nossas Colunas & Colunistas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Artigos exclusivos, visão crítica e análise dos principais acontecimentos das cidades.
            </p>
          </div>

          <Link
            href={cidade ? `/seja-colunista?cidade=${encodeURIComponent(cidade)}` : "/seja-colunista"}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>Quero Ser um Colunista</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filtro por Cidade */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400">Filtrar por cidade:</span>
          <Link
            href="/colunas"
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              !cidade
                ? "bg-primary text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Todas
          </Link>
          {cidades.map((cid) => (
            <Link
              key={cid.id}
              href={`/colunas?cidade=${cid.slug}`}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                cidade === cid.slug
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cid.nome}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid de Colunas */}
      {colunas.length === 0 ? (
        <div className="p-10 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Nenhuma coluna ativa encontrada para este filtro no momento.
          </p>
          <div className="max-w-lg mx-auto space-y-3 pt-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Quer representar esta cidade ou região no Portal Empire Cidades?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Faça a cobertura local, venda espaços publicitários no portal e receba R$ 50,00/mês
              de comissão recorrente por cada novo colunista indicado!
            </p>
            <div className="pt-2">
              <Link
                href={cidade ? `/seja-colunista?cidade=${encodeURIComponent(cidade)}` : "/seja-colunista"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-sm"
              >
                <span>Conhecer Oportunidade para Colunistas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colunas.map((col) => {
            const autor = col.dono;
            return (
              <Link
                key={col.id}
                href={`/coluna/${col.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-amber-400/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Banner de Capa em Alta Definição */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  {col.capa_url ? (
                    <Image
                      src={col.capa_url}
                      alt={col.nome}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-amber-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {col.cidade && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm">
                      <MapPin className="w-3 h-3 text-amber-400" /> {col.cidade.nome} - {col.cidade.uf}
                    </span>
                  )}
                </div>

                {/* Conteúdo do Card com Avatar Sobreposto */}
                <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-end justify-between -mt-10 mb-3">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xl shrink-0">
                        {autor?.foto_url ? (
                          <Image
                            src={autor.foto_url}
                            alt={autor.nome || col.nome}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl">
                            {(autor?.nome || col.nome).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/30 px-2.5 py-1 rounded-full shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Colunista Oficial
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                      {col.nome}
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      Por <strong className="text-slate-800 dark:text-slate-200">{autor?.nome || "Colunista Licenciado"}</strong>
                    </p>

                    {col.descricao && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        {col.descricao}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
                      Acessar Coluna
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>

                    {/* Botão Interativo de Favoritar com 90 Dias Grátis */}
                    <BotaoFavoritarColuna
                      colunaId={col.id}
                      colunaNome={col.nome}
                      colunaSlug={col.slug}
                      autorNome={autor?.nome}
                      autorFoto={autor?.foto_url}
                      cidadeNome={col.cidade ? `${col.cidade.nome} - ${col.cidade.uf}` : undefined}
                      capaUrl={col.capa_url}
                      variacao="card"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Classificados vinculados à página de Colunas / Colunistas */}
      <ClassificadosFaixaSection
        classificados={classificados}
        titulo="Classificados & Negócios dos Colunistas"
      />

      {/* Banner de Conversão — Seja um Colunista Licenciado */}
      <section className="rounded-3xl bg-white text-slate-900 p-7 sm:p-10 border-2 border-amber-400 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Estamos Captando Licenciados & Colunistas</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              Agora sua cidade tem um espaço para ser vista!{" "}
              <span className="text-amber-600">Seja um Colunista Empire Cidades</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Faça a cobertura da sua cidade ou região (pode haver mais de um colunista por
              localidade), comercialize espaços publicitários no portal e ganhe{" "}
              <strong className="text-amber-700">
                R$ 50,00 por mês de recorrência por cada novo colunista indicado
              </strong>
              . Investimento de apenas <strong className="text-slate-900">R$ 250,00/mês</strong>.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" /> Cobertura Regional Livre
              </span>
              <span className="flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-emerald-600" /> Venda de Banners Locais
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-600" /> R$ 50/mês por Indicado Ativo
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <Link
              href="/seja-colunista"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-md transition-all text-center"
            >
              <span>Ver Página de Oportunidade</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/checkout/colunista"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all text-center"
            >
              <span>Assinar Agora no Checkout (R$ 250/mês)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
