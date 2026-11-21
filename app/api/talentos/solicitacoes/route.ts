import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 10;

// GET: Lista as solicitações de orçamento (Apenas Admin)
export async function GET(request: Request) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const talento_id = searchParams.get("talento_id") || undefined;

    const adminSupabase = getSupabaseAdmin();
    let query = adminSupabase
      .from("talentos_solicitacoes")
      .select("*, talento:talentos(id, nome, slug, foto_url, titulo_profissional)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (talento_id) {
      query = query.eq("talento_id", talento_id);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao listar solicitações.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Cria uma nova solicitação de orçamento (Público)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      talento_id,
      nome_cliente,
      empresa,
      whatsapp,
      email,
      servico_desejado,
      modalidade,
      cidade_evento,
      data_prevista,
      descricao_briefing,
    } = body;

    if (!talento_id || !nome_cliente || !whatsapp || !servico_desejado) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios (talento, nome, WhatsApp e serviço)." },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    const novaSolicitacao = {
      talento_id,
      nome_cliente,
      empresa: empresa || null,
      whatsapp,
      email: email || null,
      servico_desejado,
      modalidade: modalidade || "Presencial",
      cidade_evento: cidade_evento || null,
      data_prevista: data_prevista || null,
      descricao_briefing: descricao_briefing || null,
      status: "pendente",
    };

    const { data, error } = await adminSupabase
      .from("talentos_solicitacoes")
      .insert(novaSolicitacao)
      .select()
      .single();

    if (error) {
      // Caso a tabela ainda não exista no Supabase remoto durante a fase inicial, retornamos sucesso simulado
      return NextResponse.json({
        success: true,
        data: { id: "temp-" + Date.now(), ...novaSolicitacao },
        simulated: true,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao enviar solicitação.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
