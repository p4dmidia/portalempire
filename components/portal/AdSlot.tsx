"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

interface AdSlotProps {
  posicao: "topo" | "lateral" | "meio_texto" | "rodape" | "home_entre_blocos";
  colunaId?: string;
  tipoPagina?: "home" | "coluna" | "materia" | "todas";
  className?: string;
  intervalo?: number; // ms entre cada rotação (padrão: 5000)
  carrossel?: boolean; // habilitar rotação se houver múltiplos anúncios (padrão: true)
}

interface AnuncioAtivo {
  id: string;
  espaco_id: string;
  titulo: string;
  imagem_desktop_url: string;
  imagem_mobile_url: string | null;
  link_destino: string;
}

export function AdSlot({
  posicao,
  colunaId,
  tipoPagina,
  className = "",
  intervalo = 5000,
  carrossel = true,
}: AdSlotProps) {
  const [anuncios, setAnuncios] = useState<AnuncioAtivo[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Carregar anúncios do espaço
  useEffect(() => {
    let isMounted = true;

    async function carregarAnuncios() {
      try {
        const queryParams = new URLSearchParams({ posicao });
        if (colunaId) queryParams.set("coluna_id", colunaId);
        if (tipoPagina) queryParams.set("tipo_pagina", tipoPagina);

        const res = await fetch(`/api/ads/slot?${queryParams.toString()}`);
        const data = await res.json();

        if (isMounted) {
          if (Array.isArray(data.anuncios) && data.anuncios.length > 0) {
            setAnuncios(data.anuncios);
          } else if (data.anuncio) {
            setAnuncios([data.anuncio]);
          } else {
            setAnuncios([]);
          }
        }
      } catch {
        // Silently catch ad slot network issues
      }
    }

    carregarAnuncios();

    return () => {
      isMounted = false;
    };
  }, [posicao, colunaId]);

  // Navegação
  const total = anuncios.length;

  const avancar = useCallback(() => {
    if (total <= 1) return;
    setIndiceAtual((prev) => (prev + 1) % total);
  }, [total]);

  const voltar = useCallback(() => {
    if (total <= 1) return;
    setIndiceAtual((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay do carrossel
  useEffect(() => {
    if (!carrossel || total <= 1 || isHovered) return;

    const timer = setInterval(() => {
      avancar();
    }, intervalo);

    return () => clearInterval(timer);
  }, [carrossel, total, isHovered, intervalo, avancar]);

  // Observador de visibilidade (Viewport)
  useEffect(() => {
    if (total === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (slotRef.current) {
      observer.observe(slotRef.current);
    }

    return () => observer.disconnect();
  }, [total]);

  // Registro de impressão por anúncio ativo visível (1x por sessão para cada anúncio)
  useEffect(() => {
    if (!isIntersecting || total === 0) return;
    const anuncioAtual = anuncios[indiceAtual];
    if (!anuncioAtual) return;

    const sessionKey = `ad_imp_${anuncioAtual.id}`;
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    }

    // Disparar contagem de impressão no banco
    fetch("/api/ads/impressao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anuncio_id: anuncioAtual.id }),
    }).catch(() => {});
  }, [isIntersecting, indiceAtual, anuncios, total]);

  // Suporte a swipe por toque no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        avancar();
      } else {
        voltar();
      }
    }
  };

  // Se houver anúncios cadastrados
  if (total > 0) {
    const isHorizontal = posicao === "topo" || posicao === "rodape" || posicao === "home_entre_blocos";

    return (
      <div
        ref={slotRef}
        className={`my-6 mx-auto w-full text-center relative select-none ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative inline-block max-w-full overflow-hidden rounded-xl group shadow-sm bg-slate-900/5 dark:bg-white/5 border border-slate-200/60 dark:border-slate-800/60">
          {/* Tag de Publicidade com indicador de quantidade */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest bg-black/70 text-white/95 px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm pointer-events-none">
            <span>Publicidade</span>
            {total > 1 && (
              <>
                <span className="text-white/40">·</span>
                <span className="text-amber-400 font-extrabold">
                  {indiceAtual + 1}/{total}
                </span>
              </>
            )}
          </div>

          {/* Botões de navegação lateral (apenas se houver mais de 1 anúncio) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  voltar();
                }}
                aria-label="Anúncio anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  avancar();
                }}
                aria-label="Próximo anúncio"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Faixa deslizante de slides */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${indiceAtual * 100}%)` }}
          >
            {anuncios.map((anuncio, idx) => (
              <div
                key={anuncio.id}
                className="w-full flex-shrink-0 flex items-center justify-center"
              >
                <a
                  href={`/api/ads/click/${anuncio.id}`}
                  target="_blank"
                  rel="noopener nofollow"
                  className="inline-block relative overflow-hidden rounded-xl transition-transform hover:scale-[1.003]"
                  title={anuncio.titulo}
                  tabIndex={idx === indiceAtual ? 0 : -1}
                >
                  {/* Imagem Desktop */}
                  <div className="hidden sm:block relative max-w-full">
                    <Image
                      src={anuncio.imagem_desktop_url}
                      alt={anuncio.titulo}
                      width={isHorizontal ? 970 : 300}
                      height={isHorizontal ? 90 : 250}
                      className={`rounded-xl object-contain mx-auto w-auto h-auto ${
                        isHorizontal ? "max-h-[120px]" : "max-h-[250px]"
                      }`}
                      priority={idx === 0}
                      unoptimized
                    />
                  </div>

                  {/* Imagem Mobile */}
                  <div className="block sm:hidden relative max-w-full">
                    <Image
                      src={anuncio.imagem_mobile_url || anuncio.imagem_desktop_url}
                      alt={anuncio.titulo}
                      width={320}
                      height={isHorizontal ? 50 : 250}
                      className={`rounded-xl object-contain mx-auto w-auto h-auto ${
                        isHorizontal ? "max-h-[80px]" : "max-h-[200px]"
                      }`}
                      priority={idx === 0}
                      unoptimized
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Indicadores (Dots) na base do carrossel */}
          {total > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md">
              {anuncios.map((anuncio, idx) => (
                <button
                  key={anuncio.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIndiceAtual(idx);
                  }}
                  aria-label={`Ir para anúncio ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    idx === indiceAtual
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
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

