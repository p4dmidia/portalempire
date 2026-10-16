import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: fontes, error } = await supabase
      .from("fontes_rss")
      .select(`
        *,
        categoria_padrao:categorias(id, nome),
        cidade_padrao:cidades(id, nome)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: fontes });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar fontes RSS.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const supabase = await createClient();

    const { data: portal } = await supabase
      .from("portais")
      .select("id")
      .limit(1)
      .single();

    if (!portal) throw new Error("Nenhum portal cadastrado.");

    const {
      nome,
      veiculo,
      url_feed,
      categoria_padrao_id,
      cidade_padrao_id,
      ativo = true,
      intervalo_minutos = 15,
      max_itens_por_execucao = 20,
      publicar_automatico = true,
    } = body;

    if (!nome || !veiculo || !url_feed || !categoria_padrao_id) {
      return NextResponse.json(
        { error: "Nome, veículo, URL do feed e categoria padrão são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: novaFonte, error } = await supabase
      .from("fontes_rss")
      .insert({
        portal_id: portal.id,
        nome,
        veiculo,
        url_feed,
        categoria_padrao_id,
        cidade_padrao_id: cidade_padrao_id || null,
        ativo,
        intervalo_minutos: Number(intervalo_minutos) || 15,
        max_itens_por_execucao: Number(max_itens_por_execucao) || 20,
        publicar_automatico: Boolean(publicar_automatico),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: novaFonte }, { status: 201 });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao criar fonte RSS.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
