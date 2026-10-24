import Image from "next/image";
import Link from "next/link";
import { Tag, MapPin, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { ClassificadoData } from "@/lib/portal/classificados-types";

interface ClassificadosHomeSectionProps {
  classificados: ClassificadoData[];
}

export function ClassificadosHomeSection({ classificados }: ClassificadosHomeSectionProps) {
  if (!classificados || classificados.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
            <Tag className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-extrabold uppercase text-[11px] tracking-wider">
                Vitrine Comercial
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Classificados em Destaque na Região
            </h2>
          </div>
        </div>

        <Link
          href="/classificados"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95"
        >
          <span>Acessar Classificados</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid de Classificados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {classificados.slice(0, 4).map((item) => {
          const foneLimpo = item.contato_whatsapp.replace(/\D/g, "");
          const foneFinal = foneLimpo.startsWith("55") ? foneLimpo : `55${foneLimpo}`;
          const texto = encodeURIComponent(
            `Olá! Vi seu anúncio "${item.titulo}" em destaque no Empire Cidades e gostaria de informações.`
          );
          const linkWhats = `https://wa.me/${foneFinal}?text=${texto}`;

          const formatarPreco = () => {
            if (item.preco_sob_consulta || !item.preco) {
              if (item.tipo === "troca") return "Troca";
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
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                      {item.tipo}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md px-2.5 py-0.5 rounded text-amber-400 font-black text-xs">
                    {formatarPreco()}
                  </div>
                </Link>

                <div className="p-3.5 space-y-1.5">
                  {item.cidade_nome && (
                    <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span className="truncate">
                        {item.cidade_nome} - {item.uf || "SP"}
                      </span>
                    </div>
                  )}

                  <Link href="/classificados">
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-amber-500 text-xs leading-snug transition-colors">
                      {item.titulo}
                    </h3>
                  </Link>
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2">
                <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                  {item.contato_nome}
                </span>

                <a
                  href={linkWhats}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <MessageCircle className="w-3 h-3 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
