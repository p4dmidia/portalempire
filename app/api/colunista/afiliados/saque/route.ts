import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import * as z from "zod";

const saqueSchema = z.object({
  valor: z.number().positive("O valor deve ser maior que zero"),
  chave_pix: z.string().min(3, "Informe uma chave PIX válida"),
  tipo_chave_pix: z.enum(["cpf", "cnpj", "email", "telefone", "aleatoria"]),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "colunista" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = saqueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { valor, chave_pix, tipo_chave_pix } = parsed.data;

    const supabase = await createClient();

    // 1. Buscar valor mínimo de saque
    const { data: configSaque } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "afiliados_saque_minimo")
      .maybeSingle();

    const saqueMinimo = Number(configSaque?.valor || "50.00");
    if (valor < saqueMinimo) {
      return NextResponse.json(
        { error: `O valor mínimo para solicitação de saque é de R$ ${saqueMinimo.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // 2. Buscar perfil atualizado e saldo do colunista
    const { data: colunistaData, error: colunistaErr } = await supabase
      .from("profiles")
      .select("saldo_afiliado")
      .eq("id", profile.id)
      .single();

    if (colunistaErr || !colunistaData) {
      return NextResponse.json({ error: "Perfil do colunista não encontrado." }, { status: 404 });
    }

    const saldoAtual = Number(colunistaData.saldo_afiliado || 0);
    if (valor > saldoAtual) {
      return NextResponse.json(
        { error: `Saldo insuficiente. Seu saldo disponível é de R$ ${saldoAtual.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // 3. Criar a solicitação de saque em saques_afiliados
    const { data: novoSaque, error: saqueInsertErr } = await supabase
      .from("saques_afiliados")
      .insert({
        colunista_id: profile.id,
        valor: valor,
        chave_pix: chave_pix.trim(),
        tipo_chave_pix: tipo_chave_pix,
        status: "pendente",
        solicitado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (saqueInsertErr) {
      throw saqueInsertErr;
    }

    // 4. Debitar o valor do saldo disponível e salvar a chave PIX no perfil
    const novoSaldo = Number((saldoAtual - valor).toFixed(2));
    await supabase
      .from("profiles")
      .update({
        saldo_afiliado: novoSaldo,
        chave_pix: chave_pix.trim(),
        tipo_chave_pix: tipo_chave_pix,
      })
      .eq("id", profile.id);

    return NextResponse.json({
      success: true,
      message: "Solicitação de saque enviada com sucesso! O administrador processará a transferência via PIX.",
      saque: novoSaque,
      novo_saldo: novoSaldo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno ao solicitar saque.";
    console.error("[Saque API Error]:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
