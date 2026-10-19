import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getMateriaBySlug, getMaterias, getPortalData } from "@/lib/portal/queries";
import { LabelEditoria } from "@/components/portal/LabelEditoria";
import { ShareButtons } from "@/components/portal/ShareButtons";
import { ViewCounter } from "@/components/portal/ViewCounter";
import { CardMateria } from "@/components/portal/CardMateria";
import { AdSlot } from "@/components/portal/AdSlot";
import {
  Clock,
  User,
  MapPin,
  Tag,
  ArrowLeft,
  Sparkles,
  Eye,
} from "lucide-react";
import { extrairDetalhesMateriaOriginal } from "@/lib/captacao/extrator-conteudo";
import { otimizarUrlImagem } from "@/lib/portal/image-utils";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 60;

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://portalempire.com.br";
  const canonicalUrl = `${siteUrl}/materia/${materia.slug}`;
  const title = materia.seo_titulo || `${materia.titulo} — ${portal?.nome || "Portal Empire"}`;
  const description =
    materia.seo_descricao || materia.subtitulo || materia.resumo || materia.titulo;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: materia.publicado_em || materia.created_at,
      images: materia.imagem_url ? [{ url: otimizarUrlImagem(materia.imagem_url) }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: materia.imagem_url ? [otimizarUrlImagem(materia.imagem_url)] : [],
    },
  };
}

export default async function MateriaDetalhePage({ params }: MateriaPageProps) {
  const { slug } = await params;
  const materia = await getMateriaBySlug(slug);

  if (!materia) {
    notFound();
  }

  // Obter ou extrair o conteúdo completo da matéria
  let conteudoHtml = materia.conteudo_html;

  // Se for matéria captada e o conteúdo estiver ausente/curto, OU a imagem estiver em baixa resolução (ex: miniatura w=200/fit=300),
  // busca os dados completos e a imagem editorial oficial na fonte original
  const precisaRecarregarConteudo =
    !conteudoHtml || conteudoHtml.length < 600 || conteudoHtml.includes("lead-noticia");
  const precisaRecarregarImagem =
    !materia.imagem_url ||
    materia.imagem_url.includes("w=200") ||
    materia.imagem_url.includes("w=193") ||
    materia.imagem_url.includes("fit=300") ||
    materia.imagem_url.includes("read-too");

  if (materia.origem === "captacao" && materia.url_original && (precisaRecarregarConteudo || precisaRecarregarImagem)) {
    try {
      const detalhes = await extrairDetalhesMateriaOriginal(materia.url_original);
      const updatesParaSalvar: Record<string, unknown> = {};

      if (detalhes.conteudoHtml && detalhes.conteudoHtml.length > 200 && precisaRecarregarConteudo) {
        conteudoHtml = detalhes.conteudoHtml;
        materia.conteudo_html = detalhes.conteudoHtml;
        updatesParaSalvar.conteudo_html = detalhes.conteudoHtml;
      }

      if (detalhes.imagemUrl && precisaRecarregarImagem) {
        materia.imagem_url = detalhes.imagemUrl;
        updatesParaSalvar.imagem_url = detalhes.imagemUrl;
      }

      // Persiste assincronamente no Supabase para velocidade máxima
      if (Object.keys(updatesParaSalvar).length > 0) {
        try {
          const admin = getSupabaseAdmin();
          admin
            .from("materias")
            .update(updatesParaSalvar)
            .eq("id", materia.id)
            .then(() => {});
        } catch {}
      }
    } catch (err) {
      console.warn("Falha ao carregar conteúdo/imagem completos sob demanda:", err);
    }
  }

  const [portal, relacionadas] = await Promise.all([
    getPortalData(),
    getMaterias({
      categoriaSlug: materia.categoria?.slug,
      limit: 4,
    }),
  ]);

  const materiasRelacionadas = relacionadas.filter((m) => m.id !== materia.id).slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://portalempire.com.br";
  const pageUrl = `${siteUrl}/materia/${materia.slug}`;

  const dataFormatada = materia.publicado_em
    ? format(new Date(materia.publicado_em), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    : "";

  const autorNome =
    materia.origem === "captacao"
      ? materia.fonte_nome || "Redação"
      : materia.autor?.nome || "Redação";

  // JSON-LD NewsArticle para SEO avançado
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: materia.titulo,
    description: materia.subtitulo || materia.resumo || "",
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
      name: portal?.nome || "Portal Empire",
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
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para a página inicial
          </Link>
        </div>

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
            {materia.titulo}
          </h1>

          {materia.subtitulo && (
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              {materia.subtitulo}
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
              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full text-[11.5px] font-medium border border-slate-200/60 dark:border-slate-700">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {(materia.visualizacoes || 0).toLocaleString("pt-BR")} visualizações
              </span>

              {materia.origem === "captacao" && materia.fonte_nome && (
                <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 text-xs">
                  Via {materia.fonte_nome}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Imagem Principal da Matéria */}
        {materia.imagem_url && (
          <figure className="space-y-2">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/50 dark:border-slate-800">
              {/* Fundo sutilmente desfocado que preenche as laterais de imagens verticais ou fora do padrão 16:9, evitando distorções */}
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${otimizarUrlImagem(materia.imagem_url)})` }}
              />
              <Image
                src={otimizarUrlImagem(materia.imagem_url)}
                alt={materia.titulo}
                fill
                priority
                className="object-cover relative z-10"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
            {materia.imagem_credito && (
              <figcaption className="text-right text-[11px] text-slate-400 italic">
                {materia.imagem_credito}
              </figcaption>
            )}
          </figure>
        )}

        {/* Botões de Compartilhamento */}
        <ShareButtons url={pageUrl} titulo={materia.titulo} />

        {/* AD SLOT 1: Topo do Texto */}
        <AdSlot posicao="topo" />

        {/* CONTEÚDO DA MATÉRIA COMPLETA */}
        <div className="prose prose-lg dark:prose-invert max-w-none text-base md:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
          {conteudoHtml ? (
            <div dangerouslySetInnerHTML={{ __html: conteudoHtml }} />
          ) : (
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              {materia.resumo}
            </p>
          )}
        </div>

        {/* Tags */}
        {materia.tags && materia.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Tag className="w-4 h-4 text-slate-400" />
            {materia.tags.map((tag) => (
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
        <AdSlot posicao="meio_texto" />

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
