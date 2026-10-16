import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const AnuncianteUpdateSchema = z.object({
  nome: z.string().optional(),
  nome_contato: z.string().optional(),
  empresa: z.string().nullable().optional(),
  cpf_cnpj: z.string().nullable().optional(),
  documento: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  telefone: z.string().nullable().optional(),
});

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const { id } = await props.params;
    const body = await request.json();
    const dados = AnuncianteUpdateSchema.parse(body);

    const supabase = await createClient();

    const { data: existente } = await supabase
      .from("anunciantes")
      .select("id, cadastrado_por")
      .eq("id", id)
      .single();

    if (!existente) {
      return NextResponse.json({ error: "Anunciante não encontrado." }, { status: 404 });
    }

    if (profile.role !== "admin" && existente.cadastrado_por !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const payloadUpdate: Record<string, unknown> = {};
    if (dados.nome || dados.nome_contato || dados.empresa) {
      payloadUpdate.nome =
        dados.nome ||
        (dados.empresa && dados.nome_contato
          ? `${dados.empresa} (${dados.nome_contato})`
          : dados.empresa || dados.nome_contato);
    }
    if (dados.cpf_cnpj !== undefined || dados.documento !== undefined) {
      payloadUpdate.cpf_cnpj = dados.cpf_cnpj || dados.documento || null;
    }
    if (dados.email !== undefined) {
      payloadUpdate.email = dados.email || null;
    }
    if (dados.telefone !== undefined) {
      payloadUpdate.telefone = dados.telefone || null;
    }

    const { data: atualizado, error } = await supabase
      .from("anunciantes")
      .update(payloadUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: atualizado });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem =
      error instanceof Error
        ? error.message
        : (error as { message?: string })?.message || "Erro ao atualizar anunciante.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const { id } = await props.params;

    const supabase = await createClient();

    const { data: existente } = await supabase
      .from("anunciantes")
      .select("id, cadastrado_por")
      .eq("id", id)
      .single();

    if (!existente) {
      return NextResponse.json({ error: "Anunciante não encontrado." }, { status: 404 });
    }

    if (profile.role !== "admin" && existente.cadastrado_por !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { error } = await supabase
      .from("anunciantes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Anunciante excluído com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir anunciante.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
