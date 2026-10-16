import { requireRole } from "@/lib/auth";
import { EditoriasView } from "@/components/painel/admin/editorias-view";

export default async function AdminEditoriasPage() {
  await requireRole(["admin"]);
  return <EditoriasView />;
}
