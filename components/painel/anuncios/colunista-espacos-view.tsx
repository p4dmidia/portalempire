"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  EspacoFormDialog,
  EspacoItem,
} from "@/components/painel/anuncios/espaco-form-dialog"
import { Plus, Edit, LayoutGrid } from "lucide-react"

interface ColunistaEspacosViewProps {
  initialEspacos: EspacoItem[]
  formatos: { id: string; nome: string; posicao_padrao: string; preco_minimo: number }[]
  colunas: { id: string; nome: string }[]
}

export function ColunistaEspacosView({
  initialEspacos,
  formatos,
  colunas,
}: ColunistaEspacosViewProps) {
  const [espacos, setEspacos] = useState<EspacoItem[]>(initialEspacos)
  const [modalAberto, setModalAberto] = useState(false)
  const [espacoEditando, setEspacoEditando] = useState<EspacoItem | null>(null)

  const recarregar = async () => {
    try {
      const res = await fetch("/api/espacos")
      const json = await res.json()
      if (res.ok) {
        setEspacos(json.espacos || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Espaços Publicitários</h1>
          <p className="text-sm text-muted-foreground">
            Defina posições e preços de anúncios nas suas colunas
          </p>
        </div>
        <Button
          onClick={() => {
            setEspacoEditando(null)
            setModalAberto(true)
          }}
          disabled={colunas.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Espaço
        </Button>
      </div>

      {colunas.length === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          Você precisa ter pelo menos uma coluna criada para configurar espaços publicitários.
        </div>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Espaço / Nome</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Posição</TableHead>
              <TableHead>Preço Mensal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {espacos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <LayoutGrid className="h-8 w-8 mb-2 opacity-40" />
                    <p>Nenhum espaço publicitário criado para suas colunas.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              espacos.map((espaco) => (
                <TableRow key={espaco.id}>
                  <TableCell className="font-medium">
                    {espaco.nome}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {espaco.formato?.nome || "Formato"}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {espaco.posicao}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                    R$ {Number(espaco.preco_mensal).toFixed(2)}
                    {espaco.preco_semanal && (
                      <span className="text-xs text-muted-foreground block font-normal">
                        Semanal: R$ {Number(espaco.preco_semanal).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={espaco.ativo ? "default" : "secondary"}>
                      {espaco.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEspacoEditando(espaco)
                        setModalAberto(true)
                      }}
                      title="Editar espaço"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EspacoFormDialog
        open={modalAberto}
        onOpenChange={setModalAberto}
        espacoParaEditar={espacoEditando}
        formatos={formatos}
        colunas={colunas}
        onSuccess={recarregar}
      />
    </div>
  )
}
