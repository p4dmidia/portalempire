"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Calendar, Users, Eye, Check } from "lucide-react";
import type { Talento } from "@/lib/talentos/types";

interface TalentoCardProps {
  talento: Talento;
  onSolicitarOrcamento: (talento: Talento) => void;
}

export function TalentoCard({ talento, onSolicitarOrcamento }: TalentoCardProps) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-slate-800 dark:text-slate-100">
      {/* Imagem do Talento */}
      <div className="relative w-full aspect-[4/3.8] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <Image
          src={talento.foto_url}
          alt={talento.nome}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{
            objectPosition: `center ${
              talento.foto_posicao_y !== undefined && talento.foto_posicao_y !== null
                ? talento.foto_posicao_y
                : talento.redes_sociais?.foto_posicao_y ?? 25
            }%`,
          }}
        />
        {/* Gradiente sutil inferior na imagem */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:from-black/40" />

        {/* Badge Flutuante de Seguidores */}
        <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-black/85 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-900 dark:text-amber-300 shadow-md">
          <Users className="w-3.5 h-3.5 text-amber-500" />
          <span>{talento.seguidores_total}</span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2.5">
          {/* Nome e Selo Verificado */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {talento.nome}
            </h3>
            {talento.verificado && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 shadow-sm"
                title="Perfil Verificado Empire Talentos"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          {/* Profissão e Segmentos */}
          <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
            {talento.titulo_profissional}
          </p>

          {/* Mini Biografia / Apresentação */}
          <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {talento.bio_curta}
          </p>

          {/* Lista de Serviços Oferecidos */}
          {talento.servicos && talento.servicos.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1.5">
                Serviços:
              </span>
              <ul className="space-y-1">
                {talento.servicos.slice(0, 4).map((servico, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[11.5px] text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500/10" />
                    <span className="line-clamp-1">{servico}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Rodapé do Card com Ações */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 mt-auto">
          <Link
            href={`/talentos/${talento.slug}`}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700 text-center"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Perfil</span>
          </Link>

          <button
            type="button"
            onClick={() => onSolicitarOrcamento(talento)}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm hover:scale-105 active:scale-95 text-center cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Solicitar Orçamento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
