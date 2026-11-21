import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTotemBySlug } from "@/lib/totens/queries";
import { TotemPerfilClient } from "@/components/portal/totens/TotemPerfilClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const totem = await getTotemBySlug(slug);

  if (!totem) {
    return {
      title: "Totem não encontrado | Empire Totens",
    };
  }

  return {
    title: `${totem.nome} (${totem.estabelecimento_nome}) — Totens Empire ${totem.cidade_nome}/${totem.estado}`,
    description: `Anuncie sua marca no ${totem.nome} em ${totem.estabelecimento_nome}, ${totem.cidade_nome}/${totem.estado}. Circulação estimada: ${totem.circulacao_estimada}.`,
    openGraph: {
      title: `${totem.nome} — ${totem.estabelecimento_nome}`,
      description: `${totem.descricao_ponto}. Circulação estimada de ${totem.circulacao_estimada}.`,
      images: [
        {
          url: totem.foto_url,
          width: 800,
          height: 600,
          alt: totem.nome,
        },
      ],
      type: "website",
      locale: "pt_BR",
    },
  };
}

export default async function TotemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const totem = await getTotemBySlug(slug);

  if (!totem) {
    notFound();
  }

  return <TotemPerfilClient totem={totem} />;
}
