import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, empresa, email, telefone, mensagem } = body;

    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { error: "Nome, e-mail e telefone são obrigatórios." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Gravar Lead com as colunas corretas da tabela auditoria
    const { error: insertError } = await supabase.from("auditoria").insert({
      usuario_id: null,
      acao: "lead_comercial_anuncie",
      entidade: "anunciantes",
      entidade_id: null,
      dados: {
        nome,
        empresa: empresa || "Não informada",
        email,
        telefone,
        mensagem: mensagem || "Sem mensagem específica",
        origem: "formulario_anuncie_publico",
        data: new Date().toISOString(),
      },
    });

    if (insertError) {
      console.warn("Aviso: RLS bloqueou auditoria (configure SUPABASE_SERVICE_ROLE_KEY no .env.local):", insertError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Lead recebido com sucesso.",
      warning: insertError ? "Auditoria requer chave de serviço" : undefined,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao processar solicitação.";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
