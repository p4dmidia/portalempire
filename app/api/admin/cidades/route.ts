import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const cidadeSchema = z.object({
  nome: z.string().min(2, "Nome da cidade deve ter pelo menos 2 caracteres."),
  slug: z.string().min(2, "Slug é obrigatório.").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens."),
  uf: z.string().length(2, "UF deve ter 2 caracteres (ex: SP).").toUpperCase(),
  destaque_menu: z.boolean().default(false),
  ordem: z.number().int().default(0),
  palavras_chave: z.array(z.string()).default([]),
});

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: cidades, error } = await supabase
      .from("cidades")
      .select("*")
      .order("ordem", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Contagem de colunas e matérias por cidade
    const [{ data: colunas }, { data: materias }] = await Promise.all([
      supabase.from("colunas").select("cidade_id"),
      supabase.from("materias").select("cidade_id"),
    ]);

    const colCounts: Record<string, number> = {};
    (colunas || []).forEach((c) => {
      if (c.cidade_id) colCounts[c.cidade_id] = (colCounts[c.cidade_id] || 0) + 1;
    });

    const matCounts: Record<string, number> = {};
    (materias || []).forEach((m) => {
      if (m.cidade_id) matCounts[m.cidade_id] = (matCounts[m.cidade_id] || 0) + 1;
    });

    const enriched = (cidades || []).map((cid) => ({
      ...cid,
      total_colunas: colCounts[cid.id] || 0,
      total_materias: matCounts[cid.id] || 0,
    }));

    return NextResponse.json({ cidades: enriched });
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
    const parsed = cidadeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: portal } = await supabase.from("portais").select("id").limit(1).single();
    if (!portal) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 404 });
    }

    const { data: novaCidade, error } = await supabase
      .from("cidades")
      .insert({
        portal_id: portal.id,
        nome: parsed.data.nome,
        slug: parsed.data.slug,
        uf: parsed.data.uf,
        destaque_menu: parsed.data.destaque_menu,
        ordem: parsed.data.ordem,
        palavras_chave: parsed.data.palavras_chave,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "CRIAR_CIDADE",
      entidade: "cidades",
      entidadeId: novaCidade.id,
      dados: parsed.data,
    });

    revalidatePath("/");
    revalidatePath("/cidades");
    revalidatePath("/cidade/" + novaCidade.slug);

    return NextResponse.json({
      success: true,
      cidade: novaCidade,
      message: "Cidade cadastrada com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
