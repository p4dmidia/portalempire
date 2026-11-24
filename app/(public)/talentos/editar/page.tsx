import type { Metadata } from "next";
import { TalentoEditarClient } from "@/components/portal/talentos/TalentoEditarClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gerenciar Perfil de Talento — Empire Cidades",
  description:
    "Acesse a tela de gerenciamento e edição do seu perfil de celebridade e influenciador no Grupo Empire Cidades.",
};

export default function TalentoEditarPage() {
  return <TalentoEditarClient />;
}
