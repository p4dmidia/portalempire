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
  titulo: z.string().min(1, "Nome do anunciante ou campanha é obrigatório"),
  anunciante_id: z.string().optional().nullable(),
  espaco_id: z.string().optional().nullable(),
  link_destino: z.string().optional().nullable(),
  inicio_em: z.string().optional().nullable(),
  fim_em: z.string().optional().nullable(),
  valor_total: z.coerce.number().optional().default(0),
  status: z
    .enum(["rascunho", "ativo", "agendado", "pausado", "expirado", "cancelado"])
    .default("ativo"),
  forma_pagamento: z.enum(["pix", "boleto", "cartao", "manual"]).default("manual"),
  gerar_cobranca_asaas: z.boolean().default(false),
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

export type TipoPosicao = "topo" | "lateral" | "meio_texto" | "rodape"

export const POSICOES_PREDEFINIDAS: Array<{
  pos: TipoPosicao
  label: string
  icone: string
  sub: string
  largura_desktop: number
  altura_desktop: number
  largura_mobile: number
  altura_mobile: number
  descricao: string
}> = [
  {
    pos: "topo",
    label: "Topo da Página",
    icone: "👑",
    sub: "Leaderboard (728x90)",
    largura_desktop: 728,
    altura_desktop: 90,
    largura_mobile: 320,
    altura_mobile: 50,
    descricao: "Exibido com destaque máximo no topo da coluna e acima das matérias.",
  },
  {
    pos: "lateral",
    label: "Barra Lateral",
    icone: "📌",
    sub: "Sidebar (300x250)",
    largura_desktop: 300,
    altura_desktop: 250,
    largura_mobile: 300,
    altura_mobile: 250,
    descricao: "Exibido na barra lateral ao lado dos artigos em computadores e tablets.",
  },
  {
    pos: "meio_texto",
    label: "Meio do Artigo",
    icone: "📖",
    sub: "No texto (728x90)",
    largura_desktop: 728,
    altura_desktop: 90,
    largura_mobile: 300,
    altura_mobile: 250,
    descricao: "Exibido no meio da leitura do texto dos artigos publicados pelo colunista.",
  },
  {
    pos: "rodape",
    label: "Rodapé",
    icone: "🔻",
    sub: "Footer (970x90)",
    largura_desktop: 970,
    altura_desktop: 90,
    largura_mobile: 320,
    altura_mobile: 50,
    descricao: "Exibido na base inferior da página da coluna.",
  },
]

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

  const [desktopInfo, setDesktopInfo] = useState<{
    valido: boolean
    largura: number
    altura: number
    tamanhoKB: number
    mensagem?: string
    isAlerta?: boolean
  } | null>(null)

  const [mobileInfo, setMobileInfo] = useState<{
    valido: boolean
    largura: number
    altura: number
    tamanhoKB: number
    mensagem?: string
    isAlerta?: boolean
  } | null>(null)

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
      titulo: anuncioParaEditar?.titulo?.replace(/\[paginas:.*?\]/, "").trim() || "",
      anunciante_id: anuncioParaEditar?.anunciante_id || null,
      espaco_id: anuncioParaEditar?.espaco_id || espacos[0]?.id || "",
      link_destino: anuncioParaEditar?.link_destino || "",
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
      forma_pagamento: "manual",
      gerar_cobranca_asaas: false,
    },
  })

  const [paginasExibicao, setPaginasExibicao] = useState<
    "todas" | "home_portal" | "home_coluna" | "coluna_apenas" | "artigos"
  >(() => {
    if (anuncioParaEditar?.titulo) {
      const match = anuncioParaEditar.titulo.match(/\[paginas:(.*?)\]/)
      if (match && ["todas", "home_portal", "home_coluna", "coluna_apenas", "artigos"].includes(match[1])) {
        return match[1] as "todas" | "home_portal" | "home_coluna" | "coluna_apenas" | "artigos"
      }
    }
    return "todas"
  })

  const [posicaoSelecionada, setPosicaoSelecionada] = useState<TipoPosicao>(() => {
    if (anuncioParaEditar?.espaco?.posicao) {
      const p = anuncioParaEditar.espaco.posicao
      if (p === "sidebar") return "lateral"
      if (p === "artigo") return "meio_texto"
      if (["topo", "lateral", "meio_texto", "rodape"].includes(p)) return p as TipoPosicao
    }
    return "topo"
  })

  const configPosicaoAtual =
    POSICOES_PREDEFINIDAS.find((p) => p.pos === posicaoSelecionada) || POSICOES_PREDEFINIDAS[0]

  const espacoSelecionadoId = watch("espaco_id")
  const anuncianteSelecionadoId = watch("anunciante_id")
  const formaPagamento = watch("forma_pagamento")

  const espacoAtual = espacos.find((e) => e.id === espacoSelecionadoId)
  const anuncianteAtual = anunciantes.find((a) => a.id === anuncianteSelecionadoId)

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErro(null)

    // 1. Validar tamanho máximo do arquivo (2MB para imagem, 5MB para GIF)
    const limiteBytes = file.type === "image/gif" ? 5 * 1024 * 1024 : 2 * 1024 * 1024
    const limiteTexto = file.type === "image/gif" ? "5MB" : "2MB"

    if (file.size > limiteBytes) {
      const tamanhoMB = (file.size / (1024 * 1024)).toFixed(1)
      const msgErro = `O arquivo tem ${tamanhoMB}MB, excedendo o limite de ${limiteTexto} (para manter o carregamento do portal rápido).`
      setErro(msgErro)
      setDesktopInfo({
        valido: false,
        largura: 0,
        altura: 0,
        tamanhoKB: Math.round(file.size / 1024),
        mensagem: msgErro,
        isAlerta: true,
      })
      return
    }

    // 2. Inspecionar dimensões reais da imagem
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const espacoLargura = configPosicaoAtual.largura_desktop
      const espacoAltura = configPosicaoAtual.altura_desktop

      const ratioEsperado = espacoLargura / espacoAltura
      const ratioReal = w / h
      const diffRatio = Math.abs(ratioEsperado - ratioReal)

      let mensagem = `✓ Dimensões: ${w}x${h}px • ${(file.size / 1024).toFixed(0)}KB (Padrão IAB)`
      let isAlerta = false

      if (diffRatio > 0.3) {
        isAlerta = true
        mensagem = `⚠️ Arte enviada tem ${w}x${h}px. Formato recomendado é ${espacoLargura}x${espacoAltura}px (Padrão IAB). Imagens fora da proporção podem sofrer corte visual.`
      }

      setDesktopInfo({
        valido: true,
        largura: w,
        altura: h,
        tamanhoKB: Math.round(file.size / 1024),
        mensagem,
        isAlerta,
      })
      setDesktopFile(file)
      setDesktopPreview(objectUrl)
    }

    img.onerror = () => {
      setErro("Não foi possível processar a imagem. Formato inválido.")
    }

    img.src = objectUrl
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErro(null)

    const limiteBytes = file.type === "image/gif" ? 5 * 1024 * 1024 : 2 * 1024 * 1024
    const limiteTexto = file.type === "image/gif" ? "5MB" : "2MB"

    if (file.size > limiteBytes) {
      const tamanhoMB = (file.size / (1024 * 1024)).toFixed(1)
      const msgErro = `O arquivo Mobile tem ${tamanhoMB}MB, excedendo o limite de ${limiteTexto}.`
      setErro(msgErro)
      setMobileInfo({
        valido: false,
        largura: 0,
        altura: 0,
        tamanhoKB: Math.round(file.size / 1024),
        mensagem: msgErro,
        isAlerta: true,
      })
      return
    }

    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const espacoLargura = configPosicaoAtual.largura_mobile
      const espacoAltura = configPosicaoAtual.altura_mobile

      const ratioEsperado = espacoLargura / espacoAltura
      const ratioReal = w / h
      const diffRatio = Math.abs(ratioEsperado - ratioReal)

      let mensagem = `✓ Dimensões Mobile: ${w}x${h}px • ${(file.size / 1024).toFixed(0)}KB`
      let isAlerta = false

      if (diffRatio > 0.3) {
        isAlerta = true
        mensagem = `⚠️ Arte mobile tem ${w}x${h}px (Recomendado: ${espacoLargura}x${espacoAltura}px).`
      }

      setMobileInfo({
        valido: true,
        largura: w,
        altura: h,
        tamanhoKB: Math.round(file.size / 1024),
        mensagem,
        isAlerta,
      })
      setMobileFile(file)
      setMobilePreview(objectUrl)
    }

    img.onerror = () => {
      setErro("Não foi possível processar a imagem mobile.")
    }

    img.src = objectUrl
  }

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userId = user?.id || "anon"
      const fileExt = file.name.split(".").pop() || "png"
      const fileName = `${userId}/${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("anuncios")
        .upload(fileName, file, { upsert: true })

      if (!uploadError) {
        const { data: publicData } = supabase.storage
          .from("anuncios")
          .getPublicUrl(fileName)

        if (publicData?.publicUrl) return publicData.publicUrl
      } else {
        console.warn("Upload no Supabase Storage falhou, aplicando fallback local Base64:", uploadError.message)
      }
    } catch (err) {
      console.warn("Exceção no upload para Supabase, aplicando fallback local Base64:", err)
    }

    // Fallback garantido para Base64 Data URL para não travar o cadastro
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve("")
      reader.readAsDataURL(file)
    })
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
        throw new Error("Por favor, selecione e envie a imagem do Banner Desktop.")
      }

      // Sanitizar Link de Destino
      let finalLink = (data.link_destino || "").trim()
      if (!finalLink || finalLink === "https://" || finalLink === "http://") {
        finalLink = "https://portalempire.com.br"
      } else if (finalLink.startsWith("@")) {
        finalLink = `https://instagram.com/${finalLink.substring(1)}`
      } else if (/^\d{8,14}$/.test(finalLink.replace(/\D/g, "")) && !finalLink.includes(".")) {
        const digitos = finalLink.replace(/\D/g, "")
        finalLink = `https://wa.me/${digitos.startsWith("55") ? digitos : "55" + digitos}`
      } else if (!finalLink.startsWith("http://") && !finalLink.startsWith("https://")) {
        finalLink = `https://${finalLink}`
      }

      // Garantir anuncianteId transparente para o usuário (se não houver, cria ou vincula automaticamente)
      let finalAnuncianteId = data.anunciante_id || null
      if (!finalAnuncianteId) {
        const nomeParaBuscar = (data.titulo || "").trim() || "Anunciante Local"
        const existente = anunciantes.find(
          (a) => a.nome_contato?.toLowerCase() === nomeParaBuscar.toLowerCase()
        )
        if (existente) {
          finalAnuncianteId = existente.id
        } else if (anunciantes.length > 0) {
          finalAnuncianteId = anunciantes[0].id
        } else {
          try {
            const resAnun = await fetch("/api/anunciantes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nome: nomeParaBuscar }),
            })
            const jsonAnun = await resAnun.json()
            if (jsonAnun?.data?.id) {
              finalAnuncianteId = jsonAnun.data.id
            }
          } catch (e) {
            console.warn("Aviso ao criar anunciante automático:", e)
          }
        }
      }

      // Garantir espaco_id transparente para o usuário de acordo com a posição selecionada
      let finalEspacoId = data.espaco_id
      const espacoMatch = espacos.find(
        (e) =>
          e.posicao === posicaoSelecionada ||
          (posicaoSelecionada === "lateral" && (e.posicao === "sidebar" || e.posicao === "lateral")) ||
          (posicaoSelecionada === "meio_texto" && (e.posicao === "artigo" || e.posicao === "meio_texto")) ||
          (posicaoSelecionada === "rodape" && e.posicao === "rodape")
      )

      if (espacoMatch) {
        finalEspacoId = espacoMatch.id
      } else if (!finalEspacoId && espacos.length > 0) {
        finalEspacoId = espacos[0].id
      }

      const inicioEmFinal = data.inicio_em || new Date().toISOString().slice(0, 10)
      const fimEmFinal =
        data.fim_em || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

      const tituloLimpo = (data.titulo || "").replace(/\[paginas:.*?\]/, "").trim() || "Anúncio Patrocinado"
      const payload = {
        titulo: `${tituloLimpo} [paginas:${paginasExibicao}]`,
        anunciante_id: finalAnuncianteId || null,
        espaco_id: finalEspacoId || null,
        imagem_desktop_url: desktopUrl,
        imagem_mobile_url: mobileUrl,
        link_destino: finalLink,
        inicio_em: inicioEmFinal,
        fim_em: fimEmFinal,
        valor: Number(data.valor_total) || 0,
        status: data.status || "ativo",
        forma_pagamento: data.forma_pagamento || "manual",
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
          valor: Number(data.valor_total) || 0,
          telefoneAnunciante: anuncianteAtual?.telefone || null,
        })
        onSuccess()
      } else {
        reset()
        onSuccess()
        onOpenChange(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao salvar o anúncio"
      setErro(msg)
      const dialogEl = document.querySelector('[role="dialog"]')
      if (dialogEl) dialogEl.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSalvando(false)
    }
  }

  const onValidationError = (formErrors: unknown) => {
    console.error("Validação do formulário falhou:", formErrors)
    if (formErrors && typeof formErrors === "object") {
      const keys = Object.keys(formErrors)
      if (keys.length > 0) {
        const first = (formErrors as Record<string, { message?: string }>)[keys[0]]?.message || "Por favor, verifique os campos obrigatórios destacados."
        setErro(String(first))
        const dialogEl = document.querySelector('[role="dialog"]')
        if (dialogEl) dialogEl.scrollTo({ top: 0, behavior: "smooth" })
      }
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

            <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-4">
              <div>
                <Label htmlFor="titulo" className="font-bold">
                  Nome do Anunciante ou Campanha *
                </Label>
                <Input
                  id="titulo"
                  {...register("titulo")}
                  placeholder="Ex: Drogaria São Paulo, Clínica Odonto, Restaurante..."
                  className="mt-1"
                />
                {errors.titulo && (
                  <p className="mt-1 text-xs text-destructive">{errors.titulo.message}</p>
                )}
              </div>

              {/* SELEÇÃO DO LOCAL DE EXIBIÇÃO PRÉ-DEFINIDO (1 POR VEZ) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Local Onde Vai Exibir o Banner *</Label>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                    Selecione 1 local
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POSICOES_PREDEFINIDAS.map((opcao) => {
                    const isSelected = posicaoSelecionada === opcao.pos

                    return (
                      <button
                        key={opcao.pos}
                        type="button"
                        onClick={() => {
                          setPosicaoSelecionada(opcao.pos)
                          const espacoMatch = espacos.find(
                            (e) =>
                              e.posicao === opcao.pos ||
                              (opcao.pos === "lateral" && (e.posicao === "sidebar" || e.posicao === "lateral")) ||
                              (opcao.pos === "meio_texto" && (e.posicao === "artigo" || e.posicao === "meio_texto")) ||
                              (opcao.pos === "rodape" && e.posicao === "rodape")
                          )
                          if (espacoMatch) {
                            setValue("espaco_id", espacoMatch.id)
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-2 ring-amber-500 dark:bg-amber-500/20"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-amber-950 dark:text-amber-200 bg-amber-400 dark:bg-amber-500 rounded-full w-4 h-4 flex items-center justify-center">
                            ✓
                          </span>
                        )}
                        <div>
                          <span className="text-xl">{opcao.icone}</span>
                          <p className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                            {opcao.label}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          {opcao.sub}
                        </p>
                      </button>
                    )
                  })}
                </div>
                <input type="hidden" {...register("espaco_id")} />
              </div>

              {/* SELEÇÃO DAS PÁGINAS DE EXIBIÇÃO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Páginas Onde Exibir o Banner *</Label>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    Escolha onde o anúncio deve aparecer
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaginasExibicao("todas")}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      paginasExibicao === "todas"
                        ? "border-amber-500 bg-amber-500/15 shadow-sm ring-2 ring-amber-500 dark:bg-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">🌐 Todo o Site</span>
                      {paginasExibicao === "todas" && (
                        <span className="text-[10px] font-black text-amber-950 dark:text-amber-200 bg-amber-400 dark:bg-amber-500 rounded-full w-4 h-4 flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                      Home Geral do Portal + Coluna + Artigos
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaginasExibicao("home_portal")}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      paginasExibicao === "home_portal" || paginasExibicao === "home_coluna"
                        ? "border-amber-500 bg-amber-500/15 shadow-sm ring-2 ring-amber-500 dark:bg-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">🏠 Home do Portal</span>
                      {(paginasExibicao === "home_portal" || paginasExibicao === "home_coluna") && (
                        <span className="text-[10px] font-black text-amber-950 dark:text-amber-200 bg-amber-400 dark:bg-amber-500 rounded-full w-4 h-4 flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                      Capa principal do portal (Página Inicial)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaginasExibicao("coluna_apenas")}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      paginasExibicao === "coluna_apenas"
                        ? "border-amber-500 bg-amber-500/15 shadow-sm ring-2 ring-amber-500 dark:bg-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">✍️ Capa da Coluna</span>
                      {paginasExibicao === "coluna_apenas" && (
                        <span className="text-[10px] font-black text-amber-950 dark:text-amber-200 bg-amber-400 dark:bg-amber-500 rounded-full w-4 h-4 flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                      Exclusivo na página da sua coluna
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaginasExibicao("artigos")}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      paginasExibicao === "artigos"
                        ? "border-amber-500 bg-amber-500/15 shadow-sm ring-2 ring-amber-500 dark:bg-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">📰 Nos Artigos</span>
                      {paginasExibicao === "artigos" && (
                        <span className="text-[10px] font-black text-amber-950 dark:text-amber-200 bg-amber-400 dark:bg-amber-500 rounded-full w-4 h-4 flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                      Ao ler seus artigos e matérias
                    </p>
                  </button>
                </div>
              </div>

              {/* CARD DE DIMENSÕES E REQUISITOS DINÂMICOS DO LOCAL ESCOLHIDO */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30 p-4 space-y-2 text-xs text-amber-950 dark:text-amber-200 animate-in fade-in">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sm">Requisitos para {configPosicaoAtual.label}:</span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black tracking-wide">
                    Padrão IAB Oficial
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {configPosicaoAtual.descricao}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-slate-500 text-[10px] block">Desktop:</span>
                    <strong>{configPosicaoAtual.largura_desktop} x {configPosicaoAtual.altura_desktop} px</strong>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-slate-500 text-[10px] block">Mobile:</span>
                    <strong>{configPosicaoAtual.largura_mobile} x {configPosicaoAtual.altura_mobile} px</strong>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-slate-500 text-[10px] block">Tamanho Máx:</span>
                    <strong>2 MB (5MB GIF)</strong>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-slate-500 text-[10px] block">Formatos:</span>
                    <strong>JPG, PNG, WEBP, GIF</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-xl p-3 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Banner Desktop *
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Máx 2MB</span>
                  </div>
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
                      <span>Envie a imagem desktop (JPG, PNG, WEBP ou GIF)</span>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleDesktopChange}
                    className="text-xs"
                  />
                  {desktopInfo && (
                    <div
                      className={`text-[11px] p-2 rounded-lg font-medium border leading-tight ${
                        desktopInfo.isAlerta
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300/40"
                          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300/40"
                      }`}
                    >
                      {desktopInfo.mensagem}
                    </div>
                  )}
                </div>

                <div className="space-y-2 border rounded-xl p-3 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Banner Mobile (Opcional)
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Máx 2MB</span>
                  </div>
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
                  {mobileInfo && (
                    <div
                      className={`text-[11px] p-2 rounded-lg font-medium border leading-tight ${
                        mobileInfo.isAlerta
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300/40"
                          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300/40"
                      }`}
                    >
                      {mobileInfo.mensagem}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="link_destino">Link de Destino do Anunciante (URL, WhatsApp ou Instagram)</Label>
                <Input
                  id="link_destino"
                  {...register("link_destino")}
                  placeholder="Ex: https://wa.me/5511999999999, @suaempresa ou site.com.br"
                  className="mt-1 text-sm font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ao clicar no banner, o leitor será direcionado para este link. Se deixar em branco, direcionará para a página principal da sua coluna.
                </p>
                {errors.link_destino && (
                  <p className="mt-1 text-xs text-destructive">{errors.link_destino.message}</p>
                )}
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
                  <Label htmlFor="valor_total">Valor Cobrado do Cliente (R$) *</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    {...register("valor_total")}
                    className="mt-1"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Preço acordado com seu cliente (apenas para seu controle financeiro).
                  </p>
                </div>

                <div>
                  <Label htmlFor="forma_pagamento">Modalidade de Cobrança</Label>
                  <select
                    id="forma_pagamento"
                    {...register("forma_pagamento")}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium"
                  >
                    <option value="manual">Negociação Direta / Link Externo (Sem taxas)</option>
                    <option value="pix">PIX Automático (Asaas Split)</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="boleto">Boleto Bancário</option>
                  </select>
                </div>
              </div>

              {formaPagamento === "manual" ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Pagamento Direto / Negociação Externa
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Você negocia e recebe diretamente com seu anunciante (via seu próprio PIX, link externo ou dinheiro). O portal não cobrará nenhuma taxa e o banner ficará <strong>Ativo</strong> imediatamente após ser salvo!
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border p-3 bg-primary/5 space-y-1">
                  <p className="text-xs font-semibold text-primary">
                    ⚡ Split Asaas Automático
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Será gerada uma fatura online com QR Code PIX. Quando o cliente pagar, o sistema ativará o anúncio sozinho e repassará a comissão líquida para a sua conta.
                  </p>
                </div>
              )}

              {erro && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <span className="font-medium">{erro}</span>
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
                <Button type="submit" disabled={salvando} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm">
                  {salvando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando Anúncio...
                    </>
                  ) : anuncioParaEditar ? (
                    "Salvar Alterações"
                  ) : formaPagamento === "manual" ? (
                    "Criar & Ativar Anúncio"
                  ) : (
                    "Gerar Cobrança & Criar Anúncio"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
