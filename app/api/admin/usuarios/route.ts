import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createClient as createClientJs } from "@supabase/supabase-js";
import * as z from "zod";

const updateUserSchema = z.object({
  targetUserId: z.string().uuid(),
  action: z.enum(["aprovar", "bloquear", "ativar", "alterar_role", "excluir"]),
  newRole: z.enum(["admin", "editor", "colunista", "anunciante"]).optional(),
});

const inviteUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  role: z.enum(["admin", "editor", "colunista", "anunciante"]),
  senha: z
    .string({ required_error: "A senha de acesso é obrigatória" })
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula (A-Z)")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número (0-9)")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial (!@#$%^&*...)"),
  confirmarSenha: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  // Campos detalhados de endereço
  cep: z.string().optional().nullable(),
  logradouro: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
}).refine(
  (data) => !data.confirmarSenha || data.senha === data.confirmarSenha,
  {
    message: "A confirmação de senha não confere com a senha digitada.",
    path: ["confirmarSenha"],
  }
);

const editUserSchema = z.object({
  targetUserId: z.string().uuid(),
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  role: z.enum(["admin", "editor", "colunista", "anunciante"]),
  status: z.enum(["ativo", "pendente", "bloqueado"]),
  telefone: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  // Campos detalhados de endereço
  cep: z.string().optional().nullable(),
  logradouro: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

function montarEnderecoFormatado(data: {
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  endereco?: string | null;
}): string {
  const partes: string[] = [];

  let ruaNum = data.logradouro?.trim() || "";
  if (data.numero?.trim()) {
    ruaNum = ruaNum ? `${ruaNum}, ${data.numero.trim()}` : `Nº ${data.numero.trim()}`;
  }
  if (data.complemento?.trim()) {
    ruaNum = ruaNum ? `${ruaNum} (${data.complemento.trim()})` : data.complemento.trim();
  }
  if (ruaNum) partes.push(ruaNum);

  if (data.bairro?.trim()) partes.push(data.bairro.trim());

  if (data.cidade?.trim()) {
    const cidUf = data.uf?.trim()
      ? `${data.cidade.trim()} - ${data.uf.trim().toUpperCase()}`
      : data.cidade.trim();
    partes.push(cidUf);
  } else if (data.uf?.trim()) {
    partes.push(data.uf.trim().toUpperCase());
  }

  if (data.cep?.trim()) {
    partes.push(`CEP: ${data.cep.trim()}`);
  }

  if (partes.length > 0) {
    return partes.join(", ");
  }

  return data.endereco?.trim() || "";
}

export async function POST(request: NextRequest) {
  try {
    const adminProfile = await getProfile();
    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();

    // Caso 1: Cadastrar / Convidar Novo Usuário
    if (body.action === "cadastrar" || body.action === "convidar") {
      const parsed = inviteUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const {
        email,
        nome,
        role,
        senha,
        telefone,
        instagram,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        endereco,
        bio,
      } = parsed.data;
      const supabaseAdmin = createAdminClient();
      const supabase = await createClient();

      const finalPassword = senha.trim();

      let newUserId: string | null = null;

      // 1. Tentar criar via Admin API (se Service Role Key estiver configurada)
      try {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: finalPassword,
          email_confirm: true,
          user_metadata: { nome },
        });

        if (!createError && newUser?.user?.id) {
          newUserId = newUser.user.id;
        } else if (createError) {
          const errLower = createError.message.toLowerCase();
          if (errLower.includes("already registered") || errLower.includes("unique")) {
            return NextResponse.json(
              { error: "Este e-mail já está cadastrado no sistema." },
              { status: 400 }
            );
          }
          console.warn("[Admin Cadastro] Tentando fallback signUp após:", createError.message);
        }
      } catch (errAdmin) {
        console.warn("[Admin Cadastro] Falha ao chamar auth.admin.createUser:", errAdmin);
      }

      // 2. Fallback resiliente caso auth.admin.createUser falhe por permissão ("User not allowed")
      if (!newUserId) {
        const publicClient = createClientJs(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const { data: signUpData, error: signUpError } = await publicClient.auth.signUp({
          email,
          password: finalPassword,
          options: {
            data: { nome, role },
          },
        });

        if (signUpError) {
          const errLower = signUpError.message.toLowerCase();
          const msg = errLower.includes("already registered") || errLower.includes("unique")
            ? "Este e-mail já está cadastrado no sistema."
            : signUpError.message;
          return NextResponse.json({ error: msg }, { status: 400 });
        }

        newUserId = signUpData.user?.id || null;
      }

      if (!newUserId) {
        return NextResponse.json(
          { error: "Não foi possível criar o usuário no sistema de autenticação." },
          { status: 400 }
        );
      }

      // Formatando dados adicionais (Instagram, Endereço Completo, Telefone)
      const cleanInstagram = instagram
        ? instagram.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
        : null;

      const enderecoCompleto = montarEnderecoFormatado({
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        endereco,
      });

      const dadosEndereco = {
        cep: cep?.trim() || null,
        logradouro: logradouro?.trim() || null,
        numero: numero?.trim() || null,
        complemento: complemento?.trim() || null,
        bairro: bairro?.trim() || null,
        cidade: cidade?.trim() || null,
        uf: uf?.trim()?.toUpperCase() || null,
      };

      const redesSociaisObj: Record<string, unknown> = {
        dados_endereco: dadosEndereco,
      };
      if (cleanInstagram) redesSociaisObj.instagram = cleanInstagram;
      if (enderecoCompleto) redesSociaisObj.endereco = enderecoCompleto;
      if (telefone?.trim()) redesSociaisObj.whatsapp = telefone.trim();

      const profileUpdates: Record<string, unknown> = {
        role,
        status: "ativo",
        nome,
        telefone: telefone?.trim() || null,
        bio: bio?.trim() || null,
        redes_sociais: redesSociaisObj,
        updated_at: new Date().toISOString(),
      };

      // Tenta atualizar no banco com colunas dedicadas de endereço (se existirem)
      const updatesComColunas = {
        ...profileUpdates,
        endereco: enderecoCompleto || null,
        cep: cep?.trim() || null,
        cidade: cidade?.trim() || null,
        uf: uf?.trim()?.toUpperCase() || null,
      };

      const { error: updateErr1 } = await supabase
        .from("profiles")
        .update(updatesComColunas)
        .eq("id", newUserId);

      if (updateErr1) {
        // Fallback 1: tenta salvar apenas com a coluna endereco
        const { error: updateErr2 } = await supabase
          .from("profiles")
          .update({ ...profileUpdates, endereco: enderecoCompleto || null })
          .eq("id", newUserId);

        if (updateErr2) {
          // Fallback 2: salva sem colunas extras (dados preservados em redes_sociais)
          await supabase
            .from("profiles")
            .update(profileUpdates)
            .eq("id", newUserId);
        }
      }

      // Registrar auditoria
      await supabase.from("auditoria").insert({
        usuario_id: adminProfile.id,
        acao: "CADASTRAR_USUARIO",
        entidade: "profiles",
        entidade_id: newUserId,
        dados: {
          email,
          nome,
          role,
          telefone,
          instagram: cleanInstagram,
          endereco: enderecoCompleto,
          cidade: cidade?.trim() || null,
          uf: uf?.trim()?.toUpperCase() || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Usuário cadastrado com sucesso no sistema.",
        senha: finalPassword,
        email,
        nome,
        userId: newUserId,
        endereco: enderecoCompleto,
      });
    }

    // Caso 2: Editar Perfil Completo do Usuário (Nome, Telefone, Instagram, Endereço, Bio, Role, Status)
    if (body.action === "editar_perfil") {
      const parsed = editUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const {
        targetUserId,
        nome,
        role,
        status,
        telefone,
        instagram,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        endereco,
        bio,
      } = parsed.data;
      const supabase = await createClient();

      // Buscar redes_sociais existentes para merge
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("redes_sociais")
        .eq("id", targetUserId)
        .single();

      const redesAtuais = (currentProfile?.redes_sociais as Record<string, unknown>) || {};
      const cleanInsta = instagram
        ? instagram.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
        : "";

      if (cleanInsta) redesAtuais.instagram = cleanInsta;
      else delete redesAtuais.instagram;

      const enderecoCompleto = montarEnderecoFormatado({
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        endereco,
      });

      const dadosEndereco = {
        cep: cep?.trim() || null,
        logradouro: logradouro?.trim() || null,
        numero: numero?.trim() || null,
        complemento: complemento?.trim() || null,
        bairro: bairro?.trim() || null,
        cidade: cidade?.trim() || null,
        uf: uf?.trim()?.toUpperCase() || null,
      };

      redesAtuais.dados_endereco = dadosEndereco;

      if (enderecoCompleto) redesAtuais.endereco = enderecoCompleto;
      else delete redesAtuais.endereco;

      if (telefone?.trim()) redesAtuais.whatsapp = telefone.trim();

      const updateData: Record<string, unknown> = {
        nome: nome.trim(),
        role,
        status,
        telefone: telefone?.trim() || null,
        bio: bio?.trim() || null,
        redes_sociais: redesAtuais,
        updated_at: new Date().toISOString(),
      };

      const updateDataComColunas = {
        ...updateData,
        endereco: enderecoCompleto || null,
        cep: cep?.trim() || null,
        cidade: cidade?.trim() || null,
        uf: uf?.trim()?.toUpperCase() || null,
      };

      const { error: editError1 } = await supabase
        .from("profiles")
        .update(updateDataComColunas)
        .eq("id", targetUserId);

      if (editError1) {
        // Fallback 1: tenta salvar apenas com a coluna endereco
        const { error: editError2 } = await supabase
          .from("profiles")
          .update({ ...updateData, endereco: enderecoCompleto || null })
          .eq("id", targetUserId);

        if (editError2) {
          // Fallback 2: salva sem colunas extras
          const { error: fallbackError } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", targetUserId);

          if (fallbackError) {
            return NextResponse.json({ error: fallbackError.message }, { status: 400 });
          }
        }
      }

      // Registrar auditoria
      await supabase.from("auditoria").insert({
        usuario_id: adminProfile.id,
        acao: "EDITAR_PERFIL_USUARIO",
        entidade: "profiles",
        entidade_id: targetUserId,
        dados: {
          nome,
          role,
          status,
          telefone,
          instagram: cleanInsta,
          endereco: enderecoCompleto,
          cidade: cidade?.trim() || null,
          uf: uf?.trim()?.toUpperCase() || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Informações do usuário atualizadas com sucesso.",
        endereco: enderecoCompleto,
      });
    }

    // Caso 3: Ações Rápidas de Gestão de Usuário Existente (Aprovar, Bloquear, Ativar, Alterar Role, Excluir)
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { targetUserId, action, newRole } = parsed.data;
    const supabase = await createClient();

    // Excluir usuário permanentemente
    if (action === "excluir") {
      if (targetUserId === adminProfile.id) {
        return NextResponse.json(
          { error: "Você não pode excluir sua própria conta de administrador." },
          { status: 400 }
        );
      }

      const supabaseAdmin = createAdminClient();

      // 1. Tenta excluir do Auth (se tiver chave administrativa)
      try {
        await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      } catch (errAuth) {
        console.warn("[Admin Excluir] Aviso ao excluir do auth:", errAuth);
      }

      // 2. Exclui do profiles (em cascata no banco)
      const { error: deleteErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", targetUserId);

      if (deleteErr) {
        return NextResponse.json({ error: deleteErr.message }, { status: 400 });
      }

      // Registrar auditoria
      await supabase.from("auditoria").insert({
        usuario_id: adminProfile.id,
        acao: "EXCLUIR_USUARIO",
        entidade: "profiles",
        entidade_id: targetUserId,
        dados: { action: "excluir" },
      });

      return NextResponse.json({ success: true, message: "Cadastro do usuário excluído com sucesso." });
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const adminProfile = await getProfile();
    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("id");
    if (!targetUserId) {
      return NextResponse.json({ error: "ID do usuário obrigatório." }, { status: 400 });
    }

    if (targetUserId === adminProfile.id) {
      return NextResponse.json({ error: "Você não pode excluir sua própria conta." }, { status: 400 });
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    try {
      await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    } catch {}

    const { error } = await supabase.from("profiles").delete().eq("id", targetUserId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("auditoria").insert({
      usuario_id: adminProfile.id,
      acao: "EXCLUIR_USUARIO",
      entidade: "profiles",
      entidade_id: targetUserId,
      dados: { action: "excluir" },
    });

    return NextResponse.json({ success: true, message: "Usuário excluído com sucesso." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
