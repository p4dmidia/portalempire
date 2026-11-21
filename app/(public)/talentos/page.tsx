import type { Metadata } from "next";
import { getTalentos } from "@/lib/talentos/queries";
import { TalentosVitrineClient } from "@/components/portal/talentos/TalentosVitrineClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Talentos Empire — Apresentadores, Influenciadores, Celebridades e Palestrantes",
  description:
    "Contrate apresentadores de TV, mestres de cerimônia, influenciadores digitais, celebridades e palestrantes para sua marca, eventos corporativos e campanhas publicitárias com o Grupo Empire.",
  keywords: [
    "talentos empire",
    "contratar apresentadores",
    "influenciadores digitais",
    "celebridades",
    "palestrantes corporativos",
    "mestres de cerimonia",
    "campanhas publicitarias",
    "comerciais de tv",
    "presença vip",
    "grupo empire",
  ],
  openGraph: {
    title: "Talentos Empire — Vitrine Oficial de Celebridades e Comunicadores",
    description:
      "Apresentadores de TV, influenciadores, celebridades e palestrantes para campanhas e eventos.",
    type: "website",
    locale: "pt_BR",
  },
};

export default async function TalentosPage() {
  const talentos = await getTalentos();

  return <TalentosVitrineClient talentosIniciais={talentos} />;
}
