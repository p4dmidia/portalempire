import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { AdminFinanceiroView, AdminPedidoItem } from "@/components/painel/financeiro/admin-financeiro-view"

export default async function AdminFinanceiroPage() {
  await requireRole(["admin"])
  const supabase = await createClient()

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(`
      *,
      anuncio:anuncios(
        id, titulo, inicio_em, fim_em,
        anunciante:anunciantes(nome, email)
      ),
      dono:profiles!dono_id(
        id, nome, email, asaas_wallet_id
      )
    `)
    .order("created_at", { ascending: false })

  return <AdminFinanceiroView initialPedidos={(pedidos as unknown as AdminPedidoItem[]) || []} />
}
