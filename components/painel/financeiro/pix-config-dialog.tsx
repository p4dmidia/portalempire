"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

const pixFormSchema = z.object({
  tipo_chave_pix: z.enum(["cpf", "cnpj", "email", "telefone", "aleatoria"], {
    message: "Selecione o tipo de chave PIX",
  }),
  chave_pix: z.string().min(3, "Informe uma chave PIX válida"),
  nome_titular: z.string().optional(),
  banco: z.string().optional(),
});

type PixFormData = z.infer<typeof pixFormSchema>;

interface PixConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile?: {
    nome?: string;
    chave_pix?: string | null;
    tipo_chave_pix?: string | null;
  };
  onSuccess: (chave: string, tipo: string) => void;
}

export function PixConfigDialog({
  open,
  onOpenChange,
  userProfile,
  onSuccess,
}: PixConfigDialogProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PixFormData>({
    resolver: zodResolver(pixFormSchema),
    defaultValues: {
      tipo_chave_pix:
        (userProfile?.tipo_chave_pix as
          | "cpf"
          | "cnpj"
          | "email"
          | "telefone"
          | "aleatoria") || "cpf",
      chave_pix: userProfile?.chave_pix || "",
      nome_titular: userProfile?.nome || "",
      banco: "",
    },
  });

  const tipoChave = watch("tipo_chave_pix");

  const getPlaceholder = () => {
    switch (tipoChave) {
      case "cpf":
        return "000.000.000-00";
      case "cnpj":
        return "00.000.000/0000-00";
      case "email":
        return "seu-email@exemplo.com";
      case "telefone":
        return "(11) 99999-9999";
      case "aleatoria":
        return "Chave EVP (ex: 123e4567-e89b-12d3-a456-426614174000)";
      default:
        return "Informe a chave PIX";
    }
  };

  const onSubmit = async (data: PixFormData) => {
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    try {
      const res = await fetch("/api/colunista/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erro ao salvar chave PIX.");
      }

      setSucesso(true);
      onSuccess(data.chave_pix, data.tipo_chave_pix);
      setTimeout(() => {
        onOpenChange(false);
        setSucesso(false);
      }, 1200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao processar dados.";
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Cadastrar Chave PIX para Recebimento
              </DialogTitle>
              <DialogDescription className="text-xs">
                Informe a chave onde você deseja receber seus repasses de 60%
                das mensalidades dos seus assinantes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {erro && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Chave PIX atualizada com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo_chave_pix" className="text-xs font-semibold">
              Tipo de Chave PIX *
            </Label>
            <select
              id="tipo_chave_pix"
              {...register("tipo_chave_pix")}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="telefone">Celular / Telefone</option>
              <option value="aleatoria">Chave Aleatória (EVP)</option>
            </select>
            {errors.tipo_chave_pix && (
              <p className="text-xs text-destructive">
                {errors.tipo_chave_pix.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chave_pix" className="text-xs font-semibold">
              Chave PIX *
            </Label>
            <Input
              id="chave_pix"
              placeholder={getPlaceholder()}
              {...register("chave_pix")}
              className="text-sm font-mono"
            />
            {errors.chave_pix && (
              <p className="text-xs text-destructive">
                {errors.chave_pix.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome_titular" className="text-xs font-semibold">
                Nome do Titular (Opcional)
              </Label>
              <Input
                id="nome_titular"
                placeholder="Nome completo na conta"
                {...register("nome_titular")}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banco" className="text-xs font-semibold">
                Banco / Instituição (Opcional)
              </Label>
              <Input
                id="banco"
                placeholder="Ex: Nubank, Itaú, BB..."
                {...register("banco")}
                className="text-sm"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              🔒 Informações Seguras
            </p>
            <p>
              Sua chave PIX será utilizada exclusivamente para o envio dos
              repasses referentes à sua comissão de 60% das mensalidades dos
              assinantes da sua coluna.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando} className="gap-2">
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Chave PIX"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
