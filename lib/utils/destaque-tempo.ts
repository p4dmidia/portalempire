/**
 * Utilitário universal (isomorfo: roda tanto no cliente quanto no servidor)
 * para cálculo e formatação de prazos de expiração de matérias em destaque.
 */

export type TipoDestaqueTempo = "sem_limite" | "6h" | "12h" | "24h" | "48h" | "7d";

export function calcularDataExpiracao(tipo?: string | null): string | null {
  if (!tipo || tipo === "sem_limite") return null;

  const agora = Date.now();
  const horasMap: Record<string, number> = {
    "6h": 6,
    "12h": 12,
    "24h": 24,
    "48h": 48,
    "7d": 24 * 7,
  };

  const horas = horasMap[tipo];
  if (!horas) return null;

  return new Date(agora + horas * 3600 * 1000).toISOString();
}

export function formatarRotuloTempoDestaque(
  tempoDestaque?: string | null,
  expiraEm?: string | null
): string {
  if (!tempoDestaque || tempoDestaque === "sem_limite") {
    return "Destaque Fixo";
  }

  if (expiraEm) {
    const diffMs = new Date(expiraEm).getTime() - Date.now();
    if (diffMs <= 0) return "Destaque (Expirado)";
    const diffHoras = Math.round(diffMs / (3600 * 1000));
    if (diffHoras < 1) {
      const diffMin = Math.max(1, Math.round(diffMs / (60 * 1000)));
      return `Destaque (${diffMin}min)`;
    }
    if (diffHoras < 24) return `Destaque (${diffHoras}h)`;
    const diffDias = Math.ceil(diffHoras / 24);
    return `Destaque (${diffDias}d)`;
  }

  return `Destaque (${tempoDestaque})`;
}
