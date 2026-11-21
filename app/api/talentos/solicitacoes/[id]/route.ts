import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 10;

// PATCH: Atualiza status ou notas de uma solicitação (Apenas Admin)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const adminSupabase = getSupabaseAdmin();

    const { data, error } = await adminSupabase
      .from("talentos_solicitacoes")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao atualizar solicitação.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove uma solicitação (Apenas Admin)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { id } = await params;
    const adminSupabase = getSupabaseAdmin();

    const { error } = await adminSupabase
      .from("talentos_solicitacoes")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Solicitação removida com sucesso." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao remover solicitação.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
