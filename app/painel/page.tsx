import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";

export default async function PainelIndexPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin") {
    redirect("/painel/admin/dashboard");
  } else if (profile.role === "editor") {
    redirect("/painel/editor/dashboard");
  } else if (profile.role === "colunista") {
    redirect("/painel/colunista/dashboard");
  } else if (profile.role === "anunciante") {
    redirect("/painel/anunciante/anuncios");
  }


  redirect("/painel/perfil");
}
