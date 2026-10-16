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
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react"

export interface AdminPedidoItem {
  id: string
  anuncio_id: string
  dono_id: string
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
      email: string | null
    }
  }
  dono?: {
    id: string
    nome: string
    email: string
    asaas_wallet_id: string | null
  }
}

interface AdminFinanceiroViewProps {
  initialPedidos: AdminPedidoItem[]
}

export function AdminFinanceiroView({ initialPedidos }: AdminFinanceiroViewProps) {
  const [pedidos, setPedidos] = useState<AdminPedidoItem[]>(initialPedidos)
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  // Totais consolidados
  const totalFaturamentoBruto = pedidos
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + Number(p.valor_total), 0)

  const totalComissaoPlataforma = pedidos
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + Number(p.valor_comissao), 0)

  const totalRepasseColunistas = pedidos
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + Number(p.valor_liquido_dono), 0)

  const totalPendente = pedidos
    .filter((p) => p.status === "pendente")
    .reduce((acc, p) => acc + Number(p.valor_total), 0)

  const handleConfirmarManual = async (pedidoId: string) => {
    if (!confirm("Deseja confirmar manualmente o pagamento deste pedido e ativar o anúncio?")) {
      return
    }

    try {
      setConfirmandoId(pedidoId)
      const res = await fetch(`/api/pedidos/${pedidoId}/confirmar-manual`, {
        method: "POST",
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || "Erro ao confirmar pagamento")
      }

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId
            ? { ...p, status: "pago", pago_em: new Date().toISOString() }
            : p
        )
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido"
      alert(msg)
    } finally {
      setConfirmandoId(null)
    }
  }

  const exportarCSV = () => {
    const cabecalho = [
      "ID Pedido",
      "Data Criação",
      "Campanha",
      "Anunciante",
      "Colunista / Dono",
      "Valor Bruto (R$)",
      "Comissão (%)",
      "Comissão Plataforma (R$)",
      "Líquido Colunista (R$)",
      "Forma Pagamento",
      "Status",
      "Data Pagamento",
      "Asaas Payment ID",
    ]

    const linhas = pedidos.map((p) => [
      p.id,
      new Date(p.created_at).toLocaleDateString("pt-BR"),
      `"${p.anuncio?.titulo || "Anúncio"}"`,
      `"${p.anuncio?.anunciante?.nome || "-"}"`,
      `"${p.dono?.nome || "-"}"`,
      Number(p.valor_total).toFixed(2),
      p.comissao_percentual,
      Number(p.valor_comissao).toFixed(2),
      Number(p.valor_liquido_dono).toFixed(2),
      p.forma_pagamento,
      p.status,
      p.pago_em ? new Date(p.pago_em).toLocaleDateString("pt-BR") : "-",
      p.asaas_payment_id || "-",
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [cabecalho.join(";"), ...linhas.map((e) => e.join(";"))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `relatorio_financeiro_portal_empire_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    const termo = busca.toLowerCase()
    const titulo = p.anuncio?.titulo?.toLowerCase() || ""
    const anunciante = p.anuncio?.anunciante?.nome?.toLowerCase() || ""
    const dono = p.dono?.nome?.toLowerCase() || ""
    const matchBusca =
      titulo.includes(termo) || anunciante.includes(termo) || dono.includes(termo)

    const matchStatus = statusFiltro === "todos" || p.status === statusFiltro
    return matchBusca && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro Global do Portal</h1>
          <p className="text-sm text-muted-foreground">
            Visão consolidada de faturamento, comissões retidas e repasses Asaas aos colunistas
          </p>
        </div>
        <Button onClick={exportarCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório CSV
        </Button>
      </div>

      {/* Cards com Métricas Globais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Bruto</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            R$ {totalFaturamentoBruto.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Total transacionado e pago</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Comissão da Plataforma</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-primary">
            R$ {totalComissaoPlataforma.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Receita líquida retida pelo portal</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Repasse Colunistas</span>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            R$ {totalRepasseColunistas.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Repassado via Split Asaas</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Aguardando Pagamento</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            R$ {totalPendente.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Em cobrança aberta</p>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por anúncio, anunciante ou colunista..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8"
            />
          </div>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="w-full sm:w-[180px] h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="todos">Todos os Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
            <option value="reembolsado">Reembolsado</option>
          </select>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Campanha / Anunciante</TableHead>
                <TableHead>Colunista</TableHead>
                <TableHead>Bruto</TableHead>
                <TableHead>Comissão Portal</TableHead>
                <TableHead>Líquido Colunista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Nenhum pedido localizado.
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
                        {pedido.anuncio?.titulo || "Campanha"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pedido.anuncio?.anunciante?.nome || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{pedido.dono?.nome || "Plataforma"}</div>
                      {pedido.dono?.asaas_wallet_id ? (
                        <div className="text-[10px] text-emerald-600 font-mono">
                          Wallet: {pedido.dono.asaas_wallet_id}
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground">Sem subconta</div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      R$ {Number(pedido.valor_total).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-primary">
                      R$ {Number(pedido.valor_comissao).toFixed(2)} ({pedido.comissao_percentual}%)
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">
                      R$ {Number(pedido.valor_liquido_dono).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pedido.status === "pago"
                            ? "default"
                            : pedido.status === "pendente"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          pedido.status === "pago" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                        }
                      >
                        {pedido.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {pedido.link_pagamento && (
                        <a
                          href={pedido.link_pagamento}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          title="Abrir fatura Asaas"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {pedido.status === "pendente" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={confirmandoId === pedido.id}
                          onClick={() => handleConfirmarManual(pedido.id)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          {confirmandoId === pedido.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Confirmar Manual
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
