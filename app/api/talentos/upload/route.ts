import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pasta = (formData.get("pasta") as string) || "candidatos";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas arquivos de imagem são permitidos." }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `talentos/${pasta}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Tentar upload no bucket 'talentos'
    let uploadRes = await adminSupabase.storage
      .from("talentos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    let bucketUsado = "talentos";

    // 2. Fallback no bucket 'materias' se 'talentos' não existir ou falhar
    if (uploadRes.error) {
      uploadRes = await adminSupabase.storage
        .from("materias")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });
      bucketUsado = "materias";
    }

    if (uploadRes.error) {
      console.error("[Upload Talentos Error]", uploadRes.error);
      return NextResponse.json(
        { error: `Erro no upload: ${uploadRes.error.message}` },
        { status: 500 }
      );
    }

    const { data: publicData } = adminSupabase.storage
      .from(bucketUsado)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno no upload.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
