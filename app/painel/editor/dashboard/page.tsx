import { requireRole } from "@/lib/auth";
import { EditorDashboardView } from "@/components/painel/editor/editor-dashboard-view";

export default async function EditorDashboardPage() {
  await requireRole(["editor", "admin"]);
  return <EditorDashboardView />;
}
