import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import * as z from "zod";

const updateUserSchema = z.object({
  targetUserId: z.string().uuid(),
  action: z.enum(["aprovar", "bloquear", "ativar", "alterar_role"]),
  newRole: z.enum(["admin", "editor", "colunista", "anunciante"]).optional(),
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(2),
  role: z.enum(["admin", "editor", "colunista", "anunciante"]),
});

export async function POST(request: NextRequest) {
  try {
    const adminProfile = await getProfile();
    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();

    // Caso 1: Convidar / Criar Novo Usuário
    if (body.action === "convidar") {
      const parsed = inviteUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const { email, nome, role } = parsed.data;
      const supabaseAdmin = createAdminClient();

      // Gerar senha temporária aleatória para o convite
      const tempPassword = `Temp_${Math.random().toString(36).slice(-8)}!Aa1`;

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { nome },
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      // Atualizar profile com role e status ativo
      await supabaseAdmin
        .from("profiles")
        .update({ role, status: "ativo" })
        .eq("id", newUser.user.id);

      // Registrar auditoria
      await supabaseAdmin.from("auditoria").insert({
        usuario_id: adminProfile.id,
        acao: "CONVIDAR_USUARIO",
        entidade: "profiles",
        entidade_id: newUser.user.id,
        dados: { email, nome, role },
      });

      return NextResponse.json({
        success: true,
        message: "Usuário convidado com sucesso.",
        tempPassword,
      });
    }

    // Caso 2: Ações de Gestão de Usuário Existente
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { targetUserId, action, newRole } = parsed.data;
    const supabase = await createClient();

    let updateData: Record<string, unknown> = {};
    let auditAction = "";

    if (action === "aprovar" || action === "ativar") {
      updateData = { status: "ativo" };
      auditAction = action === "aprovar" ? "APROVAR_USUARIO" : "ATIVAR_USUARIO";
    } else if (action === "bloquear") {
      updateData = { status: "bloqueado" };
      auditAction = "BLOQUEAR_USUARIO";
    } else if (action === "alterar_role") {
      if (!newRole) {
        return NextResponse.json({ error: "Novo role é obrigatório." }, { status: 400 });
      }
      updateData = { role: newRole };
      auditAction = `ALTERAR_ROLE_PARA_${newRole.toUpperCase()}`;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", targetUserId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Registrar auditoria
    await supabase.from("auditoria").insert({
      usuario_id: adminProfile.id,
      acao: auditAction,
      entidade: "profiles",
      entidade_id: targetUserId,
      dados: { action, ...updateData },
    });

    return NextResponse.json({ success: true, message: "Ação executada com sucesso." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
