import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { criarSubcontaAsaas } from "@/lib/asaas/subcontas";

const subcontaSchema = z.object({
  name: z.string().min(3, "Nome completo ou Razão Social é obrigatório"),
  email: z.string().email("E-mail inválido"),
  cpfCnpj: z.string().min(11, "CPF ou CNPJ inválido"),
  phone: z.string().optional(),
  mobilePhone: z.string().min(10, "Telefone celular / WhatsApp obrigatório"),
  address: z.string().optional(),
  addressNumber: z.string().optional(),
  complement: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["colunista", "admin"]);
    const body = await request.json();

    const dadosValidados = subcontaSchema.parse(body);

    // 1. Criar subconta no Asaas
    const respostaAsaas = await criarSubcontaAsaas({
      name: dadosValidados.name,
      email: dadosValidados.email,
      cpfCnpj: dadosValidados.cpfCnpj,
      phone: dadosValidados.phone,
      mobilePhone: dadosValidados.mobilePhone,
      address: dadosValidados.address,
      addressNumber: dadosValidados.addressNumber,
      complement: dadosValidados.complement,
      province: dadosValidados.province,
      postalCode: dadosValidados.postalCode,
    });

    if (!respostaAsaas.walletId) {
      throw new Error("Não foi possível obter o identificador da carteira (walletId) do Asaas.");
    }

    // 2. Salvar dados e wallet_id no perfil do colunista
    const supabase = getSupabaseAdmin();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        asaas_wallet_id: respostaAsaas.walletId,
        cpf_cnpj: dadosValidados.cpfCnpj.replace(/\D/g, ""),
        telefone: dadosValidados.mobilePhone.replace(/\D/g, ""),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      walletId: respostaAsaas.walletId,
      message: "Conta de recebimento configurada com sucesso!",
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao configurar conta de recebimento.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
