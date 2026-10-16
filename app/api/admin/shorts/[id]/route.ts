import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const updateShortSchema = z.object({
  youtube_id: z.string().min(1).optional(),
  titulo: z.string().min(2).optional(),
  ordem: z.number().int().optional(),
  ativo: z.boolean().optional(),
});

function extrairYouTubeId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (trimmed.includes("youtube.com/shorts/")) {
    const parts = trimmed.split("youtube.com/shorts/")[1];
    return parts.split("?")[0].split("/")[0];
  }
  if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/")[1];
    return parts.split("?")[0].split("/")[0];
  }
  if (trimmed.includes("youtube.com/watch")) {
    try {
      const url = new URL(trimmed);
      return url.searchParams.get("v") || trimmed;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateShortSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.youtube_id !== undefined) {
      updatePayload.youtube_id = extrairYouTubeId(parsed.data.youtube_id);
    }
    if (parsed.data.titulo !== undefined) updatePayload.titulo = parsed.data.titulo;
    if (parsed.data.ordem !== undefined) updatePayload.ordem = parsed.data.ordem;
    if (parsed.data.ativo !== undefined) updatePayload.ativo = parsed.data.ativo;

    const supabase = await createClient();
    const { data: updated, error } = await supabase
      .from("shorts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "EDITAR_SHORT",
      entidade: "shorts",
      entidadeId: id,
      dados: updatePayload,
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      short: updated,
      message: "Short atualizado com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("shorts").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "EXCLUIR_SHORT",
      entidade: "shorts",
      entidadeId: id,
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Short excluído com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
