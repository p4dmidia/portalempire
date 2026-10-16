import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminSaquesView, SaqueAdminItem } from "@/components/painel/admin/admin-saques-view";

export default async function AdminSaquesPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: saquesRaw } = await supabase
    .from("saques_afiliados")
    .select(`
      id,
      valor,
      chave_pix,
      tipo_chave_pix,
      status,
      comprovante,
      motivo_rejeicao,
      solicitado_em,
      pago_em,
      colunista:profiles!colunista_id(id, nome, email, slug, foto_url)
    `)
    .order("solicitado_em", { ascending: false });

  const saques: SaqueAdminItem[] = (saquesRaw || []).map((s) => ({
    id: s.id,
    valor: Number(s.valor),
    chave_pix: s.chave_pix,
    tipo_chave_pix: s.tipo_chave_pix,
    status: s.status as "pendente" | "pago" | "rejeitado",
    comprovante: s.comprovante || null,
    motivo_rejeicao: s.motivo_rejeicao || null,
    solicitado_em: s.solicitado_em,
    pago_em: s.pago_em || null,
    colunista: Array.isArray(s.colunista) ? s.colunista[0] : s.colunista,
  }));

  return <AdminSaquesView initialSaques={saques} />;
}
