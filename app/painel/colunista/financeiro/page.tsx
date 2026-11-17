import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  ColunistaFinanceiroView,
  SeguidorItem,
  SaqueItem,
} from "@/components/painel/financeiro/colunista-financeiro-view";

export default async function ColunistaFinanceiroPage() {
  const profile = await requireRole(["colunista", "admin"]);
  const supabase = await createClient();

  // 1. Limpeza automática do asaas_wallet_id fake do perfil se ainda existir
  if (profile.asaas_wallet_id) {
    const adminSb = getSupabaseAdmin();
    await adminSb
      .from("profiles")
      .update({ asaas_wallet_id: null })
      .eq("id", profile.id);
    profile.asaas_wallet_id = null;
  }

  // 2. Buscar a coluna do colunista
  const { data: colunas } = await supabase
    .from("colunas")
    .select("id, nome, slug")
    .eq("dono_id", profile.id);

  const coluna = colunas?.[0] || null;
  const colunaIds = (colunas || []).map((c) => c.id);

  // 3. Buscar seguidores / assinantes da coluna
  let seguidores: SeguidorItem[] = [];
  if (colunaIds.length > 0) {
    const { data: segsRaw } = await supabase
      .from("colunistas_seguidores")
      .select("id, nome, whatsapp, email, plano_trial, status, created_at")
      .in("coluna_id", colunaIds)
      .order("created_at", { ascending: false });

    if (segsRaw) {
      seguidores = segsRaw as SeguidorItem[];
    }
  }

  // 4. Buscar histórico de solicitações de saque via PIX
  const { data: saquesRaw } = await supabase
    .from("saques_afiliados")
    .select("id, valor, chave_pix, tipo_chave_pix, status, comprovante, motivo_rejeicao, solicitado_em, pago_em")
    .eq("colunista_id", profile.id)
    .order("solicitado_em", { ascending: false });

  const saques: SaqueItem[] = (saquesRaw || []).map((s) => ({
    id: s.id,
    valor: Number(s.valor),
    chave_pix: s.chave_pix,
    tipo_chave_pix: s.tipo_chave_pix,
    status: s.status as "pendente" | "pago" | "rejeitado",
    comprovante: s.comprovante,
    motivo_rejeicao: s.motivo_rejeicao,
    solicitado_em: s.solicitado_em,
    pago_em: s.pago_em,
  }));

  // 5. Buscar configurações de saque mínimo
  const { data: configSaque } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "afiliados_saque_minimo")
    .maybeSingle();

  const saqueMinimo = Number(configSaque?.valor || "50.00");

  return (
    <ColunistaFinanceiroView
      initialSeguidores={seguidores}
      initialSaques={saques}
      userProfile={{
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        cpf_cnpj: profile.cpf_cnpj || null,
        telefone: profile.telefone || null,
        chave_pix: profile.chave_pix || null,
        tipo_chave_pix: profile.tipo_chave_pix || null,
        saldo_afiliado: Number(profile.saldo_afiliado || 0),
      }}
      colunaNome={coluna?.nome}
      mensalidadeValor={9.90}
      percentualColunista={60}
      percentualPlataforma={40}
      saqueMinimo={saqueMinimo}
    />
  );
}
