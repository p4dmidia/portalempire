"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Home, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const cadastroSchema = z
  .object({
    nome: z.string().min(3, "O nome completo deve ter no mínimo 3 caracteres").trim(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Informe um e-mail válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
    codigoRef: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type CadastroFormData = z.infer<typeof cadastroSchema>;

function CadastroFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") || "";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      codigoRef: refParam,
    },
  });

  const codigoAtual = watch("codigoRef");

  useEffect(() => {
    if (refParam) {
      setValue("codigoRef", refParam);
    }
  }, [refParam, setValue]);

  const onSubmit = async (data: CadastroFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const emailTratado = data.email.trim().toLowerCase();
    const codigoAfiliadoFinal = (data.codigoRef || refParam || "").trim();

    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: emailTratado,
      password: data.password,
      options: {
        data: {
          nome: data.nome.trim(),
          ref: codigoAfiliadoFinal || undefined,
        },
      },
    });

    if (error) {
      let msg = error.message;
      if (msg.includes("is invalid") || msg.toLowerCase().includes("email")) {
        msg = "O formato do e-mail é inválido. Verifique se não há espaços ou caracteres incorretos.";
      } else if (msg.includes("User already registered") || msg.includes("already exists")) {
        msg = "Este e-mail já está cadastrado. Tente fazer login ou recuperar a senha.";
      }
      setErrorMessage(msg);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      setIsSuccess(true);
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Cadastro Realizado!
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Sua solicitação para ser um colunista do Portal Empire foi recebida com sucesso.
          Nossa equipe editorial analisará seu perfil para ativação.
        </p>
        <Button onClick={() => router.push("/login")} className="w-full">
          Ir para o Login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quero ser um Colunista
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Crie sua coluna de cidade e monetize com anúncios locais
        </p>
      </div>

      {codigoAtual && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Você foi indicado por um Colunista parceiro: <strong>{codigoAtual}</strong>
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            type="text"
            placeholder="Seu Nome Completo"
            className="mt-1"
            {...register("nome")}
          />
          {errors.nome && (
            <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">E-mail Profissional</Label>
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

        <div>
          <Label htmlFor="password">Senha</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Ver confirmação de senha"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="codigoRef" className="text-xs text-slate-500">
            Código de Indicação (opcional)
          </Label>
          <Input
            id="codigoRef"
            type="text"
            placeholder="Ex: carlos ou código do colunista"
            className="mt-1 text-xs"
            {...register("codigoRef")}
          />
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando Cadastro...
            </>
          ) : (
            "Enviar Solicitação de Cadastro"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="text-center text-xs text-slate-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Faça login
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

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando formulário...
        </div>
      }
    >
      <CadastroFormContent />
    </Suspense>
  );
}
