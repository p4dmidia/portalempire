import { NextRequest, NextResponse } from "next/server";
import { verificarEAtivarColunistaPorPagamento } from "@/lib/mercadopago/ativar-colunista";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId =
      searchParams.get("paymentId") ||
      searchParams.get("payment_id") ||
      searchParams.get("collection_id");
    const colunistaId =
      searchParams.get("colunistaId") ||
      searchParams.get("colunista_id") ||
      searchParams.get("external_reference") ||
      undefined;
    const cidadeId = searchParams.get("cidadeId") || null;
    const nomeColuna = searchParams.get("nomeColuna") || null;

    if (!paymentId) {
      return NextResponse.json(
        { error: "ID do pagamento não informado." },
        { status: 400 }
      );
    }

    const resultado = await verificarEAtivarColunistaPorPagamento({
      paymentId,
      colunistaIdFallback: colunistaId,
      cidadeId,
      nomeColuna,
    });

    return NextResponse.json(resultado);
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Erro ao verificar pagamento.";
    return NextResponse.json({ aprovado: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentId = body.paymentId || body.payment_id || body.collection_id;
    const colunistaId =
      body.colunistaId || body.colunista_id || body.external_reference;

    if (!paymentId) {
      return NextResponse.json(
        { error: "ID do pagamento não informado." },
        { status: 400 }
      );
    }

    const resultado = await verificarEAtivarColunistaPorPagamento({
      paymentId,
      colunistaIdFallback: colunistaId,
      cidadeId: body.cidadeId || null,
      nomeColuna: body.nomeColuna || null,
      telefone: body.telefone || null,
      cpfCnpj: body.cpfCnpj || null,
    });

    return NextResponse.json(resultado);
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Erro ao verificar pagamento.";
    return NextResponse.json({ aprovado: false, error: msg }, { status: 500 });
  }
}

