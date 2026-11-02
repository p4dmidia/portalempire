import { redirect } from "next/navigation";

interface CadastroPageProps {
  searchParams: Promise<{ ref?: string; cidade?: string }>;
}

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  const { ref, cidade } = await searchParams;
  const params = new URLSearchParams();
  if (ref) params.set("ref", ref);
  if (cidade) params.set("cidade", cidade);
  const qs = params.toString();

  redirect(`/checkout/colunista${qs ? `?${qs}` : ""}`);
}
