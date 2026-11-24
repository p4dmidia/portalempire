import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { gerarTokenEdicao } from "@/lib/talentos/token-edicao";

export const maxDuration = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, whatsapp } = body;

    if (!email?.trim() || !whatsapp?.trim()) {
      return NextResponse.json(
        { error: "Por favor, informe seu e-mail e telefone/WhatsApp de cadastro." },
        { status: 400 }
      );
    }

    const emailNorm = email.trim().toLowerCase();
    const digitsWhatsapp = whatsapp.replace(/\D/g, "");

    if (!emailNorm.includes("@") || digitsWhatsapp.length < 8) {
      return NextResponse.json(
        { error: "Informe um e-mail válido e um telefone com DDD (mínimo 8 dígitos)." },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    // Busca talentos cadastrados
    const { data: talentos, error } = await adminSupabase
      .from("talentos")
      .select("*");

    if (error || !talentos || talentos.length === 0) {
      return NextResponse.json(
        { error: "Nenhum perfil encontrado com essas credenciais." },
        { status: 404 }
      );
    }

    // Compara e-mail e telefone de forma flexível (com ou sem 55, com ou sem máscara)
    const talentoEncontrado = talentos.find((t) => {
      const emailTalento = (t.email || t.redes_sociais?.email || "").toLowerCase().trim();
      const emailBate = emailTalento === emailNorm;

      if (!emailBate) return false;

      const whatsappTalento = (t.whatsapp || t.redes_sociais?.whatsapp || "").replace(/\D/g, "");
      if (!whatsappTalento) return false;

      // Compara os últimos 8 dígitos para garantir compatibilidade com ou sem 9º dígito / DDD / 55
      const ultimos8Busca = digitsWhatsapp.slice(-8);
      const ultimos8Talento = whatsappTalento.slice(-8);

      return (
        whatsappTalento === digitsWhatsapp ||
        whatsappTalento.endsWith(digitsWhatsapp) ||
        digitsWhatsapp.endsWith(whatsappTalento) ||
        ultimos8Busca === ultimos8Talento
      );
    });

    if (!talentoEncontrado) {
      return NextResponse.json(
        {
          error:
            "Nenhum perfil encontrado com este e-mail e telefone. Verifique se os dados digitados são exatamente os mesmos informados no cadastro.",
        },
        { status: 404 }
      );
    }

    // Gera token de edição assinado
    const token = gerarTokenEdicao(talentoEncontrado.id);

    return NextResponse.json({
      success: true,
      talento: talentoEncontrado,
      token,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao validar credenciais.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
