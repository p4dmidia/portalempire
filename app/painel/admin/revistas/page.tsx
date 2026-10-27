import { requireRole } from "@/lib/auth";
import { getRevistasAdmin } from "@/lib/portal/revistas-queries";
import { RevistasGerenciador } from "@/components/painel/revistas/revistas-gerenciador";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gerenciador de Revistas — Painel Administrativo | Empire Cidades",
  description: "Cadastro, edição e publicação das edições da Empire Magazine no portal.",
};

export default async function AdminRevistasPage() {
  const profile = await requireRole(["admin"]);
  const revistas = await getRevistasAdmin();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <RevistasGerenciador
        initialItens={revistas}
        usuarioNome={profile.nome || "Administrador"}
      />
    </div>
  );
}
