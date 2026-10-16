import { requireRole } from "@/lib/auth";
import { AuditoriaView } from "@/components/painel/admin/auditoria-view";

export default async function AdminAuditoriaPage() {
  await requireRole(["admin"]);
  return <AuditoriaView />;
}
