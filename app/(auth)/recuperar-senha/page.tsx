"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Home, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const recuperarSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});

type RecuperarFormData = z.infer<typeof recuperarSchema>;

export default function RecuperarSenhaPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecuperarFormData>({
    resolver: zodResolver(recuperarSchema),
  });

  const onSubmit = async (data: RecuperarFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    const siteUrl = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${siteUrl}/redefinir-senha`,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          E-mail Enviado!
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
        </p>
        <Button onClick={() => window.location.href = "/login"} className="w-full">
          Voltar ao Login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Recuperação de Senha
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Informe seu e-mail para receber um link de redefinição
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail Cadastrado</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com.br"
            className="mt-1"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando Link...
            </>
          ) : (
            "Enviar Link de Recuperação"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="text-center text-xs text-slate-500">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Voltar ao Login
          </Link>
        </div>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          Voltar para a Página Inicial do Site
        </Link>
      </div>
    </div>
  );
}
