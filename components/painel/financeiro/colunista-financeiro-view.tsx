"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubcontaConfigDialog } from "@/components/painel/financeiro/subconta-config-dialog"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  ExternalLink,
  Search,
  Share2,
  Wallet,
} from "lucide-react"

export interface PedidoItem {
  id: string
  anuncio_id: string
  valor_total: number
  comissao_percentual: number
  valor_comissao: number
  valor_liquido_dono: number
  forma_pagamento: string
  asaas_payment_id: string | null
  link_pagamento: string | null
  status: string
  pago_em: string | null
  created_at: string
  anuncio?: {
    id: string
    titulo: string
    inicio_em: string
    fim_em: string
    anunciante?: {
      nome: string
      telefone: string | null
    }
  }
}

interface ColunistaFinanceiroViewProps {
  initialPedidos: PedidoItem[]
  userProfile: {
    id: string
    nome: string
    email: string
    cpf_cnpj: string | null
    telefone: string | null
    asaas_wallet_id: string | null
  }
}

export function ColunistaFinanceiroView({
  initialPedidos,
  userProfile,
}: ColunistaFinanceiroViewProps) {
  const [pedidos] = useState<PedidoItem[]>(initialPedidos)
  const [busca, setBusca] = useState("")
  const [modalSubcontaAberto, setModalSubcontaAberto] = useState(false)

  // Cálculos financeiros
  const totalVendido = pedidos
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + Number(p.valor_total), 0)

  const totalComissaoPlataforma = pedidos
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + Number(p.valor_comissao), 0)

  const totalLiquidoColunista = pedidos
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + Number(p.valor_liquido_dono), 0)

  const totalPendente = pedidos
    .filter((p) => p.status === "pendente")
    .reduce((acc, p) => acc + Number(p.valor_liquido_dono), 0)

  const pedidosFiltrados = pedidos.filter((p) => {
    const termo = busca.toLowerCase()
    const titulo = p.anuncio?.titulo?.toLowerCase() || ""
    const anunciante = p.anuncio?.anunciante?.nome?.toLowerCase() || ""
    return titulo.includes(termo) || anunciante.includes(termo)
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Pago (Split OK)</Badge>
      case "pendente":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Aguardando Pagamento</Badge>
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>
      case "reembolsado":
        return <Badge variant="secondary">Reembolsado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const gerarTextoWhatsApp = (pedido: PedidoItem) => {
    const link = pedido.link_pagamento || "https://sandbox.asaas.com"
    const titulo = pedido.anuncio?.titulo || "Anúncio"
    const valor = Number(pedido.valor_total).toFixed(2)
    const texto = `Olá! Segue o link seguro para pagamento da sua campanha "${titulo}" no Portal Empire no valor de R$ ${valor}:\n\n${link}\n\nAssim que o pagamento for concluído, seu anúncio entra no ar automaticamente!`
    return encodeURIComponent(texto)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro & Repasses</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o split de receitas, vendas de anúncios e sua carteira de recebimento
          </p>
        </div>
        <Button
          variant={userProfile.asaas_wallet_id ? "outline" : "default"}
          onClick={() => setModalSubcontaAberto(true)}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          {userProfile.asaas_wallet_id ? "Gerenciar Conta Asaas" : "Ativar Recebimento Asaas"}
        </Button>
      </div>

      {/* Banner de status da carteira Asaas */}
      {userProfile.asaas_wallet_id ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">Conta Asaas Integrada (Split Automático Ativo)</p>
              <p className="text-xs opacity-80 font-mono">
                Wallet ID: {userProfile.asaas_wallet_id}
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white">Pronto para Repasses</Badge>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold">⚠️ Carteira de Recebimento Não Configurada</p>
            <p className="text-xs opacity-90">
              Configure seus dados cadastrais para que os pagamentos dos anunciantes sejam repassados automaticamente para sua conta.
            </p>
          </div>
          <Button size="sm" onClick={() => setModalSubcontaAberto(true)}>
            Configurar Agora
          </Button>
        </div>
      )}

      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Líquido Recebido</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            R$ {totalLiquidoColunista.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Já transferido / split consolidado</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total em Vendas</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            R$ {totalVendido.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Valor bruto total pago pelos clientes</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Taxa da Plataforma</span>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-600 dark:text-slate-400">
            R$ {totalComissaoPlataforma.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Comissão retida (média ~20%)</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Aguardando Pagto</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            R$ {totalPendente.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Valor líquido de pedidos pendentes</p>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por anúncio ou anunciante..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Campanha / Anunciante</TableHead>
                <TableHead>Bruto</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Líquido (Você)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum pedido ou transação financeira registrada.
                  </TableCell>
                </TableRow>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {pedido.anuncio?.titulo || "Campanha Publicitária"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pedido.anuncio?.anunciante?.nome || "Anunciante"}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      R$ {Number(pedido.valor_total).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      R$ {Number(pedido.valor_comissao).toFixed(2)} ({pedido.comissao_percentual}%)
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {Number(pedido.valor_liquido_dono).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {pedido.link_pagamento && (
                        <>
                          <a
                            href={pedido.link_pagamento}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                            title="Abrir fatura Asaas"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <a
                            href={`https://api.whatsapp.com/send?text=${gerarTextoWhatsApp(pedido)}${
                              pedido.anuncio?.anunciante?.telefone
                                ? `&phone=${pedido.anuncio.anunciante.telefone.replace(/\D/g, "")}`
                                : ""
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 hover:text-emerald-700 transition-colors"
                            title="Enviar cobrança pelo WhatsApp"
                          >
                            <Share2 className="h-4 w-4" />
                          </a>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <SubcontaConfigDialog
        open={modalSubcontaAberto}
        onOpenChange={setModalSubcontaAberto}
        userProfile={userProfile}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
