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
import { Loader2 } from "lucide-react"

const anuncianteSchema = z.object({
  nome_contato: z.string().min(2, "Nome é obrigatório"),
  empresa: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  documento: z.string().optional(),
})

type AnuncianteFormData = z.infer<typeof anuncianteSchema>

export interface AnuncianteItem {
  id: string
  nome_contato: string
  empresa: string | null
  email: string | null
  telefone: string | null
  documento: string | null
  criado_em: string
}

interface AnuncianteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anuncianteParaEditar?: AnuncianteItem | null
  onSuccess: () => void
}

export function AnuncianteFormDialog({
  open,
  onOpenChange,
  anuncianteParaEditar,
  onSuccess,
}: AnuncianteFormDialogProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AnuncianteFormData>({
    resolver: zodResolver(anuncianteSchema),
    values: {
      nome_contato: anuncianteParaEditar?.nome_contato || "",
      empresa: anuncianteParaEditar?.empresa || "",
      email: anuncianteParaEditar?.email || "",
      telefone: anuncianteParaEditar?.telefone || "",
      documento: anuncianteParaEditar?.documento || "",
    },
  })

  const onSubmit = async (data: AnuncianteFormData) => {
    try {
      setSalvando(true)
      setErro(null)

      const url = anuncianteParaEditar
        ? `/api/anunciantes/${anuncianteParaEditar.id}`
        : "/api/anunciantes"
      const method = anuncianteParaEditar ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.empresa
            ? `${data.empresa} (${data.nome_contato})`
            : data.nome_contato,
          nome_contato: data.nome_contato,
          empresa: data.empresa || null,
          email: data.email || null,
          telefone: data.telefone || null,
          cpf_cnpj: data.documento || null,
          documento: data.documento || null,
        }),
      })

      const resJson = await res.json()

      if (!res.ok) {
        throw new Error(resJson.error || "Erro ao salvar anunciante")
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
      <DialogContent preventOutsideClose={true} className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {anuncianteParaEditar ? "Editar Anunciante" : "Novo Anunciante"}
          </DialogTitle>
        </DialogHeader>

        {erro && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome_contato">Nome do Contato *</Label>
            <Input
              id="nome_contato"
              {...register("nome_contato")}
              placeholder="Ex: João Silva"
              className="mt-1"
            />
            {errors.nome_contato && (
              <p className="mt-1 text-xs text-destructive">
                {errors.nome_contato.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="empresa">Empresa / Razão Social</Label>
            <Input
              id="empresa"
              {...register("empresa")}
              placeholder="Ex: Auto Peças Silva Ltda"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contato@empresa.com"
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="telefone">Telefone / WhatsApp</Label>
              <Input
                id="telefone"
                {...register("telefone")}
                placeholder="(11) 99999-9999"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="documento">CPF ou CNPJ</Label>
            <Input
              id="documento"
              {...register("documento")}
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
              className="mt-1"
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
              {anuncianteParaEditar ? "Salvar Alterações" : "Cadastrar Anunciante"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
