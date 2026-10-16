"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/auth/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Globe, LogOut, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeaderProps {
  profile: Profile;
}

export function Header({ profile }: HeaderProps) {
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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white hidden sm:block">
          Painel de Controle
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden relative flex items-center justify-center">
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

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {profile.nome}
              </span>
              <Badge variant={roleColors[profile.role] || "default"} className="uppercase text-[9px] px-1.5 py-0 h-4">
                {profile.role}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400">{profile.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "text-slate-600 dark:text-slate-300 hover:text-primary text-xs gap-1.5 h-8 border-slate-200 dark:border-slate-700"
            )}
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Ver Site</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-500 hover:text-destructive hover:bg-destructive/10 text-xs gap-1.5 h-8"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
