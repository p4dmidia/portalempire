import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import * as z from "zod";

const configsSchema = z.object({
  comissao_padrao_percentual: z.number().min(0).max(100),
  autocadastro_colunista: z.boolean(),
  aprovar_colunas_manual: z.boolean(),
  captacao_ativa_global: z.boolean(),
  captacao_arquivar_dias: z.number().int().min(1).max(365),
  colunista_mensalidade_valor: z.number().min(0).optional(),
  afiliados_comissao_percentual: z.number().min(0).max(100).optional(),
  afiliados_saque_minimo: z.number().min(1).optional(),
  captacao_reescrita_automatica: z.boolean().optional(),
  gemini_api_key: z.string().optional(),
});

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: configs, error } = await supabase.from("configuracoes").select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const configMap: Record<string, unknown> = {
      comissao_padrao_percentual: 20,
      autocadastro_colunista: true,
      aprovar_colunas_manual: true,
      captacao_ativa_global: true,
      captacao_arquivar_dias: 30,
      colunista_mensalidade_valor: 97,
      afiliados_comissao_percentual: 20,
      afiliados_saque_minimo: 50,
      captacao_reescrita_automatica: true,
      gemini_api_key: "",
    };

    (configs || []).forEach((c) => {
      configMap[c.chave] = c.valor;
    });

    return NextResponse.json({ configs: configMap });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = configsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: portal } = await supabase.from("portais").select("id").limit(1).single();
    if (!portal) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 404 });
    }

    type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

    const entries: Array<{
      portal_id: string;
      chave: string;
      valor: JsonValue;
      descricao: string;
    }> = [
      {
        portal_id: portal.id,
        chave: "comissao_padrao_percentual",
        valor: parsed.data.comissao_padrao_percentual,
        descricao: "Percentual padrão de comissão da plataforma sobre anúncios",
      },
      {
        portal_id: portal.id,
        chave: "autocadastro_colunista",
        valor: parsed.data.autocadastro_colunista,
        descricao: "Permite autocadastro de colunistas com aprovação pendente",
      },
      {
        portal_id: portal.id,
        chave: "aprovar_colunas_manual",
        valor: parsed.data.aprovar_colunas_manual,
        descricao: "Exige aprovação do administrador para novas colunas",
      },
      {
        portal_id: portal.id,
        chave: "captacao_ativa_global",
        valor: parsed.data.captacao_ativa_global,
        descricao: "Controle mestre liga/desliga da captação RSS",
      },
      {
        portal_id: portal.id,
        chave: "captacao_arquivar_dias",
        valor: parsed.data.captacao_arquivar_dias,
        descricao: "Dias para arquivar matérias captadas automaticamente",
      },
      {
        portal_id: portal.id,
        chave: "colunista_mensalidade_valor",
        valor: parsed.data.colunista_mensalidade_valor ?? 97,
        descricao: "Valor padrão em reais da mensalidade cobrada dos colunistas",
      },
      {
        portal_id: portal.id,
        chave: "afiliados_comissao_percentual",
        valor: parsed.data.afiliados_comissao_percentual ?? 20,
        descricao: "Percentual de comissão recorrente pago ao colunista afiliado indicador",
      },
      {
        portal_id: portal.id,
        chave: "afiliados_saque_minimo",
        valor: parsed.data.afiliados_saque_minimo ?? 50,
        descricao: "Valor mínimo em reais para solicitação de saque PIX de comissões",
      },
      {
        portal_id: portal.id,
        chave: "captacao_reescrita_automatica",
        valor: parsed.data.captacao_reescrita_automatica ?? true,
        descricao: "Reescrita automática anti-plágio para matérias captadas",
      },
      {
        portal_id: portal.id,
        chave: "gemini_api_key",
        valor: parsed.data.gemini_api_key ?? "",
        descricao: "Chave da API do Google Gemini para reescrita por inteligência artificial",
      },
    ];

    for (const entry of entries) {
      const { error: upsertErr } = await supabase.from("configuracoes").upsert(
        {
          portal_id: entry.portal_id,
          chave: entry.chave,
          valor: entry.valor,
          descricao: entry.descricao,
        },
        { onConflict: "portal_id,chave" }
      );

      if (upsertErr) {
        return NextResponse.json({ error: upsertErr.message }, { status: 400 });
      }
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "ATUALIZAR_CONFIGURACOES_GLOBAIS",
      entidade: "configuracoes",
      dados: parsed.data,
    });

    return NextResponse.json({
      success: true,
      message: "Configurações gerais atualizadas com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
