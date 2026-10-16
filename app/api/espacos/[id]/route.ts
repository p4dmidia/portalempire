import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const EspacoUpdateSchema = z.object({
  nome: z.string().min(3).optional(),
  preco_mensal: z.number().positive().optional(),
  preco_semanal: z.number().positive().nullable().optional(),
  ativo: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const { id } = await props.params;
    const body = await request.json();
    const dados = EspacoUpdateSchema.parse(body);

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Verificar permissão
    const { data: espaco } = await supabaseAdmin
      .from("espacos_anuncio")
      .select("id, dono_tipo, coluna_id, formato:formatos_anuncio(preco_minimo), coluna:colunas(dono_id)")
      .eq("id", id)
      .single();

    if (!espaco) {
      return NextResponse.json({ error: "Espaço de anúncio não encontrado." }, { status: 404 });
    }

    if (profile.role !== "admin") {
      const colunaDonoId = Array.isArray(espaco.coluna)
        ? espaco.coluna[0]?.dono_id
        : (espaco.coluna as { dono_id?: string } | null)?.dono_id;

      if (espaco.dono_tipo !== "coluna" || colunaDonoId !== profile.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    }

    // 2. Verificar piso de preço mínimo se preço mensal for alterado
    if (dados.preco_mensal !== undefined) {
      const precoMinimo = Array.isArray(espaco.formato)
        ? Number(espaco.formato[0]?.preco_minimo)
        : Number((espaco.formato as { preco_minimo?: number } | null)?.preco_minimo || 0);

      if (dados.preco_mensal < precoMinimo) {
        return NextResponse.json(
          { error: `O preço mensal não pode ser inferior ao preço mínimo do formato (R$ ${precoMinimo.toFixed(2)}).` },
          { status: 400 }
        );
      }
    }

    const { data: espacoAtualizado, error } = await supabaseAdmin
      .from("espacos_anuncio")
      .update(dados)
      .eq("id", id)
      .select(`
        *,
        formato:formatos_anuncio(*),
        coluna:colunas(id, nome, slug)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: espacoAtualizado });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar espaço de anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const { id } = await props.params;

    const supabaseAdmin = getSupabaseAdmin();

    const { data: espaco } = await supabaseAdmin
      .from("espacos_anuncio")
      .select("id, dono_tipo, coluna:colunas(dono_id)")
      .eq("id", id)
      .single();

    if (!espaco) {
      return NextResponse.json({ error: "Espaço não encontrado." }, { status: 404 });
    }

    if (profile.role !== "admin") {
      const colunaDonoId = Array.isArray(espaco.coluna)
        ? espaco.coluna[0]?.dono_id
        : (espaco.coluna as { dono_id?: string } | null)?.dono_id;

      if (espaco.dono_tipo !== "coluna" || colunaDonoId !== profile.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    }

    const { error } = await supabaseAdmin
      .from("espacos_anuncio")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Espaço de anúncio excluído com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir espaço.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
