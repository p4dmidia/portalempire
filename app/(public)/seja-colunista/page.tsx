import type { Metadata } from "next";
import Link from "next/link";
import { getPortalData, getCidades } from "@/lib/portal/queries";
import { SejaColunistaClient } from "@/components/portal/SejaColunistaClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPortalData();
  const nomePortal = portal?.nome || "Empire Cidades";

  return {
    title: `Seja um Colunista Licenciado — ${nomePortal}`,
    description:
      "Faça a cobertura oficial da sua cidade no Portal Empire Cidades, venda espaços publicitários locais e ganhe R$ 50,00 por mês de recorrência por cada novo colunista indicado.",
    openGraph: {
      title: `Seja um Colunista Licenciado — ${nomePortal}`,
      description:
        "Leve informação de qualidade para a sua região, comercialize anúncios no portal e construa renda recorrente todo mês.",
      type: "website",
      locale: "pt_BR",
    },
  };
}

export default async function SejaColunistaPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; cidade?: string }>;
}) {
  const { ref, cidade } = await searchParams;
  const [portal, cidades] = await Promise.all([getPortalData(), getCidades()]);

  const whatsappUrl =
    portal?.redes_sociais?.whatsapp ||
    "https://wa.me/5511999999999?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20como%20ser%20um%20Colunista%20Licenciado%20do%20Portal%20Empire%20Cidades.";

  return (
    <div className="space-y-4">
      {/* Breadcrumb discreto */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-[#c8102e] transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href="/colunas" className="hover:text-[#c8102e] transition-colors">
            Colunas & Colunistas
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            Seja um Colunista
          </span>
        </div>
        <Link
          href="/colunas"
          className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
        >
          Ver Colunistas Ativos →
        </Link>
      </div>

      <SejaColunistaClient
        codigoRef={ref || ""}
        cidadeInicial={cidade || ""}
        cidades={cidades}
        whatsappUrl={whatsappUrl}
      />
    </div>
  );
}

