import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin", "editor"]);
    const { id } = await props.params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const { status, categoria_id, cidade_id, titulo, resumo } = body;

    const updates: Record<string, unknown> = {};
    if (status !== undefined) {
      updates.status = status;
      if (status === "publicado") {
        updates.publicado_em = new Date().toISOString();
      }
    }
    if (categoria_id !== undefined) updates.categoria_id = categoria_id;
    if (cidade_id !== undefined) updates.cidade_id = cidade_id || null;
    if (titulo !== undefined) updates.titulo = titulo;
    if (resumo !== undefined) updates.resumo = resumo;

    const { data: materia, error } = await supabase
      .from("materias")
      .update(updates)
      .eq("id", id)
      .select("*, categoria:categorias(slug), cidade:cidades(slug)")
      .single();

    if (error) throw error;

    try {
      revalidatePath("/");
      revalidatePath(`/materia/${materia.slug}`);
      const catSlug = Array.isArray(materia.categoria)
        ? materia.categoria[0]?.slug
        : (materia.categoria as { slug?: string } | null)?.slug;
      if (catSlug) {
        revalidatePath(`/categoria/${catSlug}`);
      }
      const cidSlug = Array.isArray(materia.cidade)
        ? materia.cidade[0]?.slug
        : (materia.cidade as { slug?: string } | null)?.slug;
      if (cidSlug) {
        revalidatePath(`/cidade/${cidSlug}`);
      }
    } catch {
      // Ignore cache error in dev
    }

    return NextResponse.json({ success: true, data: materia });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar matéria captada.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await props.params;
    const supabase = getSupabaseAdmin();

    const { data: materia } = await supabase
      .from("materias")
      .select("slug, categoria:categorias(slug), cidade:cidades(slug)")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("materias").delete().eq("id", id);
    if (error) throw error;

    if (materia) {
      try {
        revalidatePath("/");
        revalidatePath(`/materia/${materia.slug}`);
        const catSlug = Array.isArray(materia.categoria)
          ? materia.categoria[0]?.slug
          : (materia.categoria as { slug?: string } | null)?.slug;
        if (catSlug) {
          revalidatePath(`/categoria/${catSlug}`);
        }
      } catch {
        // Ignore cache error
      }
    }

    return NextResponse.json({ success: true, message: "Matéria excluída com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir matéria.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
