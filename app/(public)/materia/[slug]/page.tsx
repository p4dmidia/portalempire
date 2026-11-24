import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatarDataBrasilia } from "@/lib/utils/date-format";
import { getMateriaBySlug, getMaterias, getPortalData } from "@/lib/portal/queries";
import { LabelEditoria } from "@/components/portal/LabelEditoria";
import { ShareButtons } from "@/components/portal/ShareButtons";
import { ViewCounter } from "@/components/portal/ViewCounter";
import { CardMateria } from "@/components/portal/CardMateria";
import { ImageWithFallback } from "@/components/portal/ImageWithFallback";
import { AdSlot } from "@/components/portal/AdSlot";
import { BotaoFavoritarColuna } from "@/components/portal/BotaoFavoritarColuna";
import { LiveViewsCounter } from "@/components/portal/LiveViewsCounter";
import {
  Clock,
  User,
  MapPin,
  Tag,
  ArrowLeft,
  Sparkles,
  Eye,
  Columns,
} from "lucide-react";
import { otimizarUrlImagem, obterImagemEditorialContextual } from "@/lib/portal/image-utils";
import { calcularVisualizacoesRealistas, formatarVisualizacoes } from "@/lib/portal/views-realistas";
import { limparEPadronizarTextoJornalistico } from "@/lib/portal/limpador-jornalistico";
import { decodificarEntidadesHtml, obterSiteUrl } from "@/lib/portal/texto-utils";

export const revalidate = 86400; // ISR: 1 dia (86.400s) para matérias publicadas

interface MateriaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: MateriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [materia, portal] = await Promise.all([
    getMateriaBySlug(slug),
    getPortalData(),
  ]);

  if (!materia) return { title: "Matéria Não Encontrada" };

  const tituloLimpo = decodificarEntidadesHtml(materia.titulo);
  const siteUrl = obterSiteUrl(portal?.dominio);
  const canonicalUrl = `${siteUrl}/materia/${materia.slug}`;
  const title = materia.seo_titulo
    ? decodificarEntidadesHtml(materia.seo_titulo)
    : `${tituloLimpo} — ${portal?.nome || "Empire Cidades"}`;
  const description = decodificarEntidadesHtml(
    materia.seo_descricao || materia.subtitulo || materia.resumo || tituloLimpo
  );

  // Notícias captadas com mais de 30 dias recebem noindex para proteger recursos e SEO
  const trintaDiasMs = 30 * 24 * 60 * 60 * 1000;
  const dataPub = new Date(materia.publicado_em || materia.created_at).getTime();
  const ehCaptadaAntiga = materia.origem === "captacao" && (Date.now() - dataPub > trintaDiasMs);
  const isArquivada = (materia.status as string) === "arquivada" || materia.status === "despublicado" || ehCaptadaAntiga;

  // Tratamento robusto da imagem de destaque para OpenGraph (WhatsApp, Facebook, Twitter, LinkedIn)
  const rawImagem = materia.imagem_url ? otimizarUrlImagem(materia.imagem_url, materia.titulo) : null;
  let imagemFinalUrl = rawImagem || obterImagemEditorialContextual(materia.titulo);

  // Garante URL absoluta (WhatsApp crawler descarta URLs relativas)
  if (imagemFinalUrl.startsWith("/")) {
    imagemFinalUrl = `${siteUrl}${imagemFinalUrl}`;
  }

  // Garante protocolo HTTPS para crawlers de redes sociais
  if (imagemFinalUrl.startsWith("http://") && !imagemFinalUrl.startsWith("http://localhost")) {
    imagemFinalUrl = imagemFinalUrl.replace(/^http:\/\//i, "https://");
  }

  // Determina mime-type (WhatsApp prioriza image/jpeg e image/png)
  let mimeType = "image/jpeg";
  const urlLower = imagemFinalUrl.toLowerCase();
  if (urlLower.includes(".png")) {
    mimeType = "image/png";
  } else if (urlLower.includes(".webp")) {
    mimeType = "image/webp";
  }

  return {
    title,
    description,
    robots: isArquivada
      ? { index: false, follow: false, noarchive: true }
      : { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: portal?.nome || "Empire Cidades",
      locale: "pt_BR",
      type: "article",
      publishedTime: materia.publicado_em || materia.created_at,
      modifiedTime: materia.publicado_em || materia.created_at,
      section: materia.categoria?.nome || "Notícias",
      authors: [
        materia.origem === "captacao"
          ? "Redação Empire Cidades"
          : materia.autor?.nome || portal?.nome || "Redação Empire Cidades",
      ],
      images: [
        {
          url: imagemFinalUrl,
          secureUrl: imagemFinalUrl,
          width: 1200,
          height: 630,
          type: mimeType,
          alt: tituloLimpo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: imagemFinalUrl,
          width: 1200,
          height: 630,
          alt: tituloLimpo,
        },
      ],
    },
  };
}

export default async function MateriaDetalhePage({ params }: MateriaPageProps) {
  const { slug } = await params;
  const materia = await getMateriaBySlug(slug);

  if (!materia) {
    notFound();
  }

  // Obter o conteúdo da matéria
  let conteudoHtml = materia.conteudo_html || materia.resumo || "";

  const [portal, relacionadas] = await Promise.all([
    getPortalData(),
    getMaterias({
      categoriaSlug: materia.categoria?.slug,
      limit: 4,
    }),
  ]);

  const materiasRelacionadas = relacionadas.filter((m) => m.id !== materia.id).slice(0, 3);

  const tituloLimpo = decodificarEntidadesHtml(materia.titulo);
  const subtituloLimpo = decodificarEntidadesHtml(materia.subtitulo);
  const siteUrl = obterSiteUrl(portal?.dominio);
  const pageUrl = `${siteUrl}/materia/${materia.slug}`;
  const visualizacoesCalculadas = calcularVisualizacoesRealistas(materia);

  const dataFormatada = formatarDataBrasilia(materia.publicado_em, { incluirHora: true });

  const autorNome =
    materia.origem === "captacao"
      ? "Redatores da Empire Cidades"
      : materia.autor?.nome || "Redatores da Empire Cidades";

  // Limpeza de ruídos de scraping apenas para matérias captadas automaticamente via RSS
  // Matérias manuais de colunistas e redatores mantêm toda a formatação rica (negrito, tópicos, títulos, etc.)
  const isCaptacao = materia.origem === "captacao" && !materia.coluna_id;
  if (isCaptacao) {
    conteudoHtml = limparEPadronizarTextoJornalistico(
      conteudoHtml,
      tituloLimpo,
      materia.cidade?.nome
    );
  } else if (conteudoHtml && !conteudoHtml.includes("<p") && !conteudoHtml.includes("<div")) {
    // Fallback caso texto manual tenha vindo sem tags HTML: divide quebras de linha em parágrafos
    conteudoHtml = conteudoHtml
      .split(/\n{2,}/)
      .map((p) => `<p class="mb-5 leading-relaxed">${p.replace(/\n/g, "<br/>")}</p>`)
      .join("\n");
  }

  // Determina se a imagem de capa deve ser renderizada no topo interno do artigo
  const conteudoMeta = (materia.conteudo as Record<string, unknown> | null) || null;
  const exibirCapaNoArtigo =
    conteudoMeta?.exibir_capa_artigo !== undefined
      ? Boolean(conteudoMeta.exibir_capa_artigo)
      : !materia.tags?.includes("sem_capa_topo");

  // JSON-LD NewsArticle para SEO avançado
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: tituloLimpo,
    description: subtituloLimpo || decodificarEntidadesHtml(materia.resumo) || "",
    image: materia.imagem_url ? [materia.imagem_url] : [],
    datePublished: materia.publicado_em || materia.created_at,
    dateModified: materia.created_at,
    author: [
      {
        "@type": "Person",
        name: autorNome,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: portal?.nome || "Empire Cidades",
      logo: {
        "@type": "ImageObject",
        url: portal?.logo_url || `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewCounter materiaId={materia.id} />

      <article className="max-w-4xl mx-auto space-y-8">
        {/* Navegação de Retorno */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para a página inicial
          </Link>

          {materia.coluna && (
            <Link
              href={`/coluna/${materia.coluna.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <Columns className="w-3.5 h-3.5" /> Coluna {materia.coluna.nome}
            </Link>
          )}
        </div>

        {/* Bloco de Identificação Institucional da Coluna Oficial */}
        {materia.coluna && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <Link href={`/coluna/${materia.coluna.slug}`} className="flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400/60 dark:border-amber-500/40 bg-slate-100 dark:bg-slate-800 shadow-sm shrink-0">
                {materia.autor?.foto_url ? (
                  <Image
                    src={materia.autor.foto_url}
                    alt={autorNome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg">
                    {autorNome.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Coluna Oficial
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {materia.coluna.nome}
                </h3>
                <span className="text-xs text-slate-500">
                  Por {autorNome}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <BotaoFavoritarColuna
                colunaId={materia.coluna.id}
                colunaNome={materia.coluna.nome}
                colunaSlug={materia.coluna.slug}
                autorNome={autorNome}
                autorFoto={materia.autor?.foto_url}
                capaUrl={materia.coluna.capa_url}
                variacao="card"
              />
              <Link
                href={`/coluna/${materia.coluna.slug}`}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors shrink-0"
              >
                Ver Coluna →
              </Link>
            </div>
          </div>
        )}

        {/* Cabeçalho da Matéria */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {materia.categoria && (
              <LabelEditoria
                nome={materia.categoria.nome}
                slug={materia.categoria.slug}
                cor={materia.categoria.cor}
              />
            )}
            {materia.cidade && (
              <Link
                href={`/cidade/${materia.cidade.slug}`}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 hover:text-primary"
              >
                <MapPin className="w-3 h-3" /> {materia.cidade.nome} - {materia.cidade.uf}
              </Link>
            )}
            {materia.urgente && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Urgente
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {tituloLimpo}
          </h1>

          {subtituloLimpo && (
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              {subtituloLimpo}
            </p>
          )}

          {/* Metadados: Autor, Data e Visualizações */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex items-center justify-center border border-slate-200 dark:border-slate-700">
                {materia.autor?.foto_url ? (
                  <Image
                    src={materia.autor.foto_url}
                    alt={autorNome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Por {autorNome}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" /> {dataFormatada}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full text-[11.5px] font-medium border border-slate-200/60 dark:border-slate-700 shadow-sm"
                title="Visualizações auditadas do artigo em tempo real"
              >
                <LiveViewsCounter materia={materia} initialViews={visualizacoesCalculadas} />
              </span>
            </div>
          </div>
        </header>

        {/* Imagem Principal da Matéria */}
        {materia.imagem_url && exibirCapaNoArtigo && (
          <figure className="space-y-2">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/50 dark:border-slate-800">
              {/* Fundo sutilmente desfocado que preenche as laterais de imagens verticais ou fora do padrão 16:9, evitando distorções */}
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-110 pointer-events-none"
                style={{
                  backgroundImage: `url(${otimizarUrlImagem(
                    materia.imagem_url,
                    `${materia.categoria?.nome || ""} ${tituloLimpo}`
                  )})`,
                }}
              />
              <ImageWithFallback
                src={materia.imagem_url}
                contexto={`${materia.categoria?.nome || ""} ${tituloLimpo}`}
                alt={tituloLimpo}
                fill
                priority
                className="object-cover relative z-10"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
            <figcaption className="text-right text-[11px] text-slate-400 italic">
              {materia.origem === "captacao"
                ? "Foto: Divulgação / Redação Empire Cidades"
                : materia.imagem_credito || "Foto: Divulgação"}
            </figcaption>
          </figure>
        )}

        {/* Botões de Compartilhamento */}
        <ShareButtons url={pageUrl} titulo={tituloLimpo} />

        {/* AD SLOT 1: Topo do Texto */}
        <AdSlot posicao="topo" colunaId={materia.coluna_id || undefined} tipoPagina="materia" />

        {/* CONTEÚDO DA MATÉRIA COMPLETA */}
        <div className="prose prose-materia prose-lg dark:prose-invert max-w-none text-base md:text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
          {conteudoHtml ? (
            <div dangerouslySetInnerHTML={{ __html: conteudoHtml }} />
          ) : (
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              {materia.resumo}
            </p>
          )}
        </div>

        {/* Tags */}
        {materia.tags && materia.tags.filter((t) => t !== "sem_capa_topo").length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Tag className="w-4 h-4 text-slate-400" />
            {materia.tags
              .filter((tag) => tag !== "sem_capa_topo")
              .map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md font-medium"
                >
                  #{tag}
                </span>
              ))}
          </div>
        )}

        {/* AD SLOT 2: Meio de Texto / Rodapé da Matéria */}
        <AdSlot posicao="meio_texto" colunaId={materia.coluna_id || undefined} tipoPagina="materia" />

        {/* Matérias Relacionadas */}
        {materiasRelacionadas.length > 0 && (
          <section className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Matérias Relacionadas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {materiasRelacionadas.map((rel) => (
                <CardMateria key={rel.id} materia={rel} variacao="medio" />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
