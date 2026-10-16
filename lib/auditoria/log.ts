import { createAdminClient } from "@/lib/supabase/admin";

export interface LogAuditoriaParams {
  usuarioId?: string | null;
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  dados?: Record<string, unknown>;
}

/**
 * Registra um evento na tabela de auditoria usando o client admin (service role).
 */
export async function registrarAuditoria({
  usuarioId,
  acao,
  entidade,
  entidadeId,
  dados = {},
}: LogAuditoriaParams): Promise<void> {
  try {
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.from("auditoria").insert({
      usuario_id: usuarioId || null,
      acao,
      entidade,
      entidade_id: entidadeId ? String(entidadeId) : null,
      dados,
    });
  } catch (error) {
    console.error("[Auditoria] Erro ao registrar log:", error);
  }
}
