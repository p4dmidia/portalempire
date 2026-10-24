"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Tag,
  Search,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Building,
  Car,
  Briefcase,
  Wrench,
  Laptop,
  UserCheck,
  Tractor,
} from "lucide-react";
import {
  ClassificadoData,
  CATEGORIAS_CLASSIFICADOS,
  TIPOS_NEGOCIACAO,
} from "@/lib/portal/classificados-types";

interface ClassificadosViewProps {
  initialClassificados: ClassificadoData[];
}

export function ClassificadosView({ initialClassificados }: ClassificadosViewProps) {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [tipoAtivo, setTipoAtivo] = useState("todos");
  const [modalItem, setModalItem] = useState<ClassificadoData | null>(null);
  const [fotoModalAtiva, setFotoModalAtiva] = useState<string>("");

  // Filtros em tempo real
  const classificadosFiltrados = useMemo(() => {
    return initialClassificados.filter((item) => {
      // Filtro Categoria
      if (categoriaAtiva !== "todos" && item.categoria !== categoriaAtiva) {
        return false;
      }
      // Filtro Tipo
      if (tipoAtivo !== "todos" && item.tipo !== tipoAtivo) {
        return false;
      }
      // Filtro Busca por texto
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const textoGeral = `${item.titulo} ${item.descricao} ${item.cidade_nome || ""} ${
          item.bairro || ""
        }`.toLowerCase();
        if (!textoGeral.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [initialClassificados, categoriaAtiva, tipoAtivo, busca]);

  // Itens em Destaque no topo
  const destaques = useMemo(() => {
    return classificadosFiltrados.filter((i) => i.destaque_classificados || i.destaque_home);
  }, [classificadosFiltrados]);

  const abrirModal = (item: ClassificadoData) => {
    setModalItem(item);
    setFotoModalAtiva(item.imagem_principal);
  };

  const fecharModal = () => {
    setModalItem(null);
    setFotoModalAtiva("");
  };

  const gerarLinkWhatsapp = (item: ClassificadoData) => {
    const foneLimpo = item.contato_whatsapp.replace(/\D/g, "");
    const foneFinal = foneLimpo.startsWith("55") ? foneLimpo : `55${foneLimpo}`;
    const texto = encodeURIComponent(
      `Olá! Vi seu anúncio "${item.titulo}" nos Classificados do Empire Cidades e gostaria de mais informações.`
    );
    return `https://wa.me/${foneFinal}?text=${texto}`;
  };

  const formatarPreco = (item: ClassificadoData) => {
    if (item.preco_sob_consulta || !item.preco) {
      if (item.tipo === "troca") return "Troca / Permuta";
      if (item.tipo === "emprego") return "A Combinar";
      return "Sob Consulta";
    }
    return `R$ ${item.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const getIconeCategoria = (slug: string) => {
    switch (slug) {
      case "imoveis":
        return <Building className="w-4 h-4" />;
      case "veiculos":
        return <Car className="w-4 h-4" />;
      case "negocios":
        return <Briefcase className="w-4 h-4" />;
      case "servicos":
        return <Wrench className="w-4 h-4" />;
      case "eletronicos":
        return <Laptop className="w-4 h-4" />;
      case "empregos":
        return <UserCheck className="w-4 h-4" />;
      case "agro":
        return <Tractor className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Hero Banner Principal */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#111622] via-[#1a2333] to-[#0d121c] border border-amber-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Classificados Oficiais Empire Cidades</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Compre, venda e anuncie na sua região com <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">segurança e agilidade</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Imóveis, veículos, oportunidades de negócios, serviços especializados e produtos com contato direto no WhatsApp. Anuncie para milhares de leitores diários.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/painel"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95"
            >
              <Tag className="w-4 h-4 fill-current" />
              <span>Anunciar no Portal</span>
            </Link>

            <Link
              href="/anuncie"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors border border-white/15"
            >
              <span>Como Funciona</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Barra de Busca e Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Input de Busca */}
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por imóvel, veículo, serviço, bairro ou cidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Select de Tipo de Negociação */}
          <div className="md:col-span-4 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={tipoAtivo}
              onChange={(e) => setTipoAtivo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-8 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {TIPOS_NEGOCIACAO.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pílulas de Categorias */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
          {CATEGORIAS_CLASSIFICADOS.map((cat) => {
            const isSelected = categoriaAtiva === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setCategoriaAtiva(cat.slug)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {getIconeCategoria(cat.slug)}
                <span>{cat.nome}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Destaques VIP / Selecionados */}
      {destaques.length > 0 && categoriaAtiva === "todos" && !busca && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Anúncios em Destaque VIP
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Oportunidades em Alta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destaques.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-2 border-amber-500/50 hover:border-amber-500 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => abrirModal(item)}>
                  <Image
                    src={item.imagem_principal}
                    alt={item.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                      ★ Destaque VIP
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-sm">
                      {item.tipo}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-black/90 to-transparent p-2 rounded-b-xl">
                    <div className="text-white text-lg font-black">{formatarPreco(item)}</div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {item.cidade_nome && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {item.bairro ? `${item.bairro}, ` : ""}
                          {item.cidade_nome} - {item.uf || "SP"}
                        </span>
                      </div>
                    )}

                    <h3
                      onClick={() => abrirModal(item)}
                      className="font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-amber-500 cursor-pointer text-base leading-snug transition-colors"
                    >
                      {item.titulo}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 mt-1.5 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => abrirModal(item)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                    >
                      Ver detalhes
                    </button>

                    <a
                      href={gerarLinkWhatsapp(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. Grade Geral de Classificados */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {categoriaAtiva === "todos"
              ? "Todos os Anúncios Recentes"
              : `Classificados em ${CATEGORIAS_CLASSIFICADOS.find((c) => c.slug === categoriaAtiva)?.nome || ""}`}
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {classificadosFiltrados.length}{" "}
            {classificadosFiltrados.length === 1 ? "anúncio encontrado" : "anúncios encontrados"}
          </span>
        </div>

        {classificadosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Nenhum anúncio encontrado para estes filtros
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Tente buscar por termos mais genéricos ou selecionar outra categoria acima.
            </p>
            <button
              onClick={() => {
                setBusca("");
                setCategoriaAtiva("todos");
                setTipoAtivo("todos");
              }}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classificadosFiltrados.map((item) => (
              <article
                key={item.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-amber-400/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden cursor-pointer"
                    onClick={() => abrirModal(item)}
                  >
                    <Image
                      src={item.imagem_principal}
                      alt={item.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-sm">
                        {item.tipo}
                      </span>
                      {item.destaque_home && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950">
                          Destaque
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-lg text-amber-400 font-extrabold text-sm border border-white/10 shadow-sm">
                      {formatarPreco(item)}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {item.cidade_nome && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-[#c8102e]" />
                        <span>
                          {item.bairro ? `${item.bairro}, ` : ""}
                          {item.cidade_nome} - {item.uf || "SP"}
                        </span>
                      </div>
                    )}

                    <h3
                      onClick={() => abrirModal(item)}
                      className="font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#c8102e] cursor-pointer text-sm leading-snug transition-colors"
                    >
                      {item.titulo}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Por <span className="font-semibold text-slate-800 dark:text-slate-200">{item.contato_nome}</span>
                  </div>

                  <a
                    href={gerarLinkWhatsapp(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. Modal de Detalhes Completos do Anúncio */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={fecharModal}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Foto Principal do Modal */}
            <div className="relative aspect-[16/10] w-full bg-slate-950">
              <Image
                src={fotoModalAtiva || modalItem.imagem_principal}
                alt={modalItem.titulo}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                  {modalItem.tipo}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-sm">
                  {modalItem.categoria}
                </span>
              </div>
            </div>

            {/* Galeria de Miniaturas se houver mais fotos */}
            {modalItem.galeria_fotos && modalItem.galeria_fotos.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                <button
                  onClick={() => setFotoModalAtiva(modalItem.imagem_principal)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 ${
                    fotoModalAtiva === modalItem.imagem_principal
                      ? "border-amber-500 shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={modalItem.imagem_principal} alt="Foto 1" fill className="object-cover" />
                </button>
                {modalItem.galeria_fotos.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFotoModalAtiva(foto)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 ${
                      fotoModalAtiva === foto
                        ? "border-amber-500 shadow-sm"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={foto} alt={`Foto ${idx + 2}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Conteúdo do Anúncio */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500 mb-2">
                  {formatarPreco(modalItem)}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {modalItem.titulo}
                </h3>
                {modalItem.cidade_nome && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    <MapPin className="w-4 h-4 text-[#c8102e]" />
                    <span>
                      {modalItem.bairro ? `${modalItem.bairro}, ` : ""}
                      {modalItem.cidade_nome} - {modalItem.uf || "SP"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Descrição do Anúncio
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {modalItem.descricao}
                </p>
              </div>

              {/* Bloco de Contato e Ações */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">
                      Anunciante
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {modalItem.contato_nome}
                    </span>
                  </div>
                  {modalItem.contato_telefone && (
                    <div className="text-right">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block">
                        Telefone Fixo
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {modalItem.contato_telefone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={gerarLinkWhatsapp(modalItem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Chamar no WhatsApp</span>
                  </a>

                  {modalItem.link_externo && (
                    <a
                      href={modalItem.link_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver Site</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
