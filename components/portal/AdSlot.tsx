"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Megaphone } from "lucide-react";

interface AdSlotProps {
  posicao: "topo" | "lateral" | "meio_texto" | "rodape" | "home_entre_blocos";
  colunaId?: string;
  className?: string;
}

interface AnuncioAtivo {
  id: string;
  espaco_id: string;
  titulo: string;
  imagem_desktop_url: string;
  imagem_mobile_url: string | null;
  link_destino: string;
}

export function AdSlot({ posicao, colunaId, className = "" }: AdSlotProps) {
  const [anuncio, setAnuncio] = useState<AnuncioAtivo | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const impressionRecorded = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function carregarAnuncio() {
      try {
        const queryParams = new URLSearchParams({ posicao });
        if (colunaId) queryParams.set("coluna_id", colunaId);

        const res = await fetch(`/api/ads/slot?${queryParams.toString()}`);
        const data = await res.json();

        if (isMounted && data.anuncio) {
          setAnuncio(data.anuncio);
        }
      } catch {
        // Silently catch ad slot network issues
      }
    }

    carregarAnuncio();

    return () => {
      isMounted = false;
    };
  }, [posicao, colunaId]);

  // Registro de impressão com IntersectionObserver (1x por sessão)
  useEffect(() => {
    if (!anuncio || impressionRecorded.current) return;

    const sessionKey = `ad_imp_${anuncio.id}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
      impressionRecorded.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !impressionRecorded.current) {
          impressionRecorded.current = true;
          sessionStorage.setItem(sessionKey, "1");

          // Disparar contagem de impressão
          fetch("/api/ads/impressao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anuncio_id: anuncio.id }),
          }).catch(() => {});
        }
      },
      { threshold: 0.5 }
    );

    if (slotRef.current) {
      observer.observe(slotRef.current);
    }

    return () => observer.disconnect();
  }, [anuncio]);

  // Caso tenha anúncio ativo
  if (anuncio) {
    return (
      <div ref={slotRef} className={`my-6 mx-auto w-full text-center ${className}`}>
        <a
          href={`/api/ads/click/${anuncio.id}`}
          target="_blank"
          rel="noopener nofollow"
          className="inline-block relative overflow-hidden rounded-xl group transition-transform hover:scale-[1.005]"
          title={anuncio.titulo}
        >
          {/* Tag de Publicidade */}
          <span className="absolute top-1.5 right-1.5 z-10 text-[9px] uppercase font-bold tracking-widest bg-black/60 text-white/90 px-1.5 py-0.5 rounded backdrop-blur-sm">
            Publicidade
          </span>

          {/* Imagem Desktop */}
          <div className="hidden sm:block relative max-w-full">
            <Image
              src={anuncio.imagem_desktop_url}
              alt={anuncio.titulo}
              width={970}
              height={250}
              className="rounded-xl object-contain mx-auto max-h-[250px] w-auto h-auto"
              unoptimized
            />
          </div>

          {/* Imagem Mobile */}
          <div className="block sm:hidden relative max-w-full">
            <Image
              src={anuncio.imagem_mobile_url || anuncio.imagem_desktop_url}
              alt={anuncio.titulo}
              width={350}
              height={250}
              className="rounded-xl object-contain mx-auto max-h-[160px] w-auto h-auto"
              unoptimized
            />
          </div>
        </a>
      </div>
    );
  }

  // Fallback: Convite para anunciar no espaço
  return (
    <div
      className={`my-6 mx-auto w-full bg-slate-100/80 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">
        <Megaphone className="w-3.5 h-3.5" />
        <span>Espaço Publicitário · {posicao.replace("_", " ")}</span>
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Anuncie sua marca e alcance milhares de leitores na região
      </p>
      <Link
        href={`/anuncie?posicao=${posicao}${colunaId ? `&coluna=${colunaId}` : ""}`}
        className="inline-flex items-center text-xs font-semibold text-primary hover:underline bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        Consulte formatos e valores disponíveis
      </Link>
    </div>
  );
}
