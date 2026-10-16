"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
  Newspaper,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve conter ao menos 6 caracteres"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/painel/admin/dashboard";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();

    // 1. Autenticar credenciais com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (authError) {
      setErrorMessage(
        authError.message === "Invalid login credentials"
          ? "Credenciais administrativas inválidas. Verifique seu e-mail e senha."
          : authError.message
      );
      setIsLoading(false);
      return;
    }

    if (!authData.user) {
      setErrorMessage("Erro ao iniciar sessão administrativa.");
      setIsLoading(false);
      return;
    }

    // 2. Verificar se o perfil possui role 'admin'
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, status, nome")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setErrorMessage("Perfil não encontrado no sistema.");
      setIsLoading(false);
      return;
    }

    if (profile.role !== "admin") {
      // Desconectar imediatamente para não conceder acesso indevido
      await supabase.auth.signOut();
      setErrorMessage(
        "Acesso negado: esta conta não possui privilégios de Administrador. Se você é colunista ou anunciante, utilize o Login Geral."
      );
      setIsLoading(false);
      return;
    }

    if (profile.status === "bloqueado") {
      await supabase.auth.signOut();
      setErrorMessage("Este usuário administrativo está bloqueado.");
      setIsLoading(false);
      return;
    }

    // Sucesso - redirecionar para a área administrativa
    router.push(redirectPath);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-red-500 selection:text-white">
      {/* Background decorativo futurista / executivo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Botão flutuante para voltar ao site */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 text-slate-400 hover:text-white hover:bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm"
          )}
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium">Voltar ao Portal Público</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Brand & Badge Admin */}
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-xl shadow-blue-500/10 mb-4 ring-1 ring-white/10">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <span>Portal Empire</span>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ADMIN
          </span>
        </h1>
        <p className="mt-2 text-xs text-slate-400 tracking-wide uppercase font-medium">
          Acesso Restrito ao Painel de Controle Master
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" /> Autenticação Segura
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Informe as credenciais de superusuário
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Servidor Ativo" />
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="text-xs font-medium text-slate-300">
                E-mail do Administrador
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@portalempire.com.br"
                autoComplete="email"
                className="mt-1.5 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-10 text-sm"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" className="text-xs font-medium text-slate-300">
                  Senha Master
                </Label>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500 pr-10 h-10 text-sm font-mono"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando Credenciais...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 mr-2" />
                  Acessar Painel Administrativo
                </>
              )}
            </Button>
          </form>

          {/* Links e aviso de segurança */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col gap-3">
            <div className="text-center text-xs text-slate-400">
              Não é administrador?{" "}
              <Link href="/login" className="text-blue-400 hover:underline font-medium">
                Acessar Login de Colunistas
              </Link>
            </div>

            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full text-xs text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Newspaper className="w-3.5 h-3.5 mr-2 text-slate-500" />
              Retornar à Página Principal do Portal
            </Link>
          </div>
        </div>

        {/* Rodapé de segurança legal */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-mono">
            <Terminal className="w-3 h-3 text-slate-600" />
            Acesso monitorado e registrado sob conformidade com a Lei 12.965/14.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-500" /> Carregando Painel Administrativo...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
