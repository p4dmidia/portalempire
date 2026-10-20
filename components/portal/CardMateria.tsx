import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LabelEditoria } from "./LabelEditoria";
import type { MateriaData } from "@/lib/portal/queries";
import { Clock, Sparkles, MapPin } from "lucide-react";
import { otimizarUrlImagem } from "@/lib/portal/image-utils";

interface CardMateriaProps {
  materia: MateriaData;
  variacao?: "grande" | "medio" | "horizontal" | "compacto" | "lista";
  prioridadeImagem?: boolean;
}

export function CardMateria({
  materia,
  variacao = "medio",
  prioridadeImagem = false,
}: CardMateriaProps) {
  const dataFormatada = materia.publicado_em
    ? formatDistanceToNow(new Date(materia.publicado_em), {
        addSuffix: true,
        locale: ptBR,
      })
    : "";

  const autorNome =
    materia.origem === "captacao"
      ? "Redatores da Empire Cidades"
      : materia.autor?.nome || "Redatores da Empire Cidades";

  const imagemPadrao = otimizarUrlImagem(materia.imagem_url);

  // VARIAÇÃO 1: GRANDE (Destaque Principal)
  if (variacao === "grande") {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl h-full flex flex-col justify-end min-h-[420px] md:min-h-[480px]">
        <div className="absolute inset-0 z-0">
          <Image
            src={imagemPadrao}
            alt={materia.titulo}
            fill
            priority={prioridadeImagem}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {materia.categoria && (
              <LabelEditoria
                nome={materia.categoria.nome}
                slug={materia.categoria.slug}
                cor={materia.categoria.cor}
              />
            )}
            {materia.urgente && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> Urgente
              </span>
            )}
            {materia.cidade && (
              <Link
                href={`/cidade/${materia.cidade.slug}`}
                className="bg-black/40 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 hover:text-white"
              >
                <MapPin className="w-2.5 h-2.5" /> {materia.cidade.nome}
              </Link>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight group-hover:text-blue-300 transition-colors">
            <Link href={`/materia/${materia.slug}`} className="before:absolute before:inset-0">
              {materia.titulo}
            </Link>
          </h2>

          {materia.subtitulo && (
            <p className="text-sm md:text-base text-slate-300 line-clamp-2">
              {materia.subtitulo}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/10">
            <span>Por <strong className="text-slate-200">{autorNome}</strong></span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {dataFormatada}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // VARIAÇÃO 2: HORIZONTAL (Linha com imagem ao lado)
  if (variacao === "horizontal") {
    return (
      <article className="group flex gap-4 items-start py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
        <div className="relative w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <Image
            src={imagemPadrao}
            alt={materia.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 120px, 160px"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            {materia.categoria && (
              <LabelEditoria
                nome={materia.categoria.nome}
                slug={materia.categoria.slug}
                cor={materia.categoria.cor}
              />
            )}
            {materia.cidade && (
              <span className="text-[10px] text-slate-400">
                · {materia.cidade.nome}
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/materia/${materia.slug}`}>{materia.titulo}</Link>
          </h3>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>{autorNome}</span>
            <span>·</span>
            <span>{dataFormatada}</span>
          </div>
        </div>
      </article>
    );
  }

  // VARIAÇÃO 3: COMPACTO (Para blocos densos ou carrosséis)
  if (variacao === "compacto") {
    return (
      <article className="group flex flex-col space-y-2">
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={imagemPadrao}
            alt={materia.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        <div className="space-y-1">
          {materia.categoria && (
            <LabelEditoria
              nome={materia.categoria.nome}
              slug={materia.categoria.slug}
              cor={materia.categoria.cor}
            />
          )}
          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/materia/${materia.slug}`}>{materia.titulo}</Link>
          </h4>
          <span className="text-[11px] text-slate-400 block">{dataFormatada}</span>
        </div>
      </article>
    );
  }

  // VARIAÇÃO 4: LISTA (Apenas texto com marcador)
  if (variacao === "lista") {
    return (
      <article className="group py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
        <div className="flex items-center gap-2 mb-1">
          {materia.categoria && (
            <LabelEditoria
              nome={materia.categoria.nome}
              slug={materia.categoria.slug}
              cor={materia.categoria.cor}
            />
          )}
          <span className="text-[11px] text-slate-400">{dataFormatada}</span>
        </div>
        <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/materia/${materia.slug}`}>{materia.titulo}</Link>
        </h4>
      </article>
    );
  }

  // VARIAÇÃO PADRÃO: MÉDIO (Grid Card)
  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all h-full">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={imagemPadrao}
          alt={materia.titulo}
          fill
          priority={prioridadeImagem}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {materia.categoria && (
          <div className="absolute top-3 left-3 z-10">
            <LabelEditoria
              nome={materia.categoria.nome}
              slug={materia.categoria.slug}
              cor={materia.categoria.cor}
              className="shadow-sm backdrop-blur-md"
            />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {materia.cidade && (
            <Link
              href={`/cidade/${materia.cidade.slug}`}
              className="text-[11px] text-slate-500 hover:text-primary font-medium flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-slate-400" /> {materia.cidade.nome} - {materia.cidade.uf}
            </Link>
          )}

          <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
            <Link href={`/materia/${materia.slug}`}>{materia.titulo}</Link>
          </h3>

          {materia.subtitulo && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {materia.subtitulo}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[140px] font-medium text-slate-600 dark:text-slate-300">
            {autorNome}
          </span>
          <span className="shrink-0">{dataFormatada}</span>
        </div>
      </div>
    </article>
  );
}
