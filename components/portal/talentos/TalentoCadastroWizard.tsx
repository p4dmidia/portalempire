"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MoveVertical,
  Star,
  Users,
  MapPin,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Phone,
  Check,
  Award,
  Video,
  ShieldCheck,
} from "lucide-react";
import { CATEGORIAS_TALENTOS, SERVICOS_PADRAO } from "@/lib/talentos/types";
import { createClient } from "@/lib/supabase/client";

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

export function TalentoCadastroWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-amber-500"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <TalentoCadastroWizardContent />
    </Suspense>
  );
}

function TalentoCadastroWizardContent() {
  const searchParams = useSearchParams();
  const isConvite = searchParams.get("convite") === "1";

  // Etapas: 1 = Formulário Inicial, 2 = Live Studio Preview & Ajuste de Capa, 3 = Sucesso
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);

  // Estados dos Campos
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("modelos");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepStatus, setCepStatus] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);
  const [cidade, setCidade] = useState("Uberlândia");
  const [estado, setEstado] = useState("MG");
  const [cidadesAtendidas, setCidadesAtendidas] = useState("Nacional e Internacional");
  const [seguidores, setSeguidores] = useState("+ 100 mil seguidores");
  const [bioCurta, setBioCurta] = useState("");
  const [bioCompleta, setBioCompleta] = useState("");
  const [segmentos, setSegmentos] = useState("Moda, Beleza, Estilo de Vida");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [servicos, setServicos] = useState<string[]>([
    "Comerciais de TV",
    "Campanhas Publicitárias",
    "Presença VIP",
    "Ações com Influenciadores",
  ]);
  const [videoTitulo, setVideoTitulo] = useState("Vídeo de Apresentação");
  const [videoUrl, setVideoUrl] = useState("");

  // Fotos
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoPosicaoY, setFotoPosicaoY] = useState<number>(50);
  const [fotoCapaUrl, setFotoCapaUrl] = useState("");
  const [fotoCapaPosicaoY, setFotoCapaPosicaoY] = useState<number>(50);

  // Estados de Upload e Controle
  const [fazendoUploadFoto, setFazendoUploadFoto] = useState(false);
  const [fazendoUploadCapa, setFazendoUploadCapa] = useState(false);
  const [enviandoCandidatura, setEnviandoCandidatura] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Arraste da Imagem de Capa (Live Studio Drag & Drop)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPos, setDragStartPos] = useState(50);

  // Arraste da Foto de Perfil (Live Studio Drag & Drop)
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

  // Upload Foto de Perfil via API Segura no Servidor (Bypassa RLS)
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUploadFoto(true);
      setErroMsg(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pasta", "candidatos");

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

  // Upload Capa Panorâmica via API Segura no Servidor (Bypassa RLS)
  const handleUploadCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFazendoUploadCapa(true);
      setErroMsg(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pasta", "capas/candidatos");

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
          msg: "CEP não encontrado. Digite o endereço, cidade e estado manualmente.",
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

  const handleToggleServico = (servico: string) => {
    setServicos((prev) =>
      prev.includes(servico) ? prev.filter((s) => s !== servico) : [...prev, servico]
    );
  };

  // Validação da Etapa 1 para ir à Etapa 2
  const handleAvancarParaPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim() || !titulo.trim() || !fotoUrl.trim() || !bioCurta.trim()) {
      setErroMsg("Por favor, preencha todos os campos obrigatórios com (*) incluindo a Foto de Perfil.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErroMsg(null);
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Envio Final da Candidatura
  const handleSubmeterCandidatura = async () => {
    try {
      setEnviandoCandidatura(true);
      setErroMsg(null);

      const segmentosArr = segmentos
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const videosArr = videoUrl.trim()
        ? [{ titulo: videoTitulo.trim() || "Vídeo de Apresentação", url: videoUrl.trim() }]
        : [];

      const payload = {
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        titulo_profissional: titulo.trim(),
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
          whatsapp: whatsapp.trim(),
          foto_posicao_y: Number(fotoPosicaoY) >= 0 ? Number(fotoPosicaoY) : 50,
          cep: cep.trim() || undefined,
          endereco: endereco.trim() || undefined,
          instagram: instagram.trim() || undefined,
          youtube: youtube.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
        servicos,
        videos: videosArr,
      };

      const res = await fetch("/api/talentos/candidatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao submeter seu cadastro.");
      }

      setEtapa(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setErroMsg(err instanceof Error ? err.message : "Erro ao enviar cadastro.");
    } finally {
      setEnviandoCandidatura(false);
    }
  };

  const videoIdPreview = extrairYouTubeId(videoUrl);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 selection:bg-amber-400 selection:text-slate-950 pb-20">
      {/* 1. Header do Portal / Barra Superior */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/talentos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar a Talentos</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">/</span>
              <span className="text-xs text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Cadastro Oficial de Elenco</span>
              </span>
            </div>
          </div>

          {/* Indicador de Etapas */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-full transition-all ${
                etapa === 1
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              1. Formulário & Fotos
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-3 py-1 rounded-full transition-all ${
                etapa === 2
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              2. Live Studio & Prévia
            </span>
          </div>
        </div>
      </header>

      {/* 2. Banner VIP de Convite (se ?convite=1) com fundo claro elegante */}
      {isConvite && etapa !== 3 && (
        <section className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-b border-amber-200/80 py-4 px-4 shadow-2xs">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <Star className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                Convite Oficial Exclusivo
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Você foi convidado(a) com exclusividade para fazer parte do catálogo de apresentadores, celebridades e influenciadores do <strong>Grupo Empire Cidades</strong>!
              </p>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-5xl mx-auto px-4 pt-8">
        {erroMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* =========================================================================
            ETAPA 1: FORMULÁRIO COMPLETO COM UPLOADS
           ========================================================================= */}
        {etapa === 1 && (
          <form onSubmit={handleAvancarParaPreview} className="space-y-8">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif">
                Cadastre seu Perfil no <span className="text-amber-600">Empire Talentos</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                Preencha suas informações profissionais e faça o upload das suas fotos. Na próxima etapa, você verá uma prévia idêntica a como sua página ficará no portal e poderá posicionar e arrastar sua imagem de capa!
              </p>
            </div>

            {/* Bloco de Imagens: Foto de Perfil & Capa Panorâmica */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Fotos do Seu Perfil</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Foto de Perfil */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Foto de Perfil (Cards & Vitrine) *
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-100 shrink-0 shadow-xs">
                      {fotoUrl ? (
                        <Image
                          src={fotoUrl}
                          alt="Foto de Perfil"
                          fill
                          unoptimized
                          style={{ objectPosition: `center ${fotoPosicaoY}%` }}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center p-2">
                          Sem foto
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>{fazendoUploadFoto ? "Enviando..." : "Upload Foto de Perfil"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadFoto}
                          disabled={fazendoUploadFoto}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Foto vertical ou quadrada com boa iluminação e rosto nítido.
                      </p>

                      {fotoUrl && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-500">Enquadramento inicial:</span>
                          <button
                            type="button"
                            onClick={() => setFotoPosicaoY(15)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              fotoPosicaoY <= 25 ? "bg-amber-400 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            Topo
                          </button>
                          <button
                            type="button"
                            onClick={() => setFotoPosicaoY(50)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              fotoPosicaoY > 25 && fotoPosicaoY < 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            Centro
                          </button>
                          <button
                            type="button"
                            onClick={() => setFotoPosicaoY(85)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              fotoPosicaoY >= 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            Base
                          </button>
                          <span className="text-[10px] font-mono font-bold text-amber-700">
                            {fotoPosicaoY}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Capa Panorâmica */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Imagem de Capa (Banner Panorâmico)
                  </label>
                  <div className="space-y-2">
                    <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                      {fotoCapaUrl ? (
                        <Image
                          src={fotoCapaUrl}
                          alt="Capa"
                          fill
                          unoptimized
                          style={{ objectPosition: `center ${fotoCapaPosicaoY}%` }}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          Nenhuma capa enviada (usará fundo padrão se não preencher)
                        </div>
                      )}
                    </div>

                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs cursor-pointer border border-slate-300 transition-colors shadow-xs">
                      <Upload className="w-4 h-4 text-amber-500" />
                      <span>{fazendoUploadCapa ? "Enviando..." : "Upload Imagem de Capa"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCapa}
                        disabled={fazendoUploadCapa}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Você poderá arrastar para cima ou baixo e ajustar o enquadramento na próxima etapa!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco de Dados Principais */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Dados Profissionais</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo / Artístico *
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Ex: Cris Arcangeli, Sabrina Sato..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp para Contato & Notificação *
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    placeholder="(34) 99999-9999"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-amber-700 font-semibold mt-1">
                    * É neste WhatsApp que enviaremos a mensagem de aprovação quando seu perfil for ao ar.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título / Profissão Principal *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    placeholder="Ex: Apresentadora, Empreendedora e Palestrante"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria Principal *
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  >
                    {CATEGORIAS_TALENTOS.filter((cat) => cat.id !== "todos").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CEP com Busca Automática de Endereço */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>CEP (Preenchimento Automático)</span>
                    </span>
                    {buscandoCep && (
                      <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando endereço...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={handleCepChange}
                    onBlur={() => consultarCep(cep)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors font-mono"
                  />
                  {cepStatus && (
                    <p
                      className={`text-[11px] mt-1.5 font-semibold flex items-center gap-1.5 ${
                        cepStatus.tipo === "sucesso" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {cepStatus.tipo === "sucesso" && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      <span>{cepStatus.msg}</span>
                    </p>
                  )}
                </div>

                {/* Campo de Endereço Completo (Rua, Número e Bairro) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Endereço (Rua, Número e Bairro)</span>
                    <span className="text-[11px] text-slate-400 font-normal">Preenchido automaticamente pelo CEP</span>
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Av. Rondon Pacheco, 1200 - Bairro Tibery"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cidade de Base
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Uberlândia, São Paulo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    maxLength={2}
                    placeholder="MG, SP, RJ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white uppercase transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Disponibilidade de Cidades
                  </label>
                  <input
                    type="text"
                    value={cidadesAtendidas}
                    onChange={(e) => setCidadesAtendidas(e.target.value)}
                    placeholder="Ex: Nacional e Internacional, ou Regional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alcance Estimado / Seguidores
                  </label>
                  <input
                    type="text"
                    value={seguidores}
                    onChange={(e) => setSeguidores(e.target.value)}
                    placeholder="Ex: + 1,9 milhões de seguidores"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Segmentos / Nichos de Atuação (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={segmentos}
                  onChange={(e) => setSegmentos(e.target.value)}
                  placeholder="Ex: Comunicação, Negócios, Moda, Beleza, Gastronomia"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Apresentação Curta (Resumo de 2 a 3 linhas para os cards) *
                </label>
                <textarea
                  rows={2}
                  value={bioCurta}
                  onChange={(e) => setBioCurta(e.target.value)}
                  required
                  placeholder="Breve resumo destacando suas principais realizações, carreira e posicionamento..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biografia Completa / Trajetória (Opcional)
                </label>
                <textarea
                  rows={4}
                  value={bioCompleta}
                  onChange={(e) => setBioCompleta(e.target.value)}
                  placeholder="Conte sua história profissional, marcos de carreira, programas que apresentou, empresas que fundou..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Redes Sociais & Portfólio em Vídeo */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Redes Sociais & Vídeo em Destaque</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram Oficial</span>
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/seu.perfil"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                    <span>Canal no YouTube</span>
                  </label>
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@seucanal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span className="text-cyan-600 font-black text-xs">TT</span>
                    <span>TikTok</span>
                  </label>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@seu.perfil"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn</span>
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/seu-perfil"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Vídeo do YouTube */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-amber-500" />
                  <span>Vídeo de Apresentação / Portfólio (YouTube)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={videoTitulo}
                    onChange={(e) => setVideoTitulo(e.target.value)}
                    placeholder="Título do vídeo (Ex: Como ser uma investidora anjo)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Link do YouTube (ex: https://youtube.com/watch?v=...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Serviços Oferecidos */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Serviços que você realiza para marcas e empresas</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SERVICOS_PADRAO.map((srv) => {
                    const marcado = servicos.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => handleToggleServico(srv)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          marcado
                            ? "bg-amber-50 border-amber-400 text-amber-950 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            marcado ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-300 bg-white"
                          }`}
                        >
                          {marcado && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{srv}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Botão de Avançar */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Avançar para Prévia & Ajustes</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            ETAPA 2: LIVE STUDIO DO CANDIDATO (PRÉVIA FIEL COM ARRASTE DE CAPA)
           ========================================================================= */}
        {etapa === 2 && (
          <div className="space-y-6">
            {/* Barra de Controle Superior da Prévia */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar e Editar Informações</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Prévia em Tempo Real: Arraste a capa abaixo para ajustar o enquadramento</span>
              </div>

              <button
                type="button"
                onClick={handleSubmeterCandidatura}
                disabled={enviandoCandidatura}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {enviandoCandidatura ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar e Enviar para Análise</span>
                  </>
                )}
              </button>
            </div>

            {/* MOLDURA DO LIVE STUDIO: SIMULAÇÃO EXATA DA PÁGINA PÚBLICA */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              {/* 1. Capa Panorâmica com Arraste (Mouse & Touch) */}
              <div
                className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:h-[380px] lg:h-[460px] bg-slate-100 overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {fotoCapaUrl ? (
                  <Image
                    src={fotoCapaUrl}
                    alt="Capa do Perfil"
                    fill
                    unoptimized
                    draggable={false}
                    style={{ objectPosition: `center ${fotoCapaPosicaoY}%` }}
                    className="object-cover transition-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-amber-100/50 via-slate-100 to-amber-100/50 flex items-center justify-center text-slate-400 text-xs">
                    Sem Capa Personalizada (usando gradiente padrão)
                  </div>
                )}

                {/* Sombra suave de legibilidade na base */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Tooltip Central Flutuante Estilo Facebook */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xl animate-pulse">
                    <MoveVertical className="w-4 h-4 text-amber-400" />
                    <span>Arraste para cima ou para baixo para reposicionar a imagem</span>
                  </div>
                </div>

                {/* Botões Rápidos de Enquadramento no Canto */}
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-md">
                  <button
                    type="button"
                    onClick={() => setFotoCapaPosicaoY(15)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-bold cursor-pointer"
                  >
                    Topo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoCapaPosicaoY(50)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-bold cursor-pointer"
                  >
                    Centro
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoCapaPosicaoY(85)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-bold cursor-pointer"
                  >
                    Base
                  </button>
                  <span className="text-[11px] text-amber-700 font-mono font-bold px-1">
                    {fotoCapaPosicaoY}%
                  </span>
                </div>

                {/* Botão de Trocar Capa */}
                <div className="absolute top-4 right-4 z-20">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-xs font-bold border border-slate-200 backdrop-blur-md shadow-md cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    <span>{fazendoUploadCapa ? "Enviando..." : "Trocar Imagem de Capa"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCapa}
                      disabled={fazendoUploadCapa}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 2. Área de Conteúdo / Cards (Overlap suave idêntico ao público) */}
              <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-12 -mt-6 sm:-mt-10 md:-mt-12 lg:-mt-14 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coluna Esquerda: Dados do Perfil */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
                          <div
                            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 shrink-0 select-none ${
                              fotoUrl ? "cursor-grab active:cursor-grabbing group/avatar" : ""
                            }`}
                            onMouseDown={fotoUrl ? handleFotoMouseDown : undefined}
                            onMouseMove={fotoUrl ? handleFotoMouseMove : undefined}
                            onMouseUp={fotoUrl ? handleFotoMouseUp : undefined}
                            onMouseLeave={fotoUrl ? handleFotoMouseUp : undefined}
                            onTouchStart={fotoUrl ? handleFotoTouchStart : undefined}
                            onTouchMove={fotoUrl ? handleFotoTouchMove : undefined}
                            onTouchEnd={fotoUrl ? handleFotoTouchEnd : undefined}
                            title={fotoUrl ? "Clique e arraste verticalmente para ajustar o enquadramento do rosto" : undefined}
                          >
                            {fotoUrl ? (
                              <>
                                <Image
                                  src={fotoUrl}
                                  alt={nome}
                                  fill
                                  unoptimized
                                  draggable={false}
                                  className="object-cover transition-none pointer-events-none"
                                  style={{ objectPosition: `center ${fotoPosicaoY}%` }}
                                />
                                {/* Overlay de instrução no hover ou arrastando */}
                                <div
                                  className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-[10px] font-bold text-center px-1 pointer-events-none transition-opacity ${
                                    isDraggingFoto ? "opacity-100" : "opacity-0 group-hover/avatar:opacity-100"
                                  }`}
                                >
                                  <MoveVertical className="w-4 h-4 text-amber-400 mb-0.5 animate-pulse" />
                                  <span>Arraste para enquadrar</span>
                                  <span className="mt-0.5 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                                    {fotoPosicaoY}%
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                Sem foto
                              </div>
                            )}
                          </div>

                          {/* Botões Rápidos de Enquadramento da Foto de Perfil */}
                          {fotoUrl && (
                            <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-xs">
                              <span className="text-[10px] font-bold text-slate-500 pl-1">Rosto:</span>
                              <button
                                type="button"
                                onClick={() => setFotoPosicaoY(15)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  fotoPosicaoY <= 25 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Topo
                              </button>
                              <button
                                type="button"
                                onClick={() => setFotoPosicaoY(50)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  fotoPosicaoY > 25 && fotoPosicaoY < 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Centro
                              </button>
                              <button
                                type="button"
                                onClick={() => setFotoPosicaoY(85)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  fotoPosicaoY >= 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Base
                              </button>
                              <span className="text-[10px] font-mono font-bold text-amber-700 px-1">
                                {fotoPosicaoY}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                              {nome || "Seu Nome Completo"}
                            </h2>
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow-xs">
                              ★
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-amber-700">
                            {titulo || "Apresentador(a) & Influenciador(a)"}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {cidade} - {estado}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {seguidores}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              {cidadesAtendidas}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tags / Nichos */}
                      <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-100 mt-5">
                        {segmentos.split(",").map((seg, idx) => {
                          const s = seg.trim();
                          if (!s) return null;
                          return (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
                            >
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Biografia & Trajetória */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Trajetória & Apresentação</span>
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {bioCurta}
                      </p>
                      {bioCompleta && (
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line pt-2">
                          {bioCompleta}
                        </p>
                      )}
                    </div>

                    {/* Portfólio em Vídeo */}
                    {videoIdPreview && (
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Video className="w-4 h-4 text-amber-500" />
                          <span>{videoTitulo || "Vídeo de Apresentação"}</span>
                        </h3>
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-inner">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoIdPreview}`}
                            title={videoTitulo}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="absolute inset-0 w-full h-full border-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coluna Direita: Bloco de Agenciamento Comercial Simulado */}
                  <div className="space-y-6">
                    <div className="bg-amber-50/70 rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-4">
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                        Agenciamento Comercial
                      </div>
                      <h3 className="text-lg font-black text-slate-900">
                        Contrate {nome || "o Talento"}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Atendimento oficial e gestão de contratos com segurança pelo Grupo Empire Cidades.
                      </p>

                      <div className="space-y-2 pt-2 border-t border-amber-200 text-xs">
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Disponibilidade:</span>
                          <span className="text-emerald-700 font-bold">Agenda Aberta</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Modalidade:</span>
                          <span className="text-slate-900 font-semibold">Presencial & Online</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Cidades:</span>
                          <span className="text-slate-900 font-semibold">{cidadesAtendidas}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xs cursor-default"
                        >
                          Solicitar Orçamento (Exemplo)
                        </button>
                      </div>
                    </div>

                    {/* Serviços */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Formatos de Atuação
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {servicos.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ação de Envio Final */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Sua prévia está pronta para envio!</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Ao confirmar, nossa equipe curatorial receberá seus dados e entrará em contato via WhatsApp.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEtapa(1)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
                >
                  Editar Informações
                </button>
                <button
                  type="button"
                  onClick={handleSubmeterCandidatura}
                  disabled={enviandoCandidatura}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {enviandoCandidatura ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando Cadastro...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar e Enviar para Análise</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 3: TELA DE SUCESSO & CONFIRMAÇÃO
           ========================================================================= */}
        {etapa === 3 && (
          <div className="max-w-2xl mx-auto text-center py-12 px-6 bg-white border border-slate-200 rounded-3xl shadow-md space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                Cadastro Submetido com Sucesso
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
                Parabéns, {nome}!
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                Recebemos sua candidatura para o elenco oficial do <strong>Empire Talentos & Celebridades</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Próximos Passos & Notificação:</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                <li>Nossa curadoria avaliará seu perfil e portfólio em breve.</li>
                <li>
                  Assim que seu perfil for aprovado, você receberá automaticamente uma mensagem no seu WhatsApp (<strong>{whatsapp}</strong>) com o link oficial da sua página no portal.
                </li>
                <li>Nossa equipe comercial estará pronta para intermediar suas contratações com marcas e patrocinadores.</li>
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/talentos"
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                Ver Catálogo de Talentos
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
              >
                Ir para a Página Inicial
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
