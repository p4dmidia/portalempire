"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

const espacoSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  formato_id: z.string().min(1, "Formato é obrigatório"),
  coluna_id: z.string().optional().nullable(),
  posicao: z.string().min(2, "Posição é obrigatória"),
  preco_mensal: z.coerce.number().min(0, "Preço mensal não pode ser negativo"),
  preco_semanal: z.coerce.number().min(0, "Preço semanal não pode ser negativo").optional().nullable(),
  ativo: z.boolean().default(true),
})

type EspacoFormData = z.infer<typeof espacoSchema>

export interface EspacoItem {
  id: string
  nome: string
  formato_id: string
  coluna_id: string | null
  posicao: string
  preco_mensal: number
  preco_semanal: number | null
  ativo: boolean
  formato?: {
    id: string
    nome: string
    posicao_padrao: string
    preco_minimo: number
  }
}

interface EspacoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  espacoParaEditar?: EspacoItem | null
  colunas?: { id: string; nome: string }[]
  formatos: { id: string; nome: string; posicao_padrao: string; preco_minimo: number }[]
  colunaIdFixa?: string
  onSuccess: () => void
}

export function EspacoFormDialog({
  open,
  onOpenChange,
  espacoParaEditar,
  colunas = [],
  formatos = [],
  colunaIdFixa,
  onSuccess,
}: EspacoFormDialogProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EspacoFormData>({
    resolver: zodResolver(espacoSchema),
    values: {
      nome: espacoParaEditar?.nome || "",
      formato_id: espacoParaEditar?.formato_id || formatos[0]?.id || "",
      coluna_id: espacoParaEditar?.coluna_id || colunaIdFixa || colunas[0]?.id || "",
      posicao: espacoParaEditar?.posicao || "topo",
      preco_mensal: Number(espacoParaEditar?.preco_mensal || formatos[0]?.preco_minimo || 100),
      preco_semanal: espacoParaEditar?.preco_semanal ? Number(espacoParaEditar.preco_semanal) : null,
      ativo: espacoParaEditar ? espacoParaEditar.ativo : true,
    },
  })

  const formatoSelecionadoId = watch("formato_id")
  const formatoAtual = formatos.find((f) => f.id === formatoSelecionadoId)
  const ativo = watch("ativo")

  // Preenchimento automático ao mudar formato
  useEffect(() => {
    if (!espacoParaEditar && formatoAtual) {
      if (formatoAtual.posicao_padrao) {
        setValue("posicao", formatoAtual.posicao_padrao)
      }
      if (formatoAtual.preco_minimo) {
        setValue("preco_mensal", Number(formatoAtual.preco_minimo))
      }
      const colunaAtualId = watch("coluna_id") || colunaIdFixa
      const colunaNome = colunas.find((c) => c.id === colunaAtualId)?.nome
      const nomeSugerido = colunaNome ? `${formatoAtual.nome} - ${colunaNome}` : formatoAtual.nome
      setValue("nome", nomeSugerido)
    }
  }, [formatoSelecionadoId, formatoAtual, espacoParaEditar, setValue, colunas, colunaIdFixa])

  const onSubmit = async (data: EspacoFormData) => {
    try {
      setSalvando(true)
      setErro(null)

      if (formatoAtual && data.preco_mensal < Number(formatoAtual.preco_minimo)) {
        throw new Error(
          `O preço mensal não pode ser menor que o preço mínimo do formato (R$ ${Number(
            formatoAtual.preco_minimo
          ).toFixed(2)})`
        )
      }

      const finalColunaId = colunaIdFixa || data.coluna_id || (colunas.length > 0 ? colunas[0].id : null)

      const url = espacoParaEditar
        ? `/api/espacos/${espacoParaEditar.id}`
        : "/api/espacos"
      const method = espacoParaEditar ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dono_tipo: finalColunaId ? "coluna" : "plataforma",
          coluna_id: finalColunaId,
        }),
      })

      const resJson = await res.json()

      if (!res.ok) {
        throw new Error(resJson.error || "Erro ao salvar espaço")
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {espacoParaEditar ? "Editar Espaço Publicitário" : "Novo Espaço Publicitário"}
          </DialogTitle>
        </DialogHeader>

        {erro && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Espaço *</Label>
            <Input
              id="nome"
              {...register("nome")}
              placeholder="Ex: Topo da Coluna Política"
              className="mt-1"
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="formato_id">Formato *</Label>
            <select
              id="formato_id"
              {...register("formato_id")}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {formatos.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome} (mín. R$ {Number(f.preco_minimo).toFixed(2)})
                </option>
              ))}
            </select>
            {errors.formato_id && (
              <p className="mt-1 text-xs text-destructive">
                {errors.formato_id.message}
              </p>
            )}
          </div>

          {!colunaIdFixa && colunas.length > 0 && (
            <div>
              <Label htmlFor="coluna_id">
                Coluna (Opcional - deixe vazio para plataforma geral)
              </Label>
              <select
                id="coluna_id"
                value={watch("coluna_id") || ""}
                onChange={(e) => setValue("coluna_id", e.target.value || null)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Plataforma Geral (sem coluna)</option>
                {colunas.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Posição no Layout (Detectada Automaticamente do Formato) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Posição no Layout:
              </span>
              <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide bg-amber-500/10 px-2 py-0.5 rounded">
                {formatoAtual?.posicao_padrao === "topo"
                  ? "Topo da Página (Leaderboard)"
                  : formatoAtual?.posicao_padrao === "lateral" || formatoAtual?.posicao_padrao === "sidebar"
                  ? "Barra Lateral (Sidebar)"
                  : formatoAtual?.posicao_padrao === "meio_texto" || formatoAtual?.posicao_padrao === "artigo"
                  ? "Meio da Matéria (In-Article)"
                  : formatoAtual?.posicao_padrao === "rodape"
                  ? "Rodapé (Footer)"
                  : formatoAtual?.posicao_padrao || "Automático"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {formatoAtual?.posicao_padrao === "topo"
                ? "Exibido com destaque máximo no topo da coluna e no cabeçalho das matérias (728x90 px Desktop | 320x50 px Mobile)."
                : formatoAtual?.posicao_padrao === "lateral" || formatoAtual?.posicao_padrao === "sidebar"
                ? "Exibido na barra lateral ao lado das matérias e artigos em computadores e tablets (300x250 px)."
                : formatoAtual?.posicao_padrao === "meio_texto" || formatoAtual?.posicao_padrao === "artigo"
                ? "Inserido no meio da leitura do texto das matérias, garantindo alta retenção visual (728x90 px)."
                : formatoAtual?.posicao_padrao === "rodape"
                ? "Exibido na base inferior da página da coluna (970x90 px Desktop | 320x50 px Mobile)."
                : "Posicionamento padronizado no portal de notícias."}
            </p>
          </div>

          <input type="hidden" {...register("posicao")} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="preco_mensal">Preço Mensal (R$) *</Label>
              <Input
                id="preco_mensal"
                type="number"
                step="0.01"
                {...register("preco_mensal")}
                className="mt-1"
              />
              {formatoAtual && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo: R$ {Number(formatoAtual.preco_minimo).toFixed(2)}
                </p>
              )}
              {errors.preco_mensal && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.preco_mensal.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="preco_semanal">Preço Semanal (R$) (Opcional)</Label>
              <Input
                id="preco_semanal"
                type="number"
                step="0.01"
                {...register("preco_semanal")}
                className="mt-1"
                placeholder="Ex: 50.00"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Espaço Ativo</p>
              <p className="text-xs text-muted-foreground">
                Disponível para venda de anúncios
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
              {espacoParaEditar ? "Salvar Alterações" : "Criar Espaço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
