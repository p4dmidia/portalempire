import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const EspacoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  dono_tipo: z.enum(["plataforma", "coluna"]).optional(),
  coluna_id: z.string().uuid().nullable().optional().or(z.literal("")),
  formato_id: z.string().uuid("Formato de anúncio é obrigatório"),
  preco_mensal: z.number().min(0, "Preço mensal deve ser positivo"),
  preco_semanal: z.number().min(0).nullable().optional(),
  posicao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista", "editor"]);
    const { searchParams } = new URL(request.url);
    const todas = searchParams.get("todas") === "true";
    const colunaId = searchParams.get("coluna_id");

    const supabaseAdmin = await createClient();

    let query = supabaseAdmin
      .from("espacos_anuncio")
      .select(`
        *,
        formato:formatos_anuncio(*),
        coluna:colunas(id, nome, slug, dono_id, cidade:cidades(nome, uf))
      `)
      .order("created_at", { ascending: false });

    if (colunaId) {
      query = query.eq("coluna_id", colunaId);
    } else if (profile.role !== "admin" || !todas) {
      if (profile.role === "colunista") {
        // Obter as colunas do colunista
        const { data: userColunas } = await supabaseAdmin
          .from("colunas")
          .select("id")
          .eq("dono_id", profile.id);

        const colIds = (userColunas || []).map((c) => c.id);
        query = query.in("coluna_id", colIds.length > 0 ? colIds : ["00000000-0000-0000-0000-000000000000"]);
      }
    }

    const { data: espacos, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: espacos || [], espacos: espacos || [] });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar espaços de anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const body = await request.json();
    const dados = EspacoSchema.parse(body);

    const supabaseAdmin = await createClient();

    // 1. Obter portal_id
    const { data: portal } = await supabaseAdmin
      .from("portais")
      .select("id")
      .limit(1)
      .single();

    if (!portal) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 400 });
    }

    let colunaIdFinal = dados.coluna_id && dados.coluna_id !== "" ? dados.coluna_id : null;
    let donoTipoFinal = dados.dono_tipo || (colunaIdFinal ? "coluna" : "plataforma");

    // Se for colunista e não informou coluna, tentar buscar a coluna dele
    if (profile.role === "colunista") {
      donoTipoFinal = "coluna";
      if (!colunaIdFinal) {
        const { data: colunasDoUsuario } = await supabaseAdmin
          .from("colunas")
          .select("id")
          .eq("dono_id", profile.id)
          .limit(1);

        if (colunasDoUsuario && colunasDoUsuario.length > 0) {
          colunaIdFinal = colunasDoUsuario[0].id;
        } else {
          return NextResponse.json(
            { error: "Você precisa criar uma Coluna primeiro para cadastrar seus espaços publicitários." },
            { status: 400 }
          );
        }
      }
    }

    // 2. Verificar permissão de dono_tipo
    if (profile.role !== "admin" && donoTipoFinal === "plataforma") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar espaços de plataforma." },
        { status: 403 }
      );
    }

    if (donoTipoFinal === "coluna" && colunaIdFinal) {
      // Se for colunista, garantir que a coluna pertence a ele
      if (profile.role !== "admin") {
        const { data: col } = await supabaseAdmin
          .from("colunas")
          .select("id, dono_id")
          .eq("id", colunaIdFinal)
          .single();

        if (!col || col.dono_id !== profile.id) {
          return NextResponse.json(
            { error: "Você só pode criar espaços nas suas próprias colunas." },
            { status: 403 }
          );
        }
      }
    }

    // 3. Verificar piso de preço mínimo do formato
    const { data: formato } = await supabaseAdmin
      .from("formatos_anuncio")
      .select("id, preco_minimo")
      .eq("id", dados.formato_id)
      .single();

    if (!formato) {
      return NextResponse.json({ error: "Formato de anúncio não encontrado." }, { status: 404 });
    }

    if (dados.preco_mensal < Number(formato.preco_minimo)) {
      return NextResponse.json(
        {
          error: `O preço mensal (R$ ${dados.preco_mensal.toFixed(2)}) não pode ser inferior ao preço mínimo do formato (R$ ${Number(formato.preco_minimo).toFixed(2)}).`,
        },
        { status: 400 }
      );
    }

    // 4. Inserir espaço
    const { data: novoEspaco, error: insertError } = await supabaseAdmin
      .from("espacos_anuncio")
      .insert({
        portal_id: portal.id,
        dono_tipo: donoTipoFinal,
        coluna_id: colunaIdFinal,
        formato_id: dados.formato_id,
        nome: dados.nome,
        preco_mensal: dados.preco_mensal,
        preco_semanal: dados.preco_semanal || null,
        ativo: dados.ativo,
      })
      .select(`
        *,
        formato:formatos_anuncio(*),
        coluna:colunas(id, nome, slug)
      `)
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: novoEspaco }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao criar espaço de anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
