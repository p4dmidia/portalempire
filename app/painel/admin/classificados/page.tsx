import { requireRole } from "@/lib/auth";
import { getClassificados } from "@/lib/portal/classificados-queries";
import { ClassificadosGerenciador } from "@/components/painel/classificados/classificados-gerenciador";

export const dynamic = "force-dynamic";

export default async function AdminClassificadosPage() {
  const profile = await requireRole(["admin"]);
  const itens = await getClassificados();

  return (
    <ClassificadosGerenciador
      initialItens={itens}
      role="admin"
      usuarioId={profile.id}
      usuarioNome={profile.nome || "Administrador"}
    />
  );
}
