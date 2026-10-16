import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Botão flutuante no topo para voltar ao portal */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800"
          )}
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Voltar para o Site</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center group mb-3"
        >
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-xl group-hover:border-amber-500/50 transition-all">
            <Image
              src="/logo.png"
              alt="Empire Cidades — Portal de Notícias"
              width={260}
              height={95}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
        </Link>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Acesso à área editorial, colunas e publicidade
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          {children}
        </div>

        {/* Link auxiliar abaixo do card */}
        <div className="mt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Ir para a página inicial do site
          </Link>
        </div>
      </div>
    </div>
  );
}

