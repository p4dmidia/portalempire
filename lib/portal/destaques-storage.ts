import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface InfoDestaque {
  materia_id: string;
  expira_em: string | null; // ISO string ou null para sem limite
  tipo: "6h" | "12h" | "24h" | "48h" | "7d" | "sem_limite";
  criado_em: string;
}

const ARQUIVO_DESTAQUES = path.join(process.cwd(), "data", "destaques-expiracao.json");

function garantirDiretorio(): void {
  const dir = path.dirname(ARQUIVO_DESTAQUES);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function carregarDestaquesExpiracao(): Record<string, InfoDestaque> {
  try {
    garantirDiretorio();
    if (!fs.existsSync(ARQUIVO_DESTAQUES)) {
      return {};
    }
    const conteudo = fs.readFileSync(ARQUIVO_DESTAQUES, "utf-8");
    return JSON.parse(conteudo || "{}");
  } catch (err) {
    console.warn("[Portal Empire] Erro ao carregar destaques-expiracao.json:", err);
    return {};
  }
}

export function salvarDestaquesExpiracao(dados: Record<string, InfoDestaque>): void {
  try {
    garantirDiretorio();
    fs.writeFileSync(ARQUIVO_DESTAQUES, JSON.stringify(dados, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Portal Empire] Erro ao salvar destaques-expiracao.json:", err);
  }
}

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

/**
 * Registra ou remove o prazo de expiração de um destaque
 */
export function definirExpiracaoDestaque(
  materiaId: string,
  tipo: "6h" | "12h" | "24h" | "48h" | "7d" | "sem_limite" = "sem_limite"
): void {
  const mapa = carregarDestaquesExpiracao();

  if (tipo === "sem_limite") {
    mapa[materiaId] = {
      materia_id: materiaId,
      expira_em: null,
      tipo: "sem_limite",
      criado_em: new Date().toISOString(),
    };
  } else {
    mapa[materiaId] = {
      materia_id: materiaId,
      expira_em: calcularDataExpiracao(tipo),
      tipo,
      criado_em: new Date().toISOString(),
    };
  }

  salvarDestaquesExpiracao(mapa);
}

export function removerExpiracaoDestaque(materiaId: string): void {
  const mapa = carregarDestaquesExpiracao();
  if (mapa[materiaId]) {
    delete mapa[materiaId];
    salvarDestaquesExpiracao(mapa);
  }
}

/**
 * Valida se a matéria ainda está dentro do período de destaque ativo
 */
export function verificarDestaqueAtivo(materiaId: string, destaqueDb: boolean): boolean {
  if (!destaqueDb) return false;

  const mapa = carregarDestaquesExpiracao();
  const info = mapa[materiaId];

  // Se não tiver registro ou for sem_limite, é destaque permanente (ex: matéria da ALLVITY)
  if (!info || !info.expira_em) {
    return true;
  }

  // Verifica se o tempo limite já passou
  const expiraEm = new Date(info.expira_em).getTime();
  const agora = Date.now();

  if (agora > expiraEm) {
    // Expirou! Desativa silenciosamente no banco em segundo plano
    try {
      delete mapa[materiaId];
      salvarDestaquesExpiracao(mapa);

      const supabase = getSupabaseAdmin();
      supabase
        .from("materias")
        .update({ destaque: false })
        .eq("id", materiaId)
        .then(() => {});
    } catch (err) {
      console.warn(`[Portal Empire] Falha ao desativar destaque expirado da matéria ${materiaId}:`, err);
    }
    return false;
  }

  return true;
}

/**
 * Retorna o texto amigável do status do destaque para a UI
 */
export function obterRotuloDestaque(materiaId: string, destaqueDb: boolean): string | null {
  if (!destaqueDb) return null;

  const mapa = carregarDestaquesExpiracao();
  const info = mapa[materiaId];

  if (!info || !info.expira_em) {
    return "Destaque Fixo";
  }

  const expiraEm = new Date(info.expira_em).getTime();
  const diffHoras = Math.round((expiraEm - Date.now()) / (3600 * 1000));

  if (diffHoras <= 0) {
    return "Expirando";
  }

  if (diffHoras < 24) {
    return `Destaque (${diffHoras}h restantes)`;
  }

  const diffDias = Math.ceil(diffHoras / 24);
  return `Destaque (${diffDias}d restantes)`;
}

