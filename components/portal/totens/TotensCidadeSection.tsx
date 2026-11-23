import Link from "next/link";
import Image from "next/image";
import { Tv, MapPin, Users, Film, ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import type { Totem } from "@/lib/totens/types";

interface TotensCidadeSectionProps {
  totens: Totem[];
  cidadeNome: string;
  cidadeEstado: string;
}

export function TotensCidadeSection({
  totens,
  cidadeNome,
  cidadeEstado,
}: TotensCidadeSectionProps) {
  return (
    <section className="my-12 rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Tv className="w-3.5 h-3.5 text-amber-600" />
            <span>Mídia Digital DOOH</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            CONHEÇA OS TOTENS PUBLICITÁRIOS DA SUA CIDADE
          </h2>

          <p className="text-xs sm:text-sm text-slate-500">
            Painéis digitais de alto impacto instalados nos pontos comerciais de maior circulação em {cidadeNome}/{cidadeEstado}.
          </p>
        </div>

        <Link
          href={`/totens?cidade=${encodeURIComponent(cidadeNome)}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <span>Ver Todos os Totens</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Conteúdo */}
      <div className="pt-6">
        {totens.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Tv className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Novos Totens Empire chegando em {cidadeNome}!
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Estamos expandindo nossos pontos de mídia digital nesta região. Quer instalar um totem no seu estabelecimento ou anunciar?
            </p>
            <Link
              href="/totens"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 underline"
            >
              <span>Consultar catálogo nacional de totens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {totens.slice(0, 3).map((totem) => {
              const rawWhatsapp = totem.franqueado_whatsapp.replace(/\D/g, "");
              const whatsappFormatado =
                rawWhatsapp.length === 10 || rawWhatsapp.length === 11
                  ? `55${rawWhatsapp}`
                  : rawWhatsapp;
              const mensagem = `Olá! Vi o Totem ${totem.nome} (${totem.estabelecimento_nome}) no Portal Empire Cidades e gostaria de anunciar.`;
              const urlWhatsApp = `https://wa.me/${whatsappFormatado}?text=${encodeURIComponent(
                mensagem
              )}`;

              return (
                <div
                  key={totem.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3 hover:border-amber-400 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-200">
                      <Image
                        src={totem.foto_url || "/images/totem-padrao.jpg"}
                        alt={totem.nome}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                        {totem.nome.split(" - ")[0]}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">
                        {totem.tipo_estabelecimento}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {totem.estabelecimento_nome}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {totem.endereco}, {totem.bairro}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        <span>{totem.circulacao_estimada}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Film className="w-3.5 h-3.5 text-amber-500" />
                        <span>{totem.formato_publicidade || "20 slots"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={urlWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors text-center shadow-sm"
                    >
                      Anunciar
                    </a>
                    <Link
                      href={`/totens/${totem.slug}`}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition-colors"
                    >
                      Detalhes
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
