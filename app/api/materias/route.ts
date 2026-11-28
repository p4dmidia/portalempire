import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sanitizeContentHtml } from "@/lib/utils/sanitize";
import { slugify } from "@/lib/utils/slugify";
import { CATEGORIAS_PADRAO_SISTEMA } from "@/lib/portal/queries";
import { definirExpiracaoDestaque, calcularDataExpiracao, desativarDestaquesExpirados } from "@/lib/portal/destaques-storage";
import * as z from "zod";

export const maxDuration = 10;

const materiaSchema = z.object({
  titulo: z.string().min(5, "O título deve ter no mínimo 5 caracteres"),
  slug: z.string().min(3),
  subtitulo: z.string().optional().nullable(),
  resumo: z.string().min(10, "O resumo deve ter no mínimo 10 caracteres"),
  categoria_id: z.string().min(1, "Selecione uma editoria válida"),
  cidade_id: z.string().optional().nullable(),
  coluna_id: z.string().optional().nullable(),
  imagem_url: z.string().optional().nullable(),
  imagem_credito: z.string().optional().nullable(),
  conteudo: z.any().optional().nullable(),
  conteudo_html: z.string().optional().nullable(),
  status: z.enum(["rascunho", "publicado", "despublicado", "agendado"]),
  publicado_em: z.string().optional().nullable(),
  urgente: z.boolean().default(false),
  destaque: z.boolean().default(false),
  tempo_destaque: z.enum(["sem_limite", "4h", "6h", "12h", "24h", "48h", "7d"]).optional().default("sem_limite"),
  tags: z.array(z.string()).default([]),
  seo_titulo: z.string().optional().nullable(),
  seo_descricao: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "todos";
    const categoria = searchParams.get("categoria") || "todas";
    const cidade = searchParams.get("cidade") || "todas";
    const origem = searchParams.get("origem") || "todas";
    const autorId = searchParams.get("autor_id") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "25", 10))
    );
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let query = supabase
      .from("materias")
      .select(
        `
        id,
        titulo,
        slug,
        subtitulo,
        resumo,
        conteudo,
        imagem_url,
        imagem_credito,
        categoria_id,
        cidade_id,
        coluna_id,
        autor_id,
        status,
        origem,
        urgente,
        destaque,
        visualizacoes,
        publicado_em,
        created_at,
        updated_at,
        categoria:categorias(id, nome, slug, cor),
        cidade:cidades(id, nome, slug, uf),
        autor:profiles(id, nome, slug, foto_url)
      `,
        { count: "exact" }
      );

    if (autorId) {
      query = query.eq("autor_id", autorId);
    }

    if (status !== "todos") {
      query = query.eq("status", status);
    }

    if (categoria !== "todas") {
      query = query.eq("categoria_id", categoria);
    }

    if (cidade !== "todas") {
      query = query.eq("cidade_id", cidade);
    }

    if (origem !== "todas") {
      if (origem === "manual") {
        query = query.neq("origem", "captacao");
      } else if (origem === "captacao") {
        query = query.eq("origem", "captacao");
      }
    }

    if (search) {
      query = query.or(
        `titulo.ilike.%${search}%,slug.ilike.%${search}%,resumo.ilike.%${search}%`
      );
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: materias, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Higienização em tempo real: se alguma matéria tiver destaque vencido, reflete destaque=false
    // e atualiza silenciosamente no banco
    const nowIso = new Date().toISOString();
    const idsExpirados: string[] = [];

    const materiasFormatadas = (materias || []).map((m) => {
      const meta = (m.conteudo as Record<string, unknown> | null) || null;
      if (
        m.destaque &&
        meta &&
        typeof meta.destaque_expira_em === "string" &&
        meta.destaque_expira_em < nowIso
      ) {
        idsExpirados.push(m.id);
        return { ...m, destaque: false };
      }
      return m;
    });

    if (idsExpirados.length > 0) {
      desativarDestaquesExpirados().catch((e) => {
        console.warn("[GET /api/materias] Falha ao atualizar destaques expirados no banco:", e);
      });
    }

    return NextResponse.json({
      materias: materiasFormatadas,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

    // REGRA PADRÃO PARA COLUNISTAS:
    // Toda matéria publicada entra na home como destaque por 4 horas e depois entra na pilha normal.
    // O colunista não tem opção de escolher tempo de destaque, todas seguem esse padrão de 4h. Apenas o admin tem a opção de customizar.
    const isColunista = profile.role === "colunista" || profile.role !== "admin";
    const isPublicando = data.status === "publicado";

    let finalDestaque = data.destaque;
    let finalTempoDestaque = data.destaque ? data.tempo_destaque || "sem_limite" : "sem_limite";

    if (isColunista) {
      if (isPublicando) {
        finalDestaque = true;
        finalTempoDestaque = "4h";
      } else {
        finalDestaque = false;
        finalTempoDestaque = "sem_limite";
      }
    }

    const conteudoFinal =
      typeof data.conteudo === "object" && data.conteudo !== null
        ? {
            ...data.conteudo,
            tempo_destaque: finalTempoDestaque,
            destaque_expira_em: finalDestaque ? calcularDataExpiracao(finalTempoDestaque) : null,
          }
        : {
            tempo_destaque: finalTempoDestaque,
            destaque_expira_em: finalDestaque ? calcularDataExpiracao(finalTempoDestaque) : null,
          };

    // Validação de cidade_id para Postgres UUID (evita crash se for ID tipo 'extra-alphaville' ou inválido)
    let cidadeIdFinal: string | null = null;
    if (data.cidade_id && !data.cidade_id.startsWith("extra-")) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.cidade_id);
      if (isUuid) {
        cidadeIdFinal = data.cidade_id;
      }
    }

    // Validação de coluna_id para Postgres UUID
    let colunaIdFinal: string | null = null;
    if (data.coluna_id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.coluna_id);
      if (isUuid) {
        colunaIdFinal = data.coluna_id;
      }
    }

    const { data: novaMateria, error: insertError } = await supabase
      .from("materias")
      .insert({
        portal_id: portalId,
        autor_id: profile.id,
        coluna_id: colunaIdFinal,
        categoria_id: categoriaIdFinal,
        cidade_id: cidadeIdFinal,
        titulo: data.titulo,
        slug: finalSlug,
        subtitulo: data.subtitulo || null,
        resumo: data.resumo,
        conteudo: conteudoFinal,
        conteudo_html: sanitizedHtml,
        imagem_url: data.imagem_url || null,
        imagem_credito: data.imagem_credito || null,
        origem: "manual",
        status: data.status,
        publicado_em: publicadoEm,
        urgente: data.urgente,
        destaque: finalDestaque,
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
    if (finalDestaque && novaMateria?.id) {
      try {
        definirExpiracaoDestaque(novaMateria.id, finalTempoDestaque);
      } catch (err) {
        console.warn("[destaques-storage] Aviso ao registrar expiração:", err);
      }
    }

    // Revalidar cache público apenas para matérias publicadas
    if (data.status === "publicado") {
      try {
        revalidatePath("/");
        revalidatePath(`/materia/${finalSlug}`);
      } catch (e) {
        console.warn("[revalidatePath] Falha na revalidação:", e);
      }
    }

    return NextResponse.json({ success: true, materia: novaMateria });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
