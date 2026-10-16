import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ColunaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  cidade_id: z.string().uuid("Cidade inválida").nullable().optional(),
  descricao: z.string().max(500, "Descrição pode ter no máximo 500 caracteres").nullable().optional(),
  capa_url: z.string().url("URL de capa inválida").nullable().optional(),
  aceita_anuncios: z.boolean().default(true),
  status: z.enum(["pendente", "ativa", "suspensa"]).optional(),
});

export async function GET(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista", "editor"]);
    const { searchParams } = new URL(request.url);
    const apenasAtivas = searchParams.get("ativas") === "true";
    const todas = searchParams.get("todas") === "true";

    const supabase = await createClient();

    let query = supabase
      .from("colunas")
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf),
        dono:profiles(id, nome, email, foto_url, slug)
      `)
      .order("created_at", { ascending: false });

    if (profile.role !== "admin" || !todas) {
      // Se não for admin buscando todas, filtra apenas as do próprio colunista
      if (profile.role === "colunista") {
        query = query.eq("dono_id", profile.id);
      }
    }

    if (apenasAtivas) {
      query = query.eq("status", "ativa");
    }

    const { data: colunas, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: colunas || [] });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao buscar colunas.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const body = await request.json();
    const dadosValidados = ColunaSchema.parse(body);

    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Obter portal_id
    const { data: portal } = await supabaseAdmin
      .from("portais")
      .select("id")
      .limit(1)
      .single();

    if (!portal) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 400 });
    }

    // 2. Verificar regra de aprovação manual em configuracoes
    let statusInicial: "pendente" | "ativa" | "suspensa" = "pendente";

    if (profile.role === "admin") {
      statusInicial = dadosValidados.status || "ativa";
    } else {
      const { data: configAprovacao } = await supabaseAdmin
        .from("configuracoes")
        .select("valor")
        .eq("chave", "aprovar_colunas_manual")
        .maybeSingle();

      const aprovarManual =
        configAprovacao?.valor === true ||
        configAprovacao?.valor === "true" ||
        configAprovacao?.valor === undefined;

      statusInicial = aprovarManual ? "pendente" : "ativa";
    }

    // 3. Inserir coluna
    const { data: novaColuna, error: insertError } = await supabase
      .from("colunas")
      .insert({
        portal_id: portal.id,
        dono_id: profile.id,
        nome: dadosValidados.nome,
        slug: dadosValidados.slug,
        cidade_id: dadosValidados.cidade_id || null,
        descricao: dadosValidados.descricao || null,
        capa_url: dadosValidados.capa_url || null,
        aceita_anuncios: dadosValidados.aceita_anuncios,
        status: statusInicial,
      })
      .select(`
        *,
        cidade:cidades(id, nome, slug, uf),
        dono:profiles(id, nome, email, foto_url, slug)
      `)
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Já existe uma coluna com este slug no portal." },
          { status: 409 }
        );
      }
      throw insertError;
    }

    // 4. Revalidar cache se a coluna foi criada como ativa
    if (statusInicial === "ativa") {
      try {
        revalidatePath("/");
        revalidatePath("/colunas");
        revalidatePath(`/coluna/${novaColuna.slug}`);
        if (novaColuna.cidade?.slug) {
          revalidatePath(`/cidade/${novaColuna.cidade.slug}`);
        }
      } catch {
        // Ignore cache in dev
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: novaColuna,
        mensagem:
          statusInicial === "pendente"
            ? "Coluna cadastrada com sucesso! Ela passará por aprovação do administrador antes de ser exibida no portal."
            : "Coluna cadastrada e ativada no portal com sucesso!",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao criar coluna.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
