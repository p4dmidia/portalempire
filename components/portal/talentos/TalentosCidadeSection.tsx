import Link from "next/link";
import Image from "next/image";
import { Star, Check, CheckCircle2, ArrowRight, Phone, Users, Sparkles, Calendar } from "lucide-react";
import type { Talento } from "@/lib/talentos/types";

interface TalentosCidadeSectionProps {
  talentos: Talento[];
  cidadeNome: string;
  cidadeEstado: string;
}

export function TalentosCidadeSection({
  talentos,
  cidadeNome,
  cidadeEstado,
}: TalentosCidadeSectionProps) {
  if (talentos.length === 0) return null;

  return (
    <section className="my-10 rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Agência Oficial • Grupo Empire</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            TALENTOS & CELEBRIDADES DISPONÍVEIS EM {cidadeNome.toUpperCase()}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500">
            Apresentadores, influenciadores, celebridades e palestrantes para sua marca, eventos corporativos e campanhas em {cidadeNome} e região.
          </p>
        </div>

        <Link
          href="/talentos"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 self-start sm:self-auto hover:scale-105 active:scale-95"
        >
          <span>Ver Elenco Completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid de Talentos da Cidade */}
      <div className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {talentos.slice(0, 4).map((talento) => {
            const rawWhatsapp = (talento.whatsapp || "34988676886").replace(/\D/g, "");
            const whatsappFormatado =
              rawWhatsapp.length === 10 || rawWhatsapp.length === 11
                ? `55${rawWhatsapp}`
                : rawWhatsapp;

            const mensagem = `Olá! Encontrei o perfil de ${talento.nome} no Portal Empire Cidades (${cidadeNome}) e gostaria de solicitar informações e orçamento para contratação.`;
            const urlWhatsApp = `https://wa.me/${whatsappFormatado}?text=${encodeURIComponent(
              mensagem
            )}`;

            return (
              <div
                key={talento.id}
                className="group bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3.5 hover:border-amber-400 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Foto com Badge de Alcance */}
                  <div className="relative aspect-[4/4] w-full rounded-xl overflow-hidden bg-slate-200">
                    <Image
                      src={talento.foto_url}
                      alt={talento.nome}
                      fill
                      unoptimized
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {talento.seguidores_total && (
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-amber-300 font-bold text-[10px]">
                        <Users className="w-3 h-3" />
                        <span>{talento.seguidores_total}</span>
                      </span>
                    )}

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[9.5px] uppercase tracking-wide">
                      {talento.categoria}
                    </span>
                  </div>

                  {/* Nome e Selo Verificado */}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                        {talento.nome}
                      </h4>
                      {talento.verificado && (
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px]"
                          title="Verificado"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11.5px] font-semibold text-slate-600 line-clamp-1 mt-0.5">
                      {talento.titulo_profissional}
                    </p>

                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      Base: <span className="text-slate-600 font-medium">{talento.cidade_nome || talento.cidade_base || cidadeNome}</span>
                    </p>
                  </div>

                  {/* Mini Lista de Serviços */}
                  {talento.servicos && talento.servicos.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        Serviços para {cidadeNome}:
                      </span>
                      <ul className="space-y-0.5">
                        {talento.servicos.slice(0, 3).map((srv, idx) => (
                          <li key={idx} className="flex items-center gap-1 text-[10.5px] text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{srv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={urlWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all text-center shadow-sm hover:scale-102 flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Contratar</span>
                  </a>

                  <Link
                    href={`/talentos/${talento.slug}`}
                    className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition-colors text-center"
                  >
                    Perfil
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
