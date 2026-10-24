"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Tag,
  PlusCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Edit,
  Trash2,
  MapPin,
  MessageCircle,
  Building,
  Car,
  Briefcase,
  Wrench,
  Laptop,
  UserCheck,
  Tractor,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import {
  ClassificadoData,
  CATEGORIAS_CLASSIFICADOS,
  TIPOS_NEGOCIACAO,
  PAGINAS_DISPONIVEIS,
} from "@/lib/portal/classificados-types";

interface ClassificadosGerenciadorProps {
  initialItens: ClassificadoData[];
  role: "admin" | "colunista";
  usuarioId: string;
  usuarioNome: string;
}

export function ClassificadosGerenciador({
  initialItens,
  role,
  usuarioId,
  usuarioNome,
}: ClassificadosGerenciadorProps) {
  const [itens, setItens] = useState<ClassificadoData[]>(initialItens);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<ClassificadoData | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Estados do Formulário
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formTipo, setFormTipo] = useState<ClassificadoData["tipo"]>("venda");
  const [formCategoria, setFormCategoria] = useState<ClassificadoData["categoria"]>("geral");
  const [formPreco, setFormPreco] = useState("");
  const [formPrecoSobConsulta, setFormPrecoSobConsulta] = useState(false);
  const [formImagemPrincipal, setFormImagemPrincipal] = useState("");
  const [formCidadeNome, setFormCidadeNome] = useState("");
  const [formBairro, setFormBairro] = useState("");
  const [formUf, setFormUf] = useState("SP");
  const [formContatoNome, setFormContatoNome] = useState(usuarioNome || "");
  const [formContatoWhatsapp, setFormContatoWhatsapp] = useState("");
  const [formContatoTelefone, setFormContatoTelefone] = useState("");
  const [formLinkExterno, setFormLinkExterno] = useState("");
  const [formDestaqueHome, setFormDestaqueHome] = useState(false);
  const [formDestaqueClassificados, setFormDestaqueClassificados] = useState(false);
  const [formPaginasExibicao, setFormPaginasExibicao] = useState<string[]>(["classificados"]);

  const abrirNovo = () => {
    setItemEmEdicao(null);
    setFormTitulo("");
    setFormDescricao("");
    setFormTipo("venda");
    setFormCategoria("imoveis");
    setFormPreco("");
    setFormPrecoSobConsulta(false);
    setFormImagemPrincipal(
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
    );
    setFormCidadeNome("Barueri");
    setFormBairro("Alphaville");
    setFormUf("SP");
    setFormContatoNome(usuarioNome || "Anunciante");
    setFormContatoWhatsapp("11999999999");
    setFormContatoTelefone("");
    setFormLinkExterno("");
    setFormDestaqueHome(false);
    setFormDestaqueClassificados(true);
    setFormPaginasExibicao(["classificados", "home"]);
    setModalAberto(true);
  };

  const abrirEdicao = (item: ClassificadoData) => {
    setItemEmEdicao(item);
    setFormTitulo(item.titulo);
    setFormDescricao(item.descricao);
    setFormTipo(item.tipo);
    setFormCategoria(item.categoria);
    setFormPreco(item.preco ? String(item.preco) : "");
    setFormPrecoSobConsulta(item.preco_sob_consulta);
    setFormImagemPrincipal(item.imagem_principal);
    setFormCidadeNome(item.cidade_nome || "");
    setFormBairro(item.bairro || "");
    setFormUf(item.uf || "SP");
    setFormContatoNome(item.contato_nome);
    setFormContatoWhatsapp(item.contato_whatsapp);
    setFormContatoTelefone(item.contato_telefone || "");
    setFormLinkExterno(item.link_externo || "");
    setFormDestaqueHome(item.destaque_home);
    setFormDestaqueClassificados(item.destaque_classificados);
    setFormPaginasExibicao(item.paginas_exibicao || ["classificados"]);
    setModalAberto(true);
  };

  const alternarPaginaExibicao = (pag: string) => {
    if (pag === "todas") {
      if (formPaginasExibicao.includes("todas")) {
        setFormPaginasExibicao(["classificados"]);
      } else {
        setFormPaginasExibicao(["todas"]);
      }
      return;
    }

    let novas = formPaginasExibicao.filter((p) => p !== "todas");
    if (novas.includes(pag)) {
      novas = novas.filter((p) => p !== pag);
      if (novas.length === 0) novas = ["classificados"];
    } else {
      novas.push(pag);
    }
    setFormPaginasExibicao(novas);
  };

  const salvarClassificado = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemErro(null);
    setMensagemSucesso(null);

    const payload = {
      titulo: formTitulo.trim(),
      descricao: formDescricao.trim(),
      tipo: formTipo,
      categoria: formCategoria,
      preco: Number(formPreco) || 0,
      preco_sob_consulta: formPrecoSobConsulta,
      imagem_principal: formImagemPrincipal.trim(),
      cidade_nome: formCidadeNome.trim(),
      bairro: formBairro.trim(),
      uf: formUf.trim().toUpperCase(),
      contato_nome: formContatoNome.trim(),
      contato_whatsapp: formContatoWhatsapp.trim(),
      contato_telefone: formContatoTelefone.trim() || null,
      link_externo: formLinkExterno.trim() || null,
      destaque_home: formDestaqueHome,
      destaque_classificados: formDestaqueClassificados,
      paginas_exibicao: formPaginasExibicao,
      status: "ativo" as const,
    };

    try {
      if (itemEmEdicao) {
        // Atualização
        const res = await fetch(`/api/classificados/${itemEmEdicao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao atualizar anúncio.");

        setItens((prev) =>
          prev.map((i) => (i.id === itemEmEdicao.id ? { ...i, ...payload } : i))
        );
        setMensagemSucesso(`Anúncio "${formTitulo}" atualizado com sucesso!`);
      } else {
        // Criação
        const res = await fetch("/api/classificados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao criar anúncio.");

        const novo: ClassificadoData = data.data || {
          id: `cls-${Date.now()}`,
          ...payload,
          visualizacoes: 0,
          created_at: new Date().toISOString(),
        };

        setItens((prev) => [novo, ...prev]);
        setMensagemSucesso(`Anúncio "${formTitulo}" cadastrado com sucesso!`);
      }

      setModalAberto(false);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirItem = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o classificado "${titulo}"?`)) return;

    try {
      await fetch(`/api/classificados/${id}`, { method: "DELETE" });
      setItens((prev) => prev.filter((i) => i.id !== id));
      setMensagemSucesso(`Anúncio "${titulo}" excluído.`);
    } catch (err) {
      console.error(err);
    }
  };

  const itensFiltrados = itens.filter((i) => {
    if (filtroCategoria !== "todos" && i.categoria !== filtroCategoria) return false;
    if (busca.trim()) {
      const b = busca.toLowerCase();
      return (
        i.titulo.toLowerCase().includes(b) ||
        (i.cidade_nome && i.cidade_nome.toLowerCase().includes(b))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header do Painel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {role === "admin" ? "Gestão Geral de Classificados" : "Meus Anúncios nos Classificados"}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cadastre anúncios de vendas, imóveis, autos, serviços e oportunidades com escolha das páginas de exibição e destaque na Home.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/classificados"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Ver no Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={abrirNovo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Classificado</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <span>{mensagemSucesso}</span>
          <button onClick={() => setMensagemSucesso(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mensagemErro && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-800 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{mensagemErro}</span>
          <button onClick={() => setMensagemErro(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total de Anúncios
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {itens.length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Destaques na Home
          </span>
          <span className="text-2xl font-black text-amber-500">
            {itens.filter((i) => i.destaque_home).length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Destaques no Topo
          </span>
          <span className="text-2xl font-black text-emerald-500">
            {itens.filter((i) => i.destaque_classificados).length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Visualizações Totais
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {itens.reduce((acc, i) => acc + (i.visualizacoes || 0), 0).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      {/* 3. Filtros e Busca */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por título, cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            {CATEGORIAS_CLASSIFICADOS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Tabela de Anúncios */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Anúncio</th>
                <th className="py-3 px-4">Tipo / Categoria</th>
                <th className="py-3 px-4">Preço</th>
                <th className="py-3 px-4">Exibição & Destaque</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Nenhum anúncio encontrado.
                  </td>
                </tr>
              ) : (
                itensFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-950 shrink-0">
                          <Image src={item.imagem_principal} alt={item.titulo} fill className="object-cover" />
                        </div>
                        <div className="max-w-xs">
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.titulo}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {item.cidade_nome || "Geral"} {item.bairro ? `• ${item.bairro}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.tipo}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          {item.categoria}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                      {item.preco_sob_consulta || !item.preco
                        ? "Sob consulta"
                        : `R$ ${item.preco.toLocaleString("pt-BR")}`}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {item.destaque_home && (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-amber-500 text-slate-950 shadow-sm">
                            Home
                          </span>
                        )}
                        {item.destaque_classificados && (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-emerald-500 text-slate-950">
                            Topo VIP
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {item.paginas_exibicao?.includes("todas")
                            ? "Todas as páginas"
                            : `${item.paginas_exibicao?.length || 1} página(s)`}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      {item.contato_whatsapp}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600">
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => abrirEdicao(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => excluirItem(item.id, item.titulo)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal de Criação / Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {itemEmEdicao ? "Editar Anúncio Classificado" : "Cadastrar Novo Classificado"}
                </h2>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarClassificado} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Título do Anúncio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Apartamento 3 Dormitórios com Varanda Gourmet"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Tipo e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Tipo de Negociação *
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
                  >
                    {TIPOS_NEGOCIACAO.filter((t) => t.valor !== "todos").map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Categoria do Segmento *
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
                  >
                    {CATEGORIAS_CLASSIFICADOS.filter((c) => c.slug !== "todos").map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preço e Sob Consulta */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Valor / Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={formPrecoSobConsulta}
                    placeholder="0.00"
                    value={formPreco}
                    onChange={(e) => setFormPreco(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div className="sm:col-span-5 pb-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPrecoSobConsulta}
                      onChange={(e) => setFormPrecoSobConsulta(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Sob Consulta / A Combinar
                    </span>
                  </label>
                </div>
              </div>

              {/* Imagem Principal */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  URL da Imagem Principal *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formImagemPrincipal}
                  onChange={(e) => setFormImagemPrincipal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Descrição Completa do Anúncio
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva detalhes, diferenciais, estado de conservação..."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Localização */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="Barueri, São Paulo..."
                    value={formCidadeNome}
                    onChange={(e) => setFormCidadeNome(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Alphaville..."
                    value={formBairro}
                    onChange={(e) => setFormBairro(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formUf}
                    onChange={(e) => setFormUf(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Nome do Anunciante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formContatoNome}
                    onChange={(e) => setFormContatoNome(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    WhatsApp para Contato *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="11999999999 (apenas números)"
                    value={formContatoWhatsapp}
                    onChange={(e) => setFormContatoWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* REGRAS SOLICITADAS: Onde o anúncio pode aparecer e destaque na home */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Regras de Destaque e Exibição nas Páginas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDestaqueHome}
                      onChange={(e) => setFormDestaqueHome(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        Destaque na Página Home
                      </span>
                      <span className="block text-[10.5px] text-slate-400">
                        Aparece na vitrine da página principal
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDestaqueClassificados}
                      onChange={(e) => setFormDestaqueClassificados(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        Destaque VIP Classificados
                      </span>
                      <span className="block text-[10.5px] text-slate-400">
                        Aparece no carrossel de topo dos classificados
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Em quais páginas o anúncio pode aparecer?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PAGINAS_DISPONIVEIS.map((pag) => {
                      const ativo = formPaginasExibicao.includes(pag.valor);
                      return (
                        <button
                          key={pag.valor}
                          type="button"
                          onClick={() => alternarPaginaExibicao(pag.valor)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            ativo
                              ? "bg-amber-500 text-slate-950 shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {pag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{itemEmEdicao ? "Salvar Alterações" : "Publicar Anúncio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
