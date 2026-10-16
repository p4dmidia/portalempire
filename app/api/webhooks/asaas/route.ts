import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarEmailAnuncioAtivado } from "@/lib/email/servico";

interface AsaasPaymentPayload {
  id: string;
  customer?: string;
  value?: number;
  netValue?: number;
  status?: string;
  billingType?: string;
  externalReference?: string;
  dueDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
}

interface AsaasWebhookEvent {
  event: string;
  payment: AsaasPaymentPayload;
}

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get("asaas-access-token");
    const configuredToken = process.env.ASAAS_WEBHOOK_TOKEN;

    // 1. Validar token de segurança do webhook (se configurado)
    if (
      configuredToken &&
      configuredToken !== "dummy-webhook-token" &&
      configuredToken !== "your-asaas-webhook-secret-token" &&
      tokenHeader !== configuredToken
    ) {
      console.warn("[Asaas Webhook] Token de autenticação inválido ou não fornecido.");
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const body: AsaasWebhookEvent = await request.json();
    const { event, payment } = body;

    if (!payment || !payment.id) {
      return NextResponse.json({ error: "Payload do pagamento inválido." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 2. Buscar o pedido correspondente por asaas_payment_id ou externalReference (anuncio_id)
    let { data: pedido } = await supabase
      .from("pedidos")
      .select(`
        *,
        anuncio:anuncios(
          id, titulo, inicio_em, fim_em, status,
          anunciante:anunciantes(nome, email)
        )
      `)
      .eq("asaas_payment_id", payment.id)
      .maybeSingle();

    if (!pedido && payment.externalReference) {
      const { data: pedidoPorRef } = await supabase
        .from("pedidos")
        .select(`
          *,
          anuncio:anuncios(
            id, titulo, inicio_em, fim_em, status,
            anunciante:anunciantes(nome, email)
          )
        `)
        .eq("anuncio_id", payment.externalReference)
        .maybeSingle();

      pedido = pedidoPorRef;
    }

    if (!pedido) {
      console.warn(`[Asaas Webhook] Nenhum pedido encontrado para o paymentId: ${payment.id}`);
      return NextResponse.json({ received: true, warning: "Pedido não localizado." });
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const anuncio = Array.isArray(pedido.anuncio) ? pedido.anuncio[0] : pedido.anuncio;

    // 3. Processar eventos do ciclo de vida de pagamento
    switch (event) {
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED": {
        // Idempotência: Se já estava pago, apenas responder 200
        if (pedido.status === "pago") {
          return NextResponse.json({ received: true, already_processed: true });
        }

        // Atualizar status do pedido
        await supabase
          .from("pedidos")
          .update({
            status: "pago",
            pago_em: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", pedido.id);

        // Ativar anúncio com base nas datas
        if (anuncio) {
          let novoStatusAnuncio = "ativo";
          if (anuncio.inicio_em > hoje) {
            novoStatusAnuncio = "agendado";
          } else if (anuncio.fim_em < hoje) {
            novoStatusAnuncio = "expirado";
          }

          await supabase
            .from("anuncios")
            .update({
              status: novoStatusAnuncio,
              updated_at: new Date().toISOString(),
            })
            .eq("id", anuncio.id);

          // Enviar e-mail de confirmação e ativação
          const anuncianteData = Array.isArray(anuncio.anunciante)
            ? anuncio.anunciante[0]
            : anuncio.anunciante;

          if (anuncianteData?.email) {
            enviarEmailAnuncioAtivado({
              email: anuncianteData.email,
              nomeCliente: anuncianteData.nome,
              tituloAnuncio: anuncio.titulo,
              inicioEm: anuncio.inicio_em,
              fimEm: anuncio.fim_em,
            }).catch(console.error);
          }

          try {
            revalidatePath("/");
            revalidatePath("/colunas");
          } catch {
            // Ignore in test
          }
        }
        break;
      }

      case "PAYMENT_OVERDUE": {
        if (pedido.status !== "pago") {
          await supabase
            .from("pedidos")
            .update({
              status: "cancelado",
              updated_at: new Date().toISOString(),
            })
            .eq("id", pedido.id);

          if (anuncio && anuncio.status === "aguardando_pagamento") {
            await supabase
              .from("anuncios")
              .update({
                status: "cancelado",
                updated_at: new Date().toISOString(),
              })
              .eq("id", anuncio.id);
          }
        }
        break;
      }

      case "PAYMENT_REFUNDED":
      case "PAYMENT_CHARGEBACK_REQUESTED":
      case "PAYMENT_CHARGEBACK_DISPUTE": {
        await supabase
          .from("pedidos")
          .update({
            status: "reembolsado",
            updated_at: new Date().toISOString(),
          })
          .eq("id", pedido.id);

        if (anuncio) {
          await supabase
            .from("anuncios")
            .update({
              status: "pausado",
              updated_at: new Date().toISOString(),
            })
            .eq("id", anuncio.id);

          try {
            revalidatePath("/");
            revalidatePath("/colunas");
          } catch {
            // Ignore in test
          }
        }
        break;
      }

      default:
        console.log(`[Asaas Webhook] Evento não mapeado ignorado: ${event}`);
    }

    return NextResponse.json({ received: true, event });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro no webhook do Asaas.";
    console.error("[Asaas Webhook Error]:", error);
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
