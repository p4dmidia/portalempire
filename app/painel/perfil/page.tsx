import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PerfilForm } from "@/components/painel/perfil-form";

export default async function PerfilPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return <PerfilForm initialProfile={profile} />;
}
