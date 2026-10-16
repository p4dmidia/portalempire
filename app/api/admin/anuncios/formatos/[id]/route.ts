import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const FormatoUpdateSchema = z.object({
  nome: z.string().min(3).optional(),
  posicao: z.enum(["topo", "lateral", "meio_texto", "rodape", "home_entre_blocos"]).optional(),
  largura: z.number().int().positive().optional(),
  altura: z.number().int().positive().optional(),
  largura_mobile: z.number().int().positive().nullable().optional(),
  altura_mobile: z.number().int().positive().nullable().optional(),
  preco_minimo: z.number().min(0).optional(),
});

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await props.params;
    const body = await request.json();
    const dados = FormatoUpdateSchema.parse(body);

    const supabase = await createClient();
    const { data: formato, error } = await supabase
      .from("formatos_anuncio")
      .update(dados)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: formato });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar formato.";
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
    const supabase = await createClient();

    const { error } = await supabase
      .from("formatos_anuncio")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Formato excluído com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir formato.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
