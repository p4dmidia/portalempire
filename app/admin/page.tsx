import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect("/painel/admin/dashboard");
    }
  }

  redirect("/admin/login");
}
