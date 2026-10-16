import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { criarPreferenciaMensalidadeMP } from "@/lib/mercadopago/client";

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Obter valor da mensalidade das configurações
    const { data: configValor } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "colunista_mensalidade_valor")
      .maybeSingle();

    const valorMensalidade = Number(configValor?.valor ?? 97);

    // 2. Buscar assinatura do colunista
    const { data: assinatura, error: assErr } = await supabase
      .from("assinaturas_colunistas")
      .select("*")
      .eq("colunista_id", profile.id)
      .maybeSingle();

    if (assErr && assErr.code !== "PGRST116") {
      console.error("[Assinatura] Erro ao buscar assinatura:", assErr);
    }

    return NextResponse.json({
      assinatura: assinatura || null,
      valorMensalidade,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar assinatura.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Obter valor atual da mensalidade
    const { data: configValor } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "colunista_mensalidade_valor")
      .maybeSingle();

    const valorMensalidade = Number(configValor?.valor ?? 97);

    // 2. Criar preferência no Mercado Pago
    const preferencia = await criarPreferenciaMensalidadeMP({
      titulo: `Mensalidade de Colunista - Portal Empire`,
      preco: valorMensalidade,
      colunistaId: profile.id,
      email: profile.email || "colunista@portalempire.com.br",
      nome: profile.nome || "Colunista",
    });

    return NextResponse.json({
      init_point: preferencia.init_point || preferencia.sandbox_init_point,
      preferenceId: preferencia.id,
      valor: valorMensalidade,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao gerar pagamento Mercado Pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
