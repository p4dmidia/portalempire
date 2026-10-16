"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  FormatoFormDialog,
  FormatoItem,
} from "@/components/painel/anuncios/formato-form-dialog"
import {
  EspacoFormDialog,
  EspacoItem,
} from "@/components/painel/anuncios/espaco-form-dialog"
import {
  MetricasDialog,
} from "@/components/painel/anuncios/metricas-dialog"
import { AnuncioFormDialog, AnuncioItem } from "@/components/painel/anuncios/anuncio-form-dialog"
import { AnuncianteFormDialog, AnuncianteItem } from "@/components/painel/anuncios/anunciante-form-dialog"
import {
  Plus,
  Search,
  BarChart3,
  Edit,
  ExternalLink,
  Megaphone,
  LayoutGrid,
  Layers,
  Calendar,
  Users,
} from "lucide-react"

interface AdminAnunciosDashboardProps {
  initialAnuncios: AnuncioItem[]
  initialEspacos: EspacoItem[]
  initialFormatos: FormatoItem[]
  initialAnunciantes?: AnuncianteItem[]
  colunas: { id: string; nome: string }[]
}

export function AdminAnunciosDashboard({
  initialAnuncios,
  initialEspacos,
  initialFormatos,
  initialAnunciantes = [],
  colunas,
}: AdminAnunciosDashboardProps) {
  const [anuncios, setAnuncios] = useState<AnuncioItem[]>(initialAnuncios)
  const [espacos, setEspacos] = useState<EspacoItem[]>(initialEspacos)
  const [formatos, setFormatos] = useState<FormatoItem[]>(initialFormatos)
  const [anunciantes, setAnunciantes] = useState<AnuncianteItem[]>(initialAnunciantes)

  const [buscaAnuncios, setBuscaAnuncios] = useState("")
  const [modalAnuncioAberto, setModalAnuncioAberto] = useState(false)
  const [anuncioEditando, setAnuncioEditando] = useState<AnuncioItem | null>(null)

  const [modalAnuncianteAberto, setModalAnuncianteAberto] = useState(false)
  const [anuncianteEditando, setAnuncianteEditando] = useState<AnuncianteItem | null>(null)

  const [modalFormatoAberto, setModalFormatoAberto] = useState(false)
  const [formatoEditando, setFormatoEditando] = useState<FormatoItem | null>(null)

  const [modalEspacoAberto, setModalEspacoAberto] = useState(false)
  const [espacoEditando, setEspacoEditando] = useState<EspacoItem | null>(null)

  const [modalMetricasAberto, setModalMetricasAberto] = useState(false)
  const [anuncioMetricas, setAnuncioMetricas] = useState<AnuncioItem | null>(null)

  const recarregarFormatos = async () => {
    try {
      const res = await fetch("/api/admin/anuncios/formatos")
      const json = await res.json()
      if (res.ok) setFormatos(json.formatos || json.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const recarregarEspacos = async () => {
    try {
      const res = await fetch("/api/espacos")
      const json = await res.json()
      if (res.ok) setEspacos(json.espacos || json.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const recarregarAnuncios = async () => {
    try {
      const res = await fetch("/api/anuncios")
      const json = await res.json()
      if (res.ok) setAnuncios(json.anuncios || json.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const recarregarAnunciantes = async () => {
    try {
      const res = await fetch("/api/anunciantes")
      const json = await res.json()
      if (res.ok) setAnunciantes(json.anunciantes || json.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleAnuncioStatus = async (anuncio: AnuncioItem, novoStatus: string) => {
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
      recarregarAnuncios()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar status"
      alert(msg)
    }
  }

  const anunciosFiltrados = anuncios.filter((a) => {
    const termo = buscaAnuncios.toLowerCase()
    return (
      a.titulo.toLowerCase().includes(termo) ||
      (a.anunciante?.empresa && a.anunciante.empresa.toLowerCase().includes(termo)) ||
      (a.anunciante?.nome_contato && a.anunciante.nome_contato.toLowerCase().includes(termo))
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Publicidade</h1>
        <p className="text-sm text-muted-foreground">
          Controle central de formatos, espaços publicitários e anúncios veiculados no portal
        </p>
      </div>

      <Tabs defaultValue="anuncios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="anuncios" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Todos os Anúncios ({anuncios.length})
          </TabsTrigger>
          <TabsTrigger value="anunciantes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Anunciantes ({anunciantes.length})
          </TabsTrigger>
          <TabsTrigger value="espacos" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Espaços ({espacos.length})
          </TabsTrigger>
          <TabsTrigger value="formatos" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Formatos ({formatos.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ANÚNCIOS */}
        <TabsContent value="anuncios" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar anúncios..."
                value={buscaAnuncios}
                onChange={(e) => setBuscaAnuncios(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              onClick={() => {
                setAnuncioEditando(null)
                setModalAnuncioAberto(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Anúncio
            </Button>
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
                      Nenhum anúncio cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  anunciosFiltrados.map((anuncio) => {
                    const ctr =
                      anuncio.impressoes > 0
                        ? ((anuncio.cliques / anuncio.impressoes) * 100).toFixed(2)
                        : "0.00"

                    return (
                      <TableRow key={anuncio.id}>
                        <TableCell>
                          <div className="font-medium flex items-center gap-1.5">
                            {anuncio.titulo}
                            {anuncio.link_destino && (
                              <a
                                href={anuncio.link_destino}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {anuncio.anunciante?.empresa || anuncio.anunciante?.nome_contato}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {anuncio.espaco?.nome || "Espaço"}
                          </span>
                          {anuncio.espaco?.formato && (
                            <div className="text-xs text-muted-foreground">
                              {anuncio.espaco.formato.nome}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(anuncio.inicio_em).toLocaleDateString("pt-BR")} -{" "}
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
                        <TableCell>
                          <Badge
                            variant={
                              anuncio.status === "ativo"
                                ? "default"
                                : anuncio.status === "agendado"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              anuncio.status === "ativo"
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : ""
                            }
                          >
                            {anuncio.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setAnuncioMetricas(anuncio)
                              setModalMetricasAberto(true)
                            }}
                            title="Ver métricas"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          {anuncio.status === "ativo" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-amber-600"
                              onClick={() => handleToggleAnuncioStatus(anuncio, "pausado")}
                            >
                              Pausar
                            </Button>
                          )}
                          {anuncio.status === "pausado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-emerald-600"
                              onClick={() => handleToggleAnuncioStatus(anuncio, "ativo")}
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
        </TabsContent>

        {/* TAB 2: ESPAÇOS */}
        <TabsContent value="espacos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Espaços de exibição cadastrados na plataforma e nas colunas
            </p>
            <Button
              onClick={() => {
                if (formatos.length === 0) {
                  setFormatoEditando(null)
                  setModalFormatoAberto(true)
                } else {
                  setEspacoEditando(null)
                  setModalEspacoAberto(true)
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Espaço
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Espaço</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Tipo / Coluna</TableHead>
                  <TableHead>Preço Mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {espacos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Nenhum espaço cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  espacos.map((espaco) => (
                    <TableRow key={espaco.id}>
                      <TableCell className="font-medium">{espaco.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {espaco.formato?.nome || "Formato"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {espaco.posicao}
                      </TableCell>
                      <TableCell>
                        {espaco.coluna_id ? (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            Coluna
                          </span>
                        ) : (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                            Plataforma Geral
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        R$ {Number(espaco.preco_mensal).toFixed(2)}
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
                            setModalEspacoAberto(true)
                          }}
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
        </TabsContent>

        {/* TAB 3: FORMATOS */}
        <TabsContent value="formatos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Formatos padronizados com dimensões desktop/mobile e preço base mínimo
            </p>
            <Button
              onClick={() => {
                setFormatoEditando(null)
                setModalFormatoAberto(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Formato
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formato / Slug</TableHead>
                  <TableHead>Dimensão Desktop</TableHead>
                  <TableHead>Dimensão Mobile</TableHead>
                  <TableHead>Posição Padrão</TableHead>
                  <TableHead>Preço Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formatos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Nenhum formato cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  formatos.map((formato) => (
                    <TableRow key={formato.id}>
                      <TableCell>
                        <div className="font-medium">{formato.nome}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {formato.slug}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formato.largura_desktop}x{formato.altura_desktop} px
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formato.largura_mobile}x{formato.altura_mobile} px
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {formato.posicao_padrao}
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        R$ {Number(formato.preco_minimo).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={formato.ativo ? "default" : "secondary"}>
                          {formato.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormatoEditando(formato)
                            setModalFormatoAberto(true)
                          }}
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
        </TabsContent>

        {/* TAB: ANUNCIANTES */}
        <TabsContent value="anunciantes" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Clientes e anunciantes cadastrados na plataforma
            </p>
            <Button
              onClick={() => {
                setAnuncianteEditando(null)
                setModalAnuncianteAberto(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Anunciante
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome / Contato</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone / WhatsApp</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anunciantes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Nenhum anunciante cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  anunciantes.map((anunciante) => (
                    <TableRow key={anunciante.id}>
                      <TableCell className="font-medium">{anunciante.nome_contato}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {anunciante.empresa || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {anunciante.email || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {anunciante.telefone || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {anunciante.documento || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAnuncianteEditando(anunciante)
                            setModalAnuncianteAberto(true)
                          }}
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
        </TabsContent>
      </Tabs>

      <AnuncioFormDialog
        open={modalAnuncioAberto}
        onOpenChange={setModalAnuncioAberto}
        anuncioParaEditar={anuncioEditando}
        anunciantes={anunciantes}
        espacos={espacos as unknown as Parameters<typeof AnuncioFormDialog>[0]["espacos"]}
        onSuccess={recarregarAnuncios}
      />

      <AnuncianteFormDialog
        open={modalAnuncianteAberto}
        onOpenChange={setModalAnuncianteAberto}
        anuncianteParaEditar={anuncianteEditando}
        onSuccess={recarregarAnunciantes}
      />

      <FormatoFormDialog
        open={modalFormatoAberto}
        onOpenChange={setModalFormatoAberto}
        formatoParaEditar={formatoEditando}
        onSuccess={recarregarFormatos}
      />

      <EspacoFormDialog
        open={modalEspacoAberto}
        onOpenChange={setModalEspacoAberto}
        espacoParaEditar={espacoEditando}
        formatos={formatos}
        colunas={colunas}
        onSuccess={recarregarEspacos}
      />

      <MetricasDialog
        open={modalMetricasAberto}
        onOpenChange={setModalMetricasAberto}
        anuncioId={anuncioMetricas?.id || null}
        anuncioTitulo={anuncioMetricas?.titulo}
      />
    </div>
  )
}
