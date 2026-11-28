"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/auth/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Globe, LogOut, User, Menu } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeaderProps {
  profile: Profile;
  onToggleSidebar?: () => void;
}

export function Header({ profile, onToggleSidebar }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const roleColors: Record<string, "default" | "secondary" | "success" | "warning"> = {
    admin: "default",
    editor: "secondary",
    colunista: "warning",
    anunciante: "success",
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Lado Esquerdo: Botão Menu Sanduíche (Mobile/Tablet) + Título */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden h-9 w-9 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 shrink-0"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate hidden sm:block">
          Painel de Controle
        </h1>
      </div>

      {/* Lado Direito: Perfil do Usuário e Ações */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden relative flex items-center justify-center shrink-0">
            {profile.foto_url ? (
              <Image
                src={profile.foto_url}
                alt={profile.nome}
                fill
                className="object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-500" />
            )}
          </div>

          <div className="flex flex-col text-left max-w-[110px] sm:max-w-[180px] md:max-w-none">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {profile.nome}
              </span>
              <Badge
                variant={roleColors[profile.role] || "default"}
                className="uppercase text-[9px] px-1.5 py-0 h-4 shrink-0 hidden sm:inline-flex"
              >
                {profile.role}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 truncate hidden md:inline">
              {profile.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver site público"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "text-slate-600 dark:text-slate-300 hover:text-primary text-xs gap-1.5 h-8 px-2 sm:px-3 border-slate-200 dark:border-slate-700"
            )}
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Ver Site</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            title="Encerrar sessão"
            className="text-slate-500 hover:text-destructive hover:bg-destructive/10 text-xs gap-1.5 h-8 px-2 sm:px-3"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
