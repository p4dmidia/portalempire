"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ViewCounterProps {
  materiaId: string;
}

export function ViewCounter({ materiaId }: ViewCounterProps) {
  useEffect(() => {
    if (!materiaId || typeof window === "undefined") return;

    // 1. Não contar visualização de robôs, scrapers ou crawlers
    const userAgent = navigator.userAgent || "";
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|headless|curl|wget/i.test(
      userAgent
    );
    if (isBot) return;

    const storageKey = `viewed_materia_${materiaId}`;
    if (sessionStorage.getItem(storageKey)) {
      return; // Já visualizado nesta sessão
    }

    // 2. Chamar a RPC do Supabase diretamente pelo navegador (zero custo de função Vercel)
    try {
      const supabase = createClient();
      void supabase.rpc("incrementar_visualizacao", { materia_id: materiaId });
      sessionStorage.setItem(storageKey, "true");
    } catch {}
  }, [materiaId]);

  return null;
}
