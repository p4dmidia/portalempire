"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Tv,
  MapPin,
  Building,
  Phone,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Check,
  X,
  Upload,
  Calendar,
  MessageSquare,
  Sparkles,
  Eye,
  BatteryCharging,
} from "lucide-react";
import type { Totem, TotemSolicitacao, TipoModeloTotem } from "@/lib/totens/types";
import { TIPOS_ESTABELECIMENTO, RECURSOS_PADRAO, obterModeloTotem, MODELOS_TOTENS_EMPIRE } from "@/lib/totens/types";
import { createClient } from "@/lib/supabase/client";

interface TotensGerenciadorProps {
  initialTotens: Totem[];
  initialSolicitacoes: TotemSolicitacao[];
  usuarioNome: string;
}

export function TotensGerenciador({
  initialTotens,
  initialSolicitacoes,
  usuarioNome,
}: TotensGerenciadorProps) {
  const [totens, setTalentos] = useState<Totem[]>(initialTotens);
  const [solicitacoes, setSolicitacoes] = useState<TotemSolicitacao[]>(initialSolicitacoes);

  const [abaAtiva, setAbaAtiva] = useState<"totens" | "solicitacoes">("totens");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");

  // Estado do Modal de Cadastro/Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [totemEmEdicao, setTotemEmEdicao] = useState<Totem | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [fazendoUpload, setFazendoUpload] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [alternandoStatusId, setAlternandoStatusId] = useState<string | null>(null);

  // Campos do Formulário
  const [formTipoModelo, setFormTipoModelo] = useState<TipoModeloTotem>("totem_carregador");
  const [formPrecoMensal, setFormPrecoMensal] = useState<number>(250);
  const [formNome, setFormNome] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formEstabelecimento, setFormEstabelecimento] = useState("");
  const [formTipo, setFormTipo] = useState("Galeria");
  const [formCep, setFormCep] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepMensagem, setCepMensagem] = useState<string | null>(null);
  const [formEndereco, setFormEndereco] = useState("");
  const [formBairro, setFormBairro] = useState("");
  const [formCidade, setFormCidade] = useState("Uberlândia");
  const [formEstado, setFormEstado] = useState("MG");
  const [formDescricaoPonto, setFormDescricaoPonto] = useState("");
  const [formCirculacao, setFormCirculacao] = useState("25.000 pessoas/mês");
  const [formPerfilPublico, setFormPerfilPublico] = useState("Consumidores, Famílias, Profissionais");
  const [formModelo, setFormModelo] = useState("Totem Digital Vertical 55 polegadas");
  const [formTamanhoTela, setFormTamanhoTela] = useState("55 polegadas 4K Ultra HD");
  const [formFormato, setFormFormato] = useState("20 slots de 15 segundos");
  const [formSlotsTotal, setFormSlotsTotal] = useState(20);
  const [formSlotsLivres, setFormSlotsLivres] = useState(5);
  const [formRecursos, setFormRecursos] = useState<string[]>(["Com carregador de celular"]);
  const [formFotoUrl, setFormFotoUrl] = useState("");
  const [formGoogleMapsUrl, setFormGoogleMapsUrl] = useState("");
  const [formFranqueadoNome, setFormFranqueadoNome] = useState("Marcelo Olivers");
  const [formFranqueadoWhatsapp, setFormFranqueadoWhatsapp] = useState("34988676886");
  const [formFranqueadoEmail, setFormFranqueadoEmail] = useState("");
  const [formDestaque, setFormDestaque] = useState(true);
  const [formStatus, setFormStatus] = useState<"ativo" | "inativo">("ativo");
  const [formOrdem, setFormOrdem] = useState(0);

  // Alternar modelo de totem com valores padrões do flyer oficial (R$ 250 e R$ 350)
  const handleMudarModelo = (novoModelo: TipoModeloTotem) => {
    setFormTipoModelo(novoModelo);
    if (novoModelo === "totem_carregador") {
      setFormPrecoMensal(250);
      setFormModelo("Totem com Carregador de Celular");
      setFormTamanhoTela("Tela Superior de Exibição");
      if (!formRecursos.some((r) => r.toLowerCase().includes("carregador"))) {
        setFormRecursos([...formRecursos, "Com carregador de celular"]);
      }
    } else if (novoModelo === "totem_interativo_maior") {
      setFormPrecoMensal(350);
      setFormModelo("Totem Interativo Maior Indoor 43\" Touch");
      setFormTamanhoTela("Tela 43\" Touch (Full HD 1920x1080)");
      if (!formRecursos.some((r) => r.toLowerCase().includes("touch"))) {
        setFormRecursos([...formRecursos, "Tela touch interativa"]);
      }
    }
  };

  // Abre Modal para Novo Totem
  const handleNovoTotem = () => {
    setTotemEmEdicao(null);
    setFormTipoModelo("totem_carregador");
    setFormPrecoMensal(250);
    setFormNome("");
    setFormSlug("");
    setFormEstabelecimento("");
    setFormTipo("Galeria");
    setFormCep("");
    setCepMensagem(null);
    setFormEndereco("");
    setFormBairro("");
    setFormCidade("Uberlândia");
    setFormEstado("MG");
    setFormDescricaoPonto("");
    setFormCirculacao("25.000 pessoas/mês");
    setFormPerfilPublico("Consumidores, Famílias, Profissionais");
    setFormModelo("Totem com Carregador de Celular");
    setFormTamanhoTela("Tela Superior de Exibição");
    setFormFormato("20 slots de 15 segundos");
    setFormSlotsTotal(20);
    setFormSlotsLivres(5);
    setFormRecursos(["Com carregador de celular"]);
    setFormFotoUrl("/images/totem-carregador.jpg");
    setFormGoogleMapsUrl("");
    setFormFranqueadoNome("Marcelo Olivers");
    setFormFranqueadoWhatsapp("34988676886");
    setFormFranqueadoEmail("");
    setFormDestaque(true);
    setFormStatus("ativo");
    setFormOrdem(0);
    setMensagemErro(null);
    setMensagemSucesso(null);
    setModalAberto(true);
  };

  // Abre Modal para Edição
  const handleEditarTotem = (t: Totem) => {
    setTotemEmEdicao(t);
    const mod = obterModeloTotem(t);
    setFormTipoModelo(t.tipo_modelo || mod.id);
    setFormPrecoMensal(t.preco_mensal || mod.preco_mensal);
    setFormNome(t.nome);
    setFormSlug(t.slug);
    setFormEstabelecimento(t.estabelecimento_nome);
    setFormTipo(t.tipo_estabelecimento);
    setFormCep(t.cep || "");
    setCepMensagem(null);
    setFormEndereco(t.endereco);
    setFormBairro(t.bairro);
    setFormCidade(t.cidade_nome);
    setFormEstado(t.estado);
    setFormDescricaoPonto(t.descricao_ponto);
    setFormCirculacao(t.circulacao_estimada);
    setFormPerfilPublico(t.perfil_publico?.join(", ") || "");
    setFormModelo(t.modelo_equipamento || mod.nome);
    setFormTamanhoTela(t.tamanho_tela || mod.tela);
    setFormFormato(t.formato_publicidade || "");
    setFormSlotsTotal(t.slots_total || 20);
    setFormSlotsLivres(t.slots_disponiveis || 5);
    setFormRecursos(t.recursos_extras || []);
    setFormFotoUrl(t.foto_url);
    setFormGoogleMapsUrl(t.google_maps_url || "");
    setFormFranqueadoNome(t.franqueado_nome);
    setFormFranqueadoWhatsapp(t.franqueado_whatsapp);
    setFormFranqueadoEmail(t.franqueado_email || "");
    setFormDestaque(t.destaque);
    setFormStatus(t.status === "ativo" ? "ativo" : "inativo");
    setFormOrdem(t.ordem || 0);
    setMensagemErro(null);
    setMensagemSucesso(null);
    setModalAberto(true);
  };

  // Upload de Imagem do Totem
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUpload(true);
      setMensagemErro(null);

      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `totens/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      let uploadRes = await supabase.storage.from("materias").upload(fileName, file, { upsert: true });
      let bucketUsado = "materias";

      if (uploadRes.error) {
        uploadRes = await supabase.storage.from("talentos").upload(fileName, file, { upsert: true });
        bucketUsado = "talentos";
      }

      if (uploadRes.error) {
        throw new Error(`Erro ao enviar foto: ${uploadRes.error.message}`);
      }

      const { data: publicData } = supabase.storage.from(bucketUsado).getPublicUrl(fileName);
      setFormFotoUrl(publicData.publicUrl);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro no upload da foto.");
    } finally {
      setFazendoUpload(false);
    }
  };

  // Alternar Status com 1 Clique direto no Card
  const handleToggleStatus = async (totem: Totem) => {
    try {
      setAlternandoStatusId(totem.id);
      const novoStatus = totem.status === "ativo" ? "inativo" : "ativo";

      const res = await fetch(`/api/totens/${totem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar status.");

      setTalentos((prev) =>
        prev.map((t) => (t.id === totem.id ? { ...t, status: novoStatus } : t))
      );
      setMensagemSucesso(
        `Totem "${totem.nome}" foi ${novoStatus === "ativo" ? "ativado" : "desativado"} com sucesso!`
      );
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao alterar status.");
      setTimeout(() => setMensagemErro(null), 4000);
    } finally {
      setAlternandoStatusId(null);
    }
  };

  // Formatar CEP (00000-000)
  const formatarCep = (valor: string) => {
    const digits = valor.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  // Buscar endereço via CEP (ViaCEP) e gerar link no Maps
  const handleBuscarCep = async (cepParaBuscar?: string) => {
    const cepLimpo = (cepParaBuscar || formCep).replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setCepMensagem("Digite os 8 números do CEP.");
      return;
    }

    try {
      setBuscandoCep(true);
      setCepMensagem("Buscando no ViaCEP...");
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepMensagem("CEP não encontrado. Preencha manualmente.");
        return;
      }

      if (data.logradouro) setFormEndereco(data.logradouro);
      if (data.bairro) setFormBairro(data.bairro);
      if (data.localidade) setFormCidade(data.localidade);
      if (data.uf) setFormEstado(data.uf.toUpperCase());

      // Auto-gerar link do Google Maps com base no ENDEREÇO REAL (evita que o Maps confunda com nomes fantasia/teste)
      const partesEndereco = [
        data.logradouro,
        data.bairro,
        `${data.localidade} - ${data.uf}`,
        data.cep ? `CEP ${data.cep}` : "",
      ].filter(Boolean);

      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        partesEndereco.join(", ")
      )}`;
      setFormGoogleMapsUrl(mapsUrl);

      setCepMensagem(
        `✓ Localizado: ${data.bairro ? data.bairro + ", " : ""}${data.localidade}/${data.uf}`
      );
      setTimeout(() => setCepMensagem(null), 5000);
    } catch {
      setCepMensagem("Não foi possível consultar o CEP no momento.");
    } finally {
      setBuscandoCep(false);
    }
  };

  // Recalcular URL do Google Maps com base nos campos de endereço atuais
  const handleRecalcularUrlMaps = () => {
    const partes = [
      formEndereco.trim(),
      formBairro.trim(),
      formCidade.trim() ? `${formCidade.trim()} - ${formEstado.trim()}` : formEstado.trim(),
      formCep.trim() ? `CEP ${formCep.trim()}` : "",
    ].filter(Boolean);

    if (partes.length === 0) {
      alert("Preencha ao menos o Endereço ou Cidade para gerar o link do mapa.");
      return;
    }

    const novaUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      partes.join(", ")
    )}`;
    setFormGoogleMapsUrl(novaUrl);
  };

  // Salvar Totem (POST ou PUT)
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim() || !formEstabelecimento.trim() || !formEndereco.trim() || !formFotoUrl.trim() || !formFranqueadoWhatsapp.trim()) {
      setMensagemErro("Preencha Nome, Estabelecimento, Endereço, Foto e WhatsApp do Franqueado.");
      return;
    }

    try {
      setSalvando(true);
      setMensagemErro(null);

      const perfisArr = formPerfilPublico
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const finalSlug =
        formSlug.trim() ||
        (totemEmEdicao
          ? totemEmEdicao.slug
          : `${formNome}-${formCidade}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

      const payload = {
        nome: formNome.trim(),
        slug: finalSlug,
        estabelecimento_nome: formEstabelecimento.trim(),
        tipo_estabelecimento: formTipo,
        cep: formCep.trim() || null,
        endereco: formEndereco.trim(),
        bairro: formBairro.trim(),
        cidade_nome: formCidade.trim(),
        estado: formEstado.trim(),
        descricao_ponto: formDescricaoPonto.trim() || "Ponto de grande circulação.",
        circulacao_estimada: formCirculacao.trim() || "25.000 pessoas/mês",
        perfil_publico: perfisArr,
        tipo_modelo: formTipoModelo,
        preco_mensal: Number(formPrecoMensal) || (formTipoModelo === "totem_interativo_maior" ? 350 : 250),
        modelo_equipamento: formModelo.trim(),
        tamanho_tela: formTamanhoTela.trim(),
        formato_publicidade: formFormato.trim(),
        slots_total: Number(formSlotsTotal) || 20,
        slots_disponiveis: Number(formSlotsLivres) || 5,
        recursos_extras: formRecursos,
        foto_url: formFotoUrl.trim(),
        google_maps_url: formGoogleMapsUrl.trim() || null,
        franqueado_nome: formFranqueadoNome.trim() || "Marcelo Olivers",
        franqueado_whatsapp: formFranqueadoWhatsapp.trim(),
        franqueado_email: formFranqueadoEmail.trim() || null,
        destaque: formDestaque,
        status: formStatus,
        ordem: Number(formOrdem) || 0,
      };

      if (totemEmEdicao) {
        const res = await fetch(`/api/totens/${totemEmEdicao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao atualizar totem.");

        setTalentos((prev) =>
          prev.map((t) => (t.id === totemEmEdicao.id ? (data.data as Totem) || { ...t, ...payload } : t))
        );
        setMensagemSucesso("Totem atualizado com sucesso!");
      } else {
        const res = await fetch("/api/totens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao cadastrar totem.");

        if (data.data) {
          setTalentos((prev) => [data.data, ...prev]);
        }
        setMensagemSucesso("Novo totem cadastrado com sucesso!");
      }

      setModalAberto(false);
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  // Excluir Totem
  const handleExcluirTotem = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o ${nome}?`)) return;

    try {
      const res = await fetch(`/api/totens/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao remover totem.");
      }
      setTalentos((prev) => prev.filter((t) => t.id !== id));
      setMensagemSucesso(`Totem ${nome} removido.`);
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao remover.");
    }
  };

  // Atualizar Status da Solicitação
  const handleAtualizarStatusSolicitacao = async (id: string, status: any) => {
    try {
      const res = await fetch(`/api/totens/solicitacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status.");

      setSolicitacoes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch {
      alert("Erro ao alterar status da solicitação.");
    }
  };

  // Toggle Recursos
  const handleToggleRecurso = (rec: string) => {
    setFormRecursos((prev) =>
      prev.includes(rec) ? prev.filter((r) => r !== rec) : [...prev, rec]
    );
  };

  // Totens Filtrados na listagem admin
  const totensFiltrados = totens.filter((t) => {
    if (filtroTipo !== "todos" && t.tipo_estabelecimento !== filtroTipo) return false;
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      return (
        t.nome.toLowerCase().includes(termo) ||
        t.estabelecimento_nome.toLowerCase().includes(termo) ||
        t.cidade_nome.toLowerCase().includes(termo) ||
        t.bairro.toLowerCase().includes(termo)
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
            <Tv className="w-3.5 h-3.5" />
            <span>Módulo DOOH & Publicidade</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Empire Totens — Gestão de Equipamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastre os totens instalados em cada cidade, gerencie franqueados e acompanhe propostas de anunciantes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/totens"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Ver Vitrine Pública</span>
          </Link>

          <button
            type="button"
            onClick={handleNovoTotem}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Totem</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{mensagemSucesso}</span>
          <button onClick={() => setMensagemSucesso(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Navegação por Abas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setAbaAtiva("totens")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === "totens"
              ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Totens Cadastrados ({totens.length})
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("solicitacoes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === "solicitacoes"
              ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Solicitações de Anunciantes ({solicitacoes.length})
        </button>
      </div>

      {/* ABA 1: TOTENS CADASTRADOS */}
      {abaAtiva === "totens" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome, shopping, bairro ou cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                aria-label="Filtrar por tipo de estabelecimento"
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                {TIPOS_ESTABELECIMENTO.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Totens */}
          {totensFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <Tv className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">Nenhum totem cadastrado ainda.</p>
              <button
                type="button"
                onClick={handleNovoTotem}
                className="text-amber-400 font-bold text-xs underline cursor-pointer"
              >
                Cadastrar o primeiro totem agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {totensFiltrados.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-800">
                        <Image
                          src={t.foto_url}
                          alt={t.nome}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            {t.nome.split(" - ")[0]}
                          </span>
                          <span className="text-[10.5px] text-slate-400">
                            {t.cidade_nome}/{t.estado}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white truncate">
                          {t.estabelecimento_nome}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {t.endereco}, {t.bairro}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Público:</span>
                        <span className="font-bold text-slate-200">{t.circulacao_estimada}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Franqueado:</span>
                        <span className="font-bold text-slate-200 truncate block">
                          {t.franqueado_nome}
                        </span>
                      </div>
                    </div>

                    {/* Botão de Alternância de Status (1 Clique) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(t)}
                        disabled={alternandoStatusId === t.id}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10.5px] flex items-center gap-1.5 transition-all cursor-pointer ${
                          t.status === "ativo"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                        }`}
                        title="Clique para Ativar ou Desativar o Totem"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            t.status === "ativo" ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        <span>
                          {alternandoStatusId === t.id
                            ? "Alterando..."
                            : t.status === "ativo"
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/totens/${t.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Ver Página Pública do Totem"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditarTotem(t)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExcluirTotem(t.id, t.nome)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: SOLICITAÇÕES DE ANUNCIANTES */}
      {abaAtiva === "solicitacoes" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Leads de Publicidade nos Totens</h3>
              <span className="text-xs text-slate-400">Total: {solicitacoes.length}</span>
            </div>

            {solicitacoes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm">Nenhuma solicitação de anunciante registrada ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Data</th>
                      <th className="p-3.5">Anunciante / Empresa</th>
                      <th className="p-3.5">WhatsApp</th>
                      <th className="p-3.5">Totem Desejado</th>
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
                          <div className="text-white">{s.nome_contato}</div>
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
                            {s.totem?.nome || "Totem"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {s.totem?.estabelecimento_nome}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={s.status}
                            onChange={(e) =>
                              handleAtualizarStatusSolicitacao(s.id, e.target.value)
                            }
                            aria-label="Atualizar status da solicitação"
                            className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em_atendimento">Em Atendimento</option>
                            <option value="fechado">Fechado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <a
                            href={`https://wa.me/55${s.whatsapp.replace(
                              /\D/g,
                              ""
                            )}?text=${encodeURIComponent(
                              `Olá ${s.nome_contato}! Sou do Grupo Empire Cidades sobre seu interesse em anunciar no totem ${
                                s.totem?.nome || ""
                              }.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chamar</span>
                          </a>
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

      {/* 3. MODAL DE CADASTRO / EDIÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl text-white overflow-hidden my-8">
            <div className="bg-slate-800 p-5 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-400" />
                <span>{totemEmEdicao ? "Editar Totem" : "Cadastrar Novo Totem"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
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

              {/* Upload da Foto */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Foto Real do Totem Instalado *
                </label>
                <div className="flex items-center gap-3">
                  {formFotoUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-slate-800">
                      <Image
                        src={formFotoUrl}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-slate-600 flex items-center justify-center text-slate-500 shrink-0">
                      <Tv className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{fazendoUpload ? "Enviando Foto..." : "Fazer Upload de Foto"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={fazendoUpload}
                          onChange={handleUploadFoto}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setFormFotoUrl("/images/totem-padrao.jpg")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 font-bold text-xs cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Usar Foto Padrão Empire</span>
                      </button>
                    </div>

                    <input
                      type="url"
                      placeholder="Ou cole a URL direta da imagem aqui..."
                      value={formFotoUrl}
                      onChange={(e) => setFormFotoUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Modelo Oficial do Totem & Preço do Anúncio (Flyer Oficial R$ 250 e R$ 350) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-amber-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modelo de Totem & Plano de Anúncio (Oficial Empire)</span>
                  </label>
                  <span className="text-[11px] text-amber-300 font-semibold">Tabela Comercial</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Opção 1: Totem com Carregador */}
                  <button
                    type="button"
                    onClick={() => handleMudarModelo("totem_carregador")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      formTipoModelo === "totem_carregador"
                        ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-md text-white"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase">
                        <BatteryCharging className="w-3.5 h-3.5" /> Com Carregador
                      </span>
                      <span className="text-sm font-black text-amber-400">R$ 250,00<span className="text-[10px] font-normal text-slate-400">/mês</span></span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Pedestal com estação de recarga para celulares e tela superior em loop de 15s.
                    </p>
                  </button>

                  {/* Opção 2: Totem Interativo Maior */}
                  <button
                    type="button"
                    onClick={() => handleMudarModelo("totem_interativo_maior")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      formTipoModelo === "totem_interativo_maior"
                        ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-md text-white"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase">
                        <Tv className="w-3.5 h-3.5" /> Interativo Maior (43&quot; Touch)
                      </span>
                      <span className="text-sm font-black text-amber-400">R$ 350,00<span className="text-[10px] font-normal text-slate-400">/mês</span></span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Display gigante monólito 43&quot; Touch Full HD, Android 11 e máxima imponência.
                    </p>
                  </button>
                </div>

                {/* Preço Mensal Customizável */}
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-300">
                    Valor Mensal Cobrado do Anunciante:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-400">R$</span>
                    <input
                      type="number"
                      step="1"
                      value={formPrecoMensal}
                      onChange={(e) => setFormPrecoMensal(Number(e.target.value))}
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                    />
                    <span className="text-[11px] text-slate-400">/ mês</span>
                  </div>
                </div>
              </div>

              {/* Nome & Estabelecimento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Nome / Identificação do Totem *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Totem 01 - Galeria Center UDI"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Nome do Estabelecimento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Galeria Center UDI ou Uberlândia Shopping"
                    value={formEstabelecimento}
                    onChange={(e) => setFormEstabelecimento(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              {/* Localização com Busca Automática por CEP */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>CEP (Busca Automática do Endereço & Maps)</span>
                  </label>
                  {cepMensagem && (
                    <span className="text-[11px] text-amber-300 font-semibold animate-pulse">
                      {cepMensagem}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00000-000"
                      maxLength={9}
                      value={formCep}
                      onChange={(e) => {
                        const formatado = formatarCep(e.target.value);
                        setFormCep(formatado);
                        if (formatado.replace(/\D/g, "").length === 8) {
                          handleBuscarCep(formatado);
                        }
                      }}
                      className="w-36 bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-mono tracking-wider text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuscarCep()}
                    disabled={buscandoCep}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Search className={`w-3.5 h-3.5 ${buscandoCep ? "animate-spin" : ""}`} />
                    <span>{buscandoCep ? "Buscando..." : "Buscar Endereço"}</span>
                  </button>

                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    Puxa rua, bairro, cidade, UF e gera o link no Google Maps automaticamente.
                  </span>
                </div>
              </div>

              {/* Tipo de Estabelecimento & Cidade & Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Tipo de Estabelecimento *
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                  >
                    {TIPOS_ESTABELECIMENTO.filter((t) => t.id !== "todos").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Uberlândia"
                    value={formCidade}
                    onChange={(e) => setFormCidade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Estado (UF) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="MG"
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white uppercase"
                  />
                </div>
              </div>

              {/* Endereço & Bairro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Floriano Peixoto, 530"
                    value={formEndereco}
                    onChange={(e) => setFormEndereco(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Centro"
                    value={formBairro}
                    onChange={(e) => setFormBairro(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              {/* Link do Google Maps (Localização) */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Link do Google Maps (Ver no Mapa)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRecalcularUrlMaps}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                    >
                      Atualizar pelo endereço atual
                    </button>
                    {formGoogleMapsUrl && (
                      <a
                        href={formGoogleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Testar rota no Maps</span>
                      </a>
                    )}
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="Gerado automaticamente com o CEP/endereço ou cole o link do Google Maps aqui..."
                  value={formGoogleMapsUrl}
                  onChange={(e) => setFormGoogleMapsUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  O link utiliza o endereço físico (rua, bairro, cidade, UF e CEP) para evitar que o Google Maps confunda com outros estabelecimentos.
                </p>
              </div>

              {/* Descrição do Ponto */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Descrição do Ponto Estratégico (Onde está instalado?) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Dentro da galeria, no saguão principal em área de grande circulação em frente à praça de alimentação..."
                  value={formDescricaoPonto}
                  onChange={(e) => setFormDescricaoPonto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white resize-none"
                />
              </div>

              {/* Métricas: Circulação, Formato e Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Circulação Estimada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 25.000 pessoas/mês"
                    value={formCirculacao}
                    onChange={(e) => setFormCirculacao(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Formato de Inserção
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 20 slots de 15 segundos"
                    value={formFormato}
                    onChange={(e) => setFormFormato(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Slots Livres / Total
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Livres"
                      value={formSlotsLivres}
                      onChange={(e) => setFormSlotsLivres(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                    />
                    <span className="text-slate-500">/</span>
                    <input
                      type="number"
                      placeholder="Total"
                      value={formSlotsTotal}
                      onChange={(e) => setFormSlotsTotal(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Perfil do Público */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Perfil do Público (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Consumidores, Famílias, Profissionais, Estudantes"
                  value={formPerfilPublico}
                  onChange={(e) => setFormPerfilPublico(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              {/* Dados do Franqueado */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-xs block">
                  Dados do Franqueado Responsável (Recebe os Contatos e Orçamentos)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Nome do Franqueado *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Marcelo Olivers"
                      value={formFranqueadoNome}
                      onChange={(e) => setFormFranqueadoNome(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      WhatsApp do Franqueado (Recebe o Clique) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 34988676886 ou (34) 98867-6886"
                      value={formFranqueadoWhatsapp}
                      onChange={(e) => setFormFranqueadoWhatsapp(e.target.value)}
                      className="w-full bg-slate-800 border border-emerald-500/50 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Recursos Extras */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2">
                  Recursos Tecnológicos do Totem
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RECURSOS_PADRAO.map((rec) => (
                    <label
                      key={rec}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer text-slate-300 hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={formRecursos.includes(rec)}
                        onChange={() => handleToggleRecurso(rec)}
                        className="rounded accent-amber-400"
                      />
                      <span>{rec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles: Status e Destaque */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formStatus === "ativo"}
                    onChange={(e) => setFormStatus(e.target.checked ? "ativo" : "inativo")}
                    className="rounded accent-amber-400"
                  />
                  <span className="font-bold text-emerald-400">Publicado / Ativo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDestaque}
                    onChange={(e) => setFormDestaque(e.target.checked)}
                    className="rounded accent-amber-400"
                  />
                  <span className="font-bold text-amber-300">Destaque na Vitrine ★</span>
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
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {salvando ? "Salvando..." : totemEmEdicao ? "Atualizar Totem" : "Cadastrar Totem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
