"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { CategoriaData, CidadeData, PortalData } from "@/lib/portal/queries";
import { Search, Menu, X, ChevronDown, Tag, ShoppingBag } from "lucide-react";
import { WidgetClimaHeader } from "@/components/portal/WidgetClimaHeader";

const TEMAS_EDITORIAIS = [
  { nome: "Empreendedorismo", slug: "empreendedorismo" },
  { nome: "Negócios", slug: "negocios" },
  { nome: "Agronegócio", slug: "agronegocio" },
  { nome: "Saúde", slug: "saude" },
  { nome: "Educação", slug: "educacao" },
];

interface HeaderProps {
  portal: PortalData | null;
  categorias: CategoriaData[];
  cidades: CidadeData[];
}

export function Header({ portal, categorias, cidades }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fecha dropdowns ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Foca no input quando abre busca
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
  };

  // Outras categorias que vão para o dropdown "+ Mais"
  const catMais = categorias.filter(
    (c) =>
      c.slug !== "noticias" &&
      c.slug !== "politica" &&
      c.slug !== "economia" &&
      c.slug !== "cidades" &&
      c.slug !== "policia" &&
      c.slug !== "esportes" &&
      !c.pai_id // apenas categorias raiz no menu Mais
  );

  const cidadesDestaque = cidades.filter((c) => c.destaque_menu).slice(0, 8);

  return (
    <header className="relative bg-[#111622] text-white">
      {/* 1. Barra Principal de Navegação (Fixa no Topo, 58px) */}
      <div className="sticky top-0 z-50 bg-[#111622] text-white shadow-md border-t-[3px] border-[#c8102e]">
        <div className="max-w-[1300px] mx-auto px-4 flex items-center justify-between gap-3 h-[58px]">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center shrink-0 py-1">
            <Image
              src={portal?.logo_url || "/logo.png"}
              alt={portal?.nome || "Empire Cidades — Portal de Notícias"}
              width={190}
              height={60}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>

        {/* 2. Navegação Desktop (Estilo Magazine Exato) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-full">
          {/* Início */}
          <Link
            href="/"
            className={`relative flex items-center h-full px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors group ${
              pathname === "/" ? "text-white" : ""
            }`}
          >
            <span>Início</span>
            <span
              className={`absolute bottom-0 left-3 right-3 h-[3px] bg-[#c8102e] transition-transform duration-200 ${
                pathname === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>

          {/* Notícias com Dropdown */}
          <div className="relative h-full flex items-center group">
            <Link
              href="/categoria/noticias"
              className="relative flex items-center gap-1 h-full px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors"
            >
              <span>Notícias</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-200" />
              <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>

            {/* Dropdown Notícias */}
            <div className="absolute top-full left-0 hidden group-hover:block bg-white text-slate-900 min-w-[210px] rounded-b-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <Link
                href="/categoria/geral"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Geral
              </Link>
              <Link
                href="/categoria/brasil"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Brasil
              </Link>
              <Link
                href="/categoria/internacional"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Internacional
              </Link>
            </div>
          </div>

          {/* Política com Dropdown */}
          <div className="relative h-full flex items-center group">
            <Link
              href="/categoria/politica"
              className="relative flex items-center gap-1 h-full px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors"
            >
              <span>Política</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-200" />
              <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>

            <div className="absolute top-full left-0 hidden group-hover:block bg-white text-slate-900 min-w-[200px] rounded-b-xl shadow-2xl border border-slate-100 py-2 z-50">
              <Link
                href="/categoria/governo"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Governo & Gestão
              </Link>
              <Link
                href="/categoria/politica"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Eleições & Bastidores
              </Link>
            </div>
          </div>

          {/* Economia com Dropdown Expandido (Negócios, Empreendedorismo, Agro) */}
          <div className="relative h-full flex items-center group">
            <Link
              href="/categoria/economia"
              className="relative flex items-center gap-1 h-full px-2.5 xl:px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors"
            >
              <span>Economia</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-200" />
              <span className="absolute bottom-0 left-2.5 right-2.5 xl:left-3 xl:right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>

            <div className="absolute top-full left-0 hidden group-hover:block bg-white text-slate-900 min-w-[210px] rounded-b-xl shadow-2xl border border-slate-100 py-2 z-50">
              <Link
                href="/categoria/economia"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Economia Geral
              </Link>
              <Link
                href="/categoria/negocios"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Negócios & Mercado
              </Link>
              <Link
                href="/categoria/empreendedorismo"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Empreendedorismo
              </Link>
              <Link
                href="/categoria/agronegocio"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Agronegócio
              </Link>
            </div>
          </div>

          {/* Gastronomia */}
          <Link
            href="/categoria/gastronomia"
            className="relative flex items-center h-full px-2.5 xl:px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors group"
          >
            <span>Gastronomia</span>
            <span className="absolute bottom-0 left-2.5 right-2.5 xl:left-3 xl:right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>

          {/* Turismo */}
          <Link
            href="/categoria/turismo"
            className="relative flex items-center h-full px-2.5 xl:px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors group"
          >
            <span>Turismo</span>
            <span className="absolute bottom-0 left-2.5 right-2.5 xl:left-3 xl:right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>

          {/* Beleza & Estética com Dropdown */}
          <div className="relative h-full flex items-center group">
            <Link
              href="/categoria/beleza"
              className="relative flex items-center gap-1 h-full px-2.5 xl:px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors"
            >
              <span>Beleza & Estética</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-200" />
              <span className="absolute bottom-0 left-2.5 right-2.5 xl:left-3 xl:right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>

            <div className="absolute top-full left-0 hidden group-hover:block bg-white text-slate-900 min-w-[200px] rounded-b-xl shadow-2xl border border-slate-100 py-2 z-50">
              <Link
                href="/categoria/beleza"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Beleza & Cuidados
              </Link>
              <Link
                href="/categoria/estetica"
                className="block px-4 py-2 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
              >
                Estética & Bem-Estar
              </Link>
            </div>
          </div>

          {/* Cidades com Dropdown */}
          <div className="relative h-full flex items-center group">
            <Link
              href="/cidades"
              className="relative flex items-center gap-1 h-full px-2.5 xl:px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors"
            >
              <span>Cidades</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-200" />
              <span className="absolute bottom-0 left-2.5 right-2.5 xl:left-3 xl:right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>

            <div className="absolute top-full left-0 hidden group-hover:block bg-white text-slate-900 min-w-[240px] rounded-b-xl shadow-2xl border border-slate-100 py-2.5 z-50">
              <div className="px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Principais Regiões
              </div>
              {cidadesDestaque.map((cid) => (
                <Link
                  key={cid.id}
                  href={`/cidade/${cid.slug}`}
                  className="block px-4 py-1.5 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
                >
                  {cid.nome}
                </Link>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1.5 px-4">
                <Link
                  href="/cidades"
                  className="block text-[12px] font-bold text-[#c8102e] hover:underline"
                >
                  Ver todas as cidades →
                </Link>
              </div>
            </div>
          </div>

          {/* Esportes */}
          <Link
            href="/categoria/esportes"
            className="relative flex items-center h-full px-2.5 xl:px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors group"
          >
            <span>Esportes</span>
            <span className="absolute bottom-0 left-2.5 right-2.5 xl:left-3 xl:right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>

          {/* + Mais Dropdown */}
          <div className="relative h-full flex items-center group">
            <button className="relative flex items-center gap-1 h-full px-3 text-[13px] font-bold uppercase tracking-wider text-slate-100 hover:text-white transition-colors cursor-pointer">
              <span>+ Mais</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-200" />
              <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#c8102e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </button>

            <div className="absolute top-full right-0 hidden group-hover:block bg-white text-slate-900 min-w-[230px] rounded-b-xl shadow-2xl border border-slate-100 py-2.5 z-50">
              <Link
                href="/colunas"
                className="block px-4 py-2 text-[13px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 transition-colors border-b border-slate-100 mb-1"
              >
                ★ Colunistas da Região
              </Link>
              {catMais.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="block px-4 py-1.5 text-[13px] font-semibold text-slate-800 hover:text-[#c8102e] hover:bg-slate-50 transition-colors"
                >
                  {cat.nome}
                </Link>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1.5 px-4 space-y-1">
                <Link
                  href="/anuncie"
                  className="block text-[12px] font-semibold text-slate-600 hover:text-[#c8102e]"
                >
                  Anuncie Conosco
                </Link>
                <Link
                  href="/painel"
                  className="block text-[12px] font-bold text-[#c8102e] hover:underline"
                >
                  Área do Redator
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* 3. Ações Direita (Botão Classificados Destaque + Busca + Menu Mobile) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Botão de Classificados em Destaque */}
          <Link
            href="/classificados"
            className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-sm shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-105 active:scale-95 border border-amber-300/60"
            title="Classificados — Vendas, Imóveis, Autos e Oportunidades"
          >
            <Tag className="w-3.5 h-3.5 fill-current" />
            <span>Classificados</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8102e]"></span>
            </span>
          </Link>

          {/* Botão de Busca Redondo */}
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Buscar"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#c8102e] flex items-center justify-center text-white transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Buscar notícias"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Botão Hambúrguer Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 lg:hidden text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>

      {/* 2. Barra de Temas e Editorias em Destaque no Cabeçalho + Clima das Cidades */}
      <div className="bg-[#0b0e17] border-t border-white/5 border-b border-black/40 py-1 sm:py-1.5 px-4 shadow-inner overflow-hidden">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-3">
          {/* Temas em Alta (com scroll horizontal) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none whitespace-nowrap min-w-0 flex-1">
            <span className="text-[#c8102e] font-black uppercase text-[10.5px] sm:text-[11px] tracking-wider shrink-0 flex items-center gap-1.5 pr-2.5 border-r border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#c8102e] animate-pulse" />
              Temas em Alta:
            </span>
            {TEMAS_EDITORIAIS.map((tema) => {
              const isActive = pathname === `/categoria/${tema.slug}`;
              return (
                <Link
                  key={tema.slug}
                  href={`/categoria/${tema.slug}`}
                  className={`px-2 py-0.5 rounded text-[11.5px] font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#c8102e] text-white font-bold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tema.nome}
                </Link>
              );
            })}
          </div>

          {/* Widget de Clima e Tempo em Tempo Real (Cidades Aleatórias e Rotativas) */}
          <WidgetClimaHeader />
        </div>
      </div>

      {/* 4. Modal de Busca Elegante */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
          <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pesquisar no Empire Cidades
              </span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Digite palavras-chave, cidades, temas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 text-white placeholder-slate-400 text-base rounded-xl pl-11 pr-4 py-3 border border-white/15 focus:outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
              <span>Termos populares:</span>
              {["Eleições", "Manaus", "Clima", "Tempestades", "Economia"].map((termo) => (
                <button
                  key={termo}
                  type="button"
                  onClick={() => {
                    router.push(`/busca?q=${encodeURIComponent(termo)}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#c8102e] hover:text-white text-slate-300 transition-colors"
                >
                  {termo}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Menu Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#111622] max-h-[85vh] overflow-y-auto px-5 py-6 space-y-5">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar notícias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-white/15 focus:outline-none focus:border-[#c8102e]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Destaque Especial Classificados Mobile */}
          <Link
            href="/classificados"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-600/15 to-transparent border border-amber-500/40 text-amber-300 font-bold shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Tag className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="block text-sm font-extrabold text-amber-200 uppercase tracking-wide">Classificados</span>
                <span className="block text-[11px] text-amber-300/80 font-medium">Imóveis, Veículos, Negócios & Serviços</span>
              </div>
            </div>
            <span className="text-[11px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              Ver →
            </span>
          </Link>

          <div className="space-y-1 border-b border-white/10 pb-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold uppercase rounded-lg hover:bg-white/5 text-white"
            >
              Início
            </Link>
            <Link
              href="/categoria/noticias"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold uppercase rounded-lg hover:bg-white/5 text-white"
            >
              Notícias
            </Link>
            <Link
              href="/categoria/politica"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold uppercase rounded-lg hover:bg-white/5 text-white"
            >
              Política
            </Link>
            <Link
              href="/categoria/economia"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold uppercase rounded-lg hover:bg-white/5 text-white"
            >
              Economia
            </Link>
            <Link
              href="/categoria/policia"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold uppercase rounded-lg hover:bg-white/5 text-white"
            >
              Polícia
            </Link>
            <Link
              href="/categoria/esportes"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold uppercase rounded-lg hover:bg-white/5 text-white"
            >
              Esportes
            </Link>
          </div>

          {/* Temas e Editorias no Mobile */}
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block px-3">
              Temas & Editorias
            </span>
            <div className="grid grid-cols-2 gap-1 px-1">
              {TEMAS_EDITORIAIS.map((tema) => (
                <Link
                  key={tema.slug}
                  href={`/categoria/${tema.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded flex items-center justify-between"
                >
                  <span>{tema.nome}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8102e]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Cidades no Mobile */}
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block px-3">
              Cidades
            </span>
            <div className="grid grid-cols-2 gap-1 px-1">
              {cidadesDestaque.map((cid) => (
                <Link
                  key={cid.id}
                  href={`/cidade/${cid.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded"
                >
                  {cid.nome}
                </Link>
              ))}
            </div>
            <Link
              href="/cidades"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 pt-1 text-xs text-[#c8102e] font-bold"
            >
              Ver todas as cidades →
            </Link>
          </div>

          {/* Colunas e Mais */}
          <div className="space-y-1">
            <Link
              href="/colunas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-amber-400 hover:bg-white/5 rounded-lg"
            >
              ★ Colunistas da Região
            </Link>
            <Link
              href="/anuncie"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 rounded-lg"
            >
              Anuncie no Portal
            </Link>
            <Link
              href="/painel"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-[#c8102e] hover:bg-white/5 rounded-lg"
            >
              Área do Redator / Painel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
