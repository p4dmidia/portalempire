import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 10;

// POST: Registra solicitação de anúncio em totem (Público)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      totem_id,
      nome_contato,
      empresa,
      whatsapp,
      email,
      cidade,
      mensagem,
    } = body;

    if (!totem_id || !nome_contato || !whatsapp) {
      return NextResponse.json(
        { error: "Preencha nome e WhatsApp para contato." },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();
    const { data, error } = await adminSupabase
      .from("totens_solicitacoes")
      .insert({
        totem_id,
        nome_contato: nome_contato.trim(),
        empresa: empresa?.trim() || null,
        whatsapp: whatsapp.trim(),
        email: email?.trim() || null,
        cidade: cidade?.trim() || null,
        mensagem: mensagem?.trim() || null,
        status: "pendente",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao registrar proposta.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
