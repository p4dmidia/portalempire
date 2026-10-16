import { requireRole } from "@/lib/auth";
import { CidadesView } from "@/components/painel/admin/cidades-view";

export default async function AdminCidadesPage() {
  await requireRole(["admin"]);
  return <CidadesView />;
}
