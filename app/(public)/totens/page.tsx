import type { Metadata } from "next";
import { getTotens, getCidadesComTotens } from "@/lib/totens/queries";
import { TotensVitrineClient } from "@/components/portal/totens/TotensVitrineClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Totens Empire — Mídia Digital & Publicidade por Cidade",
  description:
    "Encontre os totens publicitários do Grupo Empire instalados em shoppings, galerias, clínicas e comércios da sua cidade e anuncie sua empresa.",
  keywords: [
    "totens empire",
    "totens publicitarios",
    "midia digital out of home",
    "anunciar em totens",
    "painel digital cidade",
    "publicidade em shoppings",
    "grupo empire",
  ],
  openGraph: {
    title: "Totens Empire — Publicidade em Painéis Digitais por Cidade",
    description:
      "Mídia digital nas principais cidades, conectando marcas, pessoas e oportunidades.",
    type: "website",
    locale: "pt_BR",
  },
};

export default async function TotensPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const { cidade } = await searchParams;
  const [totens, cidadesComTotens] = await Promise.all([
    getTotens(),
    getCidadesComTotens(),
  ]);

  return (
    <TotensVitrineClient
      totensIniciais={totens}
      cidadesComTotens={cidadesComTotens}
      cidadePreSelecionada={cidade}
    />
  );
}
