import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    let { data: coluna, error } = await supabase
      .from("colunas")
      .update({ status })
      .eq("id", id)
      .select("*, cidade:cidades(slug)")
      .maybeSingle();

    if (error || !coluna) {
      const resAdmin = await supabaseAdmin
        .from("colunas")
        .update({ status })
        .eq("id", id)
        .select("*, cidade:cidades(slug)")
        .maybeSingle();
      if (resAdmin.data) {
        coluna = resAdmin.data;
        error = null;
      }
    }

    if (error || !coluna) throw error || new Error("Coluna não encontrada.");

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
