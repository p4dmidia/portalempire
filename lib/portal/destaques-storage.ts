import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calcularDataExpiracao, type TipoDestaqueTempo } from "@/lib/utils/destaque-tempo";

export { calcularDataExpiracao };

export interface InfoDestaque {
  materia_id: string;
  expira_em: string | null; // ISO string ou null para sem limite
  tipo: TipoDestaqueTempo;
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


/**
 * Registra ou remove o prazo de expiração de um destaque
 */
export function definirExpiracaoDestaque(
  materiaId: string,
  tipo: TipoDestaqueTempo = "sem_limite"
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
export function verificarDestaqueAtivo(
  materiaId: string,
  destaqueDb: boolean,
  conteudo?: unknown
): boolean {
  if (!destaqueDb) return false;

  // 1. Tenta verificar diretamente no metadata persistido no banco (JSONB da matéria)
  if (conteudo && typeof conteudo === "object") {
    const meta = conteudo as Record<string, unknown>;
    if (meta.destaque_expira_em && typeof meta.destaque_expira_em === "string") {
      const expiraMs = new Date(meta.destaque_expira_em).getTime();
      if (!isNaN(expiraMs) && Date.now() > expiraMs) {
        return false;
      }
    }
  }

  // 2. Fallback no mapa local em disco
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
 * Retorna o tipo de destaque configurado para a matéria ("6h", "12h", "24h", "48h", "7d", "sem_limite")
 */
export function obterTempoDestaqueMateria(
  materiaId?: string | null,
  conteudo?: unknown
): "sem_limite" | "4h" | "6h" | "12h" | "24h" | "48h" | "7d" {
  if (conteudo && typeof conteudo === "object") {
    const meta = conteudo as Record<string, unknown>;
    const t = meta.tempo_destaque as string;
    if (t === "4h" || t === "6h" || t === "12h" || t === "24h" || t === "48h" || t === "7d") {
      return t;
    }
    if (t === "sem_limite") return "sem_limite";
  }

  if (materiaId) {
    const mapa = carregarDestaquesExpiracao();
    const info = mapa[materiaId];
    if (info?.tipo && info.tipo !== "sem_limite") {
      return info.tipo;
    }
  }

  return "sem_limite";
}

/**
 * Retorna o texto amigável do status do destaque para a UI
 */
export function obterRotuloDestaque(
  materiaId: string,
  destaqueDb: boolean,
  conteudo?: unknown
): string | null {
  if (!destaqueDb) return null;

  let expiraEmStr: string | null = null;
  let tipoDestaque = "sem_limite";

  if (conteudo && typeof conteudo === "object") {
    const meta = conteudo as Record<string, unknown>;
    if (meta.destaque_expira_em && typeof meta.destaque_expira_em === "string") {
      expiraEmStr = meta.destaque_expira_em;
    }
    if (meta.tempo_destaque && typeof meta.tempo_destaque === "string") {
      tipoDestaque = meta.tempo_destaque;
    }
  }

  if (!expiraEmStr) {
    const mapa = carregarDestaquesExpiracao();
    const info = mapa[materiaId];
    if (info) {
      expiraEmStr = info.expira_em;
      tipoDestaque = info.tipo;
    }
  }

  if (!expiraEmStr || tipoDestaque === "sem_limite") {
    return "Destaque Fixo";
  }

  const expiraEm = new Date(expiraEmStr).getTime();
  const diffHoras = Math.round((expiraEm - Date.now()) / (3600 * 1000));

  if (diffHoras <= 0) {
    return "Destaque (Expirando)";
  }

  if (diffHoras < 24) {
    return `Destaque (${diffHoras}h restantes)`;
  }

  const diffDias = Math.ceil(diffHoras / 24);
  return `Destaque (${diffDias}d restantes)`;
}

