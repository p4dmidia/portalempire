import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Cache em memória simples para evitar abusos/flooding na mesma sessão/IP
const recentImpressions = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { anuncio_id } = body;

    if (!anuncio_id || typeof anuncio_id !== "string") {
      return NextResponse.json({ error: "anuncio_id inválido." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const key = `${ip}:${anuncio_id}`;
    const now = Date.now();
    const lastImp = recentImpressions.get(key);

    // Limite de 1 impressão contada a cada 30 segundos por IP/Anúncio
    if (lastImp && now - lastImp < 30000) {
      return NextResponse.json({ success: true, rate_limited: true });
    }

    recentImpressions.set(key, now);

    // Limpeza de cache antigo periodicamente
    if (recentImpressions.size > 5000) {
      for (const [k, time] of recentImpressions.entries()) {
        if (now - time > 60000) recentImpressions.delete(k);
      }
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.rpc("incrementar_metrica", {
      p_anuncio_id: anuncio_id,
      p_tipo: "impressao",
    });

    if (error) {
      console.error("Erro ao incrementar impressão de anúncio:", error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Falha ao registrar impressão." }, { status: 400 });
  }
}
