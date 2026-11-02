import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  criarPagamentoPixMP,
  criarPreferenciaMensalidadeMP,
} from "@/lib/mercadopago/client";

const checkoutSchema = z.object({
  colunistaId: z.string().min(1, "ID do colunista é obrigatório"),
  nome: z.string().min(3, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  telefone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  cidadeId: z.string().optional().nullable(),
  nomeColuna: z.string().optional().nullable(),
  codigoRef: z.string().optional().nullable(),
  metodoPagamento: z.enum(["pix", "cartao"]).default("pix"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const dados = parsed.data;
    const supabase = getSupabaseAdmin();

    // 1. Buscar valor configurado da mensalidade (padrão oficial R$ 250,00)
    const { data: configValor } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "colunista_mensalidade_valor")
      .maybeSingle();

    const valorBruto = Number(configValor?.valor ?? 250);
    // Ignorar o valor antigo de seed (97) caso a migration 250 ainda não tenha rodado no banco remoto
    const valorMensalidade =
      !valorBruto || valorBruto === 97 ? 250 : valorBruto;

    // 2. Atualizar telefone / cpf_cnpj no perfil se já existir
    if (dados.telefone || dados.cpfCnpj) {
      await supabase
        .from("profiles")
        .update({
          ...(dados.telefone ? { telefone: dados.telefone } : {}),
          ...(dados.cpfCnpj ? { cpf_cnpj: dados.cpfCnpj } : {}),
        })
        .eq("id", dados.colunistaId);
    }

    const metadata = {
      cidade_id: dados.cidadeId || null,
      nome_coluna: dados.nomeColuna || null,
      telefone: dados.telefone || null,
      cpf_cnpj: dados.cpfCnpj || null,
      ref: dados.codigoRef || null,
    };

    // 3. Gerar PIX Transparente na tela ou Checkout Pro (Cartão / Mercado Pago)
    if (dados.metodoPagamento === "pix") {
      const pagamentoPix = await criarPagamentoPixMP({
        titulo: "Licença Colunista Oficial - Portal Empire Cidades",
        preco: valorMensalidade,
        colunistaId: dados.colunistaId,
        email: dados.email,
        nome: dados.nome,
        cpfCnpj: dados.cpfCnpj,
        metadata,
      });

      const txData = pagamentoPix.point_of_interaction?.transaction_data;

      return NextResponse.json({
        metodo: "pix",
        paymentId: String(pagamentoPix.id),
        status: pagamentoPix.status,
        qrCode: txData?.qr_code || "",
        qrCodeBase64: txData?.qr_code_base64 || "",
        ticketUrl: txData?.ticket_url || "",
        valor: valorMensalidade,
      });
    } else {
      const preferencia = await criarPreferenciaMensalidadeMP({
        titulo: "Licença Colunista Oficial - Portal Empire Cidades",
        preco: valorMensalidade,
        colunistaId: dados.colunistaId,
        email: dados.email,
        nome: dados.nome,
        cpfCnpj: dados.cpfCnpj,
        telefone: dados.telefone,
        returnPath: `/checkout/colunista/retorno?email=${encodeURIComponent(
          dados.email
        )}`,
        metadata,
      });

      return NextResponse.json({
        metodo: "cartao",
        preferenceId: preferencia.id,
        initPoint: preferencia.init_point || preferencia.sandbox_init_point,
        valor: valorMensalidade,
      });
    }
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Erro ao gerar checkout no Mercado Pago.";
    console.error("[Checkout Colunista Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

