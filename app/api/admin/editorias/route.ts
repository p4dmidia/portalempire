import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const editoriaSchema = z.object({
  nome: z.string().min(2, "Nome da editoria deve ter pelo menos 2 caracteres."),
  slug: z.string().min(2, "Slug é obrigatório.").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens."),
  pai_id: z.string().uuid().optional().nullable(),
  exibir_menu: z.boolean().default(true),
  exibir_home: z.boolean().default(true),
  ordem_menu: z.number().int().default(0),
  ordem_home: z.number().int().default(0),
  cor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Cor inválida (use hex #xxxxxx)").optional().nullable(),
  palavras_chave: z.array(z.string()).default([]),
});

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: categorias, error } = await supabase
      .from("categorias")
      .select("*, pai:categorias(id, nome)")
      .order("ordem_menu", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Contagem de matérias por categoria
    const { data: countMaterias } = await supabase
      .from("materias")
      .select("categoria_id");

    const counts: Record<string, number> = {};
    (countMaterias || []).forEach((m) => {
      counts[m.categoria_id] = (counts[m.categoria_id] || 0) + 1;
    });

    const enriched = (categorias || []).map((cat) => ({
      ...cat,
      total_materias: counts[cat.id] || 0,
    }));

    return NextResponse.json({ editorias: enriched });
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
    const parsed = editoriaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: portal } = await supabase.from("portais").select("id").limit(1).single();
    if (!portal) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 404 });
    }

    const { data: novaEditoria, error } = await supabase
      .from("categorias")
      .insert({
        portal_id: portal.id,
        nome: parsed.data.nome,
        slug: parsed.data.slug,
        pai_id: parsed.data.pai_id || null,
        exibir_menu: parsed.data.exibir_menu,
        exibir_home: parsed.data.exibir_home,
        ordem_menu: parsed.data.ordem_menu,
        ordem_home: parsed.data.ordem_home,
        cor: parsed.data.cor || null,
        palavras_chave: parsed.data.palavras_chave,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "CRIAR_EDITORIA",
      entidade: "categorias",
      entidadeId: novaEditoria.id,
      dados: parsed.data,
    });

    revalidatePath("/");
    revalidatePath("/editoria/" + novaEditoria.slug);

    return NextResponse.json({
      success: true,
      editoria: novaEditoria,
      message: "Editoria criada com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
