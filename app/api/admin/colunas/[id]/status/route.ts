import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await props.params;
    const { status } = await request.json();

    if (!["ativa", "pendente", "suspensa"].includes(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: coluna, error } = await supabase
      .from("colunas")
      .update({ status })
      .eq("id", id)
      .select("*, cidade:cidades(slug)")
      .single();

    if (error) throw error;

    try {
      revalidatePath("/");
      revalidatePath("/colunas");
      revalidatePath(`/coluna/${coluna.slug}`);
      const cidSlug = Array.isArray(coluna.cidade)
        ? coluna.cidade[0]?.slug
        : (coluna.cidade as { slug?: string } | null)?.slug;
      if (cidSlug) {
        revalidatePath(`/cidade/${cidSlug}`);
      }
    } catch {
      // Ignore cache in dev
    }

    return NextResponse.json({
      success: true,
      data: coluna,
      message: `Status da coluna alterado para "${status}".`,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao alterar status da coluna.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
