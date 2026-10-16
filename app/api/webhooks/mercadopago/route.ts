import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { obterPagamentoMP } from "@/lib/mercadopago/client";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    // Mercado Pago pode enviar via query params (?type=payment&data.id=123) ou no body ({ type: 'payment', data: { id: '123' } })
    const topic = url.searchParams.get("topic") || url.searchParams.get("type") || body.type;
    const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id") || body.data?.id;

    if (!paymentId) {
      return NextResponse.json({ received: true, ignored: "Sem paymentId" });
    }

    if (topic && topic !== "payment") {
      return NextResponse.json({ received: true, ignored: `Tópico não relevante: ${topic}` });
    }

    // 1. Consultar detalhes do pagamento na API do Mercado Pago
    const pagamento = await obterPagamentoMP(paymentId);
    if (!pagamento || pagamento.status !== "approved") {
      return NextResponse.json({ received: true, status: pagamento?.status || "unprocessed" });
    }

    const colunistaId = pagamento.external_reference;
    if (!colunistaId) {
      console.warn("[Mercado Pago Webhook] Pagamento sem external_reference:", paymentId);
      return NextResponse.json({ received: true, warning: "Sem external_reference" });
    }

    const supabase = getSupabaseAdmin();
    const strPaymentId = String(pagamento.id);

    // 2. Verificar idempotência: já processamos esse pagamento em comissoes_afiliados?
    const { data: comissaoExistente } = await supabase
      .from("comissoes_afiliados")
      .select("id")
      .eq("mp_payment_id", strPaymentId)
      .maybeSingle();

    if (comissaoExistente) {
      return NextResponse.json({ received: true, already_processed: true });
    }

    // 3. Buscar dados do colunista pagante (indicado)
    const { data: colunistaIndicado, error: colErr } = await supabase
      .from("profiles")
      .select("id, nome, indicado_por_id, portal_id")
      .eq("id", colunistaId)
      .maybeSingle();

    if (colErr || !colunistaIndicado) {
      console.warn(`[Mercado Pago Webhook] Colunista não localizado para o ID: ${colunistaId}`);
      return NextResponse.json({ received: true, warning: "Colunista não encontrado" });
    }

    const hoje = new Date();
    const proximoVencimento = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const mesReferencia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
    const valorPago = Number(pagamento.transaction_amount || 97.0);

    // 4. Renovar ou criar a assinatura da coluna
    const { data: assinaturaExistente } = await supabase
      .from("assinaturas_colunistas")
      .select("id")
      .eq("colunista_id", colunistaIndicado.id)
      .maybeSingle();

    let assinaturaId: string | null = null;

    if (assinaturaExistente) {
      assinaturaId = assinaturaExistente.id;
      await supabase
        .from("assinaturas_colunistas")
        .update({
          status: "ativa",
          valor_mensal: valorPago,
          mp_payment_id: strPaymentId,
          proximo_vencimento: proximoVencimento,
          ultimo_pagamento: hoje.toISOString(),
          updated_at: hoje.toISOString(),
        })
        .eq("id", assinaturaExistente.id);
    } else {
      const { data: novaAssinatura } = await supabase
        .from("assinaturas_colunistas")
        .insert({
          portal_id: colunistaIndicado.portal_id,
          colunista_id: colunistaIndicado.id,
          valor_mensal: valorPago,
          mp_payment_id: strPaymentId,
          status: "ativa",
          forma_pagamento: pagamento.payment_type_id || "pix",
          proximo_vencimento: proximoVencimento,
          ultimo_pagamento: hoje.toISOString(),
        })
        .select("id")
        .single();

      assinaturaId = novaAssinatura?.id || null;
    }

    // 5. Ativar a(s) coluna(s) do colunista
    await supabase
      .from("colunas")
      .update({ status: "ativa" })
      .eq("dono_id", colunistaIndicado.id);

    // 6. PROCESSAR COMISSÃO RECORRENTE DE 20% SE TIVER INDICADOR
    if (colunistaIndicado.indicado_por_id) {
      // Buscar percentual de comissão configurado (padrão 20%)
      const { data: configComissao } = await supabase
        .from("configuracoes")
        .select("valor")
        .eq("chave", "afiliados_comissao_percentual")
        .maybeSingle();

      const percentual = Number(configComissao?.valor || "20.00");
      const valorComissao = Number(((valorPago * percentual) / 100).toFixed(2));

      // Creditar no saldo do indicador
      const { data: indicador } = await supabase
        .from("profiles")
        .select("id, saldo_afiliado")
        .eq("id", colunistaIndicado.indicado_por_id)
        .single();

      if (indicador) {
        const saldoAtual = Number(indicador.saldo_afiliado || 0);
        const novoSaldo = Number((saldoAtual + valorComissao).toFixed(2));

        await supabase
          .from("profiles")
          .update({ saldo_afiliado: novoSaldo })
          .eq("id", indicador.id);

        // Inserir registro na tabela comissoes_afiliados
        await supabase.from("comissoes_afiliados").insert({
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

        console.log(
          `[Mercado Pago Webhook] Comissão de R$ ${valorComissao} (20%) creditada ao indicador ${indicador.id} referente à mensalidade de ${colunistaIndicado.nome}.`
        );
      }
    }

    return NextResponse.json({
      received: true,
      processed: true,
      status: "approved",
      paymentId: strPaymentId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro no webhook do Mercado Pago";
    console.error("[Mercado Pago Webhook Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
