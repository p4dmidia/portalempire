"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CidadeData } from "@/lib/portal/queries";
import { SLUGS_CIDADES_PRIORITARIAS } from "@/lib/portal/cidades-constantes";
import { MapPin, Search, Sparkles, ChevronRight, X, Building2, Globe2 } from "lucide-react";

interface BlocoCidadesEstadosHomeProps {
  cidades: CidadeData[];
}

// Estados principais em abas rápidas
const ESTADOS_PRINCIPAIS = [
  { uf: "TODOS", nome: "Todos os Estados" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PR", nome: "Paraná" },
  { uf: "GO", nome: "Goiás" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "BA", nome: "Bahia" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "DF", nome: "Distrito Federal" },
];

// Todas as 27 UFs do Brasil agrupadas por Região para o seletor complementar
const REGIOES_BRASIL = [
  {
    regiao: "Sudeste",
    estados: [
      { uf: "SP", nome: "São Paulo" },
      { uf: "MG", nome: "Minas Gerais" },
      { uf: "RJ", nome: "Rio de Janeiro" },
      { uf: "ES", nome: "Espírito Santo" },
    ],
  },
  {
    regiao: "Sul",
    estados: [
      { uf: "PR", nome: "Paraná" },
      { uf: "SC", nome: "Santa Catarina" },
      { uf: "RS", nome: "Rio Grande do Sul" },
    ],
  },
  {
    regiao: "Centro-Oeste",
    estados: [
      { uf: "GO", nome: "Goiás" },
      { uf: "MS", nome: "Mato Grosso do Sul" },
      { uf: "MT", nome: "Mato Grosso" },
      { uf: "DF", nome: "Distrito Federal" },
    ],
  },
  {
    regiao: "Nordeste",
    estados: [
      { uf: "BA", nome: "Bahia" },
      { uf: "PI", nome: "Piauí" },
      { uf: "PE", nome: "Pernambuco" },
      { uf: "CE", nome: "Ceará" },
      { uf: "MA", nome: "Maranhão" },
      { uf: "PB", nome: "Paraíba" },
      { uf: "RN", nome: "Rio Grande do Norte" },
      { uf: "AL", nome: "Alagoas" },
      { uf: "SE", nome: "Sergipe" },
    ],
  },
  {
    regiao: "Norte",
    estados: [
      { uf: "AM", nome: "Amazonas" },
      { uf: "PA", nome: "Pará" },
      { uf: "RO", nome: "Rondônia" },
      { uf: "AC", nome: "Acre" },
      { uf: "TO", nome: "Tocantins" },
      { uf: "AP", nome: "Amapá" },
      { uf: "RR", nome: "Roraima" },
    ],
  },
];

export function BlocoCidadesEstadosHome({ cidades }: BlocoCidadesEstadosHomeProps) {
  const [selectedUf, setSelectedUf] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cidades em destaque prioritário para a barra de atalhos rápidos de 1 clique
  const cidadesEmDestaque = useMemo(() => {
    return cidades.filter((c) => SLUGS_CIDADES_PRIORITARIAS.has(c.slug));
  }, [cidades]);

  // Contagem de cidades cadastradas por UF
  const contagemPorUf = useMemo(() => {
    const mapa: Record<string, number> = { TODOS: cidades.length };
    cidades.forEach((c) => {
      mapa[c.uf] = (mapa[c.uf] || 0) + 1;
    });
    return mapa;
  }, [cidades]);

  // Filtragem dinâmica por UF e Busca
  const cidadesFiltradas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return cidades.filter((cid) => {
      // Filtro de Estado
      const matchUf = selectedUf === "TODOS" || cid.uf === selectedUf;

      // Filtro de Busca
      const matchSearch =
        !q ||
        cid.nome.toLowerCase().includes(q) ||
        cid.uf.toLowerCase().includes(q) ||
        cid.palavras_chave?.some((p) => p.toLowerCase().includes(q));

      return matchUf && matchSearch;
    });
  }, [cidades, selectedUf, searchQuery]);

  return (
    <section className="bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-900 dark:to-slate-950 p-5 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
      {/* 1. Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#c8102e] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#c8102e] animate-pulse" />
            <MapPin className="w-4 h-4" />
            <span>Cobertura Regional em Todo o Brasil</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Notícias por Estado e Município
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Selecione seu estado ou município para acompanhar em tempo real as notícias locais, política, trânsito, obras e artigos de colunistas da sua região.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/cidades"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-[#c8102e] hover:text-white transition-all shadow-sm group"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Ver Todas as Regiões</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* 2. Atalhos Rápidos de 1 Clique: Cidades em Alta / Prioritárias */}
      <div className="bg-slate-900 text-white dark:bg-black/40 rounded-xl p-3 sm:p-3.5 border border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>Cidades em Evidência (Acesso Rápido):</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Clique para ler notícias locais instantâneas
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 whitespace-nowrap">
          {cidadesEmDestaque.map((cid) => (
            <Link
              key={cid.slug}
              href={`/cidade/${cid.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 text-slate-200 transition-all border border-white/10 hover:border-amber-400/60 shadow-sm shrink-0 active:scale-95 group"
            >
              <span className="text-[10px] uppercase font-black text-amber-300 group-hover:text-slate-950">
                {cid.uf}
              </span>
              <span>{cid.nome}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Barra de Controles: Busca Instantânea + Seletor de Estados */}
      <div className="space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Buscar por município ou estado (ex: Cotia, Uberaba, Maringá, SP...)"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e] shadow-inner transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Seletor Complementar de Qualquer Estado Brasileiro */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden xl:inline flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              Estado:
            </span>
            <select
              value={selectedUf}
              onChange={(e) => setSelectedUf(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 shadow-sm focus:outline-none focus:border-[#c8102e]"
            >
              <option value="TODOS">🇧🇷 Todos os Estados ({cidades.length})</option>
              {REGIOES_BRASIL.map((reg) => (
                <optgroup key={reg.regiao} label={`Região ${reg.regiao}`}>
                  {reg.estados.map((est) => (
                    <option key={est.uf} value={est.uf}>
                      {est.uf} - {est.nome} {contagemPorUf[est.uf] ? `(${contagemPorUf[est.uf]})` : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Abas Rápidas dos Estados de Maior Cobertura */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 whitespace-nowrap">
          {ESTADOS_PRINCIPAIS.map((est) => {
            const isSelected = selectedUf === est.uf;
            const total = contagemPorUf[est.uf] || 0;
            return (
              <button
                key={est.uf}
                onClick={() => setSelectedUf(est.uf)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#c8102e] text-white shadow-sm scale-105"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{est.uf === "TODOS" ? est.nome : `${est.uf} - ${est.nome}`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Grade Responsiva de Cards de Municípios */}
      {cidadesFiltradas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
          {cidadesFiltradas.map((cid) => {
            const isPrio = SLUGS_CIDADES_PRIORITARIAS.has(cid.slug);
            return (
              <Link
                key={cid.id}
                href={`/cidade/${cid.slug}`}
                className={`group p-3 rounded-xl border transition-all flex flex-col justify-between text-left hover:-translate-y-0.5 shadow-sm relative overflow-hidden ${
                  isPrio
                    ? "bg-white dark:bg-slate-900 border-amber-500/40 hover:border-[#c8102e] hover:shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#c8102e]"
                }`}
              >
                {/* Faixa sutil no topo para cidades prioritárias */}
                {isPrio && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-[#c8102e]" />
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {cid.uf}
                    </span>
                    {isPrio && (
                      <span className="text-[9px] font-extrabold text-amber-500 dark:text-amber-400 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 fill-current" /> Destaque
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-[13px] leading-tight text-slate-900 dark:text-white group-hover:text-[#c8102e] transition-colors truncate" title={cid.nome}>
                    {cid.nome}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-[#c8102e] group-hover:translate-x-0.5 transition-transform">
                  <span>Acessar</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Nenhum município encontrado com o filtro aplicado.
          </p>
          <button
            onClick={() => {
              setSelectedUf("TODOS");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-[#c8102e] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Limpar Filtros e Mostrar Todas as Cidades
          </button>
        </div>
      )}
    </section>
  );
}
