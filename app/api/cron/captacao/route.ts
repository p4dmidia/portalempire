import { NextResponse } from "next/server";
import { executarCaptacao } from "@/lib/captacao/executar";

export const maxDuration = 60; // 60 segundos de timeout na Vercel
export const dynamic = "force-dynamic";

async function handleCaptacao(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") !== null;
  const cronSecret = process.env.CRON_SECRET;

  // Se houver CRON_SECRET válido configurado, valida (a menos que seja chamada oficial Vercel Cron ou ambiente dev)
  if (
    cronSecret &&
    cronSecret !== "dummy-cron-secret" &&
    !isVercelCron &&
    authHeader !== `Bearer ${cronSecret}` &&
    process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json(
      { error: "Não autorizado: token CRON_SECRET inválido ou ausente." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const forcar = searchParams.get("forcar") === "true";
    const resultado = await executarCaptacao({ manual: false, forcar });
    return NextResponse.json({
      success: true,
      message: "Captação RSS executada com sucesso.",
      data: resultado,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido ao executar captação.";
    console.error("Erro no cron de captação RSS:", error);
    return NextResponse.json(
      { success: false, error: mensagem },
      { status: 500 }
    );
  }
}

// Vercel Cron dispara requisições HTTP GET
export async function GET(request: Request) {
  return handleCaptacao(request);
}

// Permite acionamento via POST
export async function POST(request: Request) {
  return handleCaptacao(request);
}

