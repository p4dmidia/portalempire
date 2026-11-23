"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Users,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Share2,
  Video,
  Award,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  CheckCircle2,
  Sparkles,
  Tv,
  ExternalLink,
} from "lucide-react";
import type { Talento } from "@/lib/talentos/types";
import { SolicitarOrcamentoModal } from "./SolicitarOrcamentoModal";

interface TalentoPerfilClientProps {
  talento: Talento;
}

function extrairYouTubeId(urlOuId: string): string {
  if (!urlOuId) return "";
  const trimmed = urlOuId.trim();

  // Se já for só o ID (11 caracteres alfanuméricos com traço ou underline)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Links do tipo youtube.com/shorts/ID
  if (trimmed.includes("youtube.com/shorts/")) {
    const parts = trimmed.split("youtube.com/shorts/")[1];
    return parts.split("?")[0].split("&")[0].split("/")[0];
  }

  // Links do tipo youtu.be/ID
  if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/")[1];
    return parts.split("?")[0].split("&")[0].split("/")[0];
  }

  // Links do tipo youtube.com/embed/ID
  if (trimmed.includes("youtube.com/embed/")) {
    const parts = trimmed.split("youtube.com/embed/")[1];
    return parts.split("?")[0].split("&")[0].split("/")[0];
  }

  // Links do tipo youtube.com/live/ID
  if (trimmed.includes("youtube.com/live/")) {
    const parts = trimmed.split("youtube.com/live/")[1];
    return parts.split("?")[0].split("&")[0].split("/")[0];
  }

  // Links do tipo youtube.com/watch?v=ID
  if (trimmed.includes("v=")) {
    try {
      const match = trimmed.match(/[?&]v=([^&]+)/);
      if (match && match[1]) {
        return match[1];
      }
    } catch {
      // fallback
    }
  }

  // Fallback genérico para parâmetros ou última barra
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const vParam = url.searchParams.get("v");
    if (vParam) return vParam;
  } catch {
    // ignora
  }

  return trimmed.split("/").pop()?.split("?")[0]?.split("&")[0] || "";
}

export function TalentoPerfilClient({ talento }: TalentoPerfilClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${talento.nome} — Talentos Empire`,
        text: talento.bio_curta,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleWhatsAppDirect = () => {
    const texto = `Olá! Gostaria de solicitar um orçamento para contratação do talento *${talento.nome}* através do Portal Empire Talentos.`;
    const rawPhone = talento.whatsapp || talento.redes_sociais?.whatsapp;
    let telefone = "5534999999999";
    if (rawPhone) {
      const clean = rawPhone.replace(/\D/g, "");
      if (clean.length === 10 || clean.length === 11) {
        telefone = `55${clean}`;
      } else if (clean.length > 11) {
        telefone = clean;
      }
    }
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Barra de Navegação Superior / Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <Link
            href="/talentos"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Catálogo de Talentos</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiado ? "Link Copiado!" : "Compartilhar Perfil"}</span>
          </button>
        </div>
      </div>

      {/* 2. Capa Panorâmica com Posicionamento Personalizado */}
      <div className="relative w-full h-80 sm:h-[420px] lg:h-[480px] xl:h-[520px] bg-slate-200 dark:bg-slate-900 overflow-hidden shadow-inner">
        {talento.foto_capa_url ? (
          <Image
            src={talento.foto_capa_url}
            alt={talento.nome}
            fill
            unoptimized
            className="object-cover transition-all duration-300"
            style={{ objectPosition: `center ${talento.foto_capa_posicao_y ?? 50}%` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-200 via-amber-100/40 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#090a0f] via-black/15 to-transparent pointer-events-none" />
      </div>

      {/* 3. Container Principal (Sobreposição Suave para Não Cortar a Capa) */}
      <div className="max-w-[1440px] mx-auto px-4 -mt-10 sm:-mt-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Conteúdo do Perfil */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bloco de Apresentação */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Foto com Borda Dourada */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg shrink-0 bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={talento.foto_url}
                    alt={talento.nome}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
                </div>

                {/* Informações Principais */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {talento.nome}
                    </h1>
                    {talento.verificado && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 shadow-sm"
                        title="Verificado Oficial Grupo Empire"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    {talento.titulo_profissional}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                    {talento.cidade_nome && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        {talento.cidade_nome} - {talento.estado || "MG"}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      {talento.seguidores_total}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                      {talento.cidades_atendidas || "Nacional e Internacional"}
                    </span>
                  </div>

                  {/* Tags de Segmentos */}
                  {talento.segmentos && talento.segmentos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      {talento.segmentos.map((seg, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {seg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões Mobile de Ação Rápida */}
              <div className="sm:hidden pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs text-center shadow"
                >
                  Solicitar Orçamento
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center"
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Trajetória & Biografia Completa */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Trajetória & Biografia</span>
              </h2>

              <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
                {talento.bio_completa ? (
                  talento.bio_completa.split("\n\n").map((paragrafo, idx) => (
                    <p key={idx}>{paragrafo}</p>
                  ))
                ) : (
                  <p>{talento.bio_curta}</p>
                )}
              </div>
            </div>

            {/* Serviços e Formatos de Contratação */}
            {talento.servicos && talento.servicos.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Serviços & Formatos de Contratação</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {talento.servicos.map((servico, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-400 flex items-start gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{servico}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Atuação profissional com alinhamento de briefing e aprovação prévia.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Programas de TV & Participações */}
            {talento.programas_tv && talento.programas_tv.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-500" />
                  <span>Programas de TV & Conteúdo Multimídia</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {talento.programas_tv.map((programa, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-bold text-xs"
                    >
                      📺 {programa}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfólio em Vídeo */}
            {talento.videos && talento.videos.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-500" />
                  <span>Portfólio em Vídeo & Campanhas Anteriores</span>
                </h2>

                <div className="space-y-6">
                  {talento.videos.map((vid, idx) => {
                    const videoId = extrairYouTubeId(vid.url);
                    const linkDireto = vid.url.startsWith("http")
                      ? vid.url
                      : `https://www.youtube.com/watch?v=${videoId}`;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {vid.titulo}
                          </h4>
                          <a
                            href={linkDireto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                          >
                            <span>Assistir no YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow">
                          {videoId ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                              title={vid.titulo}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                              <Video className="w-8 h-8 mb-2 text-slate-600" />
                              <p className="text-xs">Não foi possível carregar a prévia do vídeo.</p>
                              <a
                                href={linkDireto}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-amber-400 underline mt-1"
                              >
                                Ver no YouTube
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Card Fixo de Contratação & Redes Sociais */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Card de Contratação VIP */}
            <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-md space-y-5">
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Agenciamento Comercial
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Contrate {talento.nome}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atendimento oficial e gestão de contratos pelo Grupo Empire Cidades.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Disponibilidade:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Agenda Aberta</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Modalidade:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Presencial & Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cidades:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {talento.cidades_atendidas || "Brasil & Exterior"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Solicitar Orçamento</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppDirect}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Atendimento WhatsApp</span>
              </button>
            </div>

            {/* Redes Sociais & Canais Oficiais */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Redes Sociais & Audiência
              </h3>

              <div className="space-y-2.5">
                {talento.redes_sociais?.instagram && (
                  <a
                    href={talento.redes_sociais.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>Instagram Oficial</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Seguir →</span>
                  </a>
                )}

                {talento.redes_sociais?.youtube && (
                  <a
                    href={talento.redes_sociais.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>Canal no YouTube</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Assistir →</span>
                  </a>
                )}

                {talento.redes_sociais?.linkedin && (
                  <a
                    href={talento.redes_sociais.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Linkedin className="w-4 h-4 text-blue-500" />
                      <span>LinkedIn Profissional</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Conectar →</span>
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Orçamento */}
      <SolicitarOrcamentoModal
        talento={talento}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
