import Image from "next/image";
import Link from "next/link";
import { Tag, MapPin, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import type { ClassificadoData } from "@/lib/portal/classificados-types";

interface ClassificadosFaixaSectionProps {
  classificados: ClassificadoData[];
  titulo?: string;
  subtitulo?: string;
}

export function ClassificadosFaixaSection({
  classificados,
  titulo = "Classificados & Oportunidades Comerciais",
  subtitulo = "Anúncios verificados e oportunidades diretas de negócios na região",
}: ClassificadosFaixaSectionProps) {
  return (
    <section className="my-8 bg-gradient-to-r from-amber-500/10 via-slate-900/5 dark:via-slate-900/40 to-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
            <Tag className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-extrabold uppercase text-[10px] tracking-wider">
                Vitrine de Anúncios Locais
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {titulo}
            </h3>
          </div>
        </div>

        <Link
          href="/classificados"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95"
        >
          <span>Ver Todos os Anúncios</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Se não houver anúncios específicos para esta cidade */}
      {!classificados || classificados.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-dashed border-amber-500/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Nenhum classificado ativo para esta localidade no momento
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Seja o primeiro a divulgar veículos, imóveis, serviços ou oportunidades comerciais exclusivas para o público desta região!
          </p>
          <div className="pt-2">
            <Link
              href="/anuncie"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Anunciar na Minha Cidade</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Grid de Cards de Anúncios */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classificados.slice(0, 4).map((item) => {
          const foneLimpo = item.contato_whatsapp.replace(/\D/g, "");
          const foneFinal = foneLimpo.startsWith("55") ? foneLimpo : `55${foneLimpo}`;
          const texto = encodeURIComponent(
            `Olá! Vi seu anúncio "${item.titulo}" no Empire Cidades e gostaria de informações.`
          );
          const linkWhats = `https://wa.me/${foneFinal}?text=${texto}`;

          const formatarPreco = () => {
            if (item.preco_sob_consulta || !item.preco) {
              if (item.tipo === "troca") return "Troca";
              if (item.tipo === "emprego") return "A Combinar";
              return "Sob Consulta";
            }
            return `R$ ${item.preco.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
          };

          return (
            <article
              key={item.id}
              className="group bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-amber-500/30 hover:border-amber-500 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <Link href="/classificados" className="block relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                  <Image
                    src={item.imagem_principal}
                    alt={item.titulo}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                      {item.tipo}
                    </span>
                    {item.destaque_home && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-sm">
                        Destaque
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 font-black text-xs">
                    {formatarPreco()}
                  </div>
                </Link>

                <div className="p-3 space-y-1.5">
                  {item.cidade_nome && (
                    <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span className="truncate">
                        {item.bairro ? `${item.bairro}, ` : ""}
                        {item.cidade_nome} - {item.uf || "SP"}
                      </span>
                    </div>
                  )}

                  <Link href="/classificados">
                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-amber-500 text-xs leading-snug transition-colors">
                      {item.titulo}
                    </h4>
                  </Link>
                </div>
              </div>

              <div className="p-3 pt-0">
                <a
                  href={linkWhats}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
      )}
    </section>
  );
}

