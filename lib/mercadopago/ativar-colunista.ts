import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { obterPagamentoMP, type MercadoPagoPaymentResponse } from "./client";
import { slugify } from "@/lib/utils/slugify";

export interface ResultadoAtivacaoColunista {
  aprovado: boolean;
  statusPagamento: string;
  colunistaId?: string;
  paymentId?: string;
  jaProcessado?: boolean;
  mensagem?: string;
}

/**
 * Verifica um pagamento no Mercado Pago e, se aprovado (status === 'approved'),
 * ativa imediatamente o perfil do colunista, cria/renova sua assinatura,
 * cria/ativa sua coluna editorial e credita a comissão recorrente de R$ 50,00 (20%) ao indicador.
 */
export async function verificarEAtivarColunistaPorPagamento(params: {
  paymentId: string | number;
  colunistaIdFallback?: string;
  cidadeId?: string | null;
  nomeColuna?: string | null;
  telefone?: string | null;
  cpfCnpj?: string | null;
}): Promise<ResultadoAtivacaoColunista> {
  const { paymentId, colunistaIdFallback, cidadeId, nomeColuna, telefone, cpfCnpj } = params;

  const pagamento: MercadoPagoPaymentResponse = await obterPagamentoMP(paymentId);

  if (!pagamento) {
    return {
      aprovado: false,
      statusPagamento: "not_found",
      mensagem: "Pagamento não encontrado no Mercado Pago.",
    };
  }

  if (pagamento.status !== "approved") {
    return {
      aprovado: false,
      statusPagamento: pagamento.status,
      paymentId: String(pagamento.id),
      mensagem: `Pagamento com status: ${pagamento.status}`,
    };
  }

  const colunistaId =
    pagamento.external_reference ||
    (pagamento.metadata?.colunista_id as string | undefined) ||
    colunistaIdFallback;

  if (!colunistaId) {
    return {
      aprovado: true,
      statusPagamento: "approved",
      paymentId: String(pagamento.id),
      mensagem: "Pagamento aprovado, mas sem referência de colunista.",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const strPaymentId = String(pagamento.id);
  const valorPago = Number(pagamento.transaction_amount || 250.0);
  const hoje = new Date();
  const proximoVencimento = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const mesReferencia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

  const metaCidadeId =
    cidadeId || (pagamento.metadata?.cidade_id as string | undefined) || null;
  const metaNomeColuna =
    nomeColuna || (pagamento.metadata?.nome_coluna as string | undefined) || null;
  const metaTelefone =
    telefone || (pagamento.metadata?.telefone as string | undefined) || null;
  const metaCpfCnpj =
    cpfCnpj || (pagamento.metadata?.cpf_cnpj as string | undefined) || null;

  // 1. Tentar ativar via RPC SECURITY DEFINER (caso a migration 20261031000002 esteja aplicada)
  try {
    await supabaseAdmin.rpc("ativar_colunista_pago", {
      p_colunista_id: colunistaId,
      p_mp_payment_id: strPaymentId,
      p_valor_pago: valorPago,
      p_forma_pagamento: pagamento.payment_method_id || pagamento.payment_type_id || "pix",
      p_cidade_id: metaCidadeId,
      p_nome_coluna: metaNomeColuna,
    });
  } catch {
    // Continua com atualização direta caso a função RPC ainda não exista no banco remoto
  }

  // 2. Atualizar metadados da sessão autenticada atual (se o próprio usuário estiver logado no checkout)
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (user && user.id === colunistaId) {
      await supabaseUser.auth.updateUser({
        data: {
          pagamento_aprovado: true,
          assinatura_ativa: true,
          mp_payment_id: strPaymentId,
          proximo_vencimento: proximoVencimento,
          valor_mensal: valorPago,
          ...(metaCidadeId ? { cidade_id: metaCidadeId } : {}),
          ...(metaNomeColuna ? { nome_coluna: metaNomeColuna } : {}),
        },
      });

      // Atualizar dados não sensíveis que a própria sessão tem permissão
      const dadosExtras: Record<string, unknown> = {};
      if (metaTelefone) dadosExtras.telefone = metaTelefone;
      if (metaCpfCnpj) dadosExtras.cpf_cnpj = metaCpfCnpj;
      if (Object.keys(dadosExtras).length > 0) {
        await supabaseUser.from("profiles").update(dadosExtras).eq("id", colunistaId);
      }
    }
  } catch {
    // Ignorar se chamado via webhook sem sessão de navegador
  }

  // 3. Buscar dados do colunista pagante
  const { data: colunistaIndicado } = await supabaseAdmin
    .from("profiles")
    .select("id, nome, slug, indicado_por_id, portal_id")
    .eq("id", colunistaId)
    .maybeSingle();

  let portalId = colunistaIndicado?.portal_id;
  if (!portalId) {
    const { data: portalDefault } = await supabaseAdmin
      .from("portais")
      .select("id")
      .limit(1)
      .maybeSingle();
    portalId = portalDefault?.id;
  }

  // 4. Ativar status do profile para 'ativo' e role 'colunista'
  const updateProfilePayload: Record<string, unknown> = {
    status: "ativo",
    role: "colunista",
  };
  if (metaTelefone) updateProfilePayload.telefone = metaTelefone;
  if (metaCpfCnpj) updateProfilePayload.cpf_cnpj = metaCpfCnpj;

  await supabaseAdmin
    .from("profiles")
    .update(updateProfilePayload)
    .eq("id", colunistaId);

  // 5. Criar ou renovar assinatura em assinaturas_colunistas
  let assinaturaId: string | null = null;
  if (portalId) {
    const { data: assinaturaExistente } = await supabaseAdmin
      .from("assinaturas_colunistas")
      .select("id")
      .eq("colunista_id", colunistaId)
      .maybeSingle();

    if (assinaturaExistente) {
      assinaturaId = assinaturaExistente.id;
      await supabaseAdmin
        .from("assinaturas_colunistas")
        .update({
          status: "ativa",
          valor_mensal: valorPago,
          mp_payment_id: strPaymentId,
          forma_pagamento: pagamento.payment_method_id || pagamento.payment_type_id || "pix",
          proximo_vencimento: proximoVencimento,
          ultimo_pagamento: hoje.toISOString(),
          updated_at: hoje.toISOString(),
        })
        .eq("id", assinaturaExistente.id);
    } else {
      const { data: novaAssinatura } = await supabaseAdmin
        .from("assinaturas_colunistas")
        .insert({
          portal_id: portalId,
          colunista_id: colunistaId,
          valor_mensal: valorPago,
          mp_payment_id: strPaymentId,
          status: "ativa",
          forma_pagamento: pagamento.payment_method_id || pagamento.payment_type_id || "pix",
          proximo_vencimento: proximoVencimento,
          ultimo_pagamento: hoje.toISOString(),
        })
        .select("id")
        .maybeSingle();

      assinaturaId = novaAssinatura?.id || null;
    }
  }

  // 6. Criar coluna inicial ou ativar colunas existentes do colunista
  if (portalId) {
    const { data: colunasExistentes } = await supabaseAdmin
      .from("colunas")
      .select("id")
      .eq("dono_id", colunistaId);

    if (colunasExistentes && colunasExistentes.length > 0) {
      await supabaseAdmin
        .from("colunas")
        .update({ status: "ativa" })
        .eq("dono_id", colunistaId);
    } else {
      const nomeBase =
        metaNomeColuna?.trim() ||
        `Coluna ${colunistaIndicado?.nome || "Empire"}`;
      const slugBase =
        slugify(nomeBase) || `coluna-${colunistaId.slice(0, 6)}`;
      const slugFinal = `${slugBase}-${colunistaId.slice(0, 4)}`;

      await supabaseAdmin.from("colunas").insert({
        portal_id: portalId,
        dono_id: colunistaId,
        cidade_id: metaCidadeId || null,
        nome: nomeBase,
        slug: slugFinal,
        descricao: `Coluna oficial de ${colunistaIndicado?.nome || nomeBase} no Portal Empire Cidades.`,
        status: "ativa",
        aceita_anuncios: true,
      });
    }
  }

  // 7. Processar comissão recorrente de 20% (R$ 50,00) se tiver indicador e ainda não foi processada
  if (colunistaIndicado?.indicado_por_id) {
    const { data: comissaoExistente } = await supabaseAdmin
      .from("comissoes_afiliados")
      .select("id")
      .eq("mp_payment_id", strPaymentId)
      .maybeSingle();

    if (!comissaoExistente) {
      const { data: configComissao } = await supabaseAdmin
        .from("configuracoes")
        .select("valor")
        .eq("chave", "afiliados_comissao_percentual")
        .maybeSingle();

      const percentual = Number(configComissao?.valor || "20.00");
      const valorComissao = Number(((valorPago * percentual) / 100).toFixed(2));

      const { data: indicador } = await supabaseAdmin
        .from("profiles")
        .select("id, saldo_afiliado")
        .eq("id", colunistaIndicado.indicado_por_id)
        .maybeSingle();

      if (indicador) {
        const saldoAtual = Number(indicador.saldo_afiliado || 0);
        const novoSaldo = Number((saldoAtual + valorComissao).toFixed(2));

        await supabaseAdmin
          .from("profiles")
          .update({ saldo_afiliado: novoSaldo })
          .eq("id", indicador.id);

        await supabaseAdmin.from("comissoes_afiliados").insert({
          afiliado_id: indicador.id,
          indicado_id: colunistaIndicado.id,
          assinatura_id: assinaturaId,
          mp_payment_id: strPaymentId,
          mes_referencia: mesReferencia,
          valor_mensalidade: valorPago,
          percentual_comissao: percentual,
          valor_comissao: valorComissao,
          status: "creditado",
          created_at: hoje.toISOString(),
        });
      }
    }
  }

  return {
    aprovado: true,
    statusPagamento: "approved",
    colunistaId,
    paymentId: strPaymentId,
    mensagem: "Conta de colunista e assinatura ativadas com sucesso!",
  };
}

