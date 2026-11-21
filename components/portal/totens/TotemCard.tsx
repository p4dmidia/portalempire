"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Users,
  Film,
  Phone,
  ArrowRight,
  ExternalLink,
  BatteryCharging,
  Sparkles,
  Building,
} from "lucide-react";
import type { Totem } from "@/lib/totens/types";

interface TotemCardProps {
  totem: Totem;
  onOpenSolicitar?: (totem: Totem) => void;
}

export function TotemCard({ totem, onOpenSolicitar }: TotemCardProps) {
  // Formata o número do WhatsApp
  const rawWhatsapp = totem.franqueado_whatsapp.replace(/\D/g, "");
  const whatsappFormatado =
    rawWhatsapp.length === 10 || rawWhatsapp.length === 11
      ? `55${rawWhatsapp}`
      : rawWhatsapp;

  // Mensagem automática solicitada na especificação do projeto
  const mensagemWhatsApp = `Olá! Encontrei o Totem Empire ${totem.nome} (${totem.estabelecimento_nome} - ${totem.cidade_nome}/${totem.estado}) no Portal Empire Cidades e gostaria de receber informações para anunciar minha empresa.`;
  const urlWhatsApp = `https://wa.me/${whatsappFormatado}?text=${encodeURIComponent(
    mensagemWhatsApp
  )}`;

  // Link do mapa (prioriza endereço físico para não ser confundido com nomes comerciais no Maps)
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

  const temCarregador = totem.recursos_extras?.some((r) =>
    r.toLowerCase().includes("carregador")
  );

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Imagem do Totem com Badges */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full bg-slate-100 overflow-hidden">
        <Image
          src={totem.foto_url || "/images/totem-padrao.jpg"}
          alt={totem.nome}
          fill
          unoptimized
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Badge do Nome / ID do Totem */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
            {totem.nome.split(" - ")[0] || totem.nome}
          </span>
          {temCarregador && (
            <span className="px-2 py-1 rounded-xl bg-slate-900/80 backdrop-blur-sm text-amber-300 font-bold text-[10.5px] flex items-center gap-1 shadow-md border border-amber-400/40">
              <BatteryCharging className="w-3 h-3 text-amber-400" />
              <span>Com Carregador</span>
            </span>
          )}
        </div>

        {/* Badge de Cidade */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white font-bold text-[11px] shadow">
            {totem.cidade_nome}/{totem.estado}
          </span>
        </div>

        {/* Estabelecimento sobreposto no rodapé da imagem */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
            <Building className="w-3 h-3" />
            <span>{totem.tipo_estabelecimento}</span>
          </div>
          <h3 className="text-lg font-black leading-snug drop-shadow-sm truncate">
            {totem.estabelecimento_nome}
          </h3>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Endereço e Descrição */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-1.5 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">
              <span className="font-semibold text-slate-800">{totem.endereco}</span>,{" "}
              {totem.bairro} — {totem.cidade_nome}/{totem.estado}
            </p>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pl-5 italic">
            "{totem.descricao_ponto}"
          </p>
        </div>

        {/* Métricas: Circulação e Formato de Slots */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Público Estimado
              </span>
              <span className="block text-xs font-black text-slate-900 truncate">
                {totem.circulacao_estimada}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Inserções
              </span>
              <span className="block text-xs font-black text-slate-900 truncate">
                {totem.formato_publicidade || `${totem.slots_total || 20} slots`}
              </span>
            </div>
          </div>
        </div>

        {/* Box do Franqueado */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="min-w-0 pr-2">
            <span className="block text-[10.5px] font-bold text-slate-500">
              Franqueado Responsável:
            </span>
            <span className="block font-black text-slate-900 truncate">
              {totem.franqueado_nome}
            </span>
          </div>

          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs shrink-0 transition-colors border border-emerald-300/60"
            title="Conversar com o Franqueado no WhatsApp"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totem.franqueado_whatsapp}</span>
          </a>
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 space-y-2">
          {/* Botão Principal: Anunciar neste Totem (WhatsApp) */}
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <Sparkles className="w-4 h-4" />
            <span>Anunciar neste Totem</span>
          </a>

          {/* Botões Secundários: Ver no Mapa e Mais Detalhes */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={urlMapa}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver no Mapa</span>
            </a>

            <Link
              href={`/totens/${totem.slug}`}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center shadow-sm"
            >
              <span>Mais Detalhes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
