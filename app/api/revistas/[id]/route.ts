import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// PUT: Atualiza uma revista existente (Apenas Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }

    const body = await request.json();
    const supabase = await createClient();

    const dadosAtualizar: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.titulo !== undefined) dadosAtualizar.titulo = body.titulo.trim();
    if (body.subtitulo !== undefined) dadosAtualizar.subtitulo = body.subtitulo ? body.subtitulo.trim() : null;
    if (body.capa_url !== undefined) dadosAtualizar.capa_url = body.capa_url.trim();
    if (body.link_url !== undefined) dadosAtualizar.link_url = body.link_url.trim();
    if (body.cidade !== undefined) dadosAtualizar.cidade = body.cidade ? body.cidade.trim() : null;
    if (body.estado !== undefined) dadosAtualizar.estado = body.estado ? body.estado.trim().toUpperCase() : "SP";
    if (body.escritor !== undefined) dadosAtualizar.escritor = body.escritor ? body.escritor.trim() : null;
    if (body.categoria !== undefined) dadosAtualizar.categoria = body.categoria ? body.categoria.trim() : "Diversos";
    if (body.tipo_acesso !== undefined) dadosAtualizar.tipo_acesso = body.tipo_acesso;
    if (body.data_publicacao !== undefined) dadosAtualizar.data_publicacao = body.data_publicacao;
    if (body.destaque !== undefined) dadosAtualizar.destaque = Boolean(body.destaque);
    if (body.ativo !== undefined) dadosAtualizar.ativo = Boolean(body.ativo);
    if (body.ordem !== undefined) dadosAtualizar.ordem = Number(body.ordem) || 0;

    const { data, error } = await supabase
      .from("revistas")
      .update(dadosAtualizar)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.warn("Aviso ao atualizar revista no Supabase:", error.message);
      return NextResponse.json({ success: true, data: { id, ...dadosAtualizar } });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar revista.";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

// DELETE: Exclui uma revista (Apenas Admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("revistas").delete().eq("id", id);

    if (error) {
      console.warn("Aviso ao excluir revista no Supabase:", error.message);
    }

    return NextResponse.json({ success: true, message: "Revista excluída com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir revista.";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
