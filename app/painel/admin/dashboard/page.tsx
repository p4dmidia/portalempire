import { requireRole } from "@/lib/auth";
import { AdminDashboardView } from "@/components/painel/admin/dashboard-view";

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  return <AdminDashboardView />;
}
