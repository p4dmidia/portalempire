import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 10;

// GET: Retorna um totem específico
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSupabase = getSupabaseAdmin();
    const { data, error } = await adminSupabase
      .from("totens")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Totem não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao buscar totem.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT / PATCH: Atualiza um totem (Apenas Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado. Apenas administradores podem atualizar totens." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const adminSupabase = getSupabaseAdmin();

    const updatePayload: Record<string, any> = { ...body };
    delete updatePayload.id;
    delete updatePayload.created_at;
    delete updatePayload.updated_at;

    let { data, error } = await adminSupabase
      .from("totens")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error && (error.message?.includes("cep") || error.message?.includes("tipo_modelo") || error.code === "42703")) {
      const { cep: _c, tipo_modelo: _tm, preco_mensal: _pm, ...payloadSemExtras } = updatePayload;
      const retry = await adminSupabase
        .from("totens")
        .update(payloadSemExtras)
        .eq("id", id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/totens");
      if (data?.slug) {
        revalidatePath(`/totens/${data.slug}`);
      }
      revalidateTag("totens");
    } catch {}

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao atualizar totem.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const PATCH = PUT;

// DELETE: Remove um totem (Apenas Admin)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado. Apenas administradores podem remover totens." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const adminSupabase = getSupabaseAdmin();

    const { error } = await adminSupabase
      .from("totens")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/totens");
      revalidateTag("totens");
    } catch {}

    return NextResponse.json({ success: true, message: "Totem removido com sucesso." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao remover totem.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
