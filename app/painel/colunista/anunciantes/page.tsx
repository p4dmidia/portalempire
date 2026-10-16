import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ColunistaAnunciantesView } from "@/components/painel/anuncios/colunista-anunciantes-view"
import { AnuncianteItem } from "@/components/painel/anuncios/anunciante-form-dialog"

export default async function ColunistaAnunciantesPage() {
  const profile = await requireRole(["admin", "colunista"])
  const supabase = await createClient()

  let query = supabase
    .from("anunciantes")
    .select("*")
    .order("created_at", { ascending: false })

  if (profile.role !== "admin") {
    query = query.eq("cadastrado_por", profile.id)
  }

  const { data: anunciantes } = await query

  const anunciantesFormatados: AnuncianteItem[] = (anunciantes || []).map((a) => ({
    id: a.id,
    nome_contato: a.nome,
    empresa: a.nome,
    email: a.email,
    telefone: a.telefone,
    documento: a.cpf_cnpj,
    criado_em: a.created_at,
  }))

  return <ColunistaAnunciantesView initialAnunciantes={anunciantesFormatados} />
}
