import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const supabase = getSupabaseAdmin();

    // 1. Buscar o anúncio para obter link_destino
    const { data: anuncio, error } = await supabase
      .from("anuncios")
      .select("id, link_destino, status")
      .eq("id", id)
      .single();

    if (error || !anuncio || !anuncio.link_destino) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Incrementar contagem de cliques via RPC
    try {
      await supabase.rpc("incrementar_metrica", {
        p_anuncio_id: id,
        p_tipo: "clique",
      });
    } catch (rpcErr) {
      console.error("Erro ao registrar clique:", rpcErr);
    }

    // 3. Redirecionar (302) para o link do anunciante
    return NextResponse.redirect(anuncio.link_destino, 302);
  } catch (err) {
    console.error("Erro no redirecionamento do anúncio:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
