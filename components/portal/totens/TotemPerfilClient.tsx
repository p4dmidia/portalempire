"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Users,
  Film,
  Phone,
  Share2,
  Tv,
  CheckCircle2,
  BatteryCharging,
  ExternalLink,
  Building,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import type { Totem } from "@/lib/totens/types";
import { SolicitarAnuncioModal } from "./SolicitarAnuncioModal";

interface TotemPerfilClientProps {
  totem: Totem;
}

export function TotemPerfilClient({ totem }: TotemPerfilClientProps) {
  const [fotoAtiva, setFotoAtiva] = useState(totem.foto_url);
  const [copiado, setCopiado] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formata o número do WhatsApp
  const rawWhatsapp = totem.franqueado_whatsapp.replace(/\D/g, "");
  const whatsappFormatado =
    rawWhatsapp.length === 10 || rawWhatsapp.length === 11
      ? `55${rawWhatsapp}`
      : rawWhatsapp;

  const mensagemWhatsApp = `Olá! Encontrei o Totem Empire ${totem.nome} (${totem.estabelecimento_nome} - ${totem.cidade_nome}/${totem.estado}) no Portal Empire Cidades e gostaria de receber informações para anunciar minha empresa.`;
  const urlWhatsApp = `https://wa.me/${whatsappFormatado}?text=${encodeURIComponent(
    mensagemWhatsApp
  )}`;

  // Link do mapa (prioriza endereço físico para garantir precisão geográfica)
  const queryEndereco = [
    totem.endereco,
    totem.bairro,
    `${totem.cidade_nome} - ${totem.estado}`,
    totem.cep ? `CEP ${totem.cep}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const urlMapa =
    totem.google_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryEndereco)}`;

  const todasAsFotos = [
    totem.foto_url || "/images/totem-padrao.jpg",
    ...(totem.galeria_fotos || []),
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${totem.nome} — Totens Empire`,
        text: `Confira o totem publicitário em ${totem.estabelecimento_nome} (${totem.cidade_nome}/${totem.estado})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Barra de Navegação Superior / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link
            href="/totens"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Catálogo de Totens</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiado ? "Link Copiado!" : "Compartilhar"}</span>
          </button>
        </div>
      </div>

      {/* 2. Container Principal */}
      <div className="max-w-[1440px] mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Fotos e Informações Técnicas */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bloco de Imagens: Foto Principal + Miniaturas */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={fotoAtiva}
                  alt={totem.nome}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                    {totem.nome}
                  </span>
                </div>
              </div>

              {todasAsFotos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {todasAsFotos.map((foto, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFotoAtiva(foto)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        fotoAtiva === foto
                          ? "border-amber-500 scale-105 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={foto}
                        alt={`Miniatura ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bloco de Apresentação & Localização */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>{totem.tipo_estabelecimento}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {totem.estabelecimento_nome}
                </h1>
                <p className="text-sm font-semibold text-slate-500">
                  {totem.nome} • {totem.cidade_nome}/{totem.estado}
                </p>
              </div>

              {/* Endereço Completo */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      {totem.endereco}
                    </span>
                    <span>
                      Bairro {totem.bairro} — {totem.cidade_nome}/{totem.estado}
                    </span>
                  </div>
                </div>

                <a
                  href={urlMapa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 transition-colors shrink-0 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver no Google Maps</span>
                </a>
              </div>

              {/* Descrição do Ponto */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Posicionamento Estratégico no Ponto Comercial
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/40 p-4 rounded-2xl border border-amber-200/50">
                  {totem.descricao_ponto}
                </p>
              </div>
            </div>

            {/* Ficha Técnica & Audiência */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-500" />
                <span>Ficha Técnica do Equipamento & Audiência</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">
                    Circulação Estimada de Pessoas
                  </span>
                  <div className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>{totem.circulacao_estimada}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">
                    Formato de Anúncio / Slots
                  </span>
                  <div className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Film className="w-4 h-4 text-amber-500" />
                    <span>{totem.formato_publicidade || "20 slots de 15 segundos"}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">
                    Modelo do Totem
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {totem.modelo_equipamento || "Totem Digital Vertical"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">
                    Tamanho & Resolução da Tela
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {totem.tamanho_tela || "55 polegadas 4K Ultra HD"}
                  </span>
                </div>
              </div>

              {/* Perfil do Público */}
              {totem.perfil_publico && totem.perfil_publico.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Perfil do Público Freqüentador:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {totem.perfil_publico.map((perfil, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs"
                      >
                        ✓ {perfil}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recursos Extras */}
              {totem.recursos_extras && totem.recursos_extras.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Recursos Tecnológicos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {totem.recursos_extras.map((rec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5"
                      >
                        <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                        <span>{rec}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Box Comercial Fixo com WhatsApp do Franqueado */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 shadow-md space-y-5">
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 block">
                  Publicidade Digital DOOH
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Anuncie neste Totem
                </h3>
                <p className="text-xs text-slate-500">
                  Espaços publicitários e veiculação oficial pelo Grupo Empire Cidades.
                </p>
              </div>

              {/* Box de Informações do Franqueado */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Franqueado:</span>
                  <span className="font-bold text-slate-900">{totem.franqueado_nome}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Região:</span>
                  <span className="font-bold text-slate-900">{totem.cidade_nome}/{totem.estado}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Disponibilidade:</span>
                  <span className="font-bold text-emerald-600">
                    {totem.slots_disponiveis ? `${totem.slots_disponiveis} slots livres` : "Disponível"}
                  </span>
                </div>
              </div>

              {/* Botão de WhatsApp Direto */}
              <a
                href={urlWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Sparkles className="w-4 h-4" />
                <span>Falar com o Franqueado no WhatsApp</span>
              </a>

              {/* Botão de Solicitação Interna */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Mensagem Comercial</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Solicitação */}
      <SolicitarAnuncioModal
        totem={totem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
