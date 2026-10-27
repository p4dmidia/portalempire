"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  MapPin,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Eye,
  Calendar,
  Layers,
  X,
} from "lucide-react";
import {
  RevistaData,
  CATEGORIAS_REVISTAS,
  TIPOS_ACESSO_REVISTAS,
} from "@/lib/portal/revistas-types";
import { createClient } from "@/lib/supabase/client";

interface RevistasGerenciadorProps {
  initialItens: RevistaData[];
  usuarioNome: string;
}

export function RevistasGerenciador({
  initialItens,
  usuarioNome,
}: RevistasGerenciadorProps) {
  const [itens, setItens] = useState<RevistaData[]>(initialItens);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<RevistaData | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [fazendoUpload, setFazendoUpload] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Estados do Formulário
  const [formTitulo, setFormTitulo] = useState("");
  const [formSubtitulo, setFormSubtitulo] = useState("");
  const [formCapaUrl, setFormCapaUrl] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formCidade, setFormCidade] = useState("");
  const [formEstado, setFormEstado] = useState("SP");
  const [formEscritor, setFormEscritor] = useState("");
  const [formCategoria, setFormCategoria] = useState("Diversos");
  const [formTipoAcesso, setFormTipoAcesso] = useState("GRATUITA");
  const [formDataPublicacao, setFormDataPublicacao] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDestaque, setFormDestaque] = useState(true);
  const [formAtivo, setFormAtivo] = useState(true);
  const [formOrdem, setFormOrdem] = useState(0);

  const abrirModalCriacao = () => {
    setItemEmEdicao(null);
    setFormTitulo("");
    setFormSubtitulo("");
    setFormCapaUrl("");
    setFormLinkUrl("");
    setFormCidade("");
    setFormEstado("SP");
    setFormEscritor(usuarioNome || "Redação Empire");
    setFormCategoria("Diversos");
    setFormTipoAcesso("GRATUITA");
    setFormDataPublicacao(new Date().toISOString().split("T")[0]);
    setFormDestaque(true);
    setFormAtivo(true);
    setFormOrdem(itens.length + 1);
    setMensagemErro(null);
    setModalAberto(true);
  };

  const abrirModalEdicao = (revista: RevistaData) => {
    setItemEmEdicao(revista);
    setFormTitulo(revista.titulo);
    setFormSubtitulo(revista.subtitulo || "");
    setFormCapaUrl(revista.capa_url);
    setFormLinkUrl(revista.link_url);
    setFormCidade(revista.cidade || "");
    setFormEstado(revista.estado || "SP");
    setFormEscritor(revista.escritor || "");
    setFormCategoria(revista.categoria || "Diversos");
    setFormTipoAcesso(revista.tipo_acesso || "GRATUITA");
    setFormDataPublicacao(
      revista.data_publicacao
        ? revista.data_publicacao.split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setFormDestaque(revista.destaque);
    setFormAtivo(revista.ativo);
    setFormOrdem(revista.ordem || 0);
    setMensagemErro(null);
    setModalAberto(true);
  };

  // Upload de Imagem de Capa para o Supabase Storage
  const handleUploadCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUpload(true);
      setMensagemErro(null);

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `capas/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      // Tenta fazer upload no bucket 'revistas' ou fallback 'anuncios'/'materias'
      let uploadRes = await supabase.storage.from("revistas").upload(fileName, file, { upsert: true });

      let bucketUsado = "revistas";
      if (uploadRes.error) {
        uploadRes = await supabase.storage.from("anuncios").upload(fileName, file, { upsert: true });
        bucketUsado = "anuncios";
      }

      if (uploadRes.error) {
        throw new Error(`Erro ao enviar capa: ${uploadRes.error.message}`);
      }

      const { data: publicData } = supabase.storage.from(bucketUsado).getPublicUrl(fileName);
      setFormCapaUrl(publicData.publicUrl);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro no upload da imagem.");
    } finally {
      setFazendoUpload(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitulo.trim()) {
      setMensagemErro("Por favor, informe o título da revista.");
      return;
    }
    if (!formCapaUrl.trim()) {
      setMensagemErro("Por favor, adicione a imagem da capa (upload ou URL).");
      return;
    }
    if (!formLinkUrl.trim()) {
      setMensagemErro("Por favor, informe o link de leitura da revista.");
      return;
    }

    setSalvando(true);
    setMensagemErro(null);
    setMensagemSucesso(null);

    const payload = {
      titulo: formTitulo.trim(),
      subtitulo: formSubtitulo.trim() || null,
      capa_url: formCapaUrl.trim(),
      link_url: formLinkUrl.trim(),
      cidade: formCidade.trim() || null,
      estado: formEstado.trim().toUpperCase() || "SP",
      escritor: formEscritor.trim() || "Redação Empire",
      categoria: formCategoria.trim() || "Diversos",
      tipo_acesso: formTipoAcesso,
      data_publicacao: formDataPublicacao,
      destaque: formDestaque,
      ativo: formAtivo,
      ordem: Number(formOrdem) || 0,
    };

    try {
      if (itemEmEdicao) {
        // Atualizar
        const res = await fetch(`/api/revistas/${itemEmEdicao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao atualizar revista.");

        setItens((prev) =>
          prev.map((i) => (i.id === itemEmEdicao.id ? { ...i, ...payload } : i))
        );
        setMensagemSucesso(`Revista "${formTitulo}" atualizada com sucesso!`);
      } else {
        // Criar
        const res = await fetch("/api/revistas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao cadastrar revista.");

        const nova: RevistaData = data.data || {
          id: `rev-${Date.now()}`,
          ...payload,
          slug: `revista-${Date.now()}`,
          visualizacoes: 0,
          created_at: new Date().toISOString(),
        };

        setItens((prev) => [nova, ...prev]);
        setMensagemSucesso(`Revista "${formTitulo}" cadastrada com sucesso!`);
      }

      setModalAberto(false);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const alternarStatus = async (revista: RevistaData) => {
    const novoStatus = !revista.ativo;
    try {
      await fetch(`/api/revistas/${revista.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: novoStatus }),
      });
      setItens((prev) =>
        prev.map((r) => (r.id === revista.id ? { ...r, ativo: novoStatus } : r))
      );
    } catch {
      // Ignora erro e reverte se falhar
    }
  };

  const alternarDestaque = async (revista: RevistaData) => {
    const novoDestaque = !revista.destaque;
    try {
      await fetch(`/api/revistas/${revista.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destaque: novoDestaque }),
      });
      setItens((prev) =>
        prev.map((r) => (r.id === revista.id ? { ...r, destaque: novoDestaque } : r))
      );
    } catch {
      // Ignora erro
    }
  };

  const excluirRevista = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir a revista "${titulo}"?`)) return;

    try {
      await fetch(`/api/revistas/${id}`, { method: "DELETE" });
      setItens((prev) => prev.filter((r) => r.id !== id));
      setMensagemSucesso(`Revista "${titulo}" excluída com sucesso.`);
    } catch {
      setMensagemErro("Erro ao excluir revista.");
    }
  };

  // Filtros em memória na tabela
  const itensFiltrados = itens.filter((r) => {
    const atendeCategoria =
      filtroCategoria === "Todas" ||
      r.categoria.toLowerCase() === filtroCategoria.toLowerCase();

    const termo = busca.toLowerCase().trim();
    const atendeBusca =
      !termo ||
      r.titulo.toLowerCase().includes(termo) ||
      (r.subtitulo && r.subtitulo.toLowerCase().includes(termo)) ||
      (r.cidade && r.cidade.toLowerCase().includes(termo)) ||
      (r.escritor && r.escritor.toLowerCase().includes(termo));

    return atendeCategoria && atendeBusca;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#c8102e]" />
              Catálogo de Revistas & Edições
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-[#c8102e] border border-red-200 dark:border-red-900/50">
              Admin Exclusivo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cadastre e gerencie as edições da Empire Magazine exibidas na tela pública com carrossel dinâmico.
          </p>
        </div>

        <button
          onClick={abrirModalCriacao}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#c8102e] hover:bg-[#a50d24] shadow-md shadow-red-900/20 hover:shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Revista</span>
        </button>
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mensagemErro && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, nome da edição, cidade ou escritor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
          />
        </div>

        <div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50 cursor-pointer"
          >
            {CATEGORIAS_REVISTAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "Todas" ? "Todas as Categorias" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Revistas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Capa</th>
                <th className="py-3.5 px-4">Título & Edição</th>
                <th className="py-3.5 px-4">Cidade / Região</th>
                <th className="py-3.5 px-4">Escritor / Autor</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-center">Carrossel Topo</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">Nenhuma revista encontrada.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Clique em &quot;Nova Revista&quot; acima para cadastrar a primeira edição.
                    </p>
                  </td>
                </tr>
              ) : (
                itensFiltrados.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Capa */}
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                        <Image
                          src={rev.capa_url}
                          alt={rev.titulo}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>

                    {/* Título & Edição */}
                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {rev.titulo}
                      </div>
                      {rev.subtitulo && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider line-clamp-1">
                          {rev.subtitulo}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {rev.tipo_acesso || "GRATUITA"}
                        </span>
                        {rev.data_publicacao && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(rev.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cidade */}
                    <td className="py-3 px-4">
                      {rev.cidade ? (
                        <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {rev.cidade} {rev.estado && `(${rev.estado})`}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Geral</span>
                      )}
                    </td>

                    {/* Escritor */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {rev.escritor || "Redação"}
                      </span>
                    </td>

                    {/* Categoria */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rev.categoria}
                      </span>
                    </td>

                    {/* Destaque Carrossel */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => alternarDestaque(rev)}
                        title="Alternar presença no carrossel de topo"
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          rev.destaque
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{rev.destaque ? "No Carrossel" : "Normal"}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => alternarStatus(rev)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                          rev.ativo
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rev.ativo ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {rev.ativo ? "Ativo" : "Rascunho"}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={rev.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Abrir Revista"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => abrirModalEdicao(rev)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => excluirRevista(rev.id, rev.titulo)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal de Criação / Edição de Revista */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Topo do Modal */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#c8102e]" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {itemEmEdicao ? "Editar Revista" : "Cadastrar Nova Revista"}
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvar} className="p-4 sm:p-6 space-y-4">
              {/* Título Principal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Título da Revista *
                </label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Vem aí a Revista Empire Magazine de Carmópolis de Minas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
                />
              </div>

              {/* Subtítulo / Nome da Edição */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Nome da Edição / Região
                  </label>
                  <input
                    type="text"
                    value={formSubtitulo}
                    onChange={(e) => setFormSubtitulo(e.target.value)}
                    placeholder="Ex: EMPIRE CARMÓPOLIS DE MINAS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Link de Leitura / Flipbook / PDF *
                  </label>
                  <input
                    type="url"
                    required
                    value={formLinkUrl}
                    onChange={(e) => setFormLinkUrl(e.target.value)}
                    placeholder="https://conecteonline.com.br/#top-revistas"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
                  />
                </div>
              </div>

              {/* Upload da Capa ou URL */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Capa da Revista (Aspecto Vertical 3:4) *
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Pré-visualização da Capa */}
                  <div className="relative w-24 h-32 rounded-lg bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                    {formCapaUrl ? (
                      <Image
                        src={formCapaUrl}
                        alt="Preview da capa"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <BookOpen className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px] font-semibold">Sem capa</span>
                      </div>
                    )}
                  </div>

                  {/* Opções de Upload e URL */}
                  <div className="space-y-2 flex-1 w-full">
                    <div>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                        {fazendoUpload ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{fazendoUpload ? "Enviando Imagem..." : "Fazer Upload de Imagem"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadCapa}
                          disabled={fazendoUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400 ml-2">PNG, JPG ou WebP</span>
                    </div>

                    <div>
                      <input
                        type="url"
                        value={formCapaUrl}
                        onChange={(e) => setFormCapaUrl(e.target.value)}
                        placeholder="Ou cole a URL direta da imagem aqui..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c8102e]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cidade, Estado, Escritor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formCidade}
                    onChange={(e) => setFormCidade(e.target.value)}
                    placeholder="Ex: Carmópolis de Minas"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value.toUpperCase())}
                    placeholder="SP, MG, RJ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Escritor / Autor
                  </label>
                  <input
                    type="text"
                    value={formEscritor}
                    onChange={(e) => setFormEscritor(e.target.value)}
                    placeholder="Ex: Redação Empire"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
                  />
                </div>
              </div>

              {/* Categoria, Tipo de Acesso, Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50 cursor-pointer"
                  >
                    {CATEGORIAS_REVISTAS.filter((c) => c !== "Todas").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Badge de Acesso
                  </label>
                  <select
                    value={formTipoAcesso}
                    onChange={(e) => setFormTipoAcesso(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50 cursor-pointer"
                  >
                    {TIPOS_ACESSO_REVISTAS.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Data de Publicação
                  </label>
                  <input
                    type="date"
                    value={formDataPublicacao}
                    onChange={(e) => setFormDataPublicacao(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
                  />
                </div>
              </div>

              {/* Ordem e Opções */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={formOrdem}
                    onChange={(e) => setFormOrdem(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c8102e]/50"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="destaqueTopo"
                    checked={formDestaque}
                    onChange={(e) => setFormDestaque(e.target.checked)}
                    className="w-4 h-4 rounded text-[#c8102e] focus:ring-[#c8102e] cursor-pointer"
                  />
                  <label htmlFor="destaqueTopo" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Exibir no Carrossel do Topo
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="statusAtivo"
                    checked={formAtivo}
                    onChange={(e) => setFormAtivo(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="statusAtivo" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Publicado (Ativo no Portal)
                  </label>
                </div>
              </div>

              {/* Rodapé do Modal */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#c8102e] hover:bg-[#a50d24] transition-all cursor-pointer shadow-md disabled:opacity-60"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>{itemEmEdicao ? "Atualizar Revista" : "Cadastrar Revista"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
