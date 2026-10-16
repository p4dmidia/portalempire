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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

const formatoSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  slug: z.string().min(2, "Slug é obrigatório"),
  largura_desktop: z.coerce.number().min(1, "Largura desktop deve ser > 0"),
  altura_desktop: z.coerce.number().min(1, "Altura desktop deve ser > 0"),
  largura_mobile: z.coerce.number().min(1, "Largura mobile deve ser > 0"),
  altura_mobile: z.coerce.number().min(1, "Altura mobile deve ser > 0"),
  posicao_padrao: z.string().min(2, "Posição padrão é obrigatória"),
  preco_minimo: z.coerce.number().min(0, "Preço mínimo não pode ser negativo"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
})

type FormatoFormData = z.infer<typeof formatoSchema>

export interface FormatoItem {
  id: string
  nome: string
  slug: string
  largura_desktop: number
  altura_desktop: number
  largura_mobile: number
  altura_mobile: number
  posicao_padrao: string
  preco_minimo: number
  descricao: string | null
  ativo: boolean
}

interface FormatoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formatoParaEditar?: FormatoItem | null
  onSuccess: () => void
}

export function FormatoFormDialog({
  open,
  onOpenChange,
  formatoParaEditar,
  onSuccess,
}: FormatoFormDialogProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormatoFormData>({
    resolver: zodResolver(formatoSchema),
    values: {
      nome: formatoParaEditar?.nome || "",
      slug: formatoParaEditar?.slug || "",
      largura_desktop: formatoParaEditar?.largura_desktop || 728,
      altura_desktop: formatoParaEditar?.altura_desktop || 90,
      largura_mobile: formatoParaEditar?.largura_mobile || 300,
      altura_mobile: formatoParaEditar?.altura_mobile || 250,
      posicao_padrao: formatoParaEditar?.posicao_padrao || "topo",
      preco_minimo: Number(formatoParaEditar?.preco_minimo || 50),
      descricao: formatoParaEditar?.descricao || "",
      ativo: formatoParaEditar ? formatoParaEditar.ativo : true,
    },
  })

  const ativo = watch("ativo")

  const onSubmit = async (data: FormatoFormData) => {
    try {
      setSalvando(true)
      setErro(null)

      const url = formatoParaEditar
        ? `/api/admin/anuncios/formatos/${formatoParaEditar.id}`
        : "/api/admin/anuncios/formatos"
      const method = formatoParaEditar ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const resJson = await res.json()

      if (!res.ok) {
        throw new Error(resJson.error || "Erro ao salvar formato")
      }

      reset()
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido"
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            {formatoParaEditar ? "Editar Formato de Anúncio" : "Novo Formato de Anúncio"}
          </DialogTitle>
        </DialogHeader>

        {erro && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                {...register("nome")}
                placeholder="Ex: Super Banner"
                className="mt-1"
                onChange={(e) => {
                  register("nome").onChange(e)
                  if (!formatoParaEditar) {
                    const slug = e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "")
                    setValue("slug", slug)
                  }
                }}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="super-banner"
                className="mt-1"
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-3 bg-muted/20 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dimensões (Pixels)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="largura_desktop">Largura Desktop (px) *</Label>
                <Input
                  id="largura_desktop"
                  type="number"
                  {...register("largura_desktop")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="altura_desktop">Altura Desktop (px) *</Label>
                <Input
                  id="altura_desktop"
                  type="number"
                  {...register("altura_desktop")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="largura_mobile">Largura Mobile (px) *</Label>
                <Input
                  id="largura_mobile"
                  type="number"
                  {...register("largura_mobile")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="altura_mobile">Altura Mobile (px) *</Label>
                <Input
                  id="altura_mobile"
                  type="number"
                  {...register("altura_mobile")}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="posicao_padrao">Posição Padrão *</Label>
              <Input
                id="posicao_padrao"
                {...register("posicao_padrao")}
                placeholder="topo, lateral, meio, rodape"
                className="mt-1"
              />
              {errors.posicao_padrao && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.posicao_padrao.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="preco_minimo">Preço Mínimo (R$) *</Label>
              <Input
                id="preco_minimo"
                type="number"
                step="0.01"
                {...register("preco_minimo")}
                className="mt-1"
              />
              {errors.preco_minimo && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.preco_minimo.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register("descricao")}
              placeholder="Instruções de posicionamento e visibilidade..."
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Formato Ativo</p>
              <p className="text-xs text-muted-foreground">
                Disponível para criação de novos espaços
              </p>
            </div>
            <Switch
              checked={ativo}
              onCheckedChange={(checked) => setValue("ativo", checked)}
            />
          </div>

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
              {formatoParaEditar ? "Salvar Alterações" : "Criar Formato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
