import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-service-role-key";

async function criarAdmin() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const nome = args[2] || "Administrador Geral";

  if (!email || !password) {
    console.log("\n\x1b[33mUSO:\x1b[0m npx tsx scripts/criar-admin.ts <email> <senha> [nome]");
    console.log("Exemplo: npx tsx scripts/criar-admin.ts admin@portalempire.com.br Admin123456! 'Admin Chefe'\n");
    process.exit(1);
  }

  console.log("=================================================================");
  console.log(`CRIANDO / PROMOVENDO ADMINISTRADOR: ${email}`);
  console.log("=================================================================\n");

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // 1. Verificar se o portal inicial existe
    const { data: portais } = await supabaseAdmin.from("portais").select("id").limit(1);
    const portalId = portais?.[0]?.id || null;

    // 2. Tentar criar o usuário em auth.users
    let userId: string | null = null;
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (createError) {
      if (createError.message.includes("already exists") || createError.message.includes("unique")) {
        console.log(">> Usuário já existe no Auth. Buscando ID e atualizando senha...");
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const existing = usersList?.users.find((u) => u.email === email);
        if (!existing) {
          throw new Error("Não foi possível localizar o usuário existente.");
        }
        userId = existing.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: { nome },
        });
      } else {
        throw createError;
      }
    } else {
      userId = newUser.user.id;
    }

    if (!userId) {
      throw new Error("ID do usuário não obtido.");
    }

    // 3. Atualizar o profile com role = 'admin' e status = 'ativo'
    const baseSlug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "admin";

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        portal_id: portalId,
        nome,
        slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
        email,
        role: "admin",
        status: "ativo",
      }, { onConflict: "id" });

    if (profileError) {
      throw profileError;
    }

    // 4. Gravar log de auditoria
    await supabaseAdmin.from("auditoria").insert({
      usuario_id: userId,
      acao: "CRIACAO_INICIAL_ADMIN",
      entidade: "profiles",
      entidade_id: userId,
      dados: { email, nome, role: "admin", origin: "cli_script" },
    });

    console.log("\x1b[32m[SUCESSO]\x1b[0m Administrador configurado com sucesso!");
    console.log(`- E-mail: ${email}`);
    console.log(`- Role: admin`);
    console.log(`- Status: ativo`);
    console.log(`- ID: ${userId}\n`);
  } catch (error) {
    console.error("\x1b[31m[ERRO]\x1b[0m Falha ao criar administrador:", error);
    process.exit(1);
  }
}

criarAdmin();
