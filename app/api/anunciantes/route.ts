import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const AnuncianteSchema = z.object({
  nome: z.string().optional(),
  nome_contato: z.string().optional(),
  empresa: z.string().nullable().optional(),
  cpf_cnpj: z.string().nullable().optional(),
  documento: z.string().nullable().optional(),
  email: z.string().email("E-mail inválido").nullable().optional().or(z.literal("")),
  telefone: z.string().nullable().optional(),
}).refine((data) => data.nome || data.nome_contato || data.empresa, {
  message: "Nome do anunciante ou empresa é obrigatório",
  path: ["nome"],
});

export async function GET(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista", "editor"]);
    const { searchParams } = new URL(request.url);
    const todos = searchParams.get("todos") === "true";

    const supabase = await createClient();

    let query = supabase
      .from("anunciantes")
      .select(`
        *,
        cadastrado_por_perfil:profiles!cadastrado_por(id, nome, email)
      `)
      .order("created_at", { ascending: false });

    if (profile.role !== "admin" || !todos) {
      query = query.eq("cadastrado_por", profile.id);
    }

    const { data: anunciantes, error } = await query;
    if (error) throw error;

    const formatados = (anunciantes || []).map((a) => ({
      id: a.id,
      nome_contato: a.nome,
      empresa: a.nome,
      email: a.email,
      telefone: a.telefone,
      documento: a.cpf_cnpj,
      criado_em: a.created_at,
    }));

    return NextResponse.json({ success: true, data: formatados, anunciantes: formatados });
  } catch (error: unknown) {
    const mensagem =
      error instanceof Error
        ? error.message
        : (error as { message?: string })?.message || "Erro ao listar anunciantes.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const body = await request.json();
    const dados = AnuncianteSchema.parse(body);

    const supabase = await createClient();

    const { data: portal } = await supabase
      .from("portais")
      .select("id")
      .limit(1)
      .single();

    if (!portal) {
      return NextResponse.json({ error: "Portal não encontrado." }, { status: 400 });
    }

    const nomeFinal =
      dados.nome ||
      (dados.empresa && dados.nome_contato
        ? `${dados.empresa} (${dados.nome_contato})`
        : dados.empresa || dados.nome_contato || "Anunciante");

    const cpfCnpjFinal = dados.cpf_cnpj || dados.documento || null;

    const { data: novoAnunciante, error } = await supabase
      .from("anunciantes")
      .insert({
        portal_id: portal.id,
        cadastrado_por: profile.id,
        nome: nomeFinal,
        cpf_cnpj: cpfCnpjFinal,
        email: dados.email || null,
        telefone: dados.telefone || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: novoAnunciante }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem =
      error instanceof Error
        ? error.message
        : (error as { message?: string })?.message || "Erro ao criar anunciante.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
