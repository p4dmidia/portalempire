import { requireRole } from "@/lib/auth";
import { ConfiguracoesView } from "@/components/painel/admin/configuracoes-view";

export default async function AdminConfiguracoesPage() {
  await requireRole(["admin"]);
  return <ConfiguracoesView />;
}

