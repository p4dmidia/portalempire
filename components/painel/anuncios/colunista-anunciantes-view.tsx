"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  AnuncianteFormDialog,
  AnuncianteItem,
} from "@/components/painel/anuncios/anunciante-form-dialog"
import { Plus, Search, Edit, Trash2, Building, Mail, Phone, Users } from "lucide-react"

interface ColunistaAnunciantesViewProps {
  initialAnunciantes: AnuncianteItem[]
}

export function ColunistaAnunciantesView({
  initialAnunciantes,
}: ColunistaAnunciantesViewProps) {
  const [anunciantes, setAnunciantes] = useState<AnuncianteItem[]>(initialAnunciantes)
  const [busca, setBusca] = useState("")
  const [modalAberto, setModalAberto] = useState(false)
  const [anuncianteEditando, setAnuncianteEditando] = useState<AnuncianteItem | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const recarregar = async () => {
    try {
      const res = await fetch("/api/anunciantes")
      const json = await res.json()
      if (res.ok) {
        setAnunciantes(json.anunciantes || json.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente remover o anunciante "${nome}"?`)) return
    try {
      setExcluindoId(id)
      const res = await fetch(`/api/anunciantes/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || "Erro ao excluir anunciante")
        return
      }
      setAnunciantes((prev) => prev.filter((a) => a.id !== id))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir anunciante"
      alert(msg)
    } finally {
      setExcluindoId(null)
    }
  }

  const anunciantesFiltrados = anunciantes.filter((a) => {
    const termo = busca.toLowerCase()
    return (
      a.nome_contato.toLowerCase().includes(termo) ||
      (a.empresa && a.empresa.toLowerCase().includes(termo)) ||
      (a.email && a.email.toLowerCase().includes(termo)) ||
      (a.telefone && a.telefone.includes(termo))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Anunciantes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os clientes e empresas que anunciam nas suas colunas
          </p>
        </div>
        <Button
          onClick={() => {
            setAnuncianteEditando(null)
            setModalAberto(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Anunciante
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por contato, empresa ou e-mail..."
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
              <TableHead>Contato / Empresa</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anunciantesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-8 w-8 mb-2 opacity-40" />
                    <p>Nenhum anunciante cadastrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              anunciantesFiltrados.map((anunciante) => (
                <TableRow key={anunciante.id}>
                  <TableCell>
                    <div className="font-medium">{anunciante.nome_contato}</div>
                    {anunciante.empresa && (
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <Building className="mr-1 h-3 w-3" />
                        {anunciante.empresa}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {anunciante.email ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                        {anunciante.email}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {anunciante.telefone ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1.5 h-3.5 w-3.5" />
                        {anunciante.telefone}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {anunciante.documento || "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAnuncianteEditando(anunciante)
                        setModalAberto(true)
                      }}
                      title="Editar anunciante"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={excluindoId === anunciante.id}
                      onClick={() => handleDelete(anunciante.id, anunciante.nome_contato)}
                      title="Remover anunciante"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AnuncianteFormDialog
        open={modalAberto}
        onOpenChange={setModalAberto}
        anuncianteParaEditar={anuncianteEditando}
        onSuccess={recarregar}
      />
    </div>
  )
}
