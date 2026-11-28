"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/painel/sidebar";
import { Header } from "@/components/painel/header";
import type { Profile } from "@/lib/auth/types";

interface PainelShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export function PainelShell({ profile, children }: PainelShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu lateral automaticamente ao navegar entre páginas no mobile/tablet
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Trava a rolagem do body quando o menu lateral mobile estiver aberto
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Fecha com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Sidebar Responsivo (Fixo no Desktop, Gaveta Deslizante no Mobile/Tablet) */}
      <Sidebar
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header
          profile={profile}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
