import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CIDADES_CATALOGO, FONTES_CATALOGO } from "@/lib/captacao/catalogo-portais";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireRole(["admin"]);
    const supabase = await createClient();

    // 1. Obter Portal ID
    const { data: portal, error: portalError } = await supabase
      .from("portais")
      .select("id")
      .limit(1)
      .single();

    if (portalError || !portal) {
      throw new Error("Nenhum portal cadastrado no sistema.");
    }

    const portalId = portal.id;

    // 2. Sincronizar Cidades do Catálogo
    const cidadesParaInserir = CIDADES_CATALOGO.map((cid, idx) => ({
      portal_id: portalId,
      nome: cid.nome,
      slug: cid.slug,
      uf: cid.uf,
      destaque_menu: false,
      ordem: 20 + idx,
      palavras_chave: cid.palavras_chave,
    }));

    // Inserção com ignoreDuplicates para não sobrescrever cidades existentes
    await supabase.from("cidades").upsert(cidadesParaInserir, {
      onConflict: "portal_id,slug",
      ignoreDuplicates: true,
    });

    // 3. Buscar categorias e cidades atualizadas para vincular IDs
    const [{ data: categorias }, { data: cidades }] = await Promise.all([
      supabase.from("categorias").select("id, slug"),
      supabase.from("cidades").select("id, slug"),
    ]);

    const catMap = new Map((categorias || []).map((c) => [c.slug, c.id]));
    const cidMap = new Map((cidades || []).map((c) => [c.slug, c.id]));

    // Categoria padrão de fallback
    const catGeralId = catMap.get("geral") || catMap.get("noticias") || (categorias && categorias[0]?.id);

    // 4. Buscar fontes já cadastradas para atualizar URLs e evitar duplicatas
    const { data: fontesExistentes } = await supabase
      .from("fontes_rss")
      .select("id, nome, veiculo, url_feed");

    const mapaPorNome = new Map(
      (fontesExistentes || []).map((f) => [f.nome.toLowerCase().trim(), f])
    );
    const urlsExistentes = new Set(
      (fontesExistentes || []).map((f) => f.url_feed.replace(/\/+$/, "").toLowerCase())
    );

    let novasInseridas = 0;
    let atualizadas = 0;
    let jaExistentes = 0;

    const registrosParaInserir: any[] = [];

    for (const item of FONTES_CATALOGO) {
      const urlNormalizada = item.url_feed.replace(/\/+$/, "").toLowerCase();
      const nomeNormalizado = item.nome.toLowerCase().trim();

      const fonteExistente = mapaPorNome.get(nomeNormalizado);
      if (fonteExistente) {
        const urlExistenteNormalizada = fonteExistente.url_feed.replace(/\/+$/, "").toLowerCase();
        // Se a URL no catálogo foi atualizada para um feed direto mais robusto, atualiza no banco
        if (urlExistenteNormalizada !== urlNormalizada) {
          await supabase
            .from("fontes_rss")
            .update({
              url_feed: item.url_feed,
              ultimo_erro: null,
              ultimo_status: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", fonteExistente.id);
          atualizadas++;
        } else {
          jaExistentes++;
        }
        continue;
      }

      if (urlsExistentes.has(urlNormalizada)) {
        jaExistentes++;
        continue;
      }

      urlsExistentes.add(urlNormalizada);
      novasInseridas++;

      const categoriaId = catMap.get(item.categoria_slug) || catGeralId;
      const cidadeId = item.cidade_slug ? cidMap.get(item.cidade_slug) || null : null;

      registrosParaInserir.push({
        portal_id: portalId,
        nome: item.nome,
        veiculo: item.veiculo,
        url_feed: item.url_feed,
        categoria_padrao_id: categoriaId,
        cidade_padrao_id: cidadeId,
        ativo: true,
        intervalo_minutos: 15,
        max_itens_por_execucao: 20,
        publicar_automatico: true,
      });
    }

    if (registrosParaInserir.length > 0) {
      // Inserir em lotes de 25 para segurança no Postgres
      for (let i = 0; i < registrosParaInserir.length; i += 25) {
        const lote = registrosParaInserir.slice(i, i + 25);
        const { error: insertError } = await supabase.from("fontes_rss").insert(lote);
        if (insertError) {
          console.error("Erro ao inserir lote de fontes:", insertError);
          throw insertError;
        }
      }
    }

    const mensagemPartes = [];
    if (novasInseridas > 0) mensagemPartes.push(`${novasInseridas} novas fontes adicionadas`);
    if (atualizadas > 0) mensagemPartes.push(`${atualizadas} fontes atualizadas com novas URLs`);
    if (mensagemPartes.length === 0) mensagemPartes.push("Todas as fontes já estavam atualizadas");

    return NextResponse.json({
      success: true,
      message: `Catálogo sincronizado com sucesso! ${mensagemPartes.join(", ")}.`,
      total_catalogo: FONTES_CATALOGO.length,
      novas_inseridas: novasInseridas,
      atualizadas: atualizadas,
      ja_existentes: jaExistentes,
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao sincronizar catálogo de fontes.";
    console.error("Erro em sincronizar-fontes:", error);
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
