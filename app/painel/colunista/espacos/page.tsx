import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ColunistaEspacosView } from "@/components/painel/anuncios/colunista-espacos-view"
import { EspacoItem } from "@/components/painel/anuncios/espaco-form-dialog"

export default async function ColunistaEspacosPage() {
  const profile = await requireRole(["admin", "colunista"])
  const supabase = await createClient()

  // 1. Verificar portal padrão
  const { data: portal } = await supabase.from("portais").select("id").limit(1).single()
  const portalId = portal?.id

  // 2. Garantir formatos padrão se ainda não existirem
  if (portalId) {
    const { count: formatosCount } = await supabase
      .from("formatos_anuncio")
      .select("id", { count: "exact", head: true })
      .eq("portal_id", portalId)

    if (!formatosCount || formatosCount === 0) {
      const formatosPadrao = [
        {
          portal_id: portalId,
          nome: "Super Banner Topo (Leaderboard)",
          posicao: "topo",
          largura: 728,
          altura: 90,
          largura_mobile: 320,
          altura_mobile: 50,
          preco_minimo: 350.0,
        },
        {
          portal_id: portalId,
          nome: "Retângulo Barra Lateral (Sidebar)",
          posicao: "sidebar",
          largura: 300,
          altura: 250,
          largura_mobile: 300,
          altura_mobile: 250,
          preco_minimo: 250.0,
        },
        {
          portal_id: portalId,
          nome: "Banner Feed de Notícias (In-Feed)",
          posicao: "feed",
          largura: 728,
          altura: 90,
          largura_mobile: 320,
          altura_mobile: 100,
          preco_minimo: 200.0,
        },
        {
          portal_id: portalId,
          nome: "Banner Meio da Matéria (In-Article)",
          posicao: "artigo",
          largura: 640,
          altura: 100,
          largura_mobile: 300,
          altura_mobile: 250,
          preco_minimo: 300.0,
        },
        {
          portal_id: portalId,
          nome: "Mega Banner Rodapé (Footer)",
          posicao: "rodape",
          largura: 970,
          altura: 90,
          largura_mobile: 320,
          altura_mobile: 50,
          preco_minimo: 180.0,
        },
      ]

      await supabase.from("formatos_anuncio").insert(formatosPadrao)
    }
  }

  // Buscar colunas do usuário
  const { data: colunas } = await supabase
    .from("colunas")
    .select("id, nome")
    .eq("dono_id", profile.id)

  const colunaIds = (colunas || []).map((c) => c.id)

  let espacos: EspacoItem[] = []
  if (colunaIds.length > 0) {
    const { data } = await supabase
      .from("espacos_anuncio")
      .select(`
        *,
        formato:formatos_anuncio(
          id,
          nome,
          posicao,
          preco_minimo
        )
      `)
      .in("coluna_id", colunaIds)
      .order("created_at", { ascending: false })

    espacos = ((data || []).map((e) => ({
      id: e.id,
      nome: e.nome,
      formato_id: e.formato_id,
      coluna_id: e.coluna_id,
      posicao: e.posicao || e.formato?.posicao || "topo",
      preco_mensal: Number(e.preco_mensal) || 0,
      preco_semanal: e.preco_semanal ? Number(e.preco_semanal) : null,
      ativo: e.ativo,
      formato: e.formato
        ? {
            id: e.formato.id,
            nome: e.formato.nome,
            posicao_padrao: e.formato.posicao,
            preco_minimo: Number(e.formato.preco_minimo) || 0,
          }
        : undefined,
    })) as unknown as EspacoItem[]) || []
  }

  // Buscar formatos disponíveis
  const { data: formatosDb } = await supabase
    .from("formatos_anuncio")
    .select("id, nome, posicao, preco_minimo")
    .order("preco_minimo", { ascending: true })

  const formatosFormatados = (formatosDb || []).map((f) => ({
    id: f.id,
    nome: f.nome,
    posicao_padrao: f.posicao,
    preco_minimo: Number(f.preco_minimo) || 0,
  }))

  return (
    <ColunistaEspacosView
      initialEspacos={espacos}
      formatos={formatosFormatados}
      colunas={colunas || []}
    />
  )
}
