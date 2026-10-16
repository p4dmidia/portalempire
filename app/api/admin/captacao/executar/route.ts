import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { executarCaptacao } from "@/lib/captacao/executar";

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    let body: { fonte_id?: string; forcar?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // Body opcional
    }

    const resultado = await executarCaptacao(
      {
        fonteId: body.fonte_id,
        manual: true,
        forcar: body.forcar !== false,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      data: resultado,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao executar captação manual.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
