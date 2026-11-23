"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Users,
  Mic,
  Smartphone,
  Star,
  Presentation,
  UserCheck,
  Newspaper,
  Tv,
  Film,
  Camera,
  Award,
  Video,
  Volume2,
  Sparkles,
} from "lucide-react";
import type { Talento } from "@/lib/talentos/types";
import { TalentoCard } from "./TalentoCard";
import { SolicitarOrcamentoModal } from "./SolicitarOrcamentoModal";

interface TalentosVitrineClientProps {
  talentosIniciais: Talento[];
}

const CATEGORIAS_SIDEBAR = [
  { id: "todos", label: "Todos os Talentos", icon: Users },
  { id: "modelos", label: "Modelos & Fashion", icon: Sparkles },
  { id: "apresentadores", label: "Apresentadores", icon: Mic },
  { id: "influenciadores", label: "Influenciadores", icon: Smartphone },
  { id: "celebridades", label: "Celebridades", icon: Star },
  { id: "palestrantes", label: "Palestrantes", icon: Presentation },
  { id: "mestres_cerimonia", label: "Mestres de Cerimônia", icon: UserCheck },
  { id: "jornalistas", label: "Jornalistas / Repórteres", icon: Newspaper },
  { id: "programas_tv", label: "Programas de TV", icon: Tv },
];

const SERVICOS_DESTAQUE = [
  { nome: "Comerciais de TV", icon: Tv },
  { nome: "Desfiles e Passarela", icon: Sparkles },
  { nome: "Ensaios Fotográficos & Editoriais", icon: Camera },
  { nome: "Apresentações e Cerimoniais", icon: Mic },
  { nome: "Cobertura de Eventos", icon: Camera },
  { nome: "Palestras", icon: Presentation },
  { nome: "Programas de TV", icon: Video },
  { nome: "Campanhas Publicitárias", icon: Film },
  { nome: "Presença VIP", icon: Award },
  { nome: "Ações com Influenciadores", icon: Volume2 },
];

export function TalentosVitrineClient({ talentosIniciais }: TalentosVitrineClientProps) {
  const [talentos, setTalentos] = useState<Talento[]>(talentosIniciais);

  useEffect(() => {
    setTalentos(talentosIniciais);
  }, [talentosIniciais]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todos");
  const [servicoFiltro, setServicoFiltro] = useState<string | null>(null);
  const [buscaTexto, setBuscaTexto] = useState<string>("");
  const [segmentoFiltro, setSegmentoFiltro] = useState<string>("todos");
  const [cidadeFiltro, setCidadeFiltro] = useState<string>("todas");

  // Modal de Orçamento
  const [talentoSelecionado, setTalentoSelecionado] = useState<Talento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lista de todos os segmentos únicos
  const segmentosDisponiveis = useMemo(() => {
    const setSeg = new Set<string>();
    talentos.forEach((t) => {
      t.segmentos?.forEach((s) => setSeg.add(s));
    });
    return Array.from(setSeg).sort();
  }, [talentos]);

  // Lista de cidades únicas
  const cidadesDisponiveis = useMemo(() => {
    const setCid = new Set<string>();
    talentos.forEach((t) => {
      if (t.cidade_nome) setCid.add(t.cidade_nome);
    });
    return Array.from(setCid).sort();
  }, [talentos]);

  // Contagem de talentos por categoria
  const contagemPorCategoria = useMemo(() => {
    const counts: Record<string, number> = { todos: talentos.length };
    CATEGORIAS_SIDEBAR.forEach((cat) => {
      if (cat.id !== "todos") {
        counts[cat.id] = talentos.filter((t) => t.categoria === cat.id).length;
      }
    });
    return counts;
  }, [talentos]);

  // Filtragem dinâmica
  const talentosFiltrados = useMemo(() => {
    return talentos.filter((t) => {
      if (categoriaAtiva !== "todos" && t.categoria !== categoriaAtiva) return false;
      if (servicoFiltro && !t.servicos?.includes(servicoFiltro)) return false;
      if (segmentoFiltro !== "todos" && !t.segmentos?.includes(segmentoFiltro)) return false;
      if (cidadeFiltro !== "todas" && t.cidade_nome !== cidadeFiltro) return false;

      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase().trim();
        const noNome = t.nome.toLowerCase().includes(termo);
        const naProfissao = t.titulo_profissional.toLowerCase().includes(termo);
        const naBio = t.bio_curta.toLowerCase().includes(termo);
        const nosServicos = t.servicos?.some((s) => s.toLowerCase().includes(termo));
        const nosSegmentos = t.segmentos?.some((s) => s.toLowerCase().includes(termo));

        if (!noNome && !naProfissao && !naBio && !nosServicos && !nosSegmentos) {
          return false;
        }
      }

      return true;
    });
  }, [talentos, categoriaAtiva, servicoFiltro, segmentoFiltro, cidadeFiltro, buscaTexto]);

  const handleOpenOrcamento = (talento: Talento) => {
    setTalentoSelecionado(talento);
    setIsModalOpen(true);
  };

  const handleCloseOrcamento = () => {
    setIsModalOpen(false);
    setTalentoSelecionado(null);
  };

  const handleToggleServico = (servicoNome: string) => {
    if (servicoFiltro === servicoNome) {
      setServicoFiltro(null);
    } else {
      setServicoFiltro(servicoNome);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Hero Banner Principal com Fundo Claro e Sofisticado */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-10 sm:py-14 px-4 shadow-sm">
        {/* Detalhes luminosos sutis */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto text-center relative z-10 space-y-4">
          {/* Badge Oficial */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Agência Oficial de Celebridades & Influenciadores</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-serif">
            Talentos{" "}
            <span className="text-amber-500">
              Empire★
            </span>
          </h1>

          <p className="text-base sm:text-xl font-semibold text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Apresentadores, Influenciadores, Celebridades e Palestrantes
          </p>

          <div className="inline-block px-5 py-2 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-900 dark:text-amber-200 font-extrabold text-sm sm:text-base shadow-sm">
            Contrate o talento ideal para a sua marca, evento ou campanha!
          </div>

          {/* Botão de Auto-Cadastro / Faça Parte */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/talentos/cadastro"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Quero Fazer Parte / Cadastrar Perfil de Talento</span>
            </Link>
          </div>

          {/* 2. Barra Rápida de Serviços Oferecidos (Preenche a largura sem cortes) */}
          <div className="pt-6 w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 w-full">
              {SERVICOS_DESTAQUE.map((item) => {
                const IconComponent = item.icon;
                const isSelected = servicoFiltro === item.nome;
                return (
                  <button
                    key={item.nome}
                    type="button"
                    onClick={() => handleToggleServico(item.nome)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer w-full text-center ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-[1.02]"
                        : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-400"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? "text-slate-950" : "text-amber-500"}`} />
                    <span className="leading-tight text-[11px] sm:text-xs truncate sm:whitespace-normal">{item.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Barra Central de Busca e Filtros */}
          <div className="pt-3 max-w-5xl mx-auto w-full">
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex flex-col md:flex-row items-center gap-2.5">
              {/* Input de Busca */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Busque por nome, segmento ou serviço..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Select Segmento */}
              <div className="w-full md:w-48">
                <select
                  value={segmentoFiltro}
                  onChange={(e) => setSegmentoFiltro(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="todos">Todos os Segmentos</option>
                  {segmentosDisponiveis.map((seg) => (
                    <option key={seg} value={seg}>
                      {seg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Cidade */}
              <div className="w-full md:w-48">
                <select
                  value={cidadeFiltro}
                  onChange={(e) => setCidadeFiltro(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="todas">Todas as Cidades</option>
                  {cidadesDisponiveis.map((cid) => (
                    <option key={cid} value={cid}>
                      {cid}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão Buscar */}
              <button
                type="button"
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Conteúdo Principal com Sidebar de Categorias e Grid de Talentos */}
      <section className="max-w-[1440px] mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Esquerda: Categorias */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 px-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Filtrar Talentos</span>
              </h2>

              <nav className="space-y-1">
                {CATEGORIAS_SIDEBAR.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = categoriaAtiva === cat.id;
                  const total = contagemPorCategoria[cat.id] ?? 0;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoriaAtiva(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 shadow-sm font-extrabold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-slate-950" : "text-amber-500"}`} />
                        <span>{cat.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-black/15 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {total}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Botão de Limpar Filtros quando houver algum ativo */}
              {(categoriaAtiva !== "todos" ||
                servicoFiltro ||
                segmentoFiltro !== "todos" ||
                cidadeFiltro !== "todas" ||
                buscaTexto) && (
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoriaAtiva("todos");
                      setServicoFiltro(null);
                      setSegmentoFiltro("todos");
                      setCidadeFiltro("todas");
                      setBuscaTexto("");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors text-center"
                  >
                    Limpar Todos os Filtros
                  </button>
                </div>
              )}
            </div>

            {/* Banner de Atendimento Comercial VIP */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-slate-900 dark:to-slate-800 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-center space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto font-black text-xs shadow-sm">
                VIP
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Atendimento Corporativo Grupo Empire
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Precisa de um elenco completo ou campanha multiplataforma? Nossa equipe comercial desenha a proposta sob medida.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (talentos.length > 0) handleOpenOrcamento(talentos[0]);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                Falar com Consultor
              </button>
            </div>
          </aside>

          {/* Área Direita: Grid dos Cards de Talentos */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Exibindo <span className="text-slate-900 dark:text-white font-extrabold">{talentosFiltrados.length}</span>{" "}
                {talentosFiltrados.length === 1 ? "talento profissional" : "talentos profissionais"}
              </span>

              {servicoFiltro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                  Filtro: {servicoFiltro}
                  <button
                    onClick={() => setServicoFiltro(null)}
                    className="hover:text-black ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            {talentosFiltrados.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum talento encontrado</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Não encontramos nenhum profissional com os filtros selecionados. Tente ajustar a busca ou limpar os filtros.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaAtiva("todos");
                    setServicoFiltro(null);
                    setSegmentoFiltro("todos");
                    setCidadeFiltro("todas");
                    setBuscaTexto("");
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-sm hover:bg-amber-400 transition-colors"
                >
                  Restaurar Todos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {talentosFiltrados.map((talento) => (
                  <TalentoCard
                    key={talento.id}
                    talento={talento}
                    onSolicitarOrcamento={handleOpenOrcamento}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Modal de Orçamento / Proposta Comercial */}
      <SolicitarOrcamentoModal
        talento={talentoSelecionado}
        isOpen={isModalOpen}
        onClose={handleCloseOrcamento}
      />
    </div>
  );
}
