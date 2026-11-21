import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTalentoBySlug } from "@/lib/talentos/queries";
import { TalentoPerfilClient } from "@/components/portal/talentos/TalentoPerfilClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const talento = await getTalentoBySlug(slug);

  if (!talento) {
    return {
      title: "Talento não encontrado | Empire Talentos",
    };
  }

  return {
    title: `${talento.nome} — Perfil e Contratação | Talentos Empire`,
    description: talento.bio_curta,
    openGraph: {
      title: `${talento.nome} | Talentos Empire Cidades`,
      description: `${talento.titulo_profissional}. ${talento.bio_curta}`,
      images: [
        {
          url: talento.foto_url,
          width: 800,
          height: 800,
          alt: talento.nome,
        },
      ],
      type: "profile",
      locale: "pt_BR",
    },
  };
}

export default async function TalentoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const talento = await getTalentoBySlug(slug);

  if (!talento) {
    notFound();
  }

  return <TalentoPerfilClient talento={talento} />;
}
