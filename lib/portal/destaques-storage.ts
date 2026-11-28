import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calcularDataExpiracao, type TipoDestaqueTempo } from "@/lib/utils/destaque-tempo";

export { calcularDataExpiracao };

export interface InfoDestaque {
  materia_id: string;
  expira_em: string | null;
  tipo: TipoDestaqueTempo;
  criado_em: string;
}

/**
 * Registra ou remove o prazo de expiração de um destaque.
 * Mantido para compatibilidade com chamadas existentes.
 */
export function definirExpiracaoDestaque(
  _materiaId: string,
  _tipo: TipoDestaqueTempo = "sem_limite"
): void {
  // O controle agora é 100% persistido no JSONB da matéria (campo conteudo->destaque_expira_em)
}

export function removerExpiracaoDestaque(_materiaId: string): void {
  // O controle agora é 100% persistido no JSONB da matéria
}

/**
 * Desativa no banco Supabase todas as matérias que possuem destaque ativo
 * mas cujo prazo (conteudo->>destaque_expira_em) já expirou.
 * Retorna o número de matérias desativadas.
 */
export async function desativarDestaquesExpirados(): Promise<number> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    const { data: expirados, error } = await supabaseAdmin
      .from("materias")
      .select("id, slug, titulo")
      .eq("destaque", true)
      .not("conteudo->>destaque_expira_em", "is", null)
      .filter("conteudo->>destaque_expira_em", "lt", nowIso);

    if (error || !expirados || expirados.length === 0) {
      return 0;
    }

    const ids = expirados.map((m) => m.id);
    const { error: updateError } = await supabaseAdmin
      .from("materias")
      .update({ destaque: false })
      .in("id", ids);

    if (updateError) {
      console.warn("[destaques-storage] Erro ao desativar destaques expirados:", updateError.message);
      return 0;
    }

    console.log(`[destaques-storage] ${expirados.length} destaques expirados foram desativados no banco com sucesso.`);
    return expirados.length;
  } catch (err) {
    console.warn("[destaques-storage] Falha ao desativar destaques expirados:", err);
    return 0;
  }
}

/**
 * Valida se a matéria ainda está dentro do período de destaque ativo.
 * Se expirou, retorna false e já dispara a desativação no Supabase em segundo plano.
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
        // Expirou! Desativa silenciosamente no banco em segundo plano
        try {
          const supabase = getSupabaseAdmin();
          supabase
            .from("materias")
            .update({ destaque: false })
            .eq("id", materiaId)
            .then(() => {});
        } catch (err) {
          console.warn(`[destaques-storage] Falha ao desativar matéria expirada ${materiaId}:`, err);
        }
        return false;
      }
      return true;
    }

    // Se possui tempo_destaque "sem_limite", é destaque fixo
    if (meta.tempo_destaque === "sem_limite") {
      return true;
    }
  }

  // Se destaqueDb for true e não houver data de expiração gravada, é destaque permanente
  return true;
}

/**
 * Retorna o tipo de destaque configurado para a matéria ("4h", "6h", "12h", "24h", "48h", "7d", "sem_limite")
 */
export function obterTempoDestaqueMateria(
  _materiaId?: string | null,
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

  return "sem_limite";
}

/**
 * Retorna o texto amigável do status do destaque para a UI
 */
export function obterRotuloDestaque(
  _materiaId: string,
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

  if (!expiraEmStr || tipoDestaque === "sem_limite") {
    return "Destaque Fixo";
  }

  const expiraEm = new Date(expiraEmStr).getTime();
  const diffHoras = Math.round((expiraEm - Date.now()) / (3600 * 1000));

  if (diffHoras <= 0) {
    return "Destaque (Expirado)";
  }

  if (diffHoras < 24) {
    return `Destaque (${diffHoras}h restantes)`;
  }

  const diffDias = Math.ceil(diffHoras / 24);
  return `Destaque (${diffDias}d restantes)`;
}
