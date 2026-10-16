import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import * as z from "zod";

const updateSaqueSchema = z.object({
  status: z.enum(["pago", "rejeitado"]),
  comprovante: z.string().optional(),
  motivo_rejeicao: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSaqueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { status, comprovante, motivo_rejeicao } = parsed.data;
    const supabase = getSupabaseAdmin();

    // 1. Buscar a solicitação de saque existente
    const { data: saque, error: fetchErr } = await supabase
      .from("saques_afiliados")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !saque) {
      return NextResponse.json({ error: "Solicitação de saque não encontrada." }, { status: 404 });
    }

    if (saque.status !== "pendente") {
      return NextResponse.json(
        { error: `Este saque já foi processado anteriormente (status: ${saque.status}).` },
        { status: 400 }
      );
    }

    // 2. Se for rejeitado, devolver o saldo ao colunista
    if (status === "rejeitado") {
      const { data: colunista } = await supabase
        .from("profiles")
        .select("saldo_afiliado")
        .eq("id", saque.colunista_id)
        .single();

      const saldoAtual = Number(colunista?.saldo_afiliado || 0);
      const saldoRestituido = Number((saldoAtual + Number(saque.valor)).toFixed(2));

      await supabase
        .from("profiles")
        .update({ saldo_afiliado: saldoRestituido })
        .eq("id", saque.colunista_id);
    }

    // 3. Atualizar o registro de saque
    const { data: updatedSaque, error: updateErr } = await supabase
      .from("saques_afiliados")
      .update({
        status: status,
        comprovante: comprovante || null,
        motivo_rejeicao: motivo_rejeicao || null,
        pago_em: status === "pago" ? new Date().toISOString() : null,
        processado_por: profile.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: status === "pago" ? "Saque marcado como pago com sucesso!" : "Saque rejeitado e saldo restituído ao colunista.",
      saque: updatedSaque,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao processar saque.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
