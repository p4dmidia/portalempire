import type { Metadata } from "next";
import { TalentoCadastroWizard } from "@/components/portal/talentos/TalentoCadastroWizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Link Convite de Talentos e Celebridades — Empire Cidades",
  description:
    "Faça parte da vitrine oficial de celebridades, influenciadores e apresentadores do Grupo Empire Cidades.",
  openGraph: {
    title: "Link Convite de Talentos e Celebridades — Empire Cidades",
    description:
      "Cadastre seu perfil oficial no Grupo Empire Cidades para agenciamento de marcas, comerciais, campanhas e eventos.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Convite de Talentos e Celebridades — Empire Cidades",
    description:
      "Cadastre seu perfil oficial no Grupo Empire Cidades para agenciamento de marcas, comerciais, campanhas e eventos.",
  },
};

export default function TalentoCadastroPage() {
  return <TalentoCadastroWizard />;
}
