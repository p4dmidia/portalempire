import { NextRequest, NextResponse } from "next/server";
import { verificarEAtivarColunistaPorPagamento } from "@/lib/mercadopago/ativar-colunista";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    // Mercado Pago pode enviar via query params (?type=payment&data.id=123) ou no body ({ type: 'payment', data: { id: '123' } })
    const topic =
      url.searchParams.get("topic") ||
      url.searchParams.get("type") ||
      body.type ||
      body.action;
    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body.data?.id ||
      body.id;

    if (!paymentId) {
      return NextResponse.json({ received: true, ignored: "Sem paymentId" });
    }

    if (
      topic &&
      topic !== "payment" &&
      !String(topic).startsWith("payment.")
    ) {
      return NextResponse.json({
        received: true,
        ignored: `Tópico não relevante: ${topic}`,
      });
    }

    const resultado = await verificarEAtivarColunistaPorPagamento({
      paymentId,
    });

    return NextResponse.json({
      received: true,
      processed: resultado.aprovado,
      status: resultado.statusPagamento,
      paymentId: resultado.paymentId,
      colunistaId: resultado.colunistaId,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Erro no webhook do Mercado Pago";
    console.error("[Mercado Pago Webhook Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
