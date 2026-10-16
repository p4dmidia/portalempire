import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import type { CategoriaData, PortalData } from "@/lib/portal/queries";

interface FooterProps {
  portal: PortalData | null;
  categorias: CategoriaData[];
}

export function Footer({ portal, categorias }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Coluna 1: Sobre */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-sm group-hover:border-amber-500/50 transition-all">
                <Image
                  src={portal?.logo_url || "/logo.png"}
                  alt={portal?.nome || "Empire Cidades — Portal de Notícias"}
                  width={240}
                  height={88}
                  className="h-12 md:h-14 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              {portal?.descricao_seo ||
                "Portal líder em jornalismo regional, notícias de cidades, cobertura em tempo real e colunistas renomados."}
            </p>
            <div className="flex items-center gap-3 text-slate-300">
              <a
                href={portal?.redes_sociais?.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 bg-slate-900 rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={portal?.redes_sociais?.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 bg-slate-900 rounded-full"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={portal?.redes_sociais?.youtube || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 bg-slate-900 rounded-full"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={portal?.redes_sociais?.twitter || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 bg-slate-900 rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Editorias Principais */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Editorias
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {categorias.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {cat.nome}
                </Link>
              ))}
            </div>
          </div>

          {/* Coluna 3: Links Institucionais */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Institucional
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/colunas" className="hover:text-white transition-colors">
                  Nossos Colunistas
                </Link>
              </li>
              <li>
                <Link href="/cidades" className="hover:text-white transition-colors">
                  Cidades Cobertas
                </Link>
              </li>
              <li>
                <Link href="/anuncie" className="hover:text-white transition-colors">
                  Mídia Kit & Publicidade
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-white transition-colors">
                  Seja um Colunista
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="hover:text-white transition-colors">
                  Feed RSS
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Área Restrita */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Acesso Editorial
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Área exclusiva para editores, colunistas municipais e anunciantes parceiros.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg border border-slate-800 transition-colors"
            >
              Acessar Painel
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {currentYear} {portal?.nome || "Portal Empire"}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-slate-300 transition-colors">
              Privacidade & LGPD
            </Link>
            <span>·</span>
            <Link href="/termos" className="hover:text-slate-300 transition-colors">
              Termos de Uso
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
