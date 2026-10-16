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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

const subcontaFormSchema = z.object({
  name: z.string().min(3, "Nome completo ou Razão Social é obrigatório"),
  email: z.string().email("E-mail válido é obrigatório"),
  cpfCnpj: z.string().min(11, "CPF ou CNPJ válido é obrigatório"),
  mobilePhone: z.string().min(10, "Celular / WhatsApp com DDD é obrigatório"),
  address: z.string().min(3, "Endereço com rua e bairro"),
  addressNumber: z.string().min(1, "Número"),
  province: z.string().min(2, "Bairro"),
  postalCode: z.string().min(8, "CEP válido"),
})

type SubcontaFormData = z.infer<typeof subcontaFormSchema>

interface SubcontaConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userProfile?: {
    nome?: string
    email?: string
    cpf_cnpj?: string | null
    telefone?: string | null
    asaas_wallet_id?: string | null
  }
  onSuccess: () => void
}

export function SubcontaConfigDialog({
  open,
  onOpenChange,
  userProfile,
  onSuccess,
}: SubcontaConfigDialogProps) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubcontaFormData>({
    resolver: zodResolver(subcontaFormSchema),
    values: {
      name: userProfile?.nome || "",
      email: userProfile?.email || "",
      cpfCnpj: userProfile?.cpf_cnpj || "",
      mobilePhone: userProfile?.telefone || "",
      address: "Av. Principal",
      addressNumber: "100",
      province: "Centro",
      postalCode: "01310100",
    },
  })

  const onSubmit = async (data: SubcontaFormData) => {
    try {
      setSalvando(true)
      setErro(null)

      const res = await fetch("/api/colunista/subconta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const resJson = await res.json()

      if (!res.ok) {
        throw new Error(resJson.error || "Erro ao configurar subconta Asaas")
      }

      setSucesso(true)
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        setSucesso(false)
      }, 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido"
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Conta de Recebimento (Asaas Split)</DialogTitle>
          <DialogDescription>
            Informe seus dados cadastrais para ativar o repasse automático e seguro das comissões dos seus anúncios direto na sua conta.
          </DialogDescription>
        </DialogHeader>

        {erro && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Conta de recebimento ativada com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="sub_nome">Nome Completo / Razão Social *</Label>
            <Input
              id="sub_nome"
              {...register("name")}
              placeholder="Ex: João da Silva"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sub_cpf">CPF ou CNPJ *</Label>
              <Input
                id="sub_cpf"
                {...register("cpfCnpj")}
                placeholder="000.000.000-00"
                className="mt-1"
              />
              {errors.cpfCnpj && (
                <p className="mt-1 text-xs text-destructive">{errors.cpfCnpj.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="sub_email">E-mail Financeiro *</Label>
              <Input
                id="sub_email"
                type="email"
                {...register("email")}
                placeholder="financeiro@email.com"
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="sub_phone">Celular / WhatsApp (com DDD) *</Label>
            <Input
              id="sub_phone"
              {...register("mobilePhone")}
              placeholder="(11) 99999-9999"
              className="mt-1"
            />
            {errors.mobilePhone && (
              <p className="mt-1 text-xs text-destructive">{errors.mobilePhone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="sub_address">Endereço / Logradouro *</Label>
              <Input
                id="sub_address"
                {...register("address")}
                placeholder="Rua / Avenida"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sub_num">Número *</Label>
              <Input
                id="sub_num"
                {...register("addressNumber")}
                placeholder="100"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sub_prov">Bairro *</Label>
              <Input
                id="sub_prov"
                {...register("province")}
                placeholder="Centro"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sub_cep">CEP *</Label>
              <Input
                id="sub_cep"
                {...register("postalCode")}
                placeholder="00000-000"
                className="mt-1"
              />
            </div>
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
              {userProfile?.asaas_wallet_id ? "Atualizar Conta" : "Ativar Recebimento Asaas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
