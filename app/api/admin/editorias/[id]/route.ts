import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const updateEditoriaSchema = z.object({
  nome: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  pai_id: z.string().uuid().optional().nullable(),
  exibir_menu: z.boolean().optional(),
  exibir_home: z.boolean().optional(),
  ordem_menu: z.number().int().optional(),
  ordem_home: z.number().int().optional(),
  cor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional().nullable(),
  palavras_chave: z.array(z.string()).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateEditoriaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: updated, error } = await supabase
      .from("categorias")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "EDITAR_EDITORIA",
      entidade: "categorias",
      entidadeId: id,
      dados: parsed.data,
    });

    revalidatePath("/");
    revalidatePath("/editoria/" + updated.slug);

    return NextResponse.json({
      success: true,
      editoria: updated,
      message: "Editoria atualizada com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();

    // Validar se tem matérias vinculadas
    const { count: countMaterias } = await supabase
      .from("materias")
      .select("id", { count: "exact", head: true })
      .eq("categoria_id", id);

    if (countMaterias && countMaterias > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: existem ${countMaterias} matéria(s) vinculadas a esta editoria.` },
        { status: 400 }
      );
    }

    // Validar se tem subcategorias
    const { count: countFilhas } = await supabase
      .from("categorias")
      .select("id", { count: "exact", head: true })
      .eq("pai_id", id);

    if (countFilhas && countFilhas > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: existem ${countFilhas} subeditoria(s) vinculadas a esta editoria.` },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "EXCLUIR_EDITORIA",
      entidade: "categorias",
      entidadeId: id,
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Editoria excluída com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
