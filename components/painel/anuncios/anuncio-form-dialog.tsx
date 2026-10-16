"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import {
  Loader2,
  Upload,
  AlertCircle,
  CheckCircle2,
  Share2,
  ExternalLink,
  Copy,
  QrCode,
  ChevronDown,
  PlusCircle,
} from "lucide-react"

const anuncioSchema = z.object({
  titulo: z.string().min(2, "Título é obrigatório"),
  anunciante_id: z.string().min(1, "Selecione o anunciante"),
  espaco_id: z.string().min(1, "Selecione o espaço publicitário"),
  link_destino: z.string().url("URL de destino inválida"),
  inicio_em: z.string().min(10, "Data de início obrigatória"),
  fim_em: z.string().min(10, "Data de fim obrigatória"),
  valor_total: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0"),
  status: z
    .enum(["rascunho", "ativo", "agendado", "pausado", "expirado", "cancelado"])
    .default("ativo"),
  forma_pagamento: z.enum(["pix", "boleto", "cartao", "manual"]).default("pix"),
  gerar_cobranca_asaas: z.boolean().default(true),
})

type AnuncioFormData = z.infer<typeof anuncioSchema>

export interface AnuncioItem {
  id: string
  titulo: string
  anunciante_id: string
  espaco_id: string
  imagem_desktop_url: string
  imagem_mobile_url: string | null
  link_destino: string
  inicio_em: string
  fim_em: string
  valor_total: number
  status: string
  impressoes: number
  cliques: number
  anunciante?: {
    id?: string
    nome_contato: string
    empresa?: string | null
    telefone?: string | null
    email?: string | null
  }
  espaco?: {
    id: string
    nome: string
    posicao: string
    preco_mensal: number
    formato?: {
      id: string
      nome: string
      largura_desktop: number
      altura_desktop: number
      largura_mobile: number
      altura_mobile: number
    }
  }
}

interface AnuncioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anuncioParaEditar?: AnuncioItem | null
  anunciantes: { id: string; nome_contato: string; empresa: string | null; telefone?: string | null }[]
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
  onSuccess: () => void
}

export function AnuncioFormDialog({
  open,
  onOpenChange,
  anuncioParaEditar,
  anunciantes,
  espacos,
  onSuccess,
}: AnuncioFormDialogProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Estado de Sucesso / Cobrança gerada
  const [cobrancaResultado, setCobrancaResultado] = useState<{
    linkPagamento: string | null
    pixPayload?: string | null
    pixQrCodeImage?: string | null
    titulo: string
    valor: number
    telefoneAnunciante?: string | null
  } | null>(null)

  const [copiado, setCopiado] = useState(false)

  const [desktopFile, setDesktopFile] = useState<File | null>(null)
  const [desktopPreview, setDesktopPreview] = useState<string | null>(
    anuncioParaEditar?.imagem_desktop_url || null
  )

  const [mobileFile, setMobileFile] = useState<File | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(
    anuncioParaEditar?.imagem_mobile_url || null
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AnuncioFormData>({
    resolver: zodResolver(anuncioSchema),
    values: {
      titulo: anuncioParaEditar?.titulo || "",
      anunciante_id: anuncioParaEditar?.anunciante_id || anunciantes[0]?.id || "",
      espaco_id: anuncioParaEditar?.espaco_id || espacos[0]?.id || "",
      link_destino: anuncioParaEditar?.link_destino || "https://",
      inicio_em: anuncioParaEditar?.inicio_em
        ? new Date(anuncioParaEditar.inicio_em).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      fim_em: anuncioParaEditar?.fim_em
        ? new Date(anuncioParaEditar.fim_em).toISOString().slice(0, 10)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      valor_total: Number(anuncioParaEditar?.valor_total || 0),
      status:
        (anuncioParaEditar?.status as
          | "rascunho"
          | "ativo"
          | "agendado"
          | "pausado"
          | "expirado"
          | "cancelado") || "ativo",
      forma_pagamento: "pix",
      gerar_cobranca_asaas: !anuncioParaEditar,
    },
  })

  const espacoSelecionadoId = watch("espaco_id")
  const anuncianteSelecionadoId = watch("anunciante_id")
  const formaPagamento = watch("forma_pagamento")

  const espacoAtual = espacos.find((e) => e.id === espacoSelecionadoId)
  const anuncianteAtual = anunciantes.find((a) => a.id === anuncianteSelecionadoId)

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesktopFile(file)
      setDesktopPreview(URL.createObjectURL(file))
    }
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMobileFile(file)
      setMobilePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userId = user?.id || "anon"
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("anuncios")
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      throw new Error(`Erro ao enviar imagem: ${uploadError.message}`)
    }

    const { data: publicData } = supabase.storage
      .from("anuncios")
      .getPublicUrl(fileName)

    return publicData.publicUrl
  }

  const onSubmit = async (data: AnuncioFormData) => {
    try {
      setSalvando(true)
      setErro(null)

      let desktopUrl = anuncioParaEditar?.imagem_desktop_url || ""
      let mobileUrl = anuncioParaEditar?.imagem_mobile_url || null

      if (desktopFile) {
        desktopUrl = await uploadImage(desktopFile, "desktop")
      }

      if (mobileFile) {
        mobileUrl = await uploadImage(mobileFile, "mobile")
      }

      if (!desktopUrl) {
        throw new Error("A imagem Desktop é obrigatória.")
      }

      const payload = {
        titulo: data.titulo,
        anunciante_id: data.anunciante_id,
        espaco_id: data.espaco_id,
        imagem_desktop_url: desktopUrl,
        imagem_mobile_url: mobileUrl,
        link_destino: data.link_destino,
        inicio_em: data.inicio_em,
        fim_em: data.fim_em,
        valor: Number(data.valor_total),
        status: data.status,
        forma_pagamento: data.forma_pagamento,
        gerar_cobranca_asaas: data.forma_pagamento !== "manual" && data.gerar_cobranca_asaas,
      }

      const url = anuncioParaEditar
        ? `/api/anuncios/${anuncioParaEditar.id}`
        : "/api/anuncios"
      const method = anuncioParaEditar ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const resJson = await res.json()

      if (!res.ok) {
        throw new Error(resJson.error || "Erro ao salvar anúncio")
      }

      if (!anuncioParaEditar && resJson.link_pagamento) {
        // Exibir tela de cobrança gerada
        setCobrancaResultado({
          linkPagamento: resJson.link_pagamento,
          pixPayload: resJson.pix_qr_code?.payload || null,
          pixQrCodeImage: resJson.pix_qr_code?.encodedImage || null,
          titulo: data.titulo,
          valor: Number(data.valor_total),
          telefoneAnunciante: anuncianteAtual?.telefone || null,
        })
        onSuccess()
      } else {
        reset()
        onSuccess()
        onOpenChange(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido"
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  const copiarPix = () => {
    if (cobrancaResultado?.pixPayload) {
      navigator.clipboard.writeText(cobrancaResultado.pixPayload)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const gerarTextoWhatsApp = () => {
    if (!cobrancaResultado) return ""
    const link = cobrancaResultado.linkPagamento || ""
    const texto = `Olá! Segue a fatura para veiculação do anúncio "${cobrancaResultado.titulo}" no Portal Empire no valor de R$ ${cobrancaResultado.valor.toFixed(2)}:\n\n${link}\n\nAssim que o pagamento for confirmado, seu anúncio entra no ar automaticamente!`
    return encodeURIComponent(texto)
  }

  const [buscaAnunciante, setBuscaAnunciante] = useState("")
  const [isTypingAnunciante, setIsTypingAnunciante] = useState(false)
  const [anuncianteDropdownOpen, setAnuncianteDropdownOpen] = useState(false)
  const [criandoAnuncianteRapido, setCriandoAnuncianteRapido] = useState(false)
  const [listaAnunciantes, setListaAnunciantes] = useState(anunciantes)

  const [buscaEspaco, setBuscaEspaco] = useState("")
  const [isTypingEspaco, setIsTypingEspaco] = useState(false)
  const [espacoDropdownOpen, setEspacoDropdownOpen] = useState(false)

  // Sincronizar lista quando a prop mudar
  useState(() => {
    if (anunciantes.length > 0) setListaAnunciantes(anunciantes)
  })

  const anunciantesFiltrados = listaAnunciantes.filter((a) =>
    (a.nome_contato && a.nome_contato.toLowerCase().includes(buscaAnunciante.toLowerCase())) ||
    (a.empresa && a.empresa.toLowerCase().includes(buscaAnunciante.toLowerCase()))
  )

  const espacosFiltrados = espacos.filter((e) =>
    (e.nome && e.nome.toLowerCase().includes(buscaEspaco.toLowerCase())) ||
    (e.formato?.nome && e.formato.nome.toLowerCase().includes(buscaEspaco.toLowerCase()))
  )

  const handleCriarAnuncianteRapido = async (nome: string) => {
    if (!nome.trim()) return
    try {
      setCriandoAnuncianteRapido(true)
      const res = await fetch("/api/anunciantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        const novo = {
          id: data.data.id,
          nome_contato: data.data.nome,
          empresa: data.data.nome,
          telefone: data.data.telefone,
        }
        setListaAnunciantes((prev) => [novo, ...prev])
        setValue("anunciante_id", novo.id)
        setBuscaAnunciante(novo.nome_contato)
        setIsTypingAnunciante(false)
        setAnuncianteDropdownOpen(false)
      } else {
        alert(data.error || "Erro ao cadastrar anunciante")
      }
    } catch {
      alert("Erro ao conectar com o servidor")
    } finally {
      setCriandoAnuncianteRapido(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent preventOutsideClose={true} className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        {cobrancaResultado ? (
          /* TELA DE COBRANÇA GERADA (PÓS-CRIAÇÃO) */
          <div className="space-y-6 py-2">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-black">
                Campanha Criada & Cobrança Gerada!
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                O anúncio foi cadastrado e a fatura no Asaas com Split já está disponível.
              </p>
            </div>

            {cobrancaResultado.pixQrCodeImage && (
              <div className="border rounded-2xl p-4 bg-muted/20 flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase">
                  <QrCode className="w-4 h-4" /> Pagamento Instantâneo via PIX
                </div>
                <Image
                  src={cobrancaResultado.pixQrCodeImage}
                  alt="QR Code PIX"
                  width={176}
                  height={176}
                  unoptimized
                  className="w-44 h-44 rounded-lg bg-white p-2 border shadow-sm"
                />
                {cobrancaResultado.pixPayload && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copiarPix}
                    className="text-xs"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    {copiado ? "Copiado!" : "Copiar Código PIX"}
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Link da Fatura Online (PIX / Boleto / Cartão)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={cobrancaResultado.linkPagamento || ""}
                  className="text-xs font-mono"
                />
                {cobrancaResultado.linkPagamento && (
                  <a
                    href={cobrancaResultado.linkPagamento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 py-2 border rounded-md hover:bg-muted text-sm shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${gerarTextoWhatsApp()}${
                  cobrancaResultado.telefoneAnunciante
                    ? `&phone=${cobrancaResultado.telefoneAnunciante.replace(/\D/g, "")}`
                    : ""
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                <Share2 className="h-4 w-4" />
                Enviar Fatura por WhatsApp
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCobrancaResultado(null)
                  reset()
                  onOpenChange(false)
                }}
              >
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE ANÚNCIO */
          <>
            <DialogHeader>
              <DialogTitle>
                {anuncioParaEditar ? "Editar Anúncio" : "Cadastrar Novo Anúncio"}
              </DialogTitle>
            </DialogHeader>

            {erro && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título / Campanha *</Label>
                <Input
                  id="titulo"
                  {...register("titulo")}
                  placeholder="Ex: Campanha Black Friday 2026"
                  className="mt-1"
                />
                {errors.titulo && (
                  <p className="mt-1 text-xs text-destructive">{errors.titulo.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ANUNCIANTE SEARCHABLE */}
                <div className="relative space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="busca_anunciante">Anunciante *</Label>
                    {anuncianteSelecionadoId && (
                      <span className="text-[11px] text-emerald-600 font-medium">✓ Selecionado</span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="busca_anunciante"
                      placeholder="Digite ou clique para selecionar..."
                      value={
                        isTypingAnunciante
                          ? buscaAnunciante
                          : anuncianteAtual?.empresa
                          ? `${anuncianteAtual.empresa} (${anuncianteAtual.nome_contato})`
                          : anuncianteAtual?.nome_contato || buscaAnunciante
                      }
                      onFocus={() => {
                        setIsTypingAnunciante(true)
                        setAnuncianteDropdownOpen(true)
                        setBuscaAnunciante("")
                      }}
                      onChange={(e) => {
                        setIsTypingAnunciante(true)
                        setBuscaAnunciante(e.target.value)
                        setAnuncianteDropdownOpen(true)
                      }}
                      autoComplete="off"
                      className="h-10 text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAnuncianteDropdownOpen((prev) => !prev)
                        if (!anuncianteDropdownOpen) {
                          setIsTypingAnunciante(true)
                          setBuscaAnunciante("")
                        }
                      }}
                      className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.anunciante_id && (
                    <p className="text-xs text-destructive">{errors.anunciante_id.message}</p>
                  )}

                  {anuncianteDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                          setAnuncianteDropdownOpen(false)
                          setIsTypingAnunciante(false)
                        }}
                      />
                      <div
                        className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-sm divide-y divide-slate-100 dark:divide-slate-800"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {buscaAnunciante.trim().length > 1 &&
                          !listaAnunciantes.some(
                            (a) =>
                              a.nome_contato.toLowerCase() === buscaAnunciante.toLowerCase() ||
                              a.empresa?.toLowerCase() === buscaAnunciante.toLowerCase()
                          ) && (
                            <div
                              onClick={() => handleCriarAnuncianteRapido(buscaAnunciante)}
                              className="p-2.5 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer text-xs font-semibold flex items-center gap-2"
                            >
                              <PlusCircle className="w-4 h-4" />
                              {criandoAnuncianteRapido
                                ? "Cadastrando anunciante..."
                                : `Cadastrar anunciante "${buscaAnunciante}"`}
                            </div>
                          )}

                        {anunciantesFiltrados.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            Nenhum anunciante encontrado com &quot;{buscaAnunciante}&quot;.
                          </div>
                        ) : (
                          anunciantesFiltrados.map((a) => (
                            <div
                              key={a.id}
                              onClick={() => {
                                setValue("anunciante_id", a.id)
                                setBuscaAnunciante(a.empresa ? `${a.empresa} (${a.nome_contato})` : a.nome_contato)
                                setIsTypingAnunciante(false)
                                setAnuncianteDropdownOpen(false)
                              }}
                              className={`px-3 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex flex-col ${
                                anuncianteSelecionadoId === a.id ? "bg-primary/10 text-primary font-semibold" : ""
                              }`}
                            >
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {a.empresa || a.nome_contato}
                              </span>
                              {a.empresa && (
                                <span className="text-[10px] text-slate-400">Contato: {a.nome_contato}</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* ESPAÇO PUBLICITÁRIO SEARCHABLE */}
                <div className="relative space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="busca_espaco">Espaço Publicitário *</Label>
                    {espacoSelecionadoId && (
                      <span className="text-[11px] text-emerald-600 font-medium">✓ Selecionado</span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="busca_espaco"
                      placeholder="Digite ou clique para selecionar..."
                      value={
                        isTypingEspaco
                          ? buscaEspaco
                          : espacoAtual
                          ? `${espacoAtual.nome} - R$ ${Number(espacoAtual.preco_mensal).toFixed(2)}`
                          : buscaEspaco
                      }
                      onFocus={() => {
                        setIsTypingEspaco(true)
                        setEspacoDropdownOpen(true)
                        setBuscaEspaco("")
                      }}
                      onChange={(e) => {
                        setIsTypingEspaco(true)
                        setBuscaEspaco(e.target.value)
                        setEspacoDropdownOpen(true)
                      }}
                      autoComplete="off"
                      className="h-10 text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEspacoDropdownOpen((prev) => !prev)
                        if (!espacoDropdownOpen) {
                          setIsTypingEspaco(true)
                          setBuscaEspaco("")
                        }
                      }}
                      className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.espaco_id && (
                    <p className="text-xs text-destructive">{errors.espaco_id.message}</p>
                  )}

                  {espacoDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                          setEspacoDropdownOpen(false)
                          setIsTypingEspaco(false)
                        }}
                      />
                      <div
                        className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-sm divide-y divide-slate-100 dark:divide-slate-800"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {espacosFiltrados.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            Nenhum espaço encontrado.
                          </div>
                        ) : (
                          espacosFiltrados.map((esp) => (
                            <div
                              key={esp.id}
                              onClick={() => {
                                setValue("espaco_id", esp.id)
                                if (!anuncioParaEditar) {
                                  setValue("valor_total", Number(esp.preco_mensal))
                                }
                                setBuscaEspaco(`${esp.nome} - R$ ${Number(esp.preco_mensal).toFixed(2)}`)
                                setIsTypingEspaco(false)
                                setEspacoDropdownOpen(false)
                              }}
                              className={`px-3 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between ${
                                espacoSelecionadoId === esp.id ? "bg-primary/10 text-primary font-semibold" : ""
                              }`}
                            >
                              <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">{esp.nome}</div>
                                <div className="text-[10px] text-slate-400">
                                  {esp.formato
                                    ? `${esp.formato.nome} (${esp.formato.largura_desktop}x${esp.formato.altura_desktop})`
                                    : esp.posicao}
                                </div>
                              </div>
                              <span className="font-semibold text-emerald-600 text-xs">
                                R$ {Number(esp.preco_mensal).toFixed(2)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {espacoAtual && (
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Dimensões recomendadas para este espaço:
                  </span>{" "}
                  Desktop: {espacoAtual.formato.largura_desktop}x
                  {espacoAtual.formato.altura_desktop} px | Mobile:{" "}
                  {espacoAtual.formato.largura_mobile}x
                  {espacoAtual.formato.altura_mobile} px
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-lg p-3 bg-muted/10">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Banner Desktop *
                  </Label>
                  {desktopPreview ? (
                    <div className="relative aspect-video w-full rounded border bg-slate-900 overflow-hidden flex items-center justify-center">
                      <Image
                        src={desktopPreview}
                        alt="Preview Desktop"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded border border-dashed flex flex-col items-center justify-center text-muted-foreground text-xs p-2 text-center">
                      <Upload className="h-6 w-6 mb-1 opacity-50" />
                      <span>Envie a imagem desktop</span>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleDesktopChange}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2 border rounded-lg p-3 bg-muted/10">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Banner Mobile (Opcional)
                  </Label>
                  {mobilePreview ? (
                    <div className="relative aspect-video w-full rounded border bg-slate-900 overflow-hidden flex items-center justify-center">
                      <Image
                        src={mobilePreview}
                        alt="Preview Mobile"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded border border-dashed flex flex-col items-center justify-center text-muted-foreground text-xs p-2 text-center">
                      <Upload className="h-6 w-6 mb-1 opacity-50" />
                      <span>Usa versão desktop se vazio</span>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleMobileChange}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="link_destino">Link de Destino (URL) *</Label>
                <Input
                  id="link_destino"
                  {...register("link_destino")}
                  placeholder="https://suaempresa.com.br/promocao"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="inicio_em">Início da Veiculação *</Label>
                  <Input
                    id="inicio_em"
                    type="date"
                    {...register("inicio_em")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fim_em">Fim da Veiculação *</Label>
                  <Input
                    id="fim_em"
                    type="date"
                    {...register("fim_em")}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="valor_total">Valor Total do Anúncio (R$) *</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    {...register("valor_total")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="forma_pagamento">Modalidade de Pagamento</Label>
                  <select
                    id="forma_pagamento"
                    {...register("forma_pagamento")}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="pix">PIX Automático (Asaas Split)</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="manual">Pagamento Manual (Direto)</option>
                  </select>
                </div>
              </div>

              {formaPagamento !== "manual" && (
                <div className="rounded-lg border p-3 bg-primary/5 space-y-1">
                  <p className="text-xs font-semibold text-primary">
                    ⚡ Split Asaas Automático
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Será gerada uma fatura online com QR Code PIX. Quando o cliente pagar, o sistema ativará o anúncio sozinho e repassará a comissão líquida para a sua conta.
                  </p>
                </div>
              )}

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {anuncioParaEditar
                    ? "Salvar Alterações"
                    : formaPagamento === "manual"
                    ? "Criar & Ativar Anúncio"
                    : "Gerar Cobrança & Criar Anúncio"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
