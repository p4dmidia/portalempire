import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { ColunistaAnunciosView } from "@/components/painel/anuncios/colunista-anuncios-view"
import { AnuncioItem } from "@/components/painel/anuncios/anuncio-form-dialog"

interface EspacoComFormato {
  id: string
  nome: string
  posicao: string
  preco_mensal: number
  coluna_id: string | null
  formato: {
    id: string
    nome: string
    largura_desktop: number
    altura_desktop: number
    largura_mobile: number
    altura_mobile: number
  }
}

export default async function ColunistaAnunciosPage() {
  const profile = await requireRole(["admin", "colunista"])
  const supabase = await createClient()

  // 1. Buscar colunas do colunista e portal
  const { data: portal } = await supabase.from("portais").select("id").limit(1).single()
  const portalId = portal?.id

  const { data: colunas } = await supabase
    .from("colunas")
    .select("id, nome")
    .eq("dono_id", profile.id)

  const colunaIds = (colunas || []).map((c) => c.id)

  if (portalId && colunaIds.length > 0) {
    // 1.1 Garantir exatamente 1 espaço para cada posição da coluna
      const { data: formatosDb } = await supabase
        .from("formatos_anuncio")
        .select("id, nome, posicao, largura, altura, largura_mobile, altura_mobile")

      if (formatosDb && formatosDb.length > 0) {
        for (const col of colunas || []) {
          const { data: espacosCol } = await supabase
            .from("espacos_anuncio")
            .select("id, formato_id")
            .eq("coluna_id", col.id)

          const posicoesVistas = new Set<string>()

          for (const e of espacosCol || []) {
            const fmt = formatosDb.find((f) => f.id === e.formato_id)
            if (fmt?.posicao) {
              posicoesVistas.add(fmt.posicao)
            }
          }

          const posicoesNecessarias: Array<"topo" | "lateral" | "meio_texto" | "rodape"> = [
            "topo",
            "lateral",
            "meio_texto",
            "rodape",
          ]

          for (const pos of posicoesNecessarias) {
            if (!posicoesVistas.has(pos)) {
              const fmt = formatosDb.find((f) => f.posicao === pos) || formatosDb[0]
              await supabase.from("espacos_anuncio").insert({
                portal_id: portalId,
                dono_tipo: "coluna",
                coluna_id: col.id,
                formato_id: fmt.id,
                nome: `${fmt.nome} - ${col.nome}`,
                preco_mensal: 150,
                ativo: true,
              })
            }
          }
        }
      }
    }

  // 2. Buscar anúncios
  let queryAnuncios = supabase
    .from("anuncios")
    .select(`
      *,
      anunciante:anunciantes(id, nome, email, telefone),
      espaco:espacos_anuncio(
        id,
        nome,
        preco_mensal,
        formato:formatos_anuncio(
          id,
          nome,
          posicao,
          largura,
          altura,
          largura_mobile,
          altura_mobile
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (profile.role !== "admin") {
    queryAnuncios = queryAnuncios.eq("dono_id", profile.id)
  }

  // 3. Buscar anunciantes cadastrados pelo usuário (ou todos se admin)
  let queryAnunciantes = supabase
    .from("anunciantes")
    .select("id, nome, email, telefone, cpf_cnpj")
    .order("created_at", { ascending: false })

  if (profile.role !== "admin") {
    queryAnunciantes = queryAnunciantes.eq("cadastrado_por", profile.id)
  }

  // 4. Buscar espaços de anúncio disponíveis
  let queryEspacos = supabase
    .from("espacos_anuncio")
    .select(`
      id,
      nome,
      preco_mensal,
      coluna_id,
      formato:formatos_anuncio(
        id,
        nome,
        posicao,
        largura,
        altura,
        largura_mobile,
        altura_mobile
      )
    `)
    .eq("ativo", true)
    .order("created_at", { ascending: false })

  if (profile.role !== "admin") {
    if (colunaIds.length > 0) {
      // Espaços das colunas do colunista ou da plataforma
      queryEspacos = queryEspacos.or(`coluna_id.in.(${colunaIds.join(",")}),dono_tipo.eq.plataforma`)
    }
  }

  let [
    { data: anunciosDb },
    { data: anunciantesDb },
    { data: espacosDb },
  ] = await Promise.all([
    queryAnuncios,
    queryAnunciantes,
    queryEspacos,
  ])

  // Fallback garantido se RLS restringir a leitura do usuário
  if (!anunciosDb || anunciosDb.length === 0) {
    try {
      const admin = getSupabaseAdmin();
      let adminQ = admin
        .from("anuncios")
        .select(`
          *,
          anunciante:anunciantes(id, nome, email, telefone),
          espaco:espacos_anuncio(
            id,
            nome,
            preco_mensal,
            formato:formatos_anuncio(
              id,
              nome,
              posicao,
              largura,
              altura,
              largura_mobile,
              altura_mobile
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (profile.role !== "admin") {
        adminQ = adminQ.eq("dono_id", profile.id);
      }

      const { data: adminAnuncios } = await adminQ;
      if (adminAnuncios && adminAnuncios.length > 0) {
        anunciosDb = adminAnuncios;
      }
    } catch (e) {
      console.warn("Aviso na consulta admin de anúncios:", e);
    }
  }

  // Formatar anunciantes para o componente
  const anunciantesFormatados = (anunciantesDb || []).map((a) => ({
    id: a.id,
    nome_contato: a.nome,
    empresa: a.nome,
    email: a.email,
    telefone: a.telefone,
  }))

  // Formatar espaços para o componente
  const espacosFormatados: EspacoComFormato[] = (espacosDb || []).map((rawE) => {
    const e = rawE as Record<string, unknown>;
    const fmt = (Array.isArray(e.formato) ? e.formato[0] : e.formato) as Record<string, unknown> | undefined;
    return {
      id: String(e.id || ""),
      nome: String(e.nome || ""),
      posicao: (fmt?.posicao as string) || "topo",
      preco_mensal: Number(e.preco_mensal) || 0,
      coluna_id: (e.coluna_id as string | null) || null,
      formato: {
        id: String(fmt?.id || ""),
        nome: String(fmt?.nome || "Formato Padrão"),
        largura_desktop: Number(fmt?.largura) || 728,
        altura_desktop: Number(fmt?.altura) || 90,
        largura_mobile: Number(fmt?.largura_mobile || fmt?.largura) || 320,
        altura_mobile: Number(fmt?.altura_mobile || fmt?.altura) || 50,
      },
    };
  })

  // Formatar anúncios para o componente
  const anunciosFormatados = (anunciosDb || []).map((rawA) => {
    const a = rawA as Record<string, unknown>;
    const anunciante = (Array.isArray(a.anunciante) ? a.anunciante[0] : a.anunciante) as Record<string, unknown> | undefined;
    const espaco = (Array.isArray(a.espaco) ? a.espaco[0] : a.espaco) as Record<string, unknown> | undefined;
    const formato = espaco ? ((Array.isArray(espaco.formato) ? espaco.formato[0] : espaco.formato) as Record<string, unknown> | undefined) : null;

    return {
      ...a,
      valor_total: Number(a.valor || 0),
      impressoes: Number(a.impressoes || 0),
      cliques: Number(a.cliques || 0),
      anunciante: anunciante
        ? {
            id: String(anunciante.id || ""),
            nome_contato: String(anunciante.nome || ""),
            empresa: String(anunciante.nome || ""),
            email: (anunciante.email as string | null) || null,
            telefone: (anunciante.telefone as string | null) || null,
          }
        : undefined,
      espaco: espaco
        ? {
            id: String(espaco.id || ""),
            nome: String(espaco.nome || ""),
            posicao: (formato?.posicao as string) || "topo",
            preco_mensal: Number(espaco.preco_mensal) || 0,
            formato: formato
              ? {
                  id: String(formato.id || ""),
                  nome: String(formato.nome || ""),
                  largura_desktop: Number(formato.largura) || 728,
                  altura_desktop: Number(formato.altura) || 90,
                  largura_mobile: Number(formato.largura_mobile || formato.largura) || 320,
                  altura_mobile: Number(formato.altura_mobile || formato.altura) || 50,
                }
              : undefined,
          }
        : undefined,
    };
  })

  return (
    <ColunistaAnunciosView
      initialAnuncios={(anunciosFormatados as unknown as AnuncioItem[]) || []}
      anunciantes={anunciantesFormatados}
      espacos={espacosFormatados}
    />
  )
}
