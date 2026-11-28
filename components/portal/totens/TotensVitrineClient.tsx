"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building,
  Tv,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  Filter,
  CheckCircle2,
  BatteryCharging,
  X,
} from "lucide-react";
import type { Totem, CidadeComTotens, TipoModeloTotem } from "@/lib/totens/types";
import { TIPOS_ESTABELECIMENTO, obterModeloTotem } from "@/lib/totens/types";
import { TotemCard } from "./TotemCard";
import { TotensModelosShowcase } from "./TotensModelosShowcase";
import { SolicitarAnuncioModal } from "./SolicitarAnuncioModal";

interface TotensVitrineClientProps {
  totensIniciais: Totem[];
  cidadesComTotens: CidadeComTotens[];
  cidadePreSelecionada?: string;
}

export function TotensVitrineClient({
  totensIniciais,
  cidadesComTotens,
  cidadePreSelecionada,
}: TotensVitrineClientProps) {
  const [totens] = useState<Totem[]>(totensIniciais);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>(
    cidadePreSelecionada || "todas"
  );
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("todos");
  const [modeloSelecionado, setModeloSelecionado] = useState<TipoModeloTotem | "todos">("todos");
  const [buscaTexto, setBuscaTexto] = useState<string>("");
  const [apenasComCarregador, setApenasComCarregador] = useState(false);

  // Referência para rolar até o catálogo
  const catalogoRef = useRef<HTMLDivElement>(null);

  // Modal de Solicitação
  const [totemSelecionadoModal, setTotemSelecionadoModal] = useState<Totem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cidades para exibição no carrossel do topo: APENAS cidades reais com totens cadastrados
  const listaCidades = useMemo(() => {
    if (cidadesComTotens && cidadesComTotens.length > 0) {
      return cidadesComTotens;
    }
    return [];
  }, [cidadesComTotens]);

  // Totens Filtrados
  const totensFiltrados = useMemo(() => {
    return totens.filter((t) => {
      // Filtro de Cidade
      if (
        cidadeSelecionada !== "todas" &&
        !t.cidade_nome.toLowerCase().includes(cidadeSelecionada.toLowerCase())
      ) {
        return false;
      }

      // Filtro de Tipo de Estabelecimento
      if (tipoSelecionado !== "todos" && t.tipo_estabelecimento !== tipoSelecionado) {
        return false;
      }

      // Filtro de Modelo de Totem
      if (modeloSelecionado !== "todos") {
        const mod = obterModeloTotem(t);
        if (mod.id !== modeloSelecionado) return false;
      }

      // Filtro de Carregador
      if (apenasComCarregador) {
        const tem = t.recursos_extras?.some((r) => r.toLowerCase().includes("carregador"));
        if (!tem) return false;
      }

      // Busca por Texto
      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase();
        const matchNome = t.nome.toLowerCase().includes(termo);
        const matchEstab = t.estabelecimento_nome.toLowerCase().includes(termo);
        const matchEnd = t.endereco.toLowerCase().includes(termo);
        const matchBairro = t.bairro.toLowerCase().includes(termo);
        const matchCidade = t.cidade_nome.toLowerCase().includes(termo);
        return matchNome || matchEstab || matchEnd || matchBairro || matchCidade;
      }

      return true;
    });
  }, [totens, cidadeSelecionada, tipoSelecionado, modeloSelecionado, apenasComCarregador, buscaTexto]);

  const handleFiltrarModelo = (modelo: TipoModeloTotem | "todos") => {
    setModeloSelecionado(modelo);
    if (catalogoRef.current) {
      catalogoRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenSolicitar = (t: Totem) => {
    setTotemSelecionadoModal(t);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 selection:bg-amber-400 selection:text-slate-950">
      {/* 1. HERO BANNER PRINCIPAL (Fundo Claro com Realces Dourados) */}
      <section className="relative bg-white border-b border-slate-200/80 overflow-hidden pt-8 pb-10 sm:py-12">
        {/* Glow dourado suave no topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-amber-100/60 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Texto Principal */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Tv className="w-3.5 h-3.5 text-amber-600" />
                <span>Módulo Empire Totens — Publicidade por Cidade</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Totens <span className="text-amber-500 underline decoration-amber-300">Empire</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl leading-relaxed">
                Mídia digital *Out of Home* nos pontos mais estratégicos das cidades: galerias, shoppings, academias e clínicas. Conecte sua marca a milhares de pessoas todos os dias.
              </p>

              {/* Badges de Destaque */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Vídeos em 4K de 15 segundos</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Localização Geográfica Estratégica</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Atendimento Direto com o Franqueado</span>
                </div>
              </div>
            </div>

            {/* Card Lateral: Fluxo de Navegação */}
            <div className="lg:col-span-4 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Fluxo de Navegação</span>
              </div>

              <ol className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span><strong>Escolha sua cidade</strong> no catálogo abaixo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span><strong>Localize o totem</strong> ideal para sua empresa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span><strong>Clique em Anunciar</strong> para falar com o franqueado no WhatsApp</span>
                </li>
              </ol>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Espaços publicitários sob medida</span>
                <span className="font-bold text-amber-700">Grupo Empire</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOWCASE COMPARATIVO DOS MODELOS DE TOTENS */}
      <TotensModelosShowcase
        modeloAtivo={modeloSelecionado}
        onFiltrarModelo={handleFiltrarModelo}
      />

      {/* 3. CATÁLOGO / SELEÇÃO DE CIDADES */}
      <div ref={catalogoRef}>
        {listaCidades.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>Escolha a Cidade</span>
              </h2>
              <p className="text-xs text-slate-500">
                Selecione o município para visualizar os totens disponíveis naquela região
              </p>
            </div>

            {cidadeSelecionada !== "todas" && (
              <button
                type="button"
                onClick={() => setCidadeSelecionada("todas")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ver Todas as Cidades</span>
              </button>
            )}
          </div>

          {/* Grid de Cards de Cidades */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Card: Todas as Cidades */}
            <button
              type="button"
              onClick={() => setCidadeSelecionada("todas")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-32 ${
                cidadeSelecionada === "todas"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:shadow-sm"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold">Brasil</span>
                <span className="block text-sm font-black">Todas as Cidades</span>
                <span className="text-[10.5px] opacity-75 font-semibold">
                  {totens.length} totens no total
                </span>
              </div>
            </button>

            {/* Cards das Cidades */}
            {listaCidades.map((cid) => {
              const isAtiva = cidadeSelecionada.toLowerCase() === cid.cidade_nome.toLowerCase();

              return (
                <button
                  key={`${cid.cidade_nome}-${cid.estado}`}
                  type="button"
                  onClick={() => setCidadeSelecionada(cid.cidade_nome)}
                  className={`relative rounded-2xl border overflow-hidden text-left transition-all cursor-pointer flex flex-col justify-end p-3 h-32 group ${
                    isAtiva
                      ? "border-amber-500 ring-2 ring-amber-400 shadow-md scale-[1.02]"
                      : "border-slate-200 hover:border-amber-400 hover:shadow-sm"
                  }`}
                >
                  {cid.foto_url && (
                    <Image
                      src={cid.foto_url}
                      alt={cid.cidade_nome}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  <div className="relative z-10 text-white">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider mb-1">
                      {cid.total_totens} {cid.total_totens === 1 ? "Totem" : "Totens"}
                    </span>
                    <h4 className="text-sm font-black leading-tight drop-shadow">
                      {cid.cidade_nome}/{cid.estado}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. BARRA DE BUSCA E FILTROS */}
      <section className="max-w-[1440px] mx-auto px-4 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Input de Busca Textual */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Busque por shopping, galeria, bairro ou endereço..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Filtro por Tipo de Estabelecimento */}
            <div className="md:col-span-4">
              <select
                value={tipoSelecionado}
                onChange={(e) => setTipoSelecionado(e.target.value)}
                aria-label="Filtrar por tipo de estabelecimento"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                {TIPOS_ESTABELECIMENTO.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox: Apenas com Carregador */}
            <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={apenasComCarregador}
                  onChange={(e) => setApenasComCarregador(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span>Com Carregador</span>
              </label>

              {(buscaTexto || tipoSelecionado !== "todos" || modeloSelecionado !== "todos" || apenasComCarregador) && (
                <button
                  type="button"
                  onClick={() => {
                    setBuscaTexto("");
                    setTipoSelecionado("todos");
                    setModeloSelecionado("todos");
                    setApenasComCarregador(false);
                  }}
                  className="text-xs text-slate-500 hover:text-red-600 font-semibold underline"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Seletor Visual Rápido de Modelos (Flyer Oficial R$ 250 e R$ 350) */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Modelo de Totem:
            </span>

            <button
              type="button"
              onClick={() => setModeloSelecionado("todos")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                modeloSelecionado === "todos"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Todos os Modelos
            </button>

            <button
              type="button"
              onClick={() => setModeloSelecionado("totem_carregador")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                modeloSelecionado === "totem_carregador"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/50"
                  : "bg-slate-100 hover:bg-amber-100 text-slate-700"
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
              <span>Totem com Carregador (R$ 250/mês)</span>
            </button>

            <button
              type="button"
              onClick={() => setModeloSelecionado("totem_interativo_maior")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                modeloSelecionado === "totem_interativo_maior"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/50"
                  : "bg-slate-100 hover:bg-amber-100 text-slate-700"
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-amber-600" />
              <span>Totem Interativo Maior 43&quot; (R$ 350/mês)</span>
            </button>

            {modeloSelecionado !== "todos" && (
              <button
                type="button"
                onClick={() => setModeloSelecionado("todos")}
                className="text-xs text-slate-400 hover:text-red-500 ml-auto underline cursor-pointer"
              >
                Limpar filtro de modelo
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. CABEÇALHO DA CIDADE SELECIONADA + CONTADORES */}
      <section className="max-w-[1440px] mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-500" />
              <span>
                {cidadeSelecionada === "todas"
                  ? "Todos os Totens Empire no Brasil"
                  : `Totens em ${cidadeSelecionada}`}
              </span>
            </h3>
            <span className="text-xs text-slate-500">
              Exibindo <strong>{totensFiltrados.length}</strong> {totensFiltrados.length === 1 ? "equipamento disponível" : "equipamentos disponíveis"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              ● Disponibilidade Aberta
            </span>
          </div>
        </div>
      </section>

      {/* 5. GRID DE CARDS DOS TOTENS */}
      <section className="max-w-[1440px] mx-auto px-4">
        {totensFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Tv className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Nenhum totem cadastrado com esses filtros
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Não encontramos equipamentos para a cidade ou estabelecimento selecionado. Você pode cadastrar novos totens pelo painel administrativo ou limpar os filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                setCidadeSelecionada("todas");
                setTipoSelecionado("todos");
                setBuscaTexto("");
                setApenasComCarregador(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow"
            >
              Restaurar Todos os Totens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {totensFiltrados.map((totem) => (
              <TotemCard
                key={totem.id}
                totem={totem}
                onOpenSolicitar={handleOpenSolicitar}
              />
            ))}
          </div>
        )}
      </section>
      </div>

      {/* 6. MODAL DE SOLICITAÇÃO */}
      <SolicitarAnuncioModal
        totem={totemSelecionadoModal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTotemSelecionadoModal(null);
        }}
      />
    </div>
  );
}
