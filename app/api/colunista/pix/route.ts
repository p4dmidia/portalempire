import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const pixSchema = z.object({
  chave_pix: z.string().min(3, "Chave PIX inválida"),
  tipo_chave_pix: z.enum(["cpf", "cnpj", "email", "telefone", "aleatoria"]),
  nome_titular: z.string().optional(),
  banco: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["colunista", "admin"]);
    const body = await request.json();

    const dados = pixSchema.parse(body);
    const supabase = getSupabaseAdmin();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        chave_pix: dados.chave_pix.trim(),
        tipo_chave_pix: dados.tipo_chave_pix,
        asaas_wallet_id: null, // Limpa qualquer resquício de Asaas
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Chave PIX salva com sucesso para recebimento de repasses!",
      chave_pix: dados.chave_pix.trim(),
      tipo_chave_pix: dados.tipo_chave_pix,
    });
  } catch (error: unknown) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao salvar chave PIX.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
