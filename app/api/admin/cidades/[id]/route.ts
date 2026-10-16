import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const updateCidadeSchema = z.object({
  nome: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  uf: z.string().length(2).toUpperCase().optional(),
  destaque_menu: z.boolean().optional(),
  ordem: z.number().int().optional(),
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
    const parsed = updateCidadeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: updated, error } = await supabase
      .from("cidades")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "EDITAR_CIDADE",
      entidade: "cidades",
      entidadeId: id,
      dados: parsed.data,
    });

    revalidatePath("/");
    revalidatePath("/cidades");
    revalidatePath("/cidade/" + updated.slug);

    return NextResponse.json({
      success: true,
      cidade: updated,
      message: "Cidade atualizada com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();

    // Validar se tem matérias ou colunas vinculadas
    const [{ count: countMaterias }, { count: countColunas }] = await Promise.all([
      supabase.from("materias").select("id", { count: "exact", head: true }).eq("cidade_id", id),
      supabase.from("colunas").select("id", { count: "exact", head: true }).eq("cidade_id", id),
    ]);

    if (countMaterias && countMaterias > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: existem ${countMaterias} matéria(s) associadas a esta cidade.` },
        { status: 400 }
      );
    }

    if (countColunas && countColunas > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: existem ${countColunas} coluna(s) associadas a esta cidade.` },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("cidades").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "EXCLUIR_CIDADE",
      entidade: "cidades",
      entidadeId: id,
    });

    revalidatePath("/");
    revalidatePath("/cidades");

    return NextResponse.json({
      success: true,
      message: "Cidade excluída com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
