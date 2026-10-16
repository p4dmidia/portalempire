import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCategorias, getCidades } from "@/lib/portal/queries";
import { CaptacaoDashboard } from "@/components/painel/captacao/captacao-dashboard";

export default async function AdminCaptacaoPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const [
    categorias,
    cidades,
    { data: fontes },
    { data: logs },
    { data: materias },
    { data: configs },
  ] = await Promise.all([
    getCategorias(),
    getCidades(),
    supabase
      .from("fontes_rss")
      .select(`
        *,
        categoria_padrao:categorias(id, nome),
        cidade_padrao:cidades(id, nome)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("captacao_logs")
      .select(`
        *,
        fonte:fontes_rss(id, nome, veiculo)
      `)
      .order("iniciado_em", { ascending: false })
      .limit(50),
    supabase
      .from("materias")
      .select(`
        id,
        titulo,
        slug,
        resumo,
        imagem_url,
        imagem_credito,
        fonte_nome,
        url_original,
        status,
        publicado_em,
        created_at,
        categoria:categorias(id, nome, slug),
        cidade:cidades(id, nome, slug),
        fonte:fontes_rss(id, nome, veiculo)
      `)
      .eq("origem", "captacao")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("configuracoes")
      .select("chave, valor")
      .in("chave", ["captacao_ativa_global", "captacao_arquivar_dias"]),
  ]);

  const configMap = {
    captacao_ativa_global: true,
    captacao_arquivar_dias: 30,
  };

  configs?.forEach((c) => {
    if (c.chave === "captacao_ativa_global") configMap.captacao_ativa_global = Boolean(c.valor);
    if (c.chave === "captacao_arquivar_dias") configMap.captacao_arquivar_dias = Number(c.valor) || 0;
  });

  return (
    <CaptacaoDashboard
      initialFontes={fontes || []}
      initialLogs={logs || []}
      initialMaterias={(materias as unknown as Parameters<typeof CaptacaoDashboard>[0]["initialMaterias"]) || []}
      initialConfig={configMap}
      categorias={categorias}
      cidades={cidades}
    />
  );
}
