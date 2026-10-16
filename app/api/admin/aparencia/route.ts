import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrarAuditoria } from "@/lib/auditoria/log";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const aparenciaSchema = z.object({
  nome: z.string().min(2, "Nome do portal deve ter pelo menos 2 caracteres."),
  dominio: z.string().optional().nullable(),
  logo_url: z.string().url("URL de logo inválida").or(z.literal("")).optional().nullable(),
  cor_primaria: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Cor primária inválida. Use formato hexadecimal (#2563eb)."),
  descricao_seo: z.string().max(500).optional().nullable(),
  redes_sociais: z.record(z.string(), z.string()).optional().nullable(),
  youtube_live_url: z.string().url("URL de TV ao vivo inválida").or(z.literal("")).optional().nullable(),
  ordem_blocos_home: z.array(z.string()).optional(),
  ordem_editorias_home: z.array(
    z.object({
      id: z.string().uuid(),
      ordem_home: z.number().int(),
      exibir_home: z.boolean(),
    })
  ).optional(),
});

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const supabase = await createClient();

    const [
      { data: portal },
      { data: shorts },
      { data: editorias },
      { data: configBlocos },
    ] = await Promise.all([
      supabase.from("portais").select("*").limit(1).single(),
      supabase.from("shorts").select("*").order("ordem", { ascending: true }),
      supabase.from("categorias").select("id, nome, slug, cor, exibir_home, ordem_home").order("ordem_home", { ascending: true }),
      supabase.from("configuracoes").select("valor").eq("chave", "ordem_blocos_home").maybeSingle(),
    ]);

    const blocosPadrao = [
      { id: "destaques", nome: "Destaques Principais (1 Grande + 4)", ativo: true },
      { id: "grade_cards", nome: "Em Foco no Portal (Grade de Cards)", ativo: true },
      { id: "recentes_mais_lidas", nome: "Mais Recentes + Sidebar Mais Lidas", ativo: true },
      { id: "carrossel_rapidas", nome: "Carrossel Notícias Rápidas", ativo: true },
      { id: "cidades", nome: "Cidades em Evidência", ativo: true },
      { id: "shorts_tv", nome: "TV ao Vivo & Vídeos Curtos (Shorts)", ativo: true },
      { id: "editorias", nome: "Blocos de Notícias por Editoria", ativo: true },
      { id: "colunistas", nome: "Carrossel de Colunistas", ativo: true },
      { id: "faixa_fontes", nome: "Faixa de Fontes de Captação", ativo: true },
    ];

    const blocosSalvos = configBlocos?.valor || portal?.config?.ordem_blocos_home;

    return NextResponse.json({
      portal: portal || null,
      shorts: shorts || [],
      editorias: editorias || [],
      ordem_blocos_home: blocosSalvos || blocosPadrao.map((b) => b.id),
      blocos_disponiveis: blocosPadrao,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = aparenciaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const {
      nome,
      dominio,
      logo_url,
      cor_primaria,
      descricao_seo,
      redes_sociais,
      youtube_live_url,
      ordem_blocos_home,
      ordem_editorias_home,
    } = parsed.data;

    const supabase = await createClient();

    // Obter portal atual
    const { data: portalAtual } = await supabase.from("portais").select("id, config").limit(1).single();
    if (!portalAtual) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 404 });
    }

    const updatedConfig = {
      ...(portalAtual.config || {}),
      ...(ordem_blocos_home ? { ordem_blocos_home } : {}),
    };

    // Atualizar portal
    const { error: portalError } = await supabase
      .from("portais")
      .update({
        nome,
        dominio: dominio || null,
        logo_url: logo_url || null,
        cor_primaria,
        descricao_seo: descricao_seo || null,
        redes_sociais: redes_sociais || {},
        youtube_live_url: youtube_live_url || null,
        config: updatedConfig,
      })
      .eq("id", portalAtual.id);

    if (portalError) {
      return NextResponse.json({ error: portalError.message }, { status: 400 });
    }

    // Atualizar chave ordem_blocos_home em configuracoes se fornecido
    if (ordem_blocos_home) {
      await supabase
        .from("configuracoes")
        .upsert(
          {
            portal_id: portalAtual.id,
            chave: "ordem_blocos_home",
            valor: ordem_blocos_home,
            descricao: "Ordem e visibilidade dos blocos da página inicial",
          },
          { onConflict: "portal_id,chave" }
        );
    }

    // Atualizar ordem e exibição das editorias na home se fornecido
    if (ordem_editorias_home && ordem_editorias_home.length > 0) {
      for (const item of ordem_editorias_home) {
        await supabase
          .from("categorias")
          .update({
            ordem_home: item.ordem_home,
            exibir_home: item.exibir_home,
          })
          .eq("id", item.id);
      }
    }

    // Auditoria
    await registrarAuditoria({
      usuarioId: profile.id,
      acao: "ATUALIZAR_APARENCIA_PORTAL",
      entidade: "portais",
      entidadeId: portalAtual.id,
      dados: {
        nome,
        cor_primaria,
        logo_url,
        redes_sociais,
        youtube_live_url,
        ordem_blocos_home,
      },
    });

    // Revalidação ISR
    revalidatePath("/");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({
      success: true,
      message: "Aparência e blocos do portal atualizados com sucesso!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
