import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sanitizeContentHtml } from "@/lib/utils/sanitize";
import { slugify } from "@/lib/utils/slugify";
import { CATEGORIAS_PADRAO_SISTEMA } from "@/lib/portal/queries";
import { definirExpiracaoDestaque } from "@/lib/portal/destaques-storage";
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
  tempo_destaque: z.enum(["sem_limite", "6h", "12h", "24h", "48h", "7d"]).optional().default("sem_limite"),
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
    if (data.status === "publicado") {
      // Se não veio data ou se a data informada for futura, crava no momento atual (evita data futura)
      if (!publicadoEm || new Date(publicadoEm).getTime() > Date.now()) {
        publicadoEm = new Date().toISOString();
      }
    }

    // Portal padrão
    let portalId = profile.portal_id;
    if (!portalId) {
      const { data: portalDefault } = await supabase
        .from("portais")
        .select("id")
        .limit(1)
        .maybeSingle();
      portalId = portalDefault?.id || "a0000000-0000-0000-0000-000000000001";
    }

    // 1. Garantir categoria_id válida no banco (evita violação de Foreign Key)
    let categoriaIdFinal = data.categoria_id;
    const { data: catExiste } = await supabase
      .from("categorias")
      .select("id")
      .eq("id", categoriaIdFinal)
      .maybeSingle();

    if (!catExiste) {
      // Tenta criar no banco se for uma das categorias padrão do sistema
      const catPadrao = CATEGORIAS_PADRAO_SISTEMA.find(
        (c) => c.id === categoriaIdFinal || c.slug === categoriaIdFinal
      );

      let criada = false;
      if (catPadrao) {
        const { error: catErr } = await supabase.from("categorias").insert({
          id: catPadrao.id,
          portal_id: portalId,
          nome: catPadrao.nome,
          slug: catPadrao.slug,
          pai_id: null,
          exibir_menu: catPadrao.exibir_menu,
          exibir_home: catPadrao.exibir_home,
          ordem_menu: catPadrao.ordem_menu,
          ordem_home: catPadrao.ordem_home,
          cor: catPadrao.cor,
          palavras_chave: catPadrao.palavras_chave,
        });
        if (!catErr) {
          criada = true;
        }
      }

      // Se ainda não existir no banco (ex: RLS bloqueou criação), mapeia para categoria existente
      if (!criada) {
        const { data: catsReais } = await supabase
          .from("categorias")
          .select("id, slug")
          .limit(20);

        if (catsReais && catsReais.length > 0) {
          const slugBuscado = catPadrao?.slug || "";
          const afinidade = catsReais.find((c) => {
            if (slugBuscado.includes("negocio") || slugBuscado.includes("empreendedor")) {
              return c.slug === "economia";
            }
            if (slugBuscado.includes("turismo") || slugBuscado.includes("gastronomia")) {
              return c.slug === "cultura" || c.slug === "geral";
            }
            if (slugBuscado.includes("beleza") || slugBuscado.includes("estetica")) {
              return c.slug === "saude" || c.slug === "geral";
            }
            return false;
          });
          categoriaIdFinal = afinidade?.id || catsReais[0].id;
        }
      }
    }

    const { data: novaMateria, error: insertError } = await supabase
      .from("materias")
      .insert({
        portal_id: portalId,
        autor_id: profile.id,
        coluna_id: data.coluna_id || null,
        categoria_id: categoriaIdFinal,
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

    // Configurar prazo de expiração do destaque se aplicável
    if (data.destaque && novaMateria?.id) {
      definirExpiracaoDestaque(novaMateria.id, data.tempo_destaque || "sem_limite");
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
