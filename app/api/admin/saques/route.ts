import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    const { data: saques, error } = await supabase
      .from("saques_afiliados")
      .select(`
        *,
        colunista:profiles!colunista_id(id, nome, email, slug, foto_url)
      `)
      .order("solicitado_em", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ saques: saques || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao listar saques.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
