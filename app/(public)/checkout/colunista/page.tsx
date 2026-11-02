import type { Metadata } from "next";
import { getCidades } from "@/lib/portal/queries";
import { CheckoutColunistaClient } from "@/components/portal/CheckoutColunistaClient";

export const metadata: Metadata = {
  title: "Checkout Colunista Licenciado | Empire Cidades",
  description:
    "Finalize sua inscrição como Colunista Licenciado do Portal Empire Cidades. Pagamento seguro via PIX ou Cartão pelo Mercado Pago e liberação imediata do Escritório do Colunista.",
};

interface PageProps {
  searchParams: Promise<{ ref?: string; cidade?: string }>;
}

export default async function CheckoutColunistaPage({ searchParams }: PageProps) {
  const { ref, cidade } = await searchParams;
  const cidades = await getCidades();

  return (
    <CheckoutColunistaClient
      cidades={cidades}
      refCode={ref || ""}
      cidadeInicialSlug={cidade || ""}
    />
  );
}
