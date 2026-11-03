"use client";

import { usePathname } from "next/navigation";
import { BlocoTvAoVivoHome } from "@/components/portal/BlocoTvAoVivoHome";
import { CardRadioAoVivo } from "@/components/portal/CardRadioAoVivo";
import { CarrosselEmpireFlix } from "@/components/portal/CarrosselEmpireFlix";

/**
 * Seção multimídia unificada exibida no final de todas as telas públicas do portal:
 * 1. TV Empire Ao Vivo (Transmissão em vídeo com player oficial)
 * 2. Rádio Empire Ao Vivo (Player de streaming de áudio)
 * 3. Card dos Apresentadores da Empire Flix (Carrossel estilo Netflix com fotos e links)
 */
export function EmpireMidiaPublica() {
  const pathname = usePathname();

  // Ocultar em telas de checkout e finalização de compra
  if (pathname?.startsWith("/checkout")) {
    return null;
  }

  return (
    <section aria-label="Mídia Oficial Empire" className="mt-12 space-y-6">
      {/* 1. TV Ao Vivo — Transmissão da TV Empire */}
      <BlocoTvAoVivoHome />

      {/* 2. Rádio Ao Vivo — Transmissão Oficial */}
      <CardRadioAoVivo />

      {/* 3. Carrossel dos Apresentadores EmpireFlix */}
      <CarrosselEmpireFlix />
    </section>
  );
}

