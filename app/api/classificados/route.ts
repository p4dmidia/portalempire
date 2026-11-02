import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getClassificados } from "@/lib/portal/classificados-queries";
import { adicionarOuAtualizarClassificadoLocal } from "@/lib/portal/classificados-storage";

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

// GET: Lista classificados (público ou com filtros do painel)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || undefined;
    const categoria = searchParams.get("categoria") || undefined;
    const busca = searchParams.get("busca") || undefined;
    const destaqueHome = searchParams.get("destaque_home") === "true" ? true : undefined;
    const pagina = searchParams.get("pagina") || undefined;
    const autorId = searchParams.get("autor_id") || undefined;

    const itens = await getClassificados({
      tipo,
      categoria,
      busca,
      destaqueHome,
      pagina,
    });

    if (autorId) {
      const filtrados = itens.filter((i) => i.autor_id === autorId);
      return NextResponse.json({ success: true, data: filtrados });
    }

    return NextResponse.json({ success: true, data: itens });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar classificados.";
    return NextResponse.json({ success: false, error: mensagem }, { status: 500 });
  }
}

// POST: Cria um novo classificado (Apenas usuários autenticados: Admin ou Colunista)
export async function POST(request: Request) {
  try {
    const user = await getProfile();
    if (!user || (user.role !== "admin" && user.role !== "colunista")) {
      return NextResponse.json(
        { error: "Acesso restrito. Apenas administradores e colunistas podem criar classificados." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.titulo || !body.contato_whatsapp || !body.imagem_principal) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes: título, WhatsApp e imagem principal." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Obter portal_id válido do banco
    let portalId: string | null = null;
    const { data: portal } = await admin.from("portais").select("id").limit(1).maybeSingle();
    if (portal?.id) {
      portalId = portal.id;
    } else {
      // Tenta fallback com id padrão se existir
      portalId = "a0000000-0000-0000-0000-000000000001";
    }

    const slug = gerarSlug(body.titulo);

    const novoClassificado = {
      portal_id: portalId,
      autor_id: user.id,
      origem_tipo: user.role === "admin" ? "admin" : "colunista",
      titulo: body.titulo.trim(),
      slug: slug,
      descricao: body.descricao ? body.descricao.trim() : "",
      tipo: body.tipo || "venda",
      categoria: body.categoria || "geral",
      preco: Number(body.preco) || 0,
      preco_sob_consulta: Boolean(body.preco_sob_consulta),
      imagem_principal: body.imagem_principal.trim(),
      galeria_fotos: Array.isArray(body.galeria_fotos) ? body.galeria_fotos : [],
      cidade_id: body.cidade_id || null,
      cidade_nome: body.cidade_nome ? body.cidade_nome.trim() : null,
      bairro: body.bairro ? body.bairro.trim() : null,
      uf: body.uf ? body.uf.trim().toUpperCase() : "SP",
      contato_nome: body.contato_nome ? body.contato_nome.trim() : user.nome,
      contato_whatsapp: body.contato_whatsapp.trim(),
      contato_telefone: body.contato_telefone ? body.contato_telefone.trim() : null,
      contato_email: body.contato_email ? body.contato_email.trim() : null,
      link_externo: body.link_externo ? body.link_externo.trim() : null,
      destaque_home: Boolean(body.destaque_home),
      destaque_classificados: Boolean(body.destaque_classificados),
      paginas_exibicao: Array.isArray(body.paginas_exibicao) && body.paginas_exibicao.length > 0
        ? body.paginas_exibicao
        : ["classificados"],
      status: body.status || "ativo",
      visualizacoes: 0,
    };

    const idGerado = `cls-${Date.now()}`;
    const classificadoPronto: any = {
      id: idGerado,
      ...novoClassificado,
      created_at: new Date().toISOString(),
    };

    // 1. Tenta persistir no Postgres via service role se a tabela existir
    let resultadoFinal = classificadoPronto;
    try {
      const { data: inserido, error: errIns } = await admin
        .from("classificados")
        .insert(novoClassificado)
        .select("*")
        .single();

      if (!errIns && inserido) {
        resultadoFinal = inserido;
      } else if (errIns) {
        console.warn("[Portal Empire] Aviso Postgres classificados (usando storage resiliente):", errIns.message);
      }
    } catch (e) {
      console.warn("[Portal Empire] Conexão Postgres falhou, persistindo localmente:", e);
    }

    // 2. Persiste no storage local resiliente (garante exibição imediata em todas as páginas)
    adicionarOuAtualizarClassificadoLocal(resultadoFinal);

    // 3. Limpa cache para refletir imediatamente nas páginas do portal
    try {
      revalidatePath("/", "layout");
      revalidatePath("/classificados");
      revalidatePath("/(public)", "layout");
    } catch {
      // Ignora erro de revalidação em dev
    }

    return NextResponse.json({ success: true, data: resultadoFinal });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao cadastrar anúncio.";
    console.error("Erro em POST /api/classificados:", error);
    return NextResponse.json({ success: false, error: mensagem }, { status: 500 });
  }
}
