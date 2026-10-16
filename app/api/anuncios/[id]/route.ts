import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const AnuncioUpdateSchema = z.object({
  titulo: z.string().min(3).optional(),
  imagem_desktop_url: z.string().url().optional(),
  imagem_mobile_url: z.string().url().nullable().optional().or(z.literal("")),
  link_destino: z.string().url().optional(),
  inicio_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fim_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["aguardando_pagamento", "ativo", "pausado", "expirado", "cancelado"]).optional(),
  valor: z.number().min(0).optional(),
});

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista", "anunciante"]);
    const { id } = await props.params;

    const supabase = getSupabaseAdmin();
    const { data: anuncio, error } = await supabase
      .from("anuncios")
      .select(`
        *,
        espaco:espacos_anuncio(
          id, nome, dono_tipo, preco_mensal, preco_semanal,
          formato:formatos_anuncio(id, nome, posicao, largura, altura, largura_mobile, altura_mobile),
          coluna:colunas(id, nome, slug)
        ),
        anunciante:anunciantes(id, nome, email, telefone, cpf_cnpj, usuario_id),
        dono:profiles!dono_id(id, nome, email)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!anuncio) {
      return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });
    }

    if (profile.role !== "admin" && anuncio.dono_id !== profile.id && anuncio.anunciante?.usuario_id !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: anuncio });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao buscar anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const { id } = await props.params;
    const body = await request.json();
    const dados = AnuncioUpdateSchema.parse(body);

    const supabase = getSupabaseAdmin();

    const { data: anuncioExistente } = await supabase
      .from("anuncios")
      .select("id, espaco_id, dono_id, inicio_em, fim_em, status")
      .eq("id", id)
      .single();

    if (!anuncioExistente) {
      return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });
    }

    if (profile.role !== "admin" && anuncioExistente.dono_id !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const novoInicio = dados.inicio_em || anuncioExistente.inicio_em;
    const novoFim = dados.fim_em || anuncioExistente.fim_em;
    const novoStatus = dados.status || anuncioExistente.status;

    // Verificar sobreposição de datas se status for ativo/aguardando_pagamento
    if (["ativo", "aguardando_pagamento"].includes(novoStatus)) {
      const { data: sobrepostos } = await supabase
        .from("anuncios")
        .select("id, titulo, inicio_em, fim_em")
        .eq("espaco_id", anuncioExistente.espaco_id)
        .neq("id", id)
        .in("status", ["ativo", "aguardando_pagamento"])
        .lte("inicio_em", novoFim)
        .gte("fim_em", novoInicio);

      if (sobrepostos && sobrepostos.length > 0) {
        const conflito = sobrepostos[0];
        return NextResponse.json(
          {
            error: `Conflito de período: o anúncio "${conflito.titulo}" já está ativo neste espaço entre ${conflito.inicio_em} e ${conflito.fim_em}.`,
          },
          { status: 409 }
        );
      }
    }

    const { data: atualizado, error } = await supabase
      .from("anuncios")
      .update(dados)
      .eq("id", id)
      .select(`
        *,
        espaco:espacos_anuncio(
          id, nome, dono_tipo,
          formato:formatos_anuncio(nome, posicao, largura, altura)
        ),
        anunciante:anunciantes(id, nome)
      `)
      .single();

    if (error) throw error;

    try {
      revalidatePath("/");
      revalidatePath("/colunas");
    } catch {
      // Ignore cache in dev
    }

    return NextResponse.json({ success: true, data: atualizado });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar anúncio.";
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

    const supabase = getSupabaseAdmin();

    const { data: existente } = await supabase
      .from("anuncios")
      .select("id, dono_id")
      .eq("id", id)
      .single();

    if (!existente) {
      return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });
    }

    if (profile.role !== "admin" && existente.dono_id !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { error } = await supabase
      .from("anuncios")
      .delete()
      .eq("id", id);

    if (error) throw error;

    try {
      revalidatePath("/");
      revalidatePath("/colunas");
    } catch {
      // Ignore cache in dev
    }

    return NextResponse.json({ success: true, message: "Anúncio excluído com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
