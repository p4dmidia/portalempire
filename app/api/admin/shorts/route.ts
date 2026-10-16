import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const shortSchema = z.object({
  youtube_id: z.string().min(1, "YouTube ID ou URL do vídeo é obrigatório."),
  titulo: z.string().min(2, "Título deve ter pelo menos 2 caracteres."),
  ordem: z.number().int().default(0),
  ativo: z.boolean().default(true),
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

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: shorts, error } = await supabase
      .from("shorts")
      .select("*")
      .order("ordem", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ shorts: shorts || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = shortSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const cleanYoutubeId = extrairYouTubeId(parsed.data.youtube_id);
    const supabase = await createClient();

    const { data: portal } = await supabase.from("portais").select("id").limit(1).single();
    if (!portal) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 404 });
    }

    const { data: newShort, error } = await supabase
      .from("shorts")
      .insert({
        portal_id: portal.id,
        youtube_id: cleanYoutubeId,
        titulo: parsed.data.titulo,
        ordem: parsed.data.ordem,
        ativo: parsed.data.ativo,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "CRIAR_SHORT",
      entidade: "shorts",
      entidadeId: newShort.id,
      dados: { titulo: parsed.data.titulo, youtube_id: cleanYoutubeId },
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      short: newShort,
      message: "Vídeo Short cadastrado com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
