import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const FormatoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  posicao: z.enum(["topo", "lateral", "meio_texto", "rodape", "home_entre_blocos"]),
  largura: z.number().int().positive("Largura deve ser positiva"),
  altura: z.number().int().positive("Altura deve ser positiva"),
  largura_mobile: z.number().int().positive().nullable().optional(),
  altura_mobile: z.number().int().positive().nullable().optional(),
  preco_minimo: z.number().min(0, "Preço mínimo não pode ser negativo").default(0),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: formatos, error } = await supabase
      .from("formatos_anuncio")
      .select("*")
      .order("preco_minimo", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: formatos || [] });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar formatos de anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const dados = FormatoSchema.parse(body);

    const supabase = await createClient();
    const { data: novoFormato, error } = await supabase
      .from("formatos_anuncio")
      .insert({
        nome: dados.nome,
        posicao: dados.posicao,
        largura: dados.largura,
        altura: dados.altura,
        largura_mobile: dados.largura_mobile || null,
        altura_mobile: dados.altura_mobile || null,
        preco_minimo: dados.preco_minimo,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: novoFormato }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao criar formato de anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
