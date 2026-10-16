import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ColunistaFinanceiroView, PedidoItem } from "@/components/painel/financeiro/colunista-financeiro-view"

export default async function ColunistaFinanceiroPage() {
  const profile = await requireRole(["colunista", "admin"])
  const supabase = await createClient()

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(`
      *,
      anuncio:anuncios(
        id, titulo, inicio_em, fim_em,
        anunciante:anunciantes(nome, telefone)
      )
    `)
    .eq("dono_id", profile.id)
    .order("created_at", { ascending: false })

  return (
    <ColunistaFinanceiroView
      initialPedidos={(pedidos as unknown as PedidoItem[]) || []}
      userProfile={{
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        cpf_cnpj: profile.cpf_cnpj || null,
        telefone: profile.telefone || null,
        asaas_wallet_id: profile.asaas_wallet_id || null,
      }}
    />
  )
}
