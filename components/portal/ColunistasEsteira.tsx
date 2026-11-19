"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ColunaData } from "@/lib/portal/queries";
import { User, MapPin, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

interface ColunistasEsteiraProps {
  colunas: ColunaData[];
}

/**
 * Esteira contínua de colunistas em loop infinito com efeito marquee.
 * Pausa suavemente ao passar o mouse para leitura e clique confortável.
 */
export function ColunistasEsteira({ colunas }: ColunistasEsteiraProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!colunas || colunas.length === 0) return null;

  // Garante quantidade mínima de itens no loop para a esteira nunca ficar com buraco vazio
  let poolColunas = [...colunas];
  while (poolColunas.length < 8) {
    poolColunas = [...poolColunas, ...colunas];
  }

  // Duplicamos o conjunto para permitir a transição infinita perfeita do CSS (0% a -50%)
  const itensDuplicados = [...poolColunas, ...poolColunas];

  const scrollManual = (direcao: "esquerda" | "direita") => {
    if (!containerRef.current) return;
    const offset = direcao === "esquerda" ? -340 : 340;
    containerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="relative my-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl p-6 sm:p-8 overflow-hidden group/esteira">
      {/* Luz ambiente de fundo */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho da Seção */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vozes de Impacto · Rede de Colunistas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Colunistas & Opinião Exclusiva
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Grandes nomes do jornalismo, negócios, turismo, comportamento e análises regionais.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/colunas"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 uppercase tracking-wider bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/60"
          >
            <span>Ver todas as colunas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Botões de Navegação Manual */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollManual("esquerda")}
              aria-label="Voltar colunistas"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollManual("direita")}
              aria-label="Avançar colunistas"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trilho da Esteira em Loop Infinito */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto scrollbar-none py-2"
      >
        <div className="animate-esteira-colunas flex items-stretch gap-5">
          {itensDuplicados.map((col, idx) => {
            const autor = col.dono;
            return (
              <Link
                key={`${col.id}-${idx}`}
                href={`/coluna/${col.slug}`}
                className="w-[280px] sm:w-[310px] shrink-0 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/60 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-amber-500/10 group/card min-w-0 overflow-hidden relative"
              >
                {/* Destaque sutil de topo */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

                {/* Avatar / Foto do Colunista */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/80 mb-3 bg-slate-800 shrink-0 shadow-md group-hover/card:border-amber-400 transition-colors">
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

                {/* Nome da Coluna */}
                <h3 className="font-bold text-base text-white group-hover/card:text-amber-300 transition-colors w-full truncate">
                  {col.nome}
                </h3>

                {/* Nome do Colunista */}
                <p className="text-xs text-slate-300 mt-0.5 font-medium w-full truncate">
                  Por {autor?.nome || "Colunista Oficial"}
                </p>

                {/* Cidade / Estado */}
                {col.cidade && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 mt-2 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full max-w-full truncate">
                    <MapPin className="w-3 h-3 shrink-0 text-amber-400" />
                    <span className="truncate">{col.cidade.nome} - {col.cidade.uf}</span>
                  </span>
                )}

                {/* Descrição com proteção total contra quebra e sobreposição */}
                {col.descricao && (
                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed w-full break-words break-all [overflow-wrap:anywhere] overflow-hidden">
                    {col.descricao}
                  </p>
                )}

                {/* Botão de Ação */}
                <span className="mt-4 pt-3 border-t border-slate-800/80 w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-400 group-hover/card:text-amber-400 transition-colors">
                  <span>Acessar Coluna</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
