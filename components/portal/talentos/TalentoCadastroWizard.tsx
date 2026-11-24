"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  MoveVertical,
  Instagram,
  Youtube,
  Linkedin,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Video,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import type { Talento } from "@/lib/talentos/types";

const CATEGORIAS_TALENTOS = [
  { id: "modelos", nome: "Modelos & Comerciais" },
  { id: "apresentadores", nome: "Apresentadores" },
  { id: "influenciadores", nome: "Influenciadores" },
  { id: "celebridades", nome: "Celebridades" },
  { id: "palestrantes", nome: "Palestrantes" },
  { id: "criadores_conteudo", nome: "Criadores de Conteúdo" },
];

const SERVICOS_PADRAO = [
  "Comerciais de TV",
  "Apresentações e Cerimoniais",
  "Cobertura de Eventos",
  "Palestras",
  "Programas de TV",
  "Campanhas Publicitárias",
  "Presença VIP",
  "Ações com Influenciadores",
  "Debates e Mediações",
  "Divulgação de Marcas",
];

interface TalentoCadastroWizardProps {
  talentoInicial?: Talento | null;
  tokenEdicao?: string;
  onSucessoEdicao?: (talentoAtualizado: Talento) => void;
  modoEdicao?: boolean;
}

export function TalentoCadastroWizard({
  talentoInicial,
  tokenEdicao,
  onSucessoEdicao,
  modoEdicao = false,
}: TalentoCadastroWizardProps) {
  const router = useRouter();

  // Estados dos Campos
  const [nome, setNome] = useState(talentoInicial?.nome || "");
  const [email, setEmail] = useState(
    talentoInicial?.email ||
      (talentoInicial?.redes_sociais?.email as string) ||
      ""
  );
  const [whatsapp, setWhatsapp] = useState(
    talentoInicial?.whatsapp ||
      (talentoInicial?.redes_sociais?.whatsapp as string) ||
      ""
  );
  const [titulo, setTitulo] = useState(talentoInicial?.titulo_profissional || "");
  const [categoria, setCategoria] = useState(talentoInicial?.categoria || "modelos");
  const [cep, setCep] = useState(
    talentoInicial?.cep ||
      (talentoInicial?.redes_sociais?.cep as string) ||
      ""
  );
  const [endereco, setEndereco] = useState(
    talentoInicial?.endereco ||
      (talentoInicial?.redes_sociais?.endereco as string) ||
      ""
  );
  const [cidade, setCidade] = useState(
    talentoInicial?.cidade_nome || talentoInicial?.cidade_base || "Uberlândia"
  );
  const [estado, setEstado] = useState(talentoInicial?.estado || "MG");
  const [cidadesAtendidas, setCidadesAtendidas] = useState(
    talentoInicial?.cidades_atendidas || "Nacional e Internacional"
  );
  const [seguidores, setSeguidores] = useState(
    talentoInicial?.seguidores_total || "+ 100 mil seguidores"
  );
  const [bioCurta, setBioCurta] = useState(talentoInicial?.bio_curta || "");
  const [bioCompleta, setBioCompleta] = useState(talentoInicial?.bio_completa || "");
  const [segmentos, setSegmentos] = useState(
    talentoInicial?.segmentos?.join(", ") || "Moda, Beleza, Estilo de Vida"
  );
  const [instagram, setInstagram] = useState(
    talentoInicial?.redes_sociais?.instagram || ""
  );
  const [youtube, setYoutube] = useState(
    talentoInicial?.redes_sociais?.youtube || ""
  );
  const [tiktok, setTiktok] = useState(
    talentoInicial?.redes_sociais?.tiktok || ""
  );
  const [linkedin, setLinkedin] = useState(
    talentoInicial?.redes_sociais?.linkedin || ""
  );
  const [servicos, setServicos] = useState<string[]>(
    talentoInicial?.servicos && talentoInicial.servicos.length > 0
      ? talentoInicial.servicos
      : [
          "Comerciais de TV",
          "Campanhas Publicitárias",
          "Presença VIP",
          "Ações com Influenciadores",
        ]
  );
  const [videoTitulo, setVideoTitulo] = useState(
    talentoInicial?.videos?.[0]?.titulo || "Vídeo de Apresentação"
  );
  const [videoUrl, setVideoUrl] = useState(
    talentoInicial?.videos?.[0]?.url || ""
  );

  // Fotos e Posições Verticais (com fallback robusto para redes_sociais)
  const [fotoUrl, setFotoUrl] = useState(talentoInicial?.foto_url || "");
  const [fotoPosicaoY, setFotoPosicaoY] = useState<number>(() => {
    if (typeof talentoInicial?.foto_posicao_y === "number") return talentoInicial.foto_posicao_y;
    if (typeof talentoInicial?.redes_sociais?.foto_posicao_y === "number") return Number(talentoInicial.redes_sociais.foto_posicao_y);
    return 50;
  });

  const [fotoCapaUrl, setFotoCapaUrl] = useState(talentoInicial?.foto_capa_url || "");
  const [fotoCapaPosicaoY, setFotoCapaPosicaoY] = useState<number>(() => {
    if (typeof talentoInicial?.foto_capa_posicao_y === "number") return talentoInicial.foto_capa_posicao_y;
    if (typeof talentoInicial?.redes_sociais?.foto_capa_posicao_y === "number") return Number(talentoInicial.redes_sociais.foto_capa_posicao_y);
    return 50;
  });

  // Sincroniza posições caso talentoInicial seja carregado após montagem
  useEffect(() => {
    if (talentoInicial) {
      if (typeof talentoInicial.foto_posicao_y === "number") {
        setFotoPosicaoY(talentoInicial.foto_posicao_y);
      } else if (typeof talentoInicial.redes_sociais?.foto_posicao_y === "number") {
        setFotoPosicaoY(Number(talentoInicial.redes_sociais.foto_posicao_y));
      }
      if (typeof talentoInicial.foto_capa_posicao_y === "number") {
        setFotoCapaPosicaoY(talentoInicial.foto_capa_posicao_y);
      } else if (typeof talentoInicial.redes_sociais?.foto_capa_posicao_y === "number") {
        setFotoCapaPosicaoY(Number(talentoInicial.redes_sociais.foto_capa_posicao_y));
      }
    }
  }, [talentoInicial]);

  // Estados de Upload, Processamento e Sucesso
  const [fazendoUploadFoto, setFazendoUploadFoto] = useState(false);
  const [fazendoUploadCapa, setFazendoUploadCapa] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [slugCriado, setSlugCriado] = useState(talentoInicial?.slug || "");

  // CEP
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepMensagem, setCepMensagem] = useState<string | null>(null);

  // Arraste Ref-Based da Capa e Foto de Perfil (Zero lag, zero salto de estado)
  const [isDragging, setIsDragging] = useState(false);
  const dragCapaRef = useRef({ isDragging: false, startY: 0, startPos: 50 });

  const [isDraggingFoto, setIsDraggingFoto] = useState(false);
  const dragFotoRef = useRef({ isDragging: false, startY: 0, startPos: 50 });

  // Listener global de liberação do mouse/touch para evitar travamento de arraste
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (dragCapaRef.current.isDragging) {
        dragCapaRef.current.isDragging = false;
        setIsDragging(false);
      }
      if (dragFotoRef.current.isDragging) {
        dragFotoRef.current.isDragging = false;
        setIsDraggingFoto(false);
      }
    };

    window.addEventListener("mouseup", handleGlobalEnd);
    window.addEventListener("touchend", handleGlobalEnd);
    return () => {
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, []);

  // Handlers de Arraste da Foto de Perfil
  const handleFotoMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragFotoRef.current = {
      isDragging: true,
      startY: e.clientY,
      startPos: fotoPosicaoY,
    };
    setIsDraggingFoto(true);
  };

  const handleFotoMouseMove = (e: React.MouseEvent) => {
    if (!dragFotoRef.current.isDragging) return;
    const deltaY = e.clientY - dragFotoRef.current.startY;
    const sensibilidade = 0.35;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragFotoRef.current.startPos - deltaY * sensibilidade)));
    setFotoPosicaoY(novaPos);
  };

  const handleFotoMouseUp = () => {
    dragFotoRef.current.isDragging = false;
    setIsDraggingFoto(false);
  };

  const handleFotoTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.stopPropagation();
      dragFotoRef.current = {
        isDragging: true,
        startY: e.touches[0].clientY,
        startPos: fotoPosicaoY,
      };
      setIsDraggingFoto(true);
    }
  };

  const handleFotoTouchMove = (e: React.TouchEvent) => {
    if (!dragFotoRef.current.isDragging || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - dragFotoRef.current.startY;
    const sensibilidade = 0.35;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragFotoRef.current.startPos - deltaY * sensibilidade)));
    setFotoPosicaoY(novaPos);
  };

  const handleFotoTouchEnd = () => {
    dragFotoRef.current.isDragging = false;
    setIsDraggingFoto(false);
  };

  // Handlers de Arraste da Imagem de Capa
  const handleMouseDown = (e: React.MouseEvent) => {
    dragCapaRef.current = {
      isDragging: true,
      startY: e.clientY,
      startPos: fotoCapaPosicaoY,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragCapaRef.current.isDragging) return;
    const deltaY = e.clientY - dragCapaRef.current.startY;
    const sensibilidade = 0.35;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragCapaRef.current.startPos - deltaY * sensibilidade)));
    setFotoCapaPosicaoY(novaPos);
  };

  const handleMouseUp = () => {
    dragCapaRef.current.isDragging = false;
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragCapaRef.current = {
        isDragging: true,
        startY: e.touches[0].clientY,
        startPos: fotoCapaPosicaoY,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragCapaRef.current.isDragging || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - dragCapaRef.current.startY;
    const sensibilidade = 0.35;
    const novaPos = Math.min(100, Math.max(0, Math.round(dragCapaRef.current.startPos - deltaY * sensibilidade)));
    setFotoCapaPosicaoY(novaPos);
  };

  const handleTouchEnd = () => {
    dragCapaRef.current.isDragging = false;
    setIsDragging(false);
  };

  // Upload Foto de Perfil
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

  // Upload Capa Panorâmica
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
    const apenasDigitos = valor.replace(/\D/g, "");
    if (apenasDigitos.length <= 5) return apenasDigitos;
    return `${apenasDigitos.slice(0, 5)}-${apenasDigitos.slice(5, 8)}`;
  };

  const consultarCep = async (cepInput: string) => {
    const cepLimpo = cepInput.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      setBuscandoCep(true);
      setCepMensagem("Buscando endereço...");

      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await res.json();

      if (dados.erro) {
        setCepMensagem("CEP não encontrado.");
        return;
      }

      const logradouroBairro = [dados.logradouro, dados.bairro].filter(Boolean).join(", ");
      if (logradouroBairro) {
        setEndereco(logradouroBairro);
      }
      if (dados.localidade) {
        setCidade(dados.localidade);
      }
      if (dados.uf) {
        setEstado(dados.uf);
      }

      setCepMensagem(`Localizado: ${dados.localidade}/${dados.uf}`);
    } catch {
      setCepMensagem("Erro ao consultar CEP.");
    } finally {
      setBuscandoCep(false);
      setTimeout(() => setCepMensagem(null), 4000);
    }
  };

  const toggleServico = (item: string) => {
    setServicos((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const extrairYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Submeter / Salvar Perfil
  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !email.trim() || !whatsapp.trim() || !titulo.trim() || !fotoUrl.trim() || !bioCurta.trim()) {
      setErroMsg("Por favor, preencha todos os campos obrigatórios marcados com (*) e envie sua Foto de Perfil.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!email.includes("@")) {
      setErroMsg("Por favor, informe um endereço de e-mail válido.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSalvando(true);
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
        email: email.trim().toLowerCase(),
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
          email: email.trim().toLowerCase(),
          whatsapp: whatsapp.trim(),
          foto_posicao_y: Number(fotoPosicaoY) >= 0 ? Number(fotoPosicaoY) : 50,
          foto_capa_posicao_y: Number(fotoCapaPosicaoY) >= 0 ? Number(fotoCapaPosicaoY) : 50,
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

      if (modoEdicao && talentoInicial?.id && tokenEdicao) {
        // MODO EDIÇÃO: Atualiza via rota de edição com token
        const res = await fetch("/api/talentos/edicao", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: talentoInicial.id,
            token: tokenEdicao,
            ...payload,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao atualizar seu perfil.");
        }

        if (onSucessoEdicao && data.data) {
          onSucessoEdicao(data.data);
        }

        setSlugCriado(data.data?.slug || talentoInicial.slug);
        setSucesso(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // MODO CADASTRO NOVO: Cria via rota de candidatura
        const res = await fetch("/api/talentos/candidatura", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao submeter seu cadastro.");
        }

        setSlugCriado(data.data?.slug || "");
        setSucesso(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: unknown) {
      setErroMsg(err instanceof Error ? err.message : "Erro ao processar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const videoIdPreview = extrairYouTubeId(videoUrl);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 selection:bg-amber-400 selection:text-slate-950 pb-20">
      {/* 1. Barra Superior Fixa de Ação */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/talentos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao Catálogo</span>
            </Link>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{modoEdicao ? "Gerenciamento de Perfil" : "Estúdio de Perfil Oficial"}</span>
              </span>
            </div>
          </div>

          {!sucesso && (
            <button
              type="button"
              onClick={handleSalvarPerfil}
              disabled={salvando}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{modoEdicao ? "Salvar Alterações" : "Publicar Perfil"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        {erroMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* =========================================================================
            TELA DE SUCESSO & CONFIRMAÇÃO
           ========================================================================= */}
        {sucesso ? (
          <div className="max-w-2xl mx-auto text-center py-12 px-6 bg-white border border-slate-200 rounded-3xl shadow-md space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                {modoEdicao ? "Perfil Atualizado com Sucesso!" : "Candidatura Enviada com Sucesso!"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
                Parabéns, {nome}!
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                {modoEdicao
                  ? "Suas alterações e o novo enquadramento das suas fotos foram salvos com sucesso no Portal Empire."
                  : "Seu perfil foi recebido pelo elenco oficial do Empire Talentos & Celebridades e está pronto para análise."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-2.5 text-xs text-slate-700">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Como Gerenciar seu Perfil no Futuro:</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Você pode editar suas informações, trocar fotos e reposicionar o enquadramento a qualquer momento! Basta acessar a opção <strong>&quot;Editar Meu Perfil&quot;</strong> e digitar seu e-mail (<strong>{email}</strong>) e WhatsApp (<strong>{whatsapp}</strong>).
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {slugCriado && (
                <Link
                  href={`/talentos/${slugCriado}`}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-colors"
                >
                  Ver Meu Perfil no Portal
                </Link>
              )}
              <Link
                href="/talentos"
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
              >
                Ir para o Catálogo de Talentos
              </Link>
            </div>
          </div>
        ) : (
          /* =========================================================================
              MODO ESTÚDIO VISUAL: TELA ÚNICA DE CADASTRO E EDIÇÃO
             ========================================================================= */
          <form onSubmit={handleSalvarPerfil} className="space-y-6">
            {/* Aviso Informativo do Estúdio */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Estúdio Visual em Tempo Real:</strong> Clique nas fotos para fazer upload e arraste verticalmente para ajustar o enquadramento do seu rosto e da sua capa antes de publicar!
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider shrink-0 bg-amber-200/60 px-2.5 py-1 rounded-lg">
                Preview Idêntico ao Portal
              </span>
            </div>

            {/* MOLDURA DO LIVE STUDIO: SIMULAÇÃO EXATA DA PÁGINA PÚBLICA */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              {/* 1. Capa Panorâmica com Arraste (Mouse & Touch) */}
              <div
                className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:h-[380px] lg:h-[440px] bg-slate-900 overflow-hidden cursor-grab active:cursor-grabbing select-none"
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
                  <div className="w-full h-full bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 flex flex-col items-center justify-center text-white/80 p-4 text-center">
                    <Camera className="w-8 h-8 text-amber-400 mb-2" />
                    <span className="text-sm font-bold text-white">Adicione uma Foto de Capa Panorâmica</span>
                    <span className="text-xs text-slate-400 mt-0.5 max-w-sm">
                      Dica: Escolha uma foto horizontal (estilo banner). Após o envio, você pode arrastar para reposicionar.
                    </span>
                  </div>
                )}

                {/* Sombra suave de legibilidade na base */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Tooltip Central Flutuante Estilo Facebook */}
                {fotoCapaUrl && (
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xl">
                      <MoveVertical className="w-3.5 h-3.5 text-amber-400" />
                      <span>Arraste para cima ou baixo para reposicionar a capa</span>
                    </div>
                  </div>
                )}

                {/* Botões Flutuantes da Capa (Canto Superior Direito) */}
                <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
                  {fotoCapaUrl && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-xl">
                      <span className="text-[11px] text-slate-300">Posição:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFotoCapaPosicaoY(10);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                          fotoCapaPosicaoY <= 25 ? "bg-amber-400 text-slate-950" : "hover:bg-white/20"
                        }`}
                      >
                        Topo
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFotoCapaPosicaoY(50);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                          fotoCapaPosicaoY > 25 && fotoCapaPosicaoY < 75 ? "bg-amber-400 text-slate-950" : "hover:bg-white/20"
                        }`}
                      >
                        Centro
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFotoCapaPosicaoY(90);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                          fotoCapaPosicaoY >= 75 ? "bg-amber-400 text-slate-950" : "hover:bg-white/20"
                        }`}
                      >
                        Base
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={fotoCapaPosicaoY}
                        onChange={(e) => setFotoCapaPosicaoY(Number(e.target.value))}
                        className="w-16 sm:w-24 accent-amber-400 cursor-pointer ml-1"
                        title="Deslize para ajuste fino de altura"
                      />
                      <span className="text-[11px] font-mono text-amber-400 w-8 text-right font-bold">
                        {fotoCapaPosicaoY}%
                      </span>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-amber-400/50 text-amber-300 font-bold text-xs cursor-pointer shadow-lg transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{fazendoUploadCapa ? "Enviando..." : fotoCapaUrl ? "Trocar Imagem de Capa" : "Adicionar Imagem de Capa"}</span>
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
              <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-12 -mt-10 sm:-mt-14 md:-mt-16 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Coluna Principal: Avatar + Formulário de Dados */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
                      {/* Avatar com Arraste Interativo do Rosto */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div
                            className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100 shrink-0 select-none ${
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
                                  alt={nome || "Foto de Perfil"}
                                  fill
                                  unoptimized
                                  draggable={false}
                                  className="object-cover transition-none pointer-events-none"
                                  style={{ objectPosition: `center ${fotoPosicaoY}%` }}
                                />
                                {/* Overlay de instrução no hover ou arrastando */}
                                <div
                                  className={`absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white text-[10px] font-bold text-center px-1 pointer-events-none transition-opacity ${
                                    isDraggingFoto ? "opacity-100" : "opacity-0 group-hover/avatar:opacity-100"
                                  }`}
                                >
                                  <MoveVertical className="w-4 h-4 text-amber-400 mb-0.5 animate-pulse" />
                                  <span>Arraste o rosto</span>
                                  <span className="mt-0.5 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                                    {fotoPosicaoY}%
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-2 text-center bg-slate-50">
                                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                                <span>Sem Foto de Perfil</span>
                              </div>
                            )}
                          </div>

                          {/* Botões Rápidos de Enquadramento */}
                          {fotoUrl && (
                            <div className="flex flex-wrap items-center gap-1 pt-1 bg-slate-100/95 px-2.5 py-1.5 rounded-xl text-[10.5px] border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-500 mr-0.5">Foco:</span>
                              <button
                                type="button"
                                onClick={() => setFotoPosicaoY(15)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  fotoPosicaoY <= 25 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Topo
                              </button>
                              <button
                                type="button"
                                onClick={() => setFotoPosicaoY(50)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  fotoPosicaoY > 25 && fotoPosicaoY < 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Centro
                              </button>
                              <button
                                type="button"
                                onClick={() => setFotoPosicaoY(85)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  fotoPosicaoY >= 75 ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Base
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={fotoPosicaoY}
                                onChange={(e) => setFotoPosicaoY(Number(e.target.value))}
                                className="w-14 sm:w-16 accent-amber-500 cursor-pointer ml-1"
                                title="Ajuste fino de altura do rosto"
                              />
                              <span className="text-[10px] font-mono font-bold text-amber-700 ml-0.5">
                                {fotoPosicaoY}%
                              </span>
                            </div>
                          )}

                          {/* Botão de Upload da Foto de Perfil */}
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-xs mt-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{fazendoUploadFoto ? "Enviando..." : fotoUrl ? "Trocar Foto" : "Adicionar Foto de Perfil"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadFoto}
                              disabled={fazendoUploadFoto}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Dados de Identificação Principais */}
                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              Nome Completo ou Nome Artístico *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Cris Arcangeli, Sabrina Sato..."
                              value={nome}
                              onChange={(e) => setNome(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              Título / Slogan Profissional *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Apresentadora | Empreendedora | Especialista em Estética"
                              value={titulo}
                              onChange={(e) => setTitulo(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-amber-600" />
                                <span>E-mail de Gestão do Perfil *</span>
                              </label>
                              <input
                                type="email"
                                required
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                Usado para você acessar e editar seu perfil no portal.
                              </span>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp Comercial *</span>
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="(34) 99999-9999"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="w-full bg-slate-50 border border-emerald-300 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                Onde você receberá as propostas de marcas e eventos.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Categoria Principal & Segmentos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Categoria Principal de Elenco *
                          </label>
                          <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                          >
                            {CATEGORIAS_TALENTOS.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Segmentos & Nichos de Atuação
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Moda, Beleza, Saúde, Empreendedorismo"
                            value={segmentos}
                            onChange={(e) => setSegmentos(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Bio Curta */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Apresentação Curta (1 a 2 frases para os cards) *
                          </label>
                          <span className="text-[11px] text-slate-400">{bioCurta.length}/280</span>
                        </div>
                        <textarea
                          rows={2}
                          required
                          maxLength={280}
                          placeholder="Ex: Referência nacional em comunicação e negócios, com presença marcante em eventos de inovação e campanhas publicitárias."
                          value={bioCurta}
                          onChange={(e) => setBioCurta(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:bg-white focus:border-amber-500 focus:outline-none resize-none"
                        />
                      </div>

                      {/* Bio Completa / Release */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Biografia Completa / Release de Portfólio (Opcional)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Conte sua trajetória profissional, conquistas, projetos em destaque e diferenciais para as marcas..."
                          value={bioCompleta}
                          onChange={(e) => setBioCompleta(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:bg-white focus:border-amber-500 focus:outline-none resize-none"
                        />
                      </div>

                      {/* Serviços que Realiza para Marcas */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Serviços que você realiza para marcas e empresas:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SERVICOS_PADRAO.map((item) => {
                            const ativo = servicos.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleServico(item)}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                                  ativo
                                    ? "bg-amber-50 border-amber-400 text-amber-950 font-bold"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                                    ativo
                                      ? "bg-amber-500 border-amber-500 text-white"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {ativo && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="truncate">{item}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Vídeo de Portfólio (YouTube) */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-red-500" />
                          <span>Vídeo de Apresentação / Portfólio (YouTube)</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Título do Vídeo"
                            value={videoTitulo}
                            onChange={(e) => setVideoTitulo(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                          <input
                            type="url"
                            placeholder="Link do YouTube (ex: https://youtube.com/watch?v=...)"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {videoIdPreview && (
                          <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-black mt-2 shadow-inner">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoIdPreview}`}
                              title="Prévia do Vídeo"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Coluna Lateral: Localização, Redes e Suporte */}
                  <div className="lg:col-span-4 space-y-5">
                    {/* Card de Localização com CEP */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        <span>Sua Localização</span>
                      </div>

                      {/* CEP com busca automática */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase">
                            CEP (Busca Automática)
                          </label>
                          {cepMensagem && (
                            <span className="text-[10px] text-amber-700 font-bold animate-pulse">
                              {cepMensagem}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={9}
                          placeholder="00000-000"
                          value={cep}
                          onChange={(e) => {
                            const formatado = formatarCep(e.target.value);
                            setCep(formatado);
                            if (formatado.replace(/\D/g, "").length === 8) {
                              consultarCep(formatado);
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Endereço / Bairro */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                          Endereço / Bairro
                        </label>
                        <input
                          type="text"
                          placeholder="Rua, Número, Bairro"
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                            Cidade Base
                          </label>
                          <input
                            type="text"
                            placeholder="Uberlândia"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                            UF
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="MG"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold uppercase text-center focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                          Disponibilidade de Deslocamento
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Nacional e Internacional ou Regional"
                          value={cidadesAtendidas}
                          onChange={(e) => setCidadesAtendidas(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Card de Redes Sociais */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Redes Sociais & Alcance</span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                          Estimativa Total de Seguidores
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: + 100 mil seguidores ou + 500k"
                          value={seguidores}
                          onChange={(e) => setSeguidores(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                          <input
                            type="text"
                            placeholder="Instagram (ex: @seu.perfil)"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 shrink-0 w-4 text-center">Tik</span>
                          <input
                            type="text"
                            placeholder="TikTok (ex: @seu.perfil)"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                          <input
                            type="text"
                            placeholder="YouTube (Canal)"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
                          <input
                            type="text"
                            placeholder="LinkedIn (Perfil)"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botão Final Flutuante na Lateral */}
                    <button
                      type="submit"
                      disabled={salvando}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {salvando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{modoEdicao ? "Salvar Alterações" : "Publicar Perfil no Portal"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
