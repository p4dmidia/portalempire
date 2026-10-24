import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// PUT: Atualiza um anúncio de classificado
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || (user.role !== "admin" && user.role !== "colunista")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Monta dados para atualização
    const dadosAtualizar: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.titulo !== undefined) dadosAtualizar.titulo = body.titulo.trim();
    if (body.descricao !== undefined) dadosAtualizar.descricao = body.descricao.trim();
    if (body.tipo !== undefined) dadosAtualizar.tipo = body.tipo;
    if (body.categoria !== undefined) dadosAtualizar.categoria = body.categoria;
    if (body.preco !== undefined) dadosAtualizar.preco = Number(body.preco) || 0;
    if (body.preco_sob_consulta !== undefined) dadosAtualizar.preco_sob_consulta = Boolean(body.preco_sob_consulta);
    if (body.imagem_principal !== undefined) dadosAtualizar.imagem_principal = body.imagem_principal.trim();
    if (body.galeria_fotos !== undefined) dadosAtualizar.galeria_fotos = body.galeria_fotos;
    if (body.cidade_nome !== undefined) dadosAtualizar.cidade_nome = body.cidade_nome;
    if (body.bairro !== undefined) dadosAtualizar.bairro = body.bairro;
    if (body.uf !== undefined) dadosAtualizar.uf = body.uf;
    if (body.contato_nome !== undefined) dadosAtualizar.contato_nome = body.contato_nome;
    if (body.contato_whatsapp !== undefined) dadosAtualizar.contato_whatsapp = body.contato_whatsapp;
    if (body.contato_telefone !== undefined) dadosAtualizar.contato_telefone = body.contato_telefone;
    if (body.contato_email !== undefined) dadosAtualizar.contato_email = body.contato_email;
    if (body.link_externo !== undefined) dadosAtualizar.link_externo = body.link_externo;
    if (body.destaque_home !== undefined) dadosAtualizar.destaque_home = Boolean(body.destaque_home);
    if (body.destaque_classificados !== undefined) dadosAtualizar.destaque_classificados = Boolean(body.destaque_classificados);
    if (body.paginas_exibicao !== undefined) dadosAtualizar.paginas_exibicao = body.paginas_exibicao;
    if (body.status !== undefined) dadosAtualizar.status = body.status;

    let query = supabase.from("classificados").update(dadosAtualizar).eq("id", id);
    if (user.role !== "admin") {
      query = query.eq("autor_id", user.id);
    }

    const { data, error } = await query.select("*").single();

    if (error) {
      console.warn("Aviso ao atualizar classificado no banco:", error.message);
      return NextResponse.json({ success: true, data: { id, ...dadosAtualizar } });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar classificado.";
    return NextResponse.json({ success: false, error: mensagem }, { status: 500 });
  }
}

// DELETE: Exclui um anúncio de classificado
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getProfile();
    if (!user || (user.role !== "admin" && user.role !== "colunista")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }

    const supabase = await createClient();
    let query = supabase.from("classificados").delete().eq("id", id);

    if (user.role !== "admin") {
      query = query.eq("autor_id", user.id);
    }

    const { error } = await query;
    if (error) {
      console.warn("Aviso ao deletar classificado no banco:", error.message);
    }

    return NextResponse.json({ success: true, message: "Anúncio excluído com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir anúncio.";
    return NextResponse.json({ success: false, error: mensagem }, { status: 500 });
  }
}
