import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ColunaUpdateSchema = z.object({
  nome: z.string().min(3).optional(),
  slug: z.string().min(3).optional(),
  cidade_id: z.string().uuid().nullable().optional(),
  descricao: z.string().max(500).nullable().optional(),
  capa_url: z.string().url().nullable().optional(),
  aceita_anuncios: z.boolean().optional(),
  status: z.enum(["pendente", "ativa", "suspensa"]).optional(),
});

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRole(["admin", "colunista", "editor"]);
    const { id } = await props.params;
    const supabase = await createClient();

    const { data: coluna, error } = await supabase
      .from("colunas")
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf),
        dono:profiles(id, nome, email, foto_url, slug)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!coluna) {
      return NextResponse.json({ error: "Coluna não encontrada." }, { status: 404 });
    }

    // Se não for admin, só pode acessar a sua própria
    if (profile.role !== "admin" && coluna.dono_id !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: coluna });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao buscar coluna.";
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
    const dadosValidados = ColunaUpdateSchema.parse(body);

    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Verificar propriedade da coluna
    const { data: colunaExistente } = await supabaseAdmin
      .from("colunas")
      .select("id, dono_id, slug, status, cidade:cidades(slug)")
      .eq("id", id)
      .single();

    if (!colunaExistente) {
      return NextResponse.json({ error: "Coluna não encontrada." }, { status: 404 });
    }

    if (profile.role !== "admin" && colunaExistente.dono_id !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (dadosValidados.nome !== undefined) updates.nome = dadosValidados.nome;
    if (dadosValidados.slug !== undefined) updates.slug = dadosValidados.slug;
    if (dadosValidados.cidade_id !== undefined) updates.cidade_id = dadosValidados.cidade_id;
    if (dadosValidados.descricao !== undefined) updates.descricao = dadosValidados.descricao;
    if (dadosValidados.capa_url !== undefined) updates.capa_url = dadosValidados.capa_url;
    if (dadosValidados.aceita_anuncios !== undefined) updates.aceita_anuncios = dadosValidados.aceita_anuncios;

    // Apenas admin pode alterar status diretamente
    if (profile.role === "admin" && dadosValidados.status !== undefined) {
      updates.status = dadosValidados.status;
    }

    const { data: colunaAtualizada, error: updateError } = await supabase
      .from("colunas")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf),
        dono:profiles(id, nome, email, foto_url, slug)
      `)
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "Já existe uma coluna com este slug no portal." },
          { status: 409 }
        );
      }
      throw updateError;
    }

    // Revalidar cache
    try {
      revalidatePath("/");
      revalidatePath("/colunas");
      revalidatePath(`/coluna/${colunaExistente.slug}`);
      if (colunaAtualizada.slug !== colunaExistente.slug) {
        revalidatePath(`/coluna/${colunaAtualizada.slug}`);
      }
      const cidSlug = Array.isArray(colunaAtualizada.cidade)
        ? colunaAtualizada.cidade[0]?.slug
        : (colunaAtualizada.cidade as { slug?: string } | null)?.slug;
      if (cidSlug) {
        revalidatePath(`/cidade/${cidSlug}`);
      }
    } catch {
      // Ignore cache in dev
    }

    return NextResponse.json({ success: true, data: colunaAtualizada });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar coluna.";
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

    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    const { data: coluna } = await supabaseAdmin
      .from("colunas")
      .select("id, dono_id, slug, cidade:cidades(slug)")
      .eq("id", id)
      .single();

    if (!coluna) {
      return NextResponse.json({ error: "Coluna não encontrada." }, { status: 404 });
    }

    if (profile.role !== "admin" && coluna.dono_id !== profile.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("colunas")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    try {
      revalidatePath("/");
      revalidatePath("/colunas");
      revalidatePath(`/coluna/${coluna.slug}`);
      const cidSlug = Array.isArray(coluna.cidade)
        ? coluna.cidade[0]?.slug
        : (coluna.cidade as { slug?: string } | null)?.slug;
      if (cidSlug) {
        revalidatePath(`/cidade/${cidSlug}`);
      }
    } catch {
      // Ignore cache in dev
    }

    return NextResponse.json({ success: true, message: "Coluna excluída com sucesso." });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao excluir coluna.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
