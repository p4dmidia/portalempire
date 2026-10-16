import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await props.params;
    const supabase = await createClient();

    const { data: fonte, error } = await supabase
      .from("fontes_rss")
      .select(`
        *,
        categoria_padrao:categorias(id, nome),
        cidade_padrao:cidades(id, nome)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!fonte) {
      return NextResponse.json({ error: "Fonte RSS não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: fonte });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao buscar fonte RSS.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await props.params;
    const body = await request.json();
    const supabase = await createClient();

    const {
      nome,
      veiculo,
      url_feed,
      categoria_padrao_id,
      cidade_padrao_id,
      ativo,
      intervalo_minutos,
      max_itens_por_execucao,
      publicar_automatico,
    } = body;

    const updates: Record<string, unknown> = {};
    if (nome !== undefined) updates.nome = nome;
    if (veiculo !== undefined) updates.veiculo = veiculo;
    if (url_feed !== undefined) updates.url_feed = url_feed;
    if (categoria_padrao_id !== undefined) updates.categoria_padrao_id = categoria_padrao_id;
    if (cidade_padrao_id !== undefined) updates.cidade_padrao_id = cidade_padrao_id || null;
    if (ativo !== undefined) updates.ativo = Boolean(ativo);
    if (intervalo_minutos !== undefined) updates.intervalo_minutos = Number(intervalo_minutos);
    if (max_itens_por_execucao !== undefined) updates.max_itens_por_execucao = Number(max_itens_por_execucao);
    if (publicar_automatico !== undefined) updates.publicar_automatico = Boolean(publicar_automatico);

    const { data: fonteAtualizada, error } = await supabase
      .from("fontes_rss")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: fonteAtualizada });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar fonte RSS.";
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

    const { error } = await supabase.from("fontes_rss").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Fonte RSS excluída com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir fonte RSS.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
