import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const nowIso = new Date().toISOString();

    // 1. Buscar matérias agendadas cuja data já chegou
    const { data: agendadas, error: fetchError } = await supabaseAdmin
      .from("materias")
      .select("id, slug")
      .eq("status", "agendado")
      .lte("publicado_em", nowIso);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!agendadas || agendadas.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhuma matéria agendada para publicação no momento.",
        publicadas: 0,
      });
    }

    const ids = agendadas.map((m) => m.id);

    // 2. Atualizar status para 'publicado'
    const { error: updateError } = await supabaseAdmin
      .from("materias")
      .update({ status: "publicado" })
      .in("id", ids);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Revalidar cache do portal
    revalidatePath("/");
    agendadas.forEach((m) => revalidatePath(`/materia/${m.slug}`));

    return NextResponse.json({
      success: true,
      message: `${agendadas.length} matérias agendadas foram publicadas com sucesso.`,
      publicadas: agendadas.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
