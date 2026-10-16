import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { AdminAnunciosDashboard } from "@/components/painel/anuncios/admin-anuncios-dashboard"
import { AnuncioItem } from "@/components/painel/anuncios/anuncio-form-dialog"
import { EspacoItem } from "@/components/painel/anuncios/espaco-form-dialog"
import { FormatoItem } from "@/components/painel/anuncios/formato-form-dialog"
import { AnuncianteItem } from "@/components/painel/anuncios/anunciante-form-dialog"

export default async function AdminAnunciosPage() {
  await requireRole(["admin"])
  const supabase = await createClient()

  // 1. Verificar portal padrão
  const { data: portal } = await supabase.from("portais").select("id").limit(1).single()
  const portalId = portal?.id

  // 2. Garantir formatos, espaços e anunciante padrão se ainda não existirem
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

    const { count: espacosCount } = await supabase
      .from("espacos_anuncio")
      .select("id", { count: "exact", head: true })
      .eq("portal_id", portalId)

    if (!espacosCount || espacosCount === 0) {
      const { data: formatosAtuais } = await supabase
        .from("formatos_anuncio")
        .select("id, nome, posicao, preco_minimo")
        .eq("portal_id", portalId)

      if (formatosAtuais && formatosAtuais.length > 0) {
        const novosEspacos = formatosAtuais.map((f) => ({
          portal_id: portalId,
          dono_tipo: "plataforma",
          coluna_id: null,
          formato_id: f.id,
          nome: `${f.nome} - Plataforma Geral`,
          preco_mensal: Number(f.preco_minimo) || 200.0,
          preco_semanal: (Number(f.preco_minimo) || 200.0) / 4,
          ativo: true,
        }))

        await supabase.from("espacos_anuncio").insert(novosEspacos)
      }
    }

    const { count: anunciantesCount } = await supabase
      .from("anunciantes")
      .select("id", { count: "exact", head: true })
      .eq("portal_id", portalId)

    if (!anunciantesCount || anunciantesCount === 0) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("anunciantes").insert([
        {
          portal_id: portalId,
          cadastrado_por: user?.id,
          nome: "Anunciante Geral (Portal Empire)",
          email: "comercial@portalempire.com.br",
          telefone: "(11) 99999-9999",
        },
      ])
    }
  }

  const [
    { data: anuncios },
    { data: espacos },
    { data: formatos },
    { data: colunas },
    { data: anunciantes },
  ] = await Promise.all([
    supabase
      .from("anuncios")
      .select(`
        *,
        anunciante:anunciantes(id, nome, email, telefone, cpf_cnpj),
        espaco:espacos_anuncio(
          id,
          nome,
          formato:formatos_anuncio(
            id,
            nome,
            posicao,
            largura,
            altura,
            largura_mobile,
            altura_mobile,
            preco_minimo
          )
        )
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("espacos_anuncio")
      .select(`
        *,
        formato:formatos_anuncio(
          id,
          nome,
          posicao,
          largura,
          altura,
          largura_mobile,
          altura_mobile,
          preco_minimo
        )
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("formatos_anuncio")
      .select("*")
      .order("created_at", { ascending: true }),

    supabase
      .from("colunas")
      .select("id, nome")
      .order("nome", { ascending: true }),

    supabase
      .from("anunciantes")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  // Normalizar campos para compatibilidade
  const anunciantesFormatados = (anunciantes || []).map((a) => ({
    id: a.id,
    nome_contato: a.nome,
    empresa: a.nome,
    email: a.email,
    telefone: a.telefone,
    documento: a.cpf_cnpj,
    criado_em: a.created_at,
  }))

  const espacosFormatados = (espacos || []).map((e) => ({
    id: e.id,
    nome: e.nome,
    posicao: e.formato?.posicao || "topo",
    preco_mensal: Number(e.preco_mensal) || 0,
    preco_semanal: Number(e.preco_semanal) || 0,
    ativo: e.ativo,
    coluna_id: e.coluna_id,
    dono_tipo: e.dono_tipo,
    formato_id: e.formato_id,
    formato: e.formato
      ? {
          id: e.formato.id,
          nome: e.formato.nome,
          posicao_padrao: e.formato.posicao,
          largura_desktop: e.formato.largura,
          altura_desktop: e.formato.altura,
          largura_mobile: e.formato.largura_mobile || e.formato.largura,
          altura_mobile: e.formato.altura_mobile || e.formato.altura,
          preco_minimo: Number(e.formato.preco_minimo) || 0,
        }
      : undefined,
  }))

  const formatosFormatados = (formatos || []).map((f) => ({
    id: f.id,
    nome: f.nome,
    slug: f.posicao,
    posicao_padrao: f.posicao,
    largura_desktop: f.largura,
    altura_desktop: f.altura,
    largura_mobile: f.largura_mobile || f.largura,
    altura_mobile: f.altura_mobile || f.altura,
    preco_minimo: Number(f.preco_minimo) || 0,
    ativo: true,
  }))

  return (
    <AdminAnunciosDashboard
      initialAnuncios={(anuncios as unknown as AnuncioItem[]) || []}
      initialEspacos={(espacosFormatados as unknown as EspacoItem[]) || []}
      initialFormatos={(formatosFormatados as unknown as FormatoItem[]) || []}
      initialAnunciantes={(anunciantesFormatados as unknown as AnuncianteItem[]) || []}
      colunas={(colunas as { id: string; nome: string }[]) || []}
    />
  )
}
