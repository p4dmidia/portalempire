"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Eye,
  Calendar,
  X,
  MessageSquare,
  Building2,
  Phone,
  Mail,
  Check,
  Tv,
  Film,
  Video,
} from "lucide-react";
import type { Talento, TalentoSolicitacao } from "@/lib/talentos/types";
import { CATEGORIAS_TALENTOS, SERVICOS_PADRAO } from "@/lib/talentos/types";
import { createClient } from "@/lib/supabase/client";

interface TalentosGerenciadorProps {
  initialTalentos: Talento[];
  initialSolicitacoes: TalentoSolicitacao[];
  usuarioNome: string;
}

export function TalentosGerenciador({
  initialTalentos,
  initialSolicitacoes,
  usuarioNome,
}: TalentosGerenciadorProps) {
  const [abaAtiva, setAbaAtiva] = useState<"talentos" | "solicitacoes">("talentos");
  const [talentos, setTalentos] = useState<Talento[]>(initialTalentos);
  const [solicitacoes, setSolicitacoes] = useState<TalentoSolicitacao[]>(initialSolicitacoes);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");

  // Estado do Modal de Talento
  const [modalAberto, setModalAberto] = useState(false);
  const [talentoEmEdicao, setTalentoEmEdicao] = useState<Talento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [fazendoUpload, setFazendoUpload] = useState(false);
  const [fazendoUploadCapa, setFazendoUploadCapa] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Estados dos Campos do Formulário
  const [formNome, setFormNome] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTitulo, setFormTitulo] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formCategoria, setFormCategoria] = useState("apresentadores");
  const [formSegmentos, setFormSegmentos] = useState("");
  const [formFotoUrl, setFormFotoUrl] = useState("");
  const [formFotoCapaUrl, setFormFotoCapaUrl] = useState("");
  const [formCidade, setFormCidade] = useState("Uberlândia");
  const [formEstado, setFormEstado] = useState("MG");
  const [formCidadesAtendidas, setFormCidadesAtendidas] = useState("Nacional e Internacional");
  const [formBioCurta, setFormBioCurta] = useState("");
  const [formBioCompleta, setFormBioCompleta] = useState("");
  const [formSeguidores, setFormSeguidores] = useState("+ 100 mil seguidores");
  const [formInstagram, setFormInstagram] = useState("");
  const [formYoutube, setFormYoutube] = useState("");
  const [formTiktok, setFormTiktok] = useState("");
  const [formLinkedin, setFormLinkedin] = useState("");
  const [formServicos, setFormServicos] = useState<string[]>([]);
  const [formVideoTitulo, setFormVideoTitulo] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formVerificado, setFormVerificado] = useState(true);
  const [formDestaqueHome, setFormDestaqueHome] = useState(true);
  const [formOrdem, setFormOrdem] = useState(0);
  const [formStatus, setFormStatus] = useState<"ativo" | "inativo">("ativo");
  const [alternandoStatusId, setAlternandoStatusId] = useState<string | null>(null);

  // Ativar / Desativar Talento com 1 Clique
  const handleToggleStatus = async (talento: Talento) => {
    try {
      setAlternandoStatusId(talento.id);
      const novoStatus = talento.status === "ativo" ? "inativo" : "ativo";

      const res = await fetch(`/api/talentos/${talento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar status.");

      setTalentos((prev) =>
        prev.map((t) => (t.id === talento.id ? { ...t, status: novoStatus } : t))
      );
      setMensagemSucesso(
        `Talento "${talento.nome}" foi ${novoStatus === "ativo" ? "ativado" : "desativado"} com sucesso!`
      );
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao alterar status.");
      setTimeout(() => setMensagemErro(null), 4000);
    } finally {
      setAlternandoStatusId(null);
    }
  };

  // Abre Modal para Novo Talento
  const handleNovoTalento = () => {
    setTalentoEmEdicao(null);
    setFormNome("");
    setFormSlug("");
    setFormTitulo("");
    setFormWhatsapp("");
    setFormCategoria("apresentadores");
    setFormSegmentos("Comunicação, Negócios");
    setFormFotoUrl("");
    setFormFotoCapaUrl("");
    setFormCidade("Uberlândia");
    setFormEstado("MG");
    setFormCidadesAtendidas("Nacional e Internacional");
    setFormBioCurta("");
    setFormBioCompleta("");
    setFormSeguidores("+ 100 mil seguidores");
    setFormInstagram("");
    setFormYoutube("");
    setFormTiktok("");
    setFormLinkedin("");
    setFormServicos(["Comerciais de TV", "Palestras", "Cerimoniais"]);
    setFormVideoTitulo("");
    setFormVideoUrl("");
    setFormVerificado(true);
    setFormDestaqueHome(true);
    setFormOrdem(0);
    setFormStatus("ativo");
    setMensagemErro(null);
    setMensagemSucesso(null);
    setModalAberto(true);
  };

  // Abre Modal para Edição
  const handleEditarTalento = (t: Talento) => {
    setTalentoEmEdicao(t);
    setFormNome(t.nome);
    setFormSlug(t.slug);
    setFormTitulo(t.titulo_profissional);
    setFormWhatsapp(t.whatsapp || t.redes_sociais?.whatsapp || "");
    setFormCategoria(t.categoria);
    setFormSegmentos(t.segmentos?.join(", ") || "");
    setFormFotoUrl(t.foto_url);
    setFormFotoCapaUrl(t.foto_capa_url || "");
    setFormCidade(t.cidade_nome || "Uberlândia");
    setFormEstado(t.estado || "MG");
    setFormCidadesAtendidas(t.cidades_atendidas || "Nacional e Internacional");
    setFormBioCurta(t.bio_curta);
    setFormBioCompleta(t.bio_completa || "");
    setFormSeguidores(t.seguidores_total || "+ 100 mil seguidores");
    setFormInstagram(t.redes_sociais?.instagram || "");
    setFormYoutube(t.redes_sociais?.youtube || "");
    setFormTiktok(t.redes_sociais?.tiktok || "");
    setFormLinkedin(t.redes_sociais?.linkedin || "");
    setFormServicos(t.servicos || []);
    setFormVideoTitulo(t.videos?.[0]?.titulo || "");
    setFormVideoUrl(t.videos?.[0]?.url || "");
    setFormVerificado(t.verificado);
    setFormDestaqueHome(t.destaque_home);
    setFormOrdem(t.ordem || 0);
    setFormStatus(t.status === "ativo" ? "ativo" : "inativo");
    setMensagemErro(null);
    setMensagemSucesso(null);
    setModalAberto(true);
  };

  // Upload de Imagem de Perfil
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUpload(true);
      setMensagemErro(null);

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `talentos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      let uploadRes = await supabase.storage.from("talentos").upload(fileName, file, { upsert: true });
      let bucketUsado = "talentos";

      if (uploadRes.error) {
        uploadRes = await supabase.storage.from("materias").upload(fileName, file, { upsert: true });
        bucketUsado = "materias";
      }

      if (uploadRes.error) {
        throw new Error(`Erro ao enviar foto: ${uploadRes.error.message}`);
      }

      const { data: publicData } = supabase.storage.from(bucketUsado).getPublicUrl(fileName);
      setFormFotoUrl(publicData.publicUrl);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro no upload da imagem.");
    } finally {
      setFazendoUpload(false);
    }
  };

  // Upload de Imagem de Capa (Banner)
  const handleUploadFotoCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUploadCapa(true);
      setMensagemErro(null);

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `talentos/capas/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      let uploadRes = await supabase.storage.from("talentos").upload(fileName, file, { upsert: true });
      let bucketUsado = "talentos";

      if (uploadRes.error) {
        uploadRes = await supabase.storage.from("materias").upload(fileName, file, { upsert: true });
        bucketUsado = "materias";
      }

      if (uploadRes.error) {
        throw new Error(`Erro ao enviar capa: ${uploadRes.error.message}`);
      }

      const { data: publicData } = supabase.storage.from(bucketUsado).getPublicUrl(fileName);
      setFormFotoCapaUrl(publicData.publicUrl);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro no upload da imagem de capa.");
    } finally {
      setFazendoUploadCapa(false);
    }
  };

  // Salvar Talento (POST ou PUT)
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim() || !formTitulo.trim() || !formFotoUrl.trim() || !formBioCurta.trim()) {
      setMensagemErro("Preencha Nome, Título, Foto e Apresentação curta.");
      return;
    }

    try {
      setSalvando(true);
      setMensagemErro(null);

      const segmentosArr = formSegmentos
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const videosArr = formVideoUrl
        ? [{ titulo: formVideoTitulo || "Vídeo de Apresentação", url: formVideoUrl }]
        : [];

      const finalSlug = formSlug.trim() || (talentoEmEdicao ? talentoEmEdicao.slug : formNome.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

      const payload = {
        nome: formNome.trim(),
        slug: finalSlug,
        titulo_profissional: formTitulo.trim(),
        whatsapp: formWhatsapp.trim() || null,
        categoria: formCategoria,
        segmentos: segmentosArr,
        foto_url: formFotoUrl.trim(),
        foto_capa_url: formFotoCapaUrl.trim() || null,
        cidade_nome: formCidade.trim(),
        estado: formEstado.trim(),
        cidades_atendidas: formCidadesAtendidas.trim(),
        bio_curta: formBioCurta.trim(),
        bio_completa: formBioCompleta.trim() || null,
        seguidores_total: formSeguidores.trim(),
        redes_sociais: {
          whatsapp: formWhatsapp.trim() || undefined,
          instagram: formInstagram.trim() || undefined,
          youtube: formYoutube.trim() || undefined,
          tiktok: formTiktok.trim() || undefined,
          linkedin: formLinkedin.trim() || undefined,
        },
        servicos: formServicos,
        modalidades: ["Presencial", "Online/Remoto"],
        videos: videosArr,
        verificado: formVerificado,
        destaque_home: formDestaqueHome,
        ordem: Number(formOrdem) || 0,
        status: formStatus,
      };

      if (talentoEmEdicao) {
        // Atualizar
        const res = await fetch(`/api/talentos/${talentoEmEdicao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao atualizar talento.");

        setTalentos((prev) =>
          prev.map((t) =>
            t.id === talentoEmEdicao.id
              ? (data.data as Talento) || { ...t, ...payload, slug: finalSlug }
              : t
          )
        );
        setMensagemSucesso("Talento atualizado com sucesso!");
      } else {
        // Criar
        const res = await fetch("/api/talentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao criar talento.");

        if (data.data) {
          setTalentos((prev) => [data.data, ...prev]);
        }
        setMensagemSucesso("Novo talento cadastrado com sucesso!");
      }

      setModalAberto(false);
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  // Excluir Talento
  const handleExcluirTalento = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja remover ${nome} do catálogo de talentos?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/talentos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao remover talento.");
      }
      setTalentos((prev) => prev.filter((t) => t.id !== id));
      setMensagemSucesso(`Talento ${nome} removido.`);
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao remover.");
    }
  };

  // Alternar Status de Solicitação
  const handleAtualizarStatusSolicitacao = async (id: string, novoStatus: any) => {
    try {
      const res = await fetch(`/api/talentos/solicitacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status.");

      setSolicitacoes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: novoStatus } : s))
      );
    } catch {
      alert("Erro ao alterar status da solicitação.");
    }
  };

  // Toggle do serviço nas checkboxes
  const handleToggleServico = (servico: string) => {
    setFormServicos((prev) =>
      prev.includes(servico) ? prev.filter((s) => s !== servico) : [...prev, servico]
    );
  };

  // Talentos filtrados na listagem
  const talentosFiltrados = talentos.filter((t) => {
    if (filtroCategoria !== "todos" && t.categoria !== filtroCategoria) return false;
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      return (
        t.nome.toLowerCase().includes(termo) ||
        t.titulo_profissional.toLowerCase().includes(termo) ||
        t.cidade_nome?.toLowerCase().includes(termo)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Módulo Comercial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Empire Talentos & Celebridades
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestão de elenco, catálogo de influenciadores, apresentadores e solicitações de orçamento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/talentos"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Vitrine no Portal</span>
          </Link>

          <button
            type="button"
            onClick={handleNovoTalento}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Talento</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* 2. Abas: Vitrine de Talentos x Solicitações */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setAbaAtiva("talentos")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            abaAtiva === "talentos"
              ? "bg-amber-400 text-slate-950 shadow"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Elenco & Talentos ({talentos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("solicitacoes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            abaAtiva === "solicitacoes"
              ? "bg-amber-400 text-slate-950 shadow"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Solicitações de Orçamento ({solicitacoes.length})</span>
          {solicitacoes.filter((s) => s.status === "pendente").length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* ABA 1: GERENCIAR TALENTOS */}
      {abaAtiva === "talentos" && (
        <div className="space-y-4">
          {/* Barra de Busca e Filtro */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, profissão ou cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="w-full sm:w-56">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {CATEGORIAS_TALENTOS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Talentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {talentosFiltrados.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-lg hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-400/50 bg-slate-800 shrink-0">
                      <Image
                        src={t.foto_url}
                        alt={t.nome}
                        fill
                        unoptimized
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-white truncate">{t.nome}</h3>
                        {t.verificado && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-amber-300 font-semibold capitalize truncate">
                        {t.categoria}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {t.cidade_nome || "Brasil"} • {t.seguidores_total}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {t.bio_curta}
                  </p>

                  <div className="flex items-center gap-2 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t)}
                      disabled={alternandoStatusId === t.id}
                      className={`px-2.5 py-1 rounded-full font-bold text-[10.5px] flex items-center gap-1.5 transition-all cursor-pointer ${
                        t.status === "ativo"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                      }`}
                      title={t.status === "ativo" ? "Clique para desativar este talento" : "Clique para ativar este talento"}
                    >
                      <span className={`w-2 h-2 rounded-full ${t.status === "ativo" ? "bg-emerald-400" : "bg-red-400"}`} />
                      <span>{alternandoStatusId === t.id ? "Alterando..." : t.status === "ativo" ? "Ativo" : "Inativo"}</span>
                    </button>
                    {t.destaque_home && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold">
                        ★ Destaque
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/talentos/${t.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Ver Perfil Público"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditarTalento(t)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExcluirTalento(t.id, t.nome)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: SOLICITAÇÕES DE ORÇAMENTO */}
      {abaAtiva === "solicitacoes" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Leads e Propostas Comerciais</h3>
              <span className="text-xs text-slate-400">Total: {solicitacoes.length}</span>
            </div>

            {solicitacoes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm">Nenhuma solicitação de orçamento registrada ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Data</th>
                      <th className="p-3.5">Cliente / Empresa</th>
                      <th className="p-3.5">WhatsApp</th>
                      <th className="p-3.5">Talento & Serviço</th>
                      <th className="p-3.5">Local & Data</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {solicitacoes.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 text-slate-400 whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-3.5 font-bold">
                          <div className="text-white">{s.nome_cliente}</div>
                          {s.empresa && (
                            <div className="text-[11px] text-slate-400 font-normal">
                              {s.empresa}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <a
                            href={`https://wa.me/55${s.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{s.whatsapp}</span>
                          </a>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-amber-300">
                            {s.talento?.nome || "Talento"}
                          </div>
                          <div className="text-[11px] text-slate-400">{s.servico_desejado}</div>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div>{s.cidade_evento || "A combinar"}</div>
                          <div className="text-[11px] text-slate-400">{s.data_prevista}</div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={s.status}
                            onChange={(e) =>
                              handleAtualizarStatusSolicitacao(s.id, e.target.value)
                            }
                            className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em_atendimento">Em Atendimento</option>
                            <option value="proposta_enviada">Proposta Enviada</option>
                            <option value="fechado">Fechado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Chamar Cliente */}
                            <a
                              href={`https://wa.me/55${s.whatsapp.replace(
                                /\D/g,
                                ""
                              )}?text=${encodeURIComponent(
                                `Olá ${s.nome_cliente}! Sou da equipe comercial do Grupo Empire Cidades sobre sua solicitação para o talento ${
                                  s.talento?.nome || ""
                                }.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                              title="Conversar com o Cliente no WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Cliente</span>
                            </a>

                            {/* Encaminhar ao Talento */}
                            {s.talento?.whatsapp && (
                              <a
                                href={`https://wa.me/55${s.talento.whatsapp.replace(
                                  /\D/g,
                                  ""
                                )}?text=${encodeURIComponent(
                                  `*NOVA PROPOSTA DE TRABALHO - EMPIRE TALENTOS*\n\n` +
                                    `Olá ${s.talento.nome}! Você recebeu uma solicitação de contratação pelo Portal Empire Cidades:\n\n` +
                                    `• *Cliente:* ${s.nome_cliente}\n` +
                                    (s.empresa ? `• *Empresa:* ${s.empresa}\n` : "") +
                                    `• *WhatsApp do Contratante:* ${s.whatsapp}\n` +
                                    (s.email ? `• *E-mail:* ${s.email}\n` : "") +
                                    `• *Serviço:* ${s.servico_desejado}\n` +
                                    `• *Modalidade:* ${s.modalidade}\n` +
                                    (s.cidade_evento ? `• *Local:* ${s.cidade_evento}\n` : "") +
                                    (s.data_prevista ? `• *Data:* ${s.data_prevista}\n` : "") +
                                    (s.descricao_briefing ? `• *Briefing:* ${s.descricao_briefing}\n` : "")
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                                title="Encaminhar Proposta Completa ao WhatsApp do Talento"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Talento</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MODAL DE CADASTRO / EDIÇÃO DE TALENTO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl text-white overflow-hidden my-8">
            <div className="bg-slate-800 p-5 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>{talentoEmEdicao ? "Editar Talento" : "Cadastrar Novo Talento"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {mensagemErro && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-semibold">
                  {mensagemErro}
                </div>
              )}

              {/* Imagens: Foto de Perfil e Imagem de Capa Panorâmica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                {/* 1. Upload da Foto de Perfil */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                    Foto de Perfil (Cards & Vitrine) *
                  </label>
                  <div className="flex items-center gap-3">
                    {formFotoUrl ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-slate-800">
                        <Image
                          src={formFotoUrl}
                          alt="Preview Perfil"
                          fill
                          unoptimized
                          className="object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 text-center p-1 shrink-0">
                        Sem Foto
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer border border-slate-600 text-xs">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{fazendoUpload ? "Enviando..." : "Upload Foto"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadFoto}
                          className="hidden"
                          disabled={fazendoUpload}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Ou URL direta da foto..."
                        value={formFotoUrl}
                        onChange={(e) => setFormFotoUrl(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Upload da Imagem de Capa (Banner do Perfil) */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                    Imagem de Capa (Banner Superior do Perfil)
                  </label>
                  <div className="flex items-center gap-3">
                    {formFotoCapaUrl ? (
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-amber-400/80 shrink-0 bg-slate-800">
                        <Image
                          src={formFotoCapaUrl}
                          alt="Preview Capa"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 text-center p-1 shrink-0">
                        Capa Padrão
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer border border-slate-600 text-xs">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{fazendoUploadCapa ? "Enviando..." : "Upload Capa"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadFotoCapa}
                            className="hidden"
                            disabled={fazendoUploadCapa}
                          />
                        </label>
                        {formFotoCapaUrl && (
                          <button
                            type="button"
                            onClick={() => setFormFotoCapaUrl("")}
                            className="text-slate-400 hover:text-red-400 text-[10px] underline"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Ou URL direta da capa..."
                        value={formFotoCapaUrl}
                        onChange={(e) => setFormFotoCapaUrl(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nome & Título Profissional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Leandro D'Ambrosio"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Título / Profissão *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Apresentador | Palestrante | Empreendedor"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              {/* Categoria & Seguidores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                  >
                    {CATEGORIAS_TALENTOS.filter((c) => c.id !== "todos").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Seguidores / Alcance
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: + 2,5 milhões de seguidores"
                    value={formSeguidores}
                    onChange={(e) => setFormSeguidores(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Cidade de Base
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Uberlândia"
                    value={formCidade}
                    onChange={(e) => setFormCidade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              {/* WhatsApp do Talento & Regiões Atendidas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <div>
                  <label className="block text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    WhatsApp do Talento (Recebe os Orçamentos Direto)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (34) 99999-9999 ou 34999999999"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-emerald-500/50 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    O cliente poderá enviar a proposta preenchida diretamente para este WhatsApp.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-xs">
                    Cidades e Regiões Atendidas
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Nacional e Internacional, ou Todo Brasil"
                    value={formCidadesAtendidas}
                    onChange={(e) => setFormCidadesAtendidas(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Regiões onde o profissional atua presencialmente.
                  </span>
                </div>
              </div>

              {/* Segmentos */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Segmentos de Atuação (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Comunicação, Negócios, Agronegócio, Sustentabilidade"
                  value={formSegmentos}
                  onChange={(e) => setFormSegmentos(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              {/* Mini Bio */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Apresentação Curta (Exibida no Card) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Resumo de 2 linhas que destaca as principais credenciais..."
                  value={formBioCurta}
                  onChange={(e) => setFormBioCurta(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white resize-none"
                />
              </div>

              {/* Bio Completa */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Trajetória & Biografia Completa (Página Individual)
                </label>
                <textarea
                  rows={4}
                  placeholder="Histórico profissional completo, carreira na televisão, eventos marcantes..."
                  value={formBioCompleta}
                  onChange={(e) => setFormBioCompleta(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              {/* Serviços Oferecidos */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2">
                  Serviços Disponíveis para Contratação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICOS_PADRAO.map((serv) => (
                    <label
                      key={serv}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer text-slate-300 hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={formServicos.includes(serv)}
                        onChange={() => handleToggleServico(serv)}
                        className="rounded accent-amber-400"
                      />
                      <span>{serv}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={formYoutube}
                    onChange={(e) => setFormYoutube(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Vídeo do YouTube */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Título do Vídeo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Apresentação no Fórum de Negócios"
                    value={formVideoTitulo}
                    onChange={(e) => setFormVideoTitulo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Link do Vídeo no YouTube
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formVerificado}
                    onChange={(e) => setFormVerificado(e.target.checked)}
                    className="rounded accent-amber-400"
                  />
                  <span className="font-bold text-amber-300">Selo Oficial Verificado ★</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDestaqueHome}
                    onChange={(e) => setFormDestaqueHome(e.target.checked)}
                    className="rounded accent-amber-400"
                  />
                  <span className="font-bold text-white">Destaque no Topo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formStatus === "ativo"}
                    onChange={(e) => setFormStatus(e.target.checked ? "ativo" : "inativo")}
                    className="rounded accent-amber-400"
                  />
                  <span className="font-bold text-emerald-400">Publicado / Ativo</span>
                </label>
              </div>

              {/* Botões do Rodapé */}
              {mensagemErro && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-semibold text-xs">
                  {mensagemErro}
                </div>
              )}

              <div className="pt-4 border-t border-slate-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {salvando ? "Salvando..." : talentoEmEdicao ? "Atualizar Talento" : "Cadastrar Talento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
