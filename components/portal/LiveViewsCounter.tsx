"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import {
  calcularVisualizacoesRealistas,
  calcularVisualizacoesColuna,
  formatarVisualizacoes,
  type MateriaParaViews,
  type ColunaParaViews,
} from "@/lib/portal/views-realistas";

interface LiveViewsCounterProps {
  materia: MateriaParaViews;
  initialViews?: number;
  className?: string;
  showIcon?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Contador de visualizações em tempo real estilo YouTube.
 * Atualiza no F5 e periodicamente enquanto o usuário permanece na página,
 * garantindo o mesmo número para qualquer usuário no mesmo instante de tempo.
 */
export function LiveViewsCounter({
  materia,
  initialViews,
  className = "",
  showIcon = true,
  prefix = "",
  suffix = " visualizações",
}: LiveViewsCounterProps) {
  const [views, setViews] = useState(() => initialViews ?? calcularVisualizacoesRealistas(materia));

  useEffect(() => {
    // Sincroniza imediatamente com a hora exata da máquina do leitor
    setViews(calcularVisualizacoesRealistas(materia, new Date()));

    // Avança o contador de forma contínua a cada 4 segundos
    const timer = setInterval(() => {
      setViews(calcularVisualizacoesRealistas(materia, new Date()));
    }, 4000);

    return () => clearInterval(timer);
  }, [materia]);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {showIcon && <Eye className="w-3.5 h-3.5 text-slate-400" />}
      <span suppressHydrationWarning>
        {prefix}
        {formatarVisualizacoes(views)}
        {suffix}
      </span>
    </span>
  );
}

interface LiveColunaViewsCounterProps {
  coluna: ColunaParaViews;
  initialViews?: number;
  totalArtigos?: number;
  className?: string;
}

/**
 * Contador de visualizações em tempo real para a página oficial da coluna.
 */
export function LiveColunaViewsCounter({
  coluna,
  initialViews,
  totalArtigos = 1,
  className = "",
}: LiveColunaViewsCounterProps) {
  const [views, setViews] = useState(() =>
    initialViews ?? calcularVisualizacoesColuna(coluna, totalArtigos)
  );

  useEffect(() => {
    setViews(calcularVisualizacoesColuna(coluna, totalArtigos, new Date()));

    const timer = setInterval(() => {
      setViews(calcularVisualizacoesColuna(coluna, totalArtigos, new Date()));
    }, 4000);

    return () => clearInterval(timer);
  }, [coluna, totalArtigos]);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Eye className="w-3.5 h-3.5 text-amber-500" />
      <span suppressHydrationWarning>{formatarVisualizacoes(views)} visualizações</span>
    </span>
  );
}
