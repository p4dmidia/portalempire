import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100">
      {/* Header simples */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center group">
          <div className="bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 shadow-sm group-hover:border-amber-500/50 transition-all flex items-center">
            <Image
              src="/logo.png"
              alt="Empire Cidades"
              width={180}
              height={66}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
        </Link>
      </header>

      {/* Conteúdo Central 404 */}
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-2">
          <Compass className="w-12 h-12 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            Erro 404 · Conteúdo Não Encontrado
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Esta página não existe ou foi removida
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            O endereço digitado pode estar incorreto ou a notícia/coluna pode ter sido arquivada pela redação.
          </p>
        </div>

        {/* Barra de Busca de Resgate */}
        <form action="/busca" method="GET" className="max-w-md mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="q"
              placeholder="O que você está procurando?"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" className="h-10 text-xs">
            Buscar
          </Button>
        </form>

        {/* Links Rápidos */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button variant="default" size="sm" className="gap-1.5 shadow-sm">
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </Link>
          <Link href="/colunas">
            <Button variant="outline" size="sm">
              Colunistas
            </Button>
          </Link>
          <Link href="/cidades">
            <Button variant="outline" size="sm">
              Cidades
            </Button>
          </Link>
        </div>
      </main>

      {/* Rodapé simples */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Portal Empire. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
