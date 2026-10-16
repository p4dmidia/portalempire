import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await props.params;

    const supabase = getSupabaseAdmin();

    const { data: pedido, error: fetchError } = await supabase
      .from("pedidos")
      .select(`
        *,
        anuncio:anuncios(id, titulo, inicio_em, fim_em, status)
      `)
      .eq("id", id)
      .single();

    if (fetchError || !pedido) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    // Atualizar pedido para pago
    const { error: updatePedidoError } = await supabase
      .from("pedidos")
      .update({
        status: "pago",
        pago_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updatePedidoError) throw updatePedidoError;

    // Ativar o anúncio correspondente
    const anuncio = Array.isArray(pedido.anuncio) ? pedido.anuncio[0] : pedido.anuncio;
    if (anuncio) {
      const hoje = new Date().toISOString().slice(0, 10);
      let novoStatus = "ativo";
      if (anuncio.inicio_em > hoje) novoStatus = "agendado";
      else if (anuncio.fim_em < hoje) novoStatus = "expirado";

      await supabase
        .from("anuncios")
        .update({
          status: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", anuncio.id);

      try {
        revalidatePath("/");
        revalidatePath("/colunas");
      } catch {
        // Ignore in dev
      }
    }

    return NextResponse.json({ success: true, message: "Pagamento confirmado manualmente com sucesso!" });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao confirmar pagamento manual.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
