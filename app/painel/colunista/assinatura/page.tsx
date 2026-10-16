import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ColunistaAssinaturaView } from "@/components/painel/assinatura/colunista-assinatura-view";

export default async function ColunistaAssinaturaPage() {
  const profile = await requireRole(["colunista", "admin"]);
  const supabase = await createClient();

  const [
    { data: configValor },
    { data: assinatura }
  ] = await Promise.all([
    supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "colunista_mensalidade_valor")
      .maybeSingle(),
    supabase
      .from("assinaturas_colunistas")
      .select("*")
      .eq("colunista_id", profile.id)
      .maybeSingle()
  ]);

  const valorMensalidade = Number(configValor?.valor ?? 97);

  return (
    <ColunistaAssinaturaView
      initialAssinatura={assinatura || null}
      valorMensalidade={valorMensalidade}
      userNome={profile.nome}
    />
  );
}
