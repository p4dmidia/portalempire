"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  ChevronLeft,
  ChevronRight,
  Thermometer,
} from "lucide-react";
import type { DadosClima } from "@/lib/portal/clima";

// Helper para renderizar o ícone correspondente
function IconeClima({ icone, className }: { icone: DadosClima["icone"]; className?: string }) {
  switch (icone) {
    case "sol":
      return <Sun className={`${className} text-amber-400`} />;
    case "sol_nuvem":
      return <CloudSun className={`${className} text-amber-300`} />;
    case "nublado":
      return <Cloud className={`${className} text-slate-300`} />;
    case "chuvisco":
    case "chuva":
      return <CloudRain className={`${className} text-sky-400`} />;
    case "tempestade":
      return <CloudLightning className={`${className} text-purple-400`} />;
    case "nevoeiro":
      return <CloudFog className={`${className} text-slate-400`} />;
    default:
      return <CloudSun className={`${className} text-amber-300`} />;
  }
}

export function WidgetClimaHeader() {
  const [climas, setClimas] = useState<DadosClima[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Busca dados de clima aleatórios das cidades
  useEffect(() => {
    let isMounted = true;

    async function carregarClima() {
      try {
        const res = await fetch("/api/portal/clima?limit=12");
        if (!res.ok) throw new Error("Falha ao buscar clima");
        const data = await res.json();
        if (isMounted && data.climas && data.climas.length > 0) {
          // Embaralha para que cada visita/sessão comece com uma cidade diferente
          const shuffled = [...data.climas].sort(() => Math.random() - 0.5);
          setClimas(shuffled);
        }
      } catch (error) {
        console.warn("[WidgetClima] Erro ao carregar clima:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    carregarClima();

    return () => {
      isMounted = false;
    };
  }, []);

  // Rotação automática suave a cada 5 segundos
  useEffect(() => {
    if (climas.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % climas.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [climas, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + climas.length) % climas.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % climas.length);
  };

  if (isLoading) {
    return (
      <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-white/5 border border-white/10 rounded-full px-3 py-1 animate-pulse shrink-0">
        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
        <span>Carregando tempo...</span>
      </div>
    );
  }

  if (climas.length === 0) return null;

  const atual = climas[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="flex items-center gap-1.5 shrink-0 select-none group"
      title={`Tempo agora em ${atual.cidade} - ${atual.uf}: ${atual.descricao}, ${atual.temperatura}°C (Mín ${atual.tempMin}° / Máx ${atual.tempMax}°)`}
    >
      <Link
        href={`/cidade/${atual.slug}`}
        className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 rounded-full pl-2.5 pr-3 py-1 transition-all duration-300 text-[11.5px] text-slate-200 hover:text-white"
      >
        {/* Ícone dinâmico do clima */}
        <IconeClima icone={atual.icone} className="w-4 h-4 transition-transform group-hover:scale-110" />

        {/* Nome da Cidade e UF */}
        <span className="font-bold tracking-tight text-white">
          {atual.cidade}
          <span className="text-amber-400 font-extrabold text-[10px] ml-1 uppercase">
            {atual.uf}
          </span>
        </span>

        {/* Temperatura Atual */}
        <span className="font-black text-amber-300 text-xs">
          {atual.temperatura}°C
        </span>

        {/* Descrição / Máx e Mín (visível em telas grandes para cima) */}
        <span className="hidden lg:inline-flex items-center gap-1 text-[10.5px] text-slate-400 border-l border-white/15 pl-2">
          <span>{atual.descricao}</span>
          <span className="text-slate-400">
            ({atual.tempMin}° / {atual.tempMax}°)
          </span>
        </span>
      </Link>

      {/* Setas para navegar manualmente entre as cidades */}
      {climas.length > 1 && (
        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePrev}
            aria-label="Cidade anterior"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Próxima cidade"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
