"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  MapPin,
  MoveVertical,
  Phone,
  Save,
  Sparkles,
  Star,
  Tv,
  Upload,
  Users,
  Video,
  X,
  Youtube,
  Trash2,
} from "lucide-react";
import type { Talento } from "@/lib/talentos/types";
import { CATEGORIAS_TALENTOS, SERVICOS_PADRAO } from "@/lib/talentos/types";
import { createClient } from "@/lib/supabase/client";

interface TalentoLiveStudioProps {
  talento: Talento;
  onFechar: () => void;
  onSalvar: (payload: any) => Promise<void>;
  salvando: boolean;
}

function extrairYouTubeId(urlOuId: string): string {
  if (!urlOuId) return "";
  const trimmed = urlOuId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  if (trimmed.includes("youtube.com/shorts/")) {
    return trimmed.split("youtube.com/shorts/")[1].split("?")[0].split("/")[0];
  }
  if (trimmed.includes("youtu.be/")) {
    return trimmed.split("youtu.be/")[1].split("?")[0].split("/")[0];
  }
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed.split("youtube.com/embed/")[1].split("?")[0].split("/")[0];
  }
  if (trimmed.includes("v=")) {
    const match = trimmed.match(/[?&]v=([^&]+)/);
    if (match && match[1]) return match[1];
  }
  return trimmed.split("/").pop()?.split("?")[0]?.split("&")[0] || "";
}

export function TalentoLiveStudio({
  talento,
  onFechar,
  onSalvar,
  salvando,
}: TalentoLiveStudioProps) {
  // Estados dos Campos
  const [nome, setNome] = useState(talento.nome);
  const [slug, setSlug] = useState(talento.slug);
  const [titulo, setTitulo] = useState(talento.titulo_profissional);
  const [whatsapp, setWhatsapp] = useState(talento.whatsapp || talento.redes_sociais?.whatsapp || "");
  const [categoria, setCategoria] = useState(talento.categoria);
  const [segmentos, setSegmentos] = useState(talento.segmentos?.join(", ") || "");
  const [fotoUrl, setFotoUrl] = useState(talento.foto_url);
  const [fotoCapaUrl, setFotoCapaUrl] = useState(talento.foto_capa_url || "");
  const [fotoCapaPosicaoY, setFotoCapaPosicaoY] = useState<number>(
    talento.foto_capa_posicao_y !== undefined && talento.foto_capa_posicao_y !== null
      ? Number(talento.foto_capa_posicao_y)
      : 50
  );
  const [fotoPosicaoY, setFotoPosicaoY] = useState<number>(
    talento.foto_posicao_y !== undefined && talento.foto_posicao_y !== null
      ? Number(talento.foto_posicao_y)
      : Number(talento.redes_sociais?.foto_posicao_y) || 50
  );
  const [cidade, setCidade] = useState(talento.cidade_nome || "Uberlândia");
  const [estado, setEstado] = useState(talento.estado || "MG");
  const [cep, setCep] = useState(talento.redes_sociais?.cep || talento.cep || "");
  const [endereco, setEndereco] = useState(talento.redes_sociais?.endereco || talento.endereco || "");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepStatus, setCepStatus] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);
  const [cidadesAtendidas, setCidadesAtendidas] = useState(talento.cidades_atendidas || "Nacional e Internacional");
  const [bioCurta, setBioCurta] = useState(talento.bio_curta);
  const [bioCompleta, setBioCompleta] = useState(talento.bio_completa || "");
  const [seguidores, setSeguidores] = useState(talento.seguidores_total || "+ 100 mil seguidores");
  const [instagram, setInstagram] = useState(talento.redes_sociais?.instagram || "");
  const [youtube, setYoutube] = useState(talento.redes_sociais?.youtube || "");
  const [tiktok, setTiktok] = useState(talento.redes_sociais?.tiktok || "");
  const [linkedin, setLinkedin] = useState(talento.redes_sociais?.linkedin || "");
  const [servicos, setServicos] = useState<string[]>(talento.servicos || []);
  const [videoTitulo, setVideoTitulo] = useState(talento.videos?.[0]?.titulo || "");
  const [videoUrl, setVideoUrl] = useState(talento.videos?.[0]?.url || "");
  const [verificado, setVerificado] = useState(talento.verificado);
  const [destaqueHome, setDestaqueHome] = useState(talento.destaque_home);
  const [status, setStatus] = useState<"ativo" | "inativo">(talento.status === "ativo" ? "ativo" : "inativo");

  // Estados de Upload e Controle
  const [fazendoUploadFoto, setFazendoUploadFoto] = useState(false);
  const [fazendoUploadCapa, setFazendoUploadCapa] = useState(false);
  const [abaEditor, setAbaEditor] = useState<"dados" | "biografia" | "servicos" | "video">("dados");
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Estados de Drag & Drop para Reposicionar Capa
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPos, setDragStartPos] = useState(50);

  // Estados de Drag & Drop para Reposicionar Foto de Perfil
  const [isDraggingFoto, setIsDraggingFoto] = useState(false);
  const [dragFotoStartY, setDragFotoStartY] = useState(0);
  const [dragFotoStartPos, setDragFotoStartPos] = useState(50);

  const handleFotoMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingFoto(true);
    setDragFotoStartY(e.clientY);
    setDragFotoStartPos(fotoPosicaoY);
  };

  const handleFotoMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingFoto) return;
    const deltaY = e.clientY - dragFotoStartY;
    const sensibilidade = 0.4;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragFotoStartPos - deltaY * sensibilidade)));
    setFotoPosicaoY(novaPos);
  };

  const handleFotoMouseUp = () => {
    setIsDraggingFoto(false);
  };

  const handleFotoTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.stopPropagation();
      setIsDraggingFoto(true);
      setDragFotoStartY(e.touches[0].clientY);
      setDragFotoStartPos(fotoPosicaoY);
    }
  };

  const handleFotoTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingFoto || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - dragFotoStartY;
    const sensibilidade = 0.4;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragFotoStartPos - deltaY * sensibilidade)));
    setFotoPosicaoY(novaPos);
  };

  const handleFotoTouchEnd = () => {
    setIsDraggingFoto(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartPos(fotoCapaPosicaoY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY;
    const sensibilidade = 0.35;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragStartPos - deltaY * sensibilidade)));
    setFotoCapaPosicaoY(novaPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStartY(e.touches[0].clientY);
      setDragStartPos(fotoCapaPosicaoY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - dragStartY;
    const sensibilidade = 0.35;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragStartPos - deltaY * sensibilidade)));
    setFotoCapaPosicaoY(novaPos);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Upload de Foto de Perfil via API Segura no Servidor (Bypassa RLS)
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUploadFoto(true);
      setErroMsg(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pasta", "perfil");

      const res = await fetch("/api/talentos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Erro no upload da foto.");
      }

      setFotoUrl(data.url);
    } catch (err: unknown) {
      setErroMsg(err instanceof Error ? err.message : "Erro no upload da foto.");
    } finally {
      setFazendoUploadFoto(false);
    }
  };

  // Upload de Imagem de Capa via API Segura no Servidor (Bypassa RLS)
  const handleUploadCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUploadCapa(true);
      setErroMsg(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pasta", "capas");

      const res = await fetch("/api/talentos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Erro no upload da capa.");
      }

      setFotoCapaUrl(data.url);
    } catch (err: unknown) {
      setErroMsg(err instanceof Error ? err.message : "Erro no upload da capa.");
    } finally {
      setFazendoUploadCapa(false);
    }
  };

  // Formatação e Consulta Automática de CEP via ViaCEP
  const formatarCep = (valor: string) => {
    const limpo = valor.replace(/\D/g, "").slice(0, 8);
    if (limpo.length > 5) {
      return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
    }
    return limpo;
  };

  const consultarCep = async (cepParaBuscar: string) => {
    const limpo = cepParaBuscar.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    try {
      setBuscandoCep(true);
      setCepStatus(null);
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepStatus({
          tipo: "erro",
          msg: "CEP não encontrado. Digite a cidade e estado manualmente.",
        });
        return;
      }

      if (data.localidade) setCidade(data.localidade);
      if (data.uf) setEstado(data.uf.toUpperCase());
      const enderecoFormatado = [data.logradouro, data.bairro].filter(Boolean).join(" - ");
      if (enderecoFormatado) {
        setEndereco(enderecoFormatado);
      }
      const detalhes = [data.logradouro, data.bairro].filter(Boolean).join(", ");
      setCepStatus({
        tipo: "sucesso",
        msg: `Endereço localizado: ${data.localidade} - ${data.uf}${detalhes ? ` (${detalhes})` : ""}`,
      });
    } catch {
      setCepStatus({
        tipo: "erro",
        msg: "Erro ao consultar CEP. Digite a cidade e estado manualmente.",
      });
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCep(e.target.value);
    setCep(formatado);
    if (formatado.replace(/\D/g, "").length === 8) {
      consultarCep(formatado);
    } else {
      setCepStatus(null);
    }
  };

  // Toggle de Serviço
  const handleToggleServico = (servico: string) => {
    setServicos((prev) =>
      prev.includes(servico) ? prev.filter((s) => s !== servico) : [...prev, servico]
    );
  };

  // Submissão do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !titulo.trim() || !fotoUrl.trim() || !bioCurta.trim()) {
      setErroMsg("Preencha Nome, Título, Foto e Apresentação Curta.");
      return;
    }

    const segmentosArr = segmentos
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const videosArr = videoUrl.trim()
      ? [{ titulo: videoTitulo.trim() || "Vídeo de Apresentação", url: videoUrl.trim() }]
      : [];

    const payload = {
      nome: nome.trim(),
      slug: slug.trim() || talento.slug,
      titulo_profissional: titulo.trim(),
      whatsapp: whatsapp.trim() || null,
      categoria,
      segmentos: segmentosArr,
      foto_url: fotoUrl.trim(),
      foto_posicao_y: Number(fotoPosicaoY) >= 0 ? Number(fotoPosicaoY) : 50,
      foto_capa_url: fotoCapaUrl.trim() || null,
      foto_capa_posicao_y: Number(fotoCapaPosicaoY) >= 0 ? Number(fotoCapaPosicaoY) : 50,
      cidade_nome: cidade.trim(),
      estado: estado.trim(),
      cidades_atendidas: cidadesAtendidas.trim(),
      bio_curta: bioCurta.trim(),
      bio_completa: bioCompleta.trim() || null,
      seguidores_total: seguidores.trim(),
      redes_sociais: {
        whatsapp: whatsapp.trim() || undefined,
        foto_posicao_y: Number(fotoPosicaoY) >= 0 ? Number(fotoPosicaoY) : 50,
        cep: cep.trim() || undefined,
        endereco: endereco.trim() || undefined,
        instagram: instagram.trim() || undefined,
        youtube: youtube.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
      },
      servicos,
      modalidades: ["Presencial", "Online/Remoto"],
      videos: videosArr,
      verificado,
      destaque_home: destaqueHome,
      ordem: talento.ordem || 0,
      status,
    };

    await onSalvar(payload);
  };

  const videoIdPreview = extrairYouTubeId(videoUrl);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto selection:bg-amber-400 selection:text-slate-950">
      {/* 1. BARRA SUPERIOR FIXA (ESTILO STUDIO DO FACEBOOK) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </button>

          <div className="hidden sm:block border-l border-slate-700 h-6" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Editando:</span>
            <span className="text-sm font-black text-white">{nome}</span>
          </div>
        </div>

        {/* Ações Direitas: Status + Ver no Site + Salvar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle de Status */}
          <button
            type="button"
            onClick={() => setStatus((prev) => (prev === "ativo" ? "inativo" : "ativo"))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              status === "ativo"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === "ativo" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span>{status === "ativo" ? "Publicado / Ativo" : "Inativo / Oculto"}</span>
          </button>

          {/* Link para Ver no Site */}
          <Link
            href={`/talentos/${slug || talento.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver no Site</span>
          </Link>

          {/* Botão Salvar Alterações */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={salvando}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{salvando ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </header>

      {/* 2. ÁREA DE PRÉ-VISUALIZAÇÃO REAL & ENQUADRAMENTO DA CAPA (LIVE STUDIO) */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto pb-16">
        {erroMsg && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-center justify-between">
            <span>{erroMsg}</span>
            <button type="button" onClick={() => setErroMsg(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CAPA PANORÂMICA (ESTILO FAN PAGE DO FACEBOOK COM DRAG DIRETO) */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:h-[380px] lg:h-[460px] xl:h-[500px] bg-slate-900 border-b border-slate-800 overflow-hidden group/capa">
          {fotoCapaUrl ? (
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative w-full h-full select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              title="Clique e arraste verticalmente para reposicionar a imagem de capa"
            >
              <Image
                src={fotoCapaUrl}
                alt={nome}
                fill
                unoptimized
                draggable={false}
                className="object-cover pointer-events-none transition-none"
                style={{ objectPosition: `center ${fotoCapaPosicaoY}%` }}
              />

              {/* OVERLAY CLÁSSICO DO FACEBOOK: AVISO CENTRAL DE REPOSICIONAMENTO */}
              <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                  isDragging ? "opacity-100" : "opacity-90 group-hover/capa:opacity-100"
                }`}
              >
                <div className="bg-black/80 backdrop-blur-md text-white border border-white/20 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold tracking-wide">
                  <MoveVertical className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Arraste para cima ou para baixo para reposicionar a imagem de capa</span>
                  <span className="ml-1 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px]">
                    {fotoCapaPosicaoY}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
              <Tv className="w-10 h-10 text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-300">Nenhuma imagem de capa cadastrada</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Adicione um banner panorâmico para destacar campanhas, patrocinadores ou a identidade visual do talento.
              </p>
            </div>
          )}

          {/* GRADIENTE INFERIOR SUAVE */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/10 to-transparent pointer-events-none" />

          {/* BARRA DE FERRAMENTAS DA CAPA (CANTO SUPERIOR DIREITO) */}
          <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2 bg-black/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-xl">
            {/* Botão de Upload da Capa */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all hover:scale-105 active:scale-95">
              <Camera className="w-3.5 h-3.5" />
              <span>{fazendoUploadCapa ? "Enviando Capa..." : "Trocar Capa"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCapa}
                className="hidden"
                disabled={fazendoUploadCapa}
              />
            </label>

            {fotoCapaUrl && (
              <>
                {/* Botões Rápidos de Enquadramento */}
                <div className="hidden sm:flex items-center gap-1 border-l border-white/20 pl-2">
                  <button
                    type="button"
                    onClick={() => setFotoCapaPosicaoY(15)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      fotoCapaPosicaoY <= 25 ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Topo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoCapaPosicaoY(50)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      fotoCapaPosicaoY > 25 && fotoCapaPosicaoY < 75
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Centro
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoCapaPosicaoY(85)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      fotoCapaPosicaoY >= 75 ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Base
                  </button>
                </div>

                {/* Remover Capa */}
                <button
                  type="button"
                  onClick={() => setFotoCapaUrl("")}
                  className="p-1.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  title="Remover Capa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3. BLOCO DE APRESENTAÇÃO SOBREPOSTO (PREVIEW REAL IDÊNTICO AO SITE PÚBLICO) */}
        <div className="px-4 sm:px-6 -mt-6 sm:-mt-10 md:-mt-12 lg:-mt-14 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coluna Esquerda: Apresentação Principal */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl relative">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                {/* Linha Topo Mobile: Foto + Nome ao Lado / Desktop: Foto à Esquerda */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
                    {/* Foto de Perfil com Botão de Troca e Drag de Enquadramento */}
                    <div
                      className={`relative group/avatar w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shrink-0 bg-slate-800 select-none ${
                        fotoUrl ? "cursor-grab active:cursor-grabbing" : ""
                      }`}
                      onMouseDown={fotoUrl ? handleFotoMouseDown : undefined}
                      onMouseMove={fotoUrl ? handleFotoMouseMove : undefined}
                      onMouseUp={fotoUrl ? handleFotoMouseUp : undefined}
                      onMouseLeave={fotoUrl ? handleFotoMouseUp : undefined}
                      onTouchStart={fotoUrl ? handleFotoTouchStart : undefined}
                      onTouchMove={fotoUrl ? handleFotoTouchMove : undefined}
                      onTouchEnd={fotoUrl ? handleFotoTouchEnd : undefined}
                      title="Arraste verticalmente para ajustar o enquadramento do rosto"
                    >
                      <Image
                        src={fotoUrl || "/images/placeholder-avatar.png"}
                        alt={nome}
                        fill
                        unoptimized
                        draggable={false}
                        className="object-cover pointer-events-none transition-none"
                        style={{ objectPosition: `center ${fotoPosicaoY}%` }}
                      />

                      {/* Overlay com instrução de arraste quando estiver mexendo */}
                      {isDraggingFoto && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold text-center px-1 pointer-events-none">
                          <MoveVertical className="w-4 h-4 text-amber-400 mb-0.5 animate-pulse" />
                          <span>{fotoPosicaoY}%</span>
                        </div>
                      )}

                      {/* Botão de Upload da Foto de Perfil (no topo superior direito da foto) */}
                      <label
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/75 hover:bg-black text-amber-400 opacity-90 group-hover/avatar:opacity-100 cursor-pointer shadow transition-all hover:scale-110 active:scale-95"
                        title="Trocar Foto de Perfil"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadFoto}
                          className="hidden"
                          disabled={fazendoUploadFoto}
                        />
                      </label>
                    </div>

                    {/* Botões Rápidos de Enquadramento da Foto de Perfil */}
                    {fotoUrl && (
                      <div className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 pl-1">Rosto:</span>
                        <button
                          type="button"
                          onClick={() => setFotoPosicaoY(15)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            fotoPosicaoY <= 25 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          Topo
                        </button>
                        <button
                          type="button"
                          onClick={() => setFotoPosicaoY(50)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            fotoPosicaoY > 25 && fotoPosicaoY < 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          Centro
                        </button>
                        <button
                          type="button"
                          onClick={() => setFotoPosicaoY(85)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            fotoPosicaoY >= 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          Base
                        </button>
                        <span className="text-[10px] font-mono font-bold text-amber-400 px-1">
                          {fotoPosicaoY}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Nome e Título no Mobile (ao lado da foto) */}
                  <div className="sm:hidden flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h1 className="text-xl font-black text-white leading-tight">{nome}</h1>
                      {verificado && (
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-slate-950 shadow-sm shrink-0"
                          title="Verificado Oficial"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-amber-400 leading-snug">{titulo}</p>
                  </div>
                </div>

                {/* Dados Principais do Talento (Desktop) + Metadados */}
                <div className="space-y-2 flex-1 w-full">
                  <div className="hidden sm:flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">{nome}</h1>
                    {verificado && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 shadow-sm"
                        title="Verificado Oficial"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="hidden sm:block text-sm font-bold text-amber-400">{titulo}</p>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {cidade} - {estado}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      {seguidores}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                      {cidadesAtendidas}
                    </span>
                  </div>

                  {/* Tags de Segmentos */}
                  {segmentos && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {segmentos.split(",").map((seg, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300"
                        >
                          {seg.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita: Card Comercial Fixo de Contratação */}
            <div className="lg:col-span-4 bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-400">
                  Agenciamento Comercial
                </span>
                <h3 className="text-lg font-black text-white">Contrate {nome}</h3>
                <p className="text-xs text-slate-400">
                  Atendimento oficial e gestão de contratos pelo Grupo Empire Cidades.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">Disponibilidade:</span>
                  <span className="font-bold text-emerald-400">Agenda Aberta</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">WhatsApp Comercial:</span>
                  <span className="font-bold text-amber-300">{whatsapp || "Não informado"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PAINEL DE ABAS INFERIOR: EDIÇÃO DETALHADA DOS DADOS */}
        <div className="px-4 sm:px-6 mt-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Navegador de Abas */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAbaEditor("dados")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  abaEditor === "dados"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                1. Dados & Contato
              </button>

              <button
                type="button"
                onClick={() => setAbaEditor("biografia")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  abaEditor === "biografia"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                2. Apresentação & Biografia
              </button>

              <button
                type="button"
                onClick={() => setAbaEditor("servicos")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  abaEditor === "servicos"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                3. Serviços Oferecidos ({servicos.length})
              </button>

              <button
                type="button"
                onClick={() => setAbaEditor("video")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  abaEditor === "video"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                4. Portfólio em Vídeo (YouTube)
              </button>
            </div>

            {/* CONTEÚDO DA ABA 1: DADOS & CONTATO */}
            {abaEditor === "dados" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Título / Profissão *
                    </label>
                    <input
                      type="text"
                      required
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Categoria Principal *
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    >
                      {CATEGORIAS_TALENTOS.filter((c) => c.id !== "todos").map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 flex items-center justify-between text-xs">
                      <span>CEP (Busca Automática)</span>
                      {buscandoCep && (
                        <span className="text-[10px] text-amber-400 font-normal flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Buscando...
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      maxLength={9}
                      value={cep}
                      onChange={handleCepChange}
                      onBlur={() => consultarCep(cep)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-amber-400 focus:outline-none text-sm"
                    />
                    {cepStatus && (
                      <span
                        className={`text-[10px] mt-1 block font-semibold ${
                          cepStatus.tipo === "sucesso" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {cepStatus.msg}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Cidade de Base *
                    </label>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Estado (UF)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={estado}
                      onChange={(e) => setEstado(e.target.value.toUpperCase())}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white uppercase focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Endereço Completo */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 flex items-center justify-between text-xs">
                    <span>Endereço (Rua, Número e Bairro)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Preenchido automaticamente pelo CEP</span>
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Av. Rondon Pacheco, 1200 - Tibery"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      WhatsApp para Contratação / Orçamentos
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 34988676886 ou (34) 98867-6886"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Seguidores / Alcance Total
                    </label>
                    <input
                      type="text"
                      value={seguidores}
                      onChange={(e) => setSeguidores(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-xs block mb-3">
                    Redes Sociais Oficiais
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Instagram URL</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">YouTube URL</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 2: APRESENTAÇÃO & BIOGRAFIA */}
            {abaEditor === "biografia" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Segmentos de Atuação (Separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Comunicação, Negócios, Moda, Saúde, Tecnologia"
                    value={segmentos}
                    onChange={(e) => setSegmentos(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Apresentação Curta (Exibida nos Cards da Vitrine) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={bioCurta}
                    onChange={(e) => setBioCurta(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Trajetória & Biografia Completa (Página Individual do Perfil)
                  </label>
                  <textarea
                    rows={6}
                    value={bioCompleta}
                    onChange={(e) => setBioCompleta(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white resize-y"
                  />
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 3: SERVIÇOS & FORMATOS */}
            {abaEditor === "servicos" && (
              <div className="space-y-4 text-xs">
                <span className="text-slate-300 font-bold uppercase tracking-wider block">
                  Selecione os formatos e serviços disponíveis para contratação:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SERVICOS_PADRAO.map((servico) => (
                    <label
                      key={servico}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        servicos.includes(servico)
                          ? "bg-amber-500/15 border-amber-400 text-amber-200 font-bold"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={servicos.includes(servico)}
                        onChange={() => handleToggleServico(servico)}
                        className="rounded accent-amber-400 w-4 h-4"
                      />
                      <span>{servico}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 4: PORTFÓLIO EM VÍDEO (YOUTUBE) */}
            {abaEditor === "video" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Título do Vídeo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Apresentação no Fórum de Negócios"
                      value={videoTitulo}
                      onChange={(e) => setVideoTitulo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                      Link do Vídeo no YouTube
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                    />
                  </div>
                </div>

                {/* Prévia do Player do YouTube */}
                {videoIdPreview && (
                  <div className="pt-2">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] block mb-2">
                      Pré-visualização do Player Incorporado:
                    </span>
                    <div className="max-w-xl aspect-video rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-md">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoIdPreview}?rel=0&modestbranding=1`}
                        title={videoTitulo || "Vídeo"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
