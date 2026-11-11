"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  AnuncioFormDialog,
  AnuncioItem,
} from "@/components/painel/anuncios/anuncio-form-dialog"
import {
  MetricasDialog,
} from "@/components/painel/anuncios/metricas-dialog"
import {
  Plus,
  Search,
  BarChart3,
  Edit,
  ExternalLink,
  Megaphone,
  Calendar,
} from "lucide-react"

interface ColunistaAnunciosViewProps {
  initialAnuncios: AnuncioItem[]
  anunciantes: { id: string; nome_contato: string; empresa: string | null }[]
  espacos: {
    id: string
    nome: string
    posicao: string
    preco_mensal: number
    formato: {
      id: string
      nome: string
      largura_desktop: number
      altura_desktop: number
      largura_mobile: number
      altura_mobile: number
    }
  }[]
}

export function ColunistaAnunciosView({
  initialAnuncios,
  anunciantes,
  espacos,
}: ColunistaAnunciosViewProps) {
  const router = useRouter()
  const [anuncios, setAnuncios] = useState<AnuncioItem[]>(initialAnuncios)
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [modalFormAberto, setModalFormAberto] = useState(false)
  const [modalMetricasAberto, setModalMetricasAberto] = useState(false)
  const [anuncioSelecionado, setAnuncioSelecionado] = useState<AnuncioItem | null>(null)

  useEffect(() => {
    if (initialAnuncios) {
      setAnuncios(initialAnuncios)
    }
  }, [initialAnuncios])

  const recarregar = async () => {
    try {
      const res = await fetch("/api/anuncios")
      const json = await res.json()
      if (res.ok && Array.isArray(json.anuncios)) {
        setAnuncios(json.anuncios)
      }
    } catch (e) {
      console.error(e)
    }
    router.refresh()
  }

  const handleStatusChange = async (anuncio: AnuncioItem, novoStatus: string) => {
    try {
      const res = await fetch(`/api/anuncios/${anuncio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: anuncio.titulo,
          anunciante_id: anuncio.anunciante_id,
          espaco_id: anuncio.espaco_id,
          imagem_desktop_url: anuncio.imagem_desktop_url,
          imagem_mobile_url: anuncio.imagem_mobile_url,
          link_destino: anuncio.link_destino,
          inicio_em: anuncio.inicio_em,
          fim_em: anuncio.fim_em,
          valor_total: anuncio.valor_total,
          status: novoStatus,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || "Erro ao alterar status")
        return
      }
      recarregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar status"
      alert(msg)
    }
  }

  const anunciosFiltrados = anuncios.filter((a) => {
    const matchBusca =
      a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (a.anunciante?.empresa &&
        a.anunciante.empresa.toLowerCase().includes(busca.toLowerCase())) ||
      (a.anunciante?.nome_contato &&
        a.anunciante.nome_contato.toLowerCase().includes(busca.toLowerCase()))

    const matchStatus = statusFiltro === "todos" || a.status === statusFiltro
    return matchBusca && matchStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
      case "agendado":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Agendado</Badge>
      case "pausado":
        return <Badge variant="secondary">Pausado</Badge>
      case "expirado":
        return <Badge variant="outline" className="text-muted-foreground">Expirado</Badge>
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners Patrocinados</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre os banners dos seus patrocinadores nas suas colunas e matérias.
          </p>
        </div>
        <Button
          onClick={() => {
            setAnuncioSelecionado(null)
            setModalFormAberto(true)
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Banner
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou anunciante..."
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
          <option value="ativo">Ativo</option>
          <option value="agendado">Agendado</option>
          <option value="pausado">Pausado</option>
          <option value="expirado">Expirado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anúncio / Anunciante</TableHead>
              <TableHead>Espaço</TableHead>
              <TableHead>Período</TableHead>
              <TableHead className="text-center">Desempenho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anunciosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Megaphone className="h-8 w-8 mb-2 opacity-40" />
                    <p>Nenhum anúncio encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              anunciosFiltrados.map((anuncio) => {
                const ctr =
                  anuncio.impressoes > 0
                    ? ((anuncio.cliques / anuncio.impressoes) * 100).toFixed(2)
                    : "0.00"

                const tituloLimpo = (anuncio.titulo || "").replace(/\[paginas:.*?\]/, "").trim() || "Anúncio"
                const pagMatch = (anuncio.titulo || "").match(/\[paginas:(.*?)\]/)
                const pagConfig = pagMatch ? pagMatch[1] : "todas"

                return (
                  <TableRow key={anuncio.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {anuncio.imagem_desktop_url && (
                          <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-slate-900 border shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={anuncio.imagem_desktop_url}
                              alt={tituloLimpo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm flex items-center gap-1.5 truncate">
                            {tituloLimpo}
                            {anuncio.link_destino && (
                              <a
                                href={anuncio.link_destino}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary shrink-0"
                                title="Abrir link de destino"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {anuncio.anunciante?.empresa || anuncio.anunciante?.nome_contato || "Anunciante"}
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border">
                              {pagConfig === "home_portal" || pagConfig === "home_coluna"
                                ? "🏠 Home do Portal"
                                : pagConfig === "coluna_apenas"
                                ? "✍️ Capa da Coluna"
                                : pagConfig === "artigos"
                                ? "📰 Artigos / Matérias"
                                : "🌐 Todo o Site"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted">
                        {anuncio.espaco?.posicao === "topo"
                          ? "Topo da Página"
                          : anuncio.espaco?.posicao === "lateral" || anuncio.espaco?.posicao === "sidebar"
                          ? "Barra Lateral"
                          : anuncio.espaco?.posicao === "meio_texto" || anuncio.espaco?.posicao === "artigo"
                          ? "Meio da Matéria"
                          : anuncio.espaco?.posicao === "rodape"
                          ? "Rodapé"
                          : anuncio.espaco?.nome || "Banner"}
                      </span>
                      {anuncio.espaco?.formato && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {anuncio.espaco.formato.largura_desktop}x{anuncio.espaco.formato.altura_desktop} px
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(anuncio.inicio_em).toLocaleDateString("pt-BR")} até{" "}
                        {new Date(anuncio.fim_em).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs space-y-0.5 font-mono">
                        <div>
                          <span className="font-semibold text-foreground">
                            {anuncio.impressoes.toLocaleString("pt-BR")}
                          </span>{" "}
                          imp.
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">
                            {anuncio.cliques.toLocaleString("pt-BR")}
                          </span>{" "}
                          cliques ({ctr}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(anuncio.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAnuncioSelecionado(anuncio)
                          setModalMetricasAberto(true)
                        }}
                        title="Ver estatísticas detalhadas"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAnuncioSelecionado(anuncio)
                          setModalFormAberto(true)
                        }}
                        title="Editar anúncio"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {anuncio.status === "ativo" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          onClick={() => handleStatusChange(anuncio, "pausado")}
                        >
                          Pausar
                        </Button>
                      )}
                      {anuncio.status === "pausado" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          onClick={() => handleStatusChange(anuncio, "ativo")}
                        >
                          Ativar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AnuncioFormDialog
        open={modalFormAberto}
        onOpenChange={setModalFormAberto}
        anuncioParaEditar={anuncioSelecionado}
        anunciantes={anunciantes}
        espacos={espacos}
        onSuccess={recarregar}
      />

      <MetricasDialog
        open={modalMetricasAberto}
        onOpenChange={setModalMetricasAberto}
        anuncioId={anuncioSelecionado?.id || null}
        anuncioTitulo={anuncioSelecionado?.titulo}
      />
    </div>
  )
}
