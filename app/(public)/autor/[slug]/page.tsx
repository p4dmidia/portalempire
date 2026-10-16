import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAutorBySlug, getMaterias, getPortalData } from "@/lib/portal/queries";
import { CardMateria } from "@/components/portal/CardMateria";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { AdSlot } from "@/components/portal/AdSlot";
import { User, Instagram, Facebook, Twitter, Youtube, Linkedin, Globe, ArrowLeft, BadgeCheck } from "lucide-react";

export const revalidate = 60;

interface AutorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AutorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [autor, portal] = await Promise.all([
    getAutorBySlug(slug),
    getPortalData(),
  ]);

  if (!autor) return { title: "Autor Não Encontrado" };

  return {
    title: `${autor.nome} — Perfil e Artigos | ${portal?.nome || "Portal Empire"}`,
    description:
      autor.bio ||
      `Confira todas as matérias e reportagens publicadas por ${autor.nome} no ${portal?.nome || "Portal Empire"}.`,
  };
}

export default async function AutorDetalhePage({ params }: AutorPageProps) {
  const { slug } = await params;
  const autor = await getAutorBySlug(slug);

  if (!autor) {
    notFound();
  }

  const [materias, maisLidas] = await Promise.all([
    getMaterias({ autorSlug: slug, limit: 12 }),
    getMaterias({ ordenarPor: "visualizacoes", limit: 5 }),
  ]);

  const redes = (autor.redes_sociais || {}) as Record<string, string>;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>
      </div>

      {/* Cartão de Perfil do Autor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-primary/20 bg-slate-100 shrink-0 shadow-md">
            {autor.foto_url ? (
              <Image
                src={autor.foto_url}
                alt={autor.nome}
                fill
                className="object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-slate-400 m-auto mt-6" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> {autor.role}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {autor.nome}
            </h1>

            {autor.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed pt-1">
                {autor.bio}
              </p>
            )}

            {/* Redes Sociais */}
            <div className="flex items-center justify-center md:justify-start gap-3 pt-3 text-slate-500">
              {redes.instagram && (
                <a href={redes.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {redes.facebook && (
                <a href={redes.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {redes.twitter && (
                <a href={redes.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {redes.youtube && (
                <a href={redes.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-primary p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {redes.linkedin && (
                <a href={redes.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {redes.website && (
                <a href={redes.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Artigos do Autor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Publicações de {autor.nome}
            </h2>
          </div>

          {materias.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">Nenhuma matéria publicada ainda por este autor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {materias.map((mat) => (
                <CardMateria key={mat.id} materia={mat} variacao="medio" />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SidebarMaisLidas materias={maisLidas} />
          <AdSlot posicao="lateral" />
        </div>
      </div>
    </div>
  );
}
