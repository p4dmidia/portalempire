"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/lib/auth/types";
import {
  Newspaper,
  LayoutDashboard,
  Users,
  FileText,
  Columns,
  FolderTree,
  MapPin,
  Rss,
  Megaphone,
  DollarSign,
  Palette,
  Settings,
  ShieldCheck,
  UserCheck,
  BarChart3,
  PlusCircle,
  ExternalLink,
  Share2,
  Banknote,
  CreditCard,
} from "lucide-react";

interface SidebarProps {
  profile: Profile;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const role: UserRole = profile.role;

  const adminNav: NavItem[] = [
    { label: "Dashboard Geral", href: "/painel/admin/dashboard", icon: LayoutDashboard },
    { label: "Usuários & Equipe", href: "/painel/admin/usuarios", icon: Users },
    { label: "Todas as Matérias", href: "/painel/admin/materias", icon: FileText },
    { label: "Colunas de Cidades", href: "/painel/admin/colunas", icon: Columns },
    { label: "Editorias", href: "/painel/admin/editorias", icon: FolderTree },
    { label: "Cidades", href: "/painel/admin/cidades", icon: MapPin },
    { label: "Captação RSS", href: "/painel/admin/captacao", icon: Rss },
    { label: "Publicidade & Formatos", href: "/painel/admin/anuncios", icon: Megaphone },
    { label: "Financeiro Global", href: "/painel/admin/financeiro", icon: DollarSign },
    { label: "Saques PIX Afiliados", href: "/painel/admin/saques", icon: Banknote },
    { label: "Aparência do Portal", href: "/painel/admin/aparencia", icon: Palette },
    { label: "Configurações", href: "/painel/admin/configuracoes", icon: Settings },
    { label: "Trilha de Auditoria", href: "/painel/admin/auditoria", icon: ShieldCheck },
  ];

  const editorNav: NavItem[] = [
    { label: "Meu Dashboard", href: "/painel/editor/dashboard", icon: LayoutDashboard },
    { label: "Minhas Matérias", href: "/painel/editor/materias", icon: FileText },
    { label: "Escrever Matéria", href: "/painel/editor/materias/nova", icon: PlusCircle },
    { label: "Notícias Captadas", href: "/painel/editor/captadas", icon: Rss },
  ];


  const colunistaNav: NavItem[] = [
    { label: "Meu Dashboard", href: "/painel/colunista/dashboard", icon: LayoutDashboard },
    { label: "Minhas Colunas", href: "/painel/colunista/colunas", icon: Columns },
    { label: "Meus Artigos", href: "/painel/colunista/artigos", icon: FileText },
    { label: "Espaços de Anúncio", href: "/painel/colunista/espacos", icon: Megaphone },
    { label: "Meus Anunciantes", href: "/painel/colunista/anunciantes", icon: Users },
    { label: "Anúncios Vendidos", href: "/painel/colunista/anuncios", icon: BarChart3 },
    { label: "Programa de Afiliados", href: "/painel/colunista/afiliados", icon: Share2 },
    { label: "Minha Assinatura", href: "/painel/colunista/assinatura", icon: CreditCard },
    { label: "Financeiro & Split", href: "/painel/colunista/financeiro", icon: DollarSign },
  ];

  const anuncianteNav: NavItem[] = [
    { label: "Meus Anúncios", href: "/painel/anunciante/anuncios", icon: Megaphone },
    { label: "Métricas & Cliques", href: "/painel/anunciante/metricas", icon: BarChart3 },
    { label: "Pagamentos & Faturas", href: "/painel/anunciante/pagamentos", icon: DollarSign },
  ];

  let navItems: NavItem[] = [];
  if (role === "admin") navItems = adminNav;
  else if (role === "editor") navItems = editorNav;
  else if (role === "colunista") navItems = colunistaNav;
  else if (role === "anunciante") navItems = anuncianteNav;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/painel" className="flex items-center group">
          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-sm group-hover:border-amber-500/50 transition-all flex items-center">
            <Image
              src="/logo.png"
              alt="Empire Cidades"
              width={160}
              height={59}
              className="h-8 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu {role}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary-foreground" : "text-slate-400")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Minha Conta
        </div>
        <Link
          href="/painel/perfil"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/painel/perfil"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
          )}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Meu Perfil</span>
        </Link>
      </div>

      {/* Footer link to public site */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span>Ver Portal Público</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
