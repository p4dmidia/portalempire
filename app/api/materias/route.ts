import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sanitizeContentHtml } from "@/lib/utils/sanitize";
import { slugify } from "@/lib/utils/slugify";
import * as z from "zod";

const materiaSchema = z.object({
  titulo: z.string().min(5, "O título deve ter no mínimo 5 caracteres"),
  slug: z.string().min(3),
  subtitulo: z.string().optional().nullable(),
  resumo: z.string().min(10, "O resumo deve ter no mínimo 10 caracteres"),
  categoria_id: z.string().uuid("Selecione uma editoria válida"),
  cidade_id: z.string().uuid().optional().nullable(),
  coluna_id: z.string().uuid().optional().nullable(),
  imagem_url: z.string().optional().nullable(),
  imagem_credito: z.string().optional().nullable(),
  conteudo: z.any().optional().nullable(),
  conteudo_html: z.string().optional().nullable(),
  status: z.enum(["rascunho", "publicado", "despublicado", "agendado"]),
  publicado_em: z.string().optional().nullable(),
  urgente: z.boolean().default(false),
  destaque: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  seo_titulo: z.string().optional().nullable(),
  seo_descricao: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfile();
    if (!profile || !["admin", "editor", "colunista"].includes(profile.role)) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = materiaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Sanitizar HTML
    const sanitizedHtml = data.conteudo_html
      ? sanitizeContentHtml(data.conteudo_html)
      : null;

    // Garantir slug único
    let finalSlug = slugify(data.slug || data.titulo);
    const { data: existingSlug } = await supabase
      .from("materias")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Definir publicado_em conforme status
    let publicadoEm = data.publicado_em;
    if (data.status === "publicado" && !publicadoEm) {
      publicadoEm = new Date().toISOString();
    }

    // Portal padrão
    let portalId = profile.portal_id;
    if (!portalId) {
      const { data: portalDefault } = await supabase
        .from("portais")
        .select("id")
        .limit(1)
        .single();
      portalId = portalDefault?.id;
    }

    const { data: novaMateria, error: insertError } = await supabase
      .from("materias")
      .insert({
        portal_id: portalId,
        autor_id: profile.id,
        coluna_id: data.coluna_id || null,
        categoria_id: data.categoria_id,
        cidade_id: data.cidade_id || null,
        titulo: data.titulo,
        slug: finalSlug,
        subtitulo: data.subtitulo || null,
        resumo: data.resumo,
        conteudo: data.conteudo || null,
        conteudo_html: sanitizedHtml,
        imagem_url: data.imagem_url || null,
        imagem_credito: data.imagem_credito || null,
        origem: "manual",
        status: data.status,
        publicado_em: publicadoEm,
        urgente: data.urgente,
        destaque: data.destaque,
        tags: data.tags,
        seo_titulo: data.seo_titulo || null,
        seo_descricao: data.seo_descricao || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // Revalidar cache público
    revalidatePath("/");
    revalidatePath(`/materia/${finalSlug}`);
    revalidatePath("/categoria");

    return NextResponse.json({ success: true, materia: novaMateria });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
