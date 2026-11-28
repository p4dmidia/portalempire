import { requireRole } from "@/lib/auth";
import { PainelShell } from "@/components/painel/painel-shell";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["admin", "editor", "colunista", "anunciante"]);

  return <PainelShell profile={profile}>{children}</PainelShell>;
}
