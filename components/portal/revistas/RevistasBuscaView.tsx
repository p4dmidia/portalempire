"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  BookOpen,
  MapPin,
  User,
  ExternalLink,
  Calendar,
  Filter,
  X,
  Sparkles,
} from "lucide-react";
import { RevistaData, CATEGORIAS_REVISTAS } from "@/lib/portal/revistas-types";
import { CarrosselRevistas } from "./CarrosselRevistas";

interface RevistasBuscaViewProps {
  initialRevistas: RevistaData[];
}

export function RevistasBuscaView({ initialRevistas }: RevistasBuscaViewProps) {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("Todas");
  const [escritorSelecionado, setEscritorSelecionado] = useState("Todos");

  // Lista de cidades únicas existentes no catálogo
  const cidadesDisponiveis = useMemo(() => {
    const setCidades = new Set<string>();
    initialRevistas.forEach((r) => {
      if (r.cidade) setCidades.add(r.cidade);
    });
    return ["Todas", ...Array.from(setCidades).sort()];
  }, [initialRevistas]);

  // Lista de escritores únicos existentes no catálogo
  const escritoresDisponiveis = useMemo(() => {
    const setEscritores = new Set<string>();
    initialRevistas.forEach((r) => {
      if (r.escritor) setEscritores.add(r.escritor);
    });
    return ["Todos", ...Array.from(setEscritores).sort()];
  }, [initialRevistas]);

  // Revistas em Destaque para o Carrossel do Topo
  const revistasDestaque = useMemo(() => {
    const destaques = initialRevistas.filter((r) => r.destaque && r.ativo);
    return destaques.length > 0 ? destaques : initialRevistas.slice(0, 6);
  }, [initialRevistas]);

  // Revistas filtradas pela busca
  const revistasFiltradas = useMemo(() => {
    return initialRevistas.filter((rev) => {
      if (!rev.ativo) return false;

      // Filtro de Categoria
      if (
        categoriaAtiva !== "Todas" &&
        rev.categoria.toLowerCase() !== categoriaAtiva.toLowerCase()
      ) {
        return false;
      }

      // Filtro de Cidade
      if (
        cidadeSelecionada !== "Todas" &&
        rev.cidade?.toLowerCase() !== cidadeSelecionada.toLowerCase()
      ) {
        return false;
      }

      // Filtro de Escritor
      if (
        escritorSelecionado !== "Todos" &&
        !rev.escritor?.toLowerCase().includes(escritorSelecionado.toLowerCase())
      ) {
        return false;
      }

      // Busca por Texto Livre
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const coincideTitulo = rev.titulo.toLowerCase().includes(termo);
        const coincideSubtitulo =
          rev.subtitulo?.toLowerCase().includes(termo) || false;
        const coincideCidade =
          rev.cidade?.toLowerCase().includes(termo) || false;
        const coincideEscritor =
          rev.escritor?.toLowerCase().includes(termo) || false;
        const coincideCategoria = rev.categoria.toLowerCase().includes(termo);

        if (
          !coincideTitulo &&
          !coincideSubtitulo &&
          !coincideCidade &&
          !coincideEscritor &&
          !coincideCategoria
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    initialRevistas,
    busca,
    categoriaAtiva,
    cidadeSelecionada,
    escritorSelecionado,
  ]);

  const limparFiltros = () => {
    setBusca("");
    setCategoriaAtiva("Todas");
    setCidadeSelecionada("Todas");
    setEscritorSelecionado("Todos");
  };

  const temFiltroAtivo =
    busca.trim() !== "" ||
    categoriaAtiva !== "Todas" ||
    cidadeSelecionada !== "Todas" ||
    escritorSelecionado !== "Todos";

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* 1. CARROSSEL DE ÚLTIMAS PUBLICAÇÕES (Estilo Conecte Online Exato) */}
      <CarrosselRevistas revistas={revistasDestaque} tituloSecao="Últimas publicações" />

      {/* 2. ÁREA DE BUSCA E FILTROS DINÂMICOS */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8102e]/10 text-[#c8102e] font-extrabold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acervo Editorial Completo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Pesquisar Edições & Revistas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Encontre publicações por nome da revista, cidade, colunista/escritor ou tema de interesse.
            </p>
          </div>

          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer self-start md:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Linha de Inputs: Campo de Busca + Cidade + Escritor */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Input de Busca */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome da revista, cidade, escritor ou palavra-chave..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50 transition-all"
            />
          </div>

          {/* Filtro por Cidade */}
          <div className="relative md:col-span-3">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50 cursor-pointer appearance-none"
            >
              <option value="Todas">Todas as Cidades</option>
              {cidadesDisponiveis
                .filter((c) => c !== "Todas")
                .map((cid) => (
                  <option key={cid} value={cid}>
                    {cid}
                  </option>
                ))}
            </select>
          </div>

          {/* Filtro por Escritor */}
          <div className="relative md:col-span-3">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={escritorSelecionado}
              onChange={(e) => setEscritorSelecionado(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50 cursor-pointer appearance-none"
            >
              <option value="Todos">Todos os Escritores</option>
              {escritoresDisponiveis
                .filter((e) => e !== "Todos")
                .map((esc) => (
                  <option key={esc} value={esc}>
                    {esc}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Pílulas de Categorias */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 pt-1">
          {CATEGORIAS_REVISTAS.map((cat) => {
            const isAtiva = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isAtiva
                    ? "bg-[#c8102e] text-white shadow-sm shadow-red-900/30 scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. GRADE COMPLETA DE REVISTAS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c8102e]" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Todas as Revistas & Edições
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {revistasFiltradas.length} {revistasFiltradas.length === 1 ? "edição" : "edições"}
          </span>
        </div>

        {revistasFiltradas.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Nenhuma revista encontrada
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Não encontramos nenhuma edição com os filtros selecionados. Tente ajustar os termos de busca ou clique no botão abaixo.
            </p>
            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#c8102e] hover:bg-[#a50d24] transition-colors cursor-pointer"
            >
              Ver Todas as Revistas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {revistasFiltradas.map((rev) => {
              const dataFormatada = rev.data_publicacao
                ? new Date(rev.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")
                : "";

              return (
                <a
                  key={rev.id}
                  href={rev.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#c8102e]/40 transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
                >
                  {/* Capa com Proporção Vertical 3:4 */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
                    <Image
                      src={rev.capa_url}
                      alt={rev.titulo}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />

                    {/* Gradiente e Brilho */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Badge de Acesso Sobreposto */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00d084] text-slate-950 shadow-md">
                        {rev.tipo_acesso || "GRATUITA"}
                      </span>
                    </div>

                    {/* Ícone de Leitura Online no Hover */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all shadow-md">
                      <span>Ler Edição</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Informações da Revista */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        {dataFormatada && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dataFormatada}
                          </span>
                        )}
                        <span className="font-extrabold uppercase text-[#00d084] tracking-wide">
                          {rev.categoria}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#c8102e] transition-colors">
                        {rev.titulo}
                      </h4>

                      {rev.subtitulo && (
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 line-clamp-1">
                          {rev.subtitulo}
                        </p>
                      )}
                    </div>

                    {/* Metadados: Cidade e Escritor */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      {rev.cidade ? (
                        <span className="flex items-center gap-1 font-semibold truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {rev.cidade}
                        </span>
                      ) : (
                        <span className="italic">Edição Geral</span>
                      )}

                      {rev.escritor && (
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          {rev.escritor}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
