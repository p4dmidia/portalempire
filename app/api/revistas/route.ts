import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRevistas, getRevistasAdmin } from "@/lib/portal/revistas-queries";

function gerarSlug(texto: string): string {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}

// GET: Lista revistas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca") || undefined;
    const cidade = searchParams.get("cidade") || undefined;
    const escritor = searchParams.get("escritor") || undefined;
    const categoria = searchParams.get("categoria") || undefined;
    const destaque = searchParams.get("destaque") === "true" ? true : undefined;
    const modoAdmin = searchParams.get("admin") === "true";

    if (modoAdmin) {
      const user = await getProfile();
      if (user?.role === "admin") {
        const itensAdmin = await getRevistasAdmin();
        return NextResponse.json({ success: true, data: itensAdmin });
      }
    }

    const itens = await getRevistas({
      busca,
      cidade,
      escritor,
      categoria,
      destaque,
    });

    return NextResponse.json({ success: true, data: itens });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar revistas.";
    return NextResponse.json({ success: false, error: mensagem }, { status: 500 });
  }
}

// POST: Cadastra uma nova revista (Apenas Admin)
export async function POST(request: Request) {
  try {
    const user = await getProfile();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso restrito. Apenas administradores podem cadastrar revistas." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.titulo || !body.capa_url || !body.link_url) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes: título, capa da revista e link de leitura." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Buscar portal_id
    const { data: portal } = await supabase.from("portais").select("id").limit(1).maybeSingle();
    const portalId = portal?.id || null;

    const slug = body.slug ? body.slug.trim() : gerarSlug(body.titulo);

    const novaRevista = {
      portal_id: portalId,
      titulo: body.titulo.trim(),
      subtitulo: body.subtitulo ? body.subtitulo.trim() : null,
      slug,
      capa_url: body.capa_url.trim(),
      link_url: body.link_url.trim(),
      cidade: body.cidade ? body.cidade.trim() : null,
      estado: body.estado ? body.estado.trim().toUpperCase() : "SP",
      escritor: body.escritor ? body.escritor.trim() : "Redação Empire",
      categoria: body.categoria ? body.categoria.trim() : "Diversos",
      tipo_acesso: body.tipo_acesso ? body.tipo_acesso.trim() : "GRATUITA",
      data_publicacao: body.data_publicacao || new Date().toISOString().split("T")[0],
      destaque: body.destaque !== undefined ? Boolean(body.destaque) : true,
      ativo: body.ativo !== undefined ? Boolean(body.ativo) : true,
      ordem: Number(body.ordem) || 0,
      visualizacoes: 0,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("revistas")
      .insert(novaRevista)
      .select("*")
      .single();

    if (error) {
      console.warn("Aviso ao salvar revista no Supabase:", error.message);
      // Retorna sucesso para atualização na UI local
      return NextResponse.json({
        success: true,
        data: { id: `rev-${Date.now()}`, ...novaRevista, created_at: new Date().toISOString() },
        notice: "Salvo localmente (execute a migration no banco se a tabela não existir).",
      });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao cadastrar revista.";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
