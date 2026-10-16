import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: configs, error } = await supabase
      .from("configuracoes")
      .select("chave, valor, descricao")
      .in("chave", ["captacao_ativa_global", "captacao_arquivar_dias"]);

    if (error) throw error;

    const configMap: Record<string, unknown> = {
      captacao_ativa_global: true,
      captacao_arquivar_dias: 30,
    };

    configs?.forEach((c) => {
      configMap[c.chave] = c.valor;
    });

    return NextResponse.json({ success: true, data: configMap });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao carregar configurações de captação.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const supabase = await createClient();

    const { data: portal } = await supabase.from("portais").select("id").limit(1).single();
    if (!portal) throw new Error("Portal não encontrado.");

    const { captacao_ativa_global, captacao_arquivar_dias } = body;

    const upserts = [];

    if (captacao_ativa_global !== undefined) {
      upserts.push(
        supabase.from("configuracoes").upsert(
          {
            portal_id: portal.id,
            chave: "captacao_ativa_global",
            valor: Boolean(captacao_ativa_global),
            descricao: "Liga/Desliga global da captação automática de notícias via RSS",
          },
          { onConflict: "portal_id,chave" }
        )
      );
    }

    if (captacao_arquivar_dias !== undefined) {
      upserts.push(
        supabase.from("configuracoes").upsert(
          {
            portal_id: portal.id,
            chave: "captacao_arquivar_dias",
            valor: Number(captacao_arquivar_dias) || 0,
            descricao: "Dias para arquivamento automático de matérias captadas via RSS (0 = desativado)",
          },
          { onConflict: "portal_id,chave" }
        )
      );
    }

    await Promise.all(upserts);

    return NextResponse.json({ success: true, message: "Configurações atualizadas com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao salvar configurações de captação.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
