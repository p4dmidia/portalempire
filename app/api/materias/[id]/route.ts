import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sanitizeContentHtml } from "@/lib/utils/sanitize";
import { slugify } from "@/lib/utils/slugify";
import { CATEGORIAS_PADRAO_SISTEMA } from "@/lib/portal/queries";
import { definirExpiracaoDestaque, removerExpiracaoDestaque, calcularDataExpiracao } from "@/lib/portal/destaques-storage";
import * as z from "zod";

const updateSchema = z.object({
  titulo: z.string().min(5).optional(),
  slug: z.string().min(3).optional(),
  subtitulo: z.string().optional().nullable(),
  resumo: z.string().min(10).optional(),
  categoria_id: z.string().min(1).optional(),
  cidade_id: z.string().optional().nullable(),
  coluna_id: z.string().optional().nullable(),
  imagem_url: z.string().optional().nullable(),
  imagem_credito: z.string().optional().nullable(),
  conteudo: z.any().optional().nullable(),
  conteudo_html: z.string().optional().nullable(),
  status: z.enum(["rascunho", "publicado", "despublicado", "agendado"]).optional(),
  publicado_em: z.string().optional().nullable(),
  urgente: z.boolean().optional(),
  destaque: z.boolean().optional(),
  tempo_destaque: z.enum(["sem_limite", "6h", "12h", "24h", "48h", "7d"]).optional(),
  tags: z.array(z.string()).optional(),
  seo_titulo: z.string().optional().nullable(),
  seo_descricao: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();

    // Verificar se a matéria existe e se o usuário é o autor ou admin
    const { data: materia, error: fetchError } = await supabase
      .from("materias")
      .select("id, portal_id, autor_id, slug, status, publicado_em, destaque, conteudo")
      .eq("id", id)
      .single();

    if (fetchError || !materia) {
      return NextResponse.json({ error: "Matéria não encontrada." }, { status: 404 });
    }

    if (profile.role !== "admin" && materia.autor_id !== profile.id) {
      return NextResponse.json(
        { error: "Você só tem permissão para editar suas próprias matérias." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.slug !== undefined) updateData.slug = slugify(data.slug);
    if (data.subtitulo !== undefined) updateData.subtitulo = data.subtitulo;
    if (data.resumo !== undefined) updateData.resumo = data.resumo;
    if (data.categoria_id !== undefined) {
      let catIdValida = data.categoria_id;
      const { data: catExiste } = await supabase
        .from("categorias")
        .select("id")
        .eq("id", catIdValida)
        .maybeSingle();

      if (!catExiste) {
        const catPadrao = CATEGORIAS_PADRAO_SISTEMA.find(
          (c) => c.id === catIdValida || c.slug === catIdValida
        );

        let criada = false;
        if (catPadrao) {
          const { error: catErr } = await supabase.from("categorias").insert({
            id: catPadrao.id,
            portal_id: materia.portal_id || "a0000000-0000-0000-0000-000000000001",
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
          if (!catErr) criada = true;
        }

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
            catIdValida = afinidade?.id || catsReais[0].id;
          }
        }
      }
      updateData.categoria_id = catIdValida;
    }
    if (data.cidade_id !== undefined) {
      if (data.cidade_id && !data.cidade_id.startsWith("extra-")) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.cidade_id);
        updateData.cidade_id = isUuid ? data.cidade_id : null;
      } else {
        updateData.cidade_id = null;
      }
    }
    if (data.coluna_id !== undefined) {
      if (data.coluna_id) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.coluna_id);
        updateData.coluna_id = isUuid ? data.coluna_id : null;
      } else {
        updateData.coluna_id = null;
      }
    }
    if (data.imagem_url !== undefined) updateData.imagem_url = data.imagem_url;
    if (data.imagem_credito !== undefined) updateData.imagem_credito = data.imagem_credito;
    if (data.conteudo !== undefined) updateData.conteudo = data.conteudo;
    if (data.conteudo_html !== undefined) {
      updateData.conteudo_html = data.conteudo_html
        ? sanitizeContentHtml(data.conteudo_html)
        : null;
    }

    const targetStatus = data.status ?? materia.status;
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.publicado_em) {
      updateData.publicado_em = data.publicado_em;
    } else if (targetStatus === "publicado") {
      updateData.publicado_em = materia.publicado_em || new Date().toISOString();
    } else if (data.publicado_em === null) {
      updateData.publicado_em = null;
    }

    // Se o status for publicado, impede terminantemente que a data fique no futuro
    if (targetStatus === "publicado" && updateData.publicado_em) {
      const pubMs = new Date(updateData.publicado_em as string).getTime();
      if (!isNaN(pubMs) && pubMs > Date.now()) {
        updateData.publicado_em = new Date().toISOString();
      }
    }

    const isDestaque = data.destaque !== undefined ? data.destaque : materia.destaque;
    const finalTempoDestaque = isDestaque
      ? data.tempo_destaque || (materia.conteudo as Record<string, unknown> | null)?.tempo_destaque || "sem_limite"
      : "sem_limite";

    const baseConteudo =
      typeof (updateData.conteudo || data.conteudo) === "object" && (updateData.conteudo || data.conteudo) !== null
        ? ((updateData.conteudo || data.conteudo) as Record<string, unknown>)
        : ((materia.conteudo as Record<string, unknown> | null) || {});

    updateData.conteudo = {
      ...baseConteudo,
      tempo_destaque: finalTempoDestaque,
      destaque_expira_em: isDestaque ? calcularDataExpiracao(finalTempoDestaque as string) : null,
    };

    if (data.urgente !== undefined) updateData.urgente = data.urgente;
    if (data.destaque !== undefined) updateData.destaque = data.destaque;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.seo_titulo !== undefined) updateData.seo_titulo = data.seo_titulo;
    if (data.seo_descricao !== undefined) updateData.seo_descricao = data.seo_descricao;

    const { data: updatedMateria, error: updateError } = await supabase
      .from("materias")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Atualizar prazo do destaque se fornecido ou remover se desativado
    if (isDestaque) {
      definirExpiracaoDestaque(id, (finalTempoDestaque as "6h" | "12h" | "24h" | "48h" | "7d" | "sem_limite") || "sem_limite");
    } else {
      removerExpiracaoDestaque(id);
    }

    // Revalidação de cache rápida e segura
    if (targetStatus === "publicado" || isDestaque || materia.destaque) {
      try {
        revalidatePath("/");
        revalidatePath(`/materia/${materia.slug}`);
        if (updatedMateria.slug !== materia.slug) {
          revalidatePath(`/materia/${updatedMateria.slug}`);
        }
      } catch (e) {
        console.warn("[revalidatePath] Falha na revalidação:", e);
      }
    }

    return NextResponse.json({ success: true, materia: updatedMateria });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();

    const { data: materia, error: fetchError } = await supabase
      .from("materias")
      .select("id, autor_id, slug")
      .eq("id", id)
      .single();

    if (fetchError || !materia) {
      return NextResponse.json({ error: "Matéria não encontrada." }, { status: 404 });
    }

    if (profile.role !== "admin" && materia.autor_id !== profile.id) {
      return NextResponse.json(
        { error: "Você só tem permissão para excluir suas próprias matérias." },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("materias")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath(`/materia/${materia.slug}`);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
