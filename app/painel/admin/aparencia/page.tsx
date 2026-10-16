import { requireRole } from "@/lib/auth";
import { AparenciaView } from "@/components/painel/admin/aparencia-view";

export default async function AdminAparenciaPage() {
  await requireRole(["admin"]);
  return <AparenciaView />;
}
