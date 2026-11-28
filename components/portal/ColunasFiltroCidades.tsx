"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Menu,
  ChevronDown,
  Search,
  Check,
  X,
  MapPin,
} from "lucide-react";

export interface CidadeItem {
  id: string;
  nome: string;
  slug: string;
  uf?: string | null;
}

interface ColunasFiltroCidadesProps {
  cidades: CidadeItem[];
  cidadeAtiva?: string;
}

export function ColunasFiltroCidades({
  cidades,
  cidadeAtiva,
}: ColunasFiltroCidadesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cidade ativa selecionada
  const cidadeSelecionadaObj = useMemo(() => {
    if (!cidadeAtiva) return null;
    return cidades.find((c) => c.slug === cidadeAtiva) || null;
  }, [cidades, cidadeAtiva]);

  // Cidades filtradas pela busca interna do dropdown
  const cidadesFiltradas = useMemo(() => {
    if (!termoBusca.trim()) return cidades;
    const t = termoBusca.toLowerCase().trim();
    return cidades.filter(
      (c) =>
        c.nome.toLowerCase().includes(t) ||
        (c.uf && c.uf.toLowerCase().includes(t)) ||
        c.slug.toLowerCase().includes(t)
    );
  }, [cidades, termoBusca]);

  return (
    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
      {/* 1. VISÃO CELULAR E TABLET (Menu Sanduíche Dropdown Compacto) */}
      <div className="block lg:hidden" ref={dropdownRef}>
        <div className="relative">
          {/* Botão Gatilho Estilo Sanduíche */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              isOpen
                ? "bg-slate-50 dark:bg-slate-800/90 border-amber-500 ring-2 ring-amber-400/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Ícone Menu Sanduíche */}
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center shrink-0">
                <Menu className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="flex flex-col text-left truncate">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Filtrar por Cidade
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {cidadeSelecionadaObj
                    ? `${cidadeSelecionadaObj.nome}${
                        cidadeSelecionadaObj.uf ? ` - ${cidadeSelecionadaObj.uf}` : ""
                      }`
                    : "Todas as Cidades"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pl-2">
              {cidadeAtiva && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  Ativo
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-amber-500" : ""
                }`}
              />
            </div>
          </button>

          {/* Tag de Filtro Ativo com Botão Limpar Rápido */}
          {cidadeAtiva && !isOpen && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <span className="text-[11px] text-slate-500 font-medium">Filtrando:</span>
              <Link
                href="/colunas"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                title="Limpar filtro e ver todas as cidades"
              >
                <span>{cidadeSelecionadaObj?.nome || cidadeAtiva}</span>
                <X className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              </Link>
            </div>
          )}

          {/* Menu Dropdown Suspenso com Busca e Cidades */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Campo de Busca Rápida de Cidade */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar cidade..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                {termoBusca && (
                  <button
                    type="button"
                    onClick={() => setTermoBusca("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Lista com Rolagem Suave */}
              <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1 pr-1 overscroll-contain">
                {/* Opção: Todas as Cidades */}
                <Link
                  href="/colunas"
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    !cidadeAtiva
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 opacity-70" />
                    <span>Todas as Cidades</span>
                  </span>
                  {!cidadeAtiva && <Check className="w-4 h-4 text-slate-950 font-black" />}
                </Link>

                {/* Lista de Cidades */}
                {cidadesFiltradas.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Nenhuma cidade encontrada para &quot;{termoBusca}&quot;.
                  </div>
                ) : (
                  cidadesFiltradas.map((cid) => {
                    const isSelected = cidadeAtiva === cid.slug;
                    return (
                      <Link
                        key={cid.id}
                        href={`/colunas?cidade=${cid.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">
                          {cid.nome}
                          {cid.uf ? (
                            <span className="text-[10.5px] opacity-60 ml-1 font-mono">
                              ({cid.uf})
                            </span>
                          ) : null}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-slate-950 font-black shrink-0" />
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. VISÃO DESKTOP (Pills em Linha Ampla para Telas Grandes) */}
      <div className="hidden lg:flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 shrink-0">Filtrar por cidade:</span>

        <Link
          href="/colunas"
          className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-sm ${
            !cidadeAtiva
              ? "bg-amber-500 text-slate-950 shadow-amber-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Todas
        </Link>

        {cidades.map((cid) => {
          const isSelected = cidadeAtiva === cid.slug;
          return (
            <Link
              key={cid.id}
              href={`/colunas?cidade=${cid.slug}`}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                isSelected
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cid.nome}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
