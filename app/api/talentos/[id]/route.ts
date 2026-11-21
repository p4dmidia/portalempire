import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 10;

// GET: Retorna um talento específico
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSupabase = getSupabaseAdmin();
    const { data, error } = await adminSupabase
      .from("talentos")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Talento não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao buscar talento.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT / PATCH: Atualiza um talento (Apenas Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado. Apenas administradores podem atualizar talentos." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const adminSupabase = getSupabaseAdmin();

    // Sanitiza payload: remove campos de controle e metadados
    const updatePayload: Record<string, any> = { ...body };
    delete updatePayload.id;
    delete updatePayload.created_at;
    delete updatePayload.updated_at;

    // Tenta atualizar
    let { data, error } = await adminSupabase
      .from("talentos")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    // Fallback 1: se o banco ainda não tiver a coluna 'whatsapp' no schema físico
    if (error && (error.message?.includes("whatsapp") || error.code === "42703" || error.code === "PGRST204")) {
      const { whatsapp, ...payloadSemWhatsapp } = updatePayload;
      if (whatsapp && payloadSemWhatsapp.redes_sociais) {
        payloadSemWhatsapp.redes_sociais.whatsapp = whatsapp;
      }
      const retry = await adminSupabase
        .from("talentos")
        .update(payloadSemWhatsapp)
        .eq("id", id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    // Fallback 2: se o talento for um dos mocks iniciais (não persistido no banco ainda)
    if (error && (error.code === "PGRST116" || error.message?.includes("0 rows"))) {
      let insertRes = await adminSupabase
        .from("talentos")
        .insert({ ...updatePayload, id })
        .select()
        .single();

      if (insertRes.error && (insertRes.error.message?.includes("whatsapp") || insertRes.error.code === "42703")) {
        const { whatsapp, ...insertSemWhatsapp } = updatePayload;
        if (whatsapp && insertSemWhatsapp.redes_sociais) {
          insertSemWhatsapp.redes_sociais.whatsapp = whatsapp;
        }
        insertRes = await adminSupabase
          .from("talentos")
          .insert({ ...insertSemWhatsapp, id })
          .select()
          .single();
      }

      if (!insertRes.error && insertRes.data) {
        data = insertRes.data;
        error = null;
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/talentos");
      if (data?.slug) {
        revalidatePath(`/talentos/${data.slug}`);
      }
      revalidateTag("talentos");
    } catch {}

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao atualizar talento.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const PATCH = PUT;

// DELETE: Remove um talento (Apenas Admin)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado. Apenas administradores podem remover talentos." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const adminSupabase = getSupabaseAdmin();

    const { error } = await adminSupabase
      .from("talentos")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/talentos");
      revalidateTag("talentos");
    } catch {}

    return NextResponse.json({ success: true, message: "Talento removido com sucesso." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao remover talento.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
