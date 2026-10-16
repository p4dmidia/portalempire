import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-service-role-key";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";

interface TestResult {
  regra: string;
  passou: boolean;
  detalhe?: string;
}

const resultados: TestResult[] = [];

function registrarResultado(regra: string, passou: boolean, detalhe?: string) {
  resultados.push({ regra, passou, detalhe });
  const statusStr = passou ? "\x1b[32m[PASSOU]\x1b[0m" : "\x1b[31m[FALHOU]\x1b[0m";
  console.log(`${statusStr} ${regra}${detalhe ? ` -> ${detalhe}` : ""}`);
}

async function runRLSTests() {
  console.log("=================================================================");
  console.log("INICIANDO SUÍTE DE TESTES DE ISOLAMENTO E RLS DO PORTAL EMPIRE");
  console.log("=================================================================\n");

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    console.log(">> Preparando usuários e dados de teste...");

    const editor1Email = `editor1_${Date.now()}@teste.com`;
    const editor2Email = `editor2_${Date.now()}@teste.com`;
    const colunista1Email = `colunista1_${Date.now()}@teste.com`;
    const colunista2Email = `colunista2_${Date.now()}@teste.com`;
    const password = "PasswordTest123!";

    const { data: userE1, error: errE1 } = await adminClient.auth.admin.createUser({
      email: editor1Email,
      password,
      email_confirm: true,
      user_metadata: { nome: "Editor Um" },
    });
    if (errE1) throw errE1;

    const { data: userE2, error: errE2 } = await adminClient.auth.admin.createUser({
      email: editor2Email,
      password,
      email_confirm: true,
      user_metadata: { nome: "Editor Dois" },
    });
    if (errE2) throw errE2;

    const { data: userC1, error: errC1 } = await adminClient.auth.admin.createUser({
      email: colunista1Email,
      password,
      email_confirm: true,
      user_metadata: { nome: "Colunista Um" },
    });
    if (errC1) throw errC1;

    const { data: userC2, error: errC2 } = await adminClient.auth.admin.createUser({
      email: colunista2Email,
      password,
      email_confirm: true,
      user_metadata: { nome: "Colunista Dois" },
    });
    if (errC2) throw errC2;

    await adminClient.from("profiles").update({ role: "editor", status: "ativo" }).eq("id", userE1.user.id);
    await adminClient.from("profiles").update({ role: "editor", status: "ativo" }).eq("id", userE2.user.id);
    await adminClient.from("profiles").update({ role: "colunista", status: "ativo" }).eq("id", userC1.user.id);
    await adminClient.from("profiles").update({ role: "colunista", status: "ativo" }).eq("id", userC2.user.id);

    const { data: portais } = await adminClient.from("portais").select("id").limit(1);
    const portalId = portais?.[0]?.id;
    const { data: categorias } = await adminClient.from("categorias").select("id").limit(1);
    const categoriaId = categorias?.[0]?.id;

    if (!portalId || !categoriaId) {
      throw new Error("Portal ou Categoria inicial não encontrada. O seed foi executado?");
    }

    const { data: matE1Rascunho } = await adminClient.from("materias").insert({
      portal_id: portalId,
      autor_id: userE1.user.id,
      categoria_id: categoriaId,
      titulo: "Matéria Rascunho Editor 1",
      slug: `mat-e1-rascunho-${Date.now()}`,
      status: "rascunho",
    }).select().single();

    const { data: matE1Publicada } = await adminClient.from("materias").insert({
      portal_id: portalId,
      autor_id: userE1.user.id,
      categoria_id: categoriaId,
      titulo: "Matéria Publicada Editor 1",
      slug: `mat-e1-pub-${Date.now()}`,
      status: "publicado",
      publicado_em: new Date(Date.now() - 10000).toISOString(),
    }).select().single();

    const { data: matE2Rascunho } = await adminClient.from("materias").insert({
      portal_id: portalId,
      autor_id: userE2.user.id,
      categoria_id: categoriaId,
      titulo: "Matéria Rascunho Editor 2",
      slug: `mat-e2-rascunho-${Date.now()}`,
      status: "rascunho",
    }).select().single();

    const { data: colC1Pendente } = await adminClient.from("colunas").insert({
      portal_id: portalId,
      dono_id: userC1.user.id,
      nome: "Coluna Pendente Colunista 1",
      slug: `col-c1-pendente-${Date.now()}`,
      status: "pendente",
    }).select().single();

    const { data: colC1Ativa } = await adminClient.from("colunas").insert({
      portal_id: portalId,
      dono_id: userC1.user.id,
      nome: "Coluna Ativa Colunista 1",
      slug: `col-c1-ativa-${Date.now()}`,
      status: "ativa",
    }).select().single();

    const { data: colC2Pendente } = await adminClient.from("colunas").insert({
      portal_id: portalId,
      dono_id: userC2.user.id,
      nome: "Coluna Pendente Colunista 2",
      slug: `col-c2-pendente-${Date.now()}`,
      status: "pendente",
    }).select().single();

    const clientE1 = createClient(SUPABASE_URL, ANON_KEY);
    await clientE1.auth.signInWithPassword({ email: editor1Email, password });

    const clientE2 = createClient(SUPABASE_URL, ANON_KEY);
    await clientE2.auth.signInWithPassword({ email: editor2Email, password });

    const clientC1 = createClient(SUPABASE_URL, ANON_KEY);
    await clientC1.auth.signInWithPassword({ email: colunista1Email, password });

    const clientC2 = createClient(SUPABASE_URL, ANON_KEY);
    await clientC2.auth.signInWithPassword({ email: colunista2Email, password });

    console.log(">> Usuários autenticados. Executando bateria de asserções RLS...\n");

    // 1. Editor 1 NÃO pode ler rascunho de Editor 2
    const { data: test1Data } = await clientE1.from("materias").select("id").eq("id", matE2Rascunho?.id);
    registrarResultado(
      "1. Editor 1 não vê rascunho de matéria do Editor 2",
      !test1Data || test1Data.length === 0,
      `Itens retornados: ${test1Data?.length ?? 0}`
    );

    // 2. Editor 1 pode ler seu próprio rascunho
    const { data: test2Data } = await clientE1.from("materias").select("id").eq("id", matE1Rascunho?.id);
    registrarResultado(
      "2. Editor 1 lê perfeitamente seu próprio rascunho",
      Boolean(test2Data && test2Data.length === 1),
      `Encontrado: ${test2Data?.length === 1}`
    );

    // 3. Editor 1 NÃO pode alterar matéria do Editor 2
    await clientE1.from("materias").update({ titulo: "Hackeado" }).eq("id", matE2Rascunho?.id);
    const { data: checkE2Mat } = await adminClient.from("materias").select("titulo").eq("id", matE2Rascunho?.id).single();
    registrarResultado(
      "3. Editor 1 não consegue alterar matéria do Editor 2",
      checkE2Mat?.titulo !== "Hackeado",
      `Título mantido: "${checkE2Mat?.titulo}"`
    );

    // 4. Editor 1 NÃO pode deletar matéria do Editor 2
    await clientE1.from("materias").delete().eq("id", matE2Rascunho?.id);
    const { data: checkE2MatExists } = await adminClient.from("materias").select("id").eq("id", matE2Rascunho?.id);
    registrarResultado(
      "4. Editor 1 não consegue deletar matéria do Editor 2",
      Boolean(checkE2MatExists && checkE2MatExists.length === 1),
      `Matéria permaneceu no banco`
    );

    // 5. Colunista 1 NÃO vê coluna pendente de Colunista 2
    const { data: test5Data } = await clientC1.from("colunas").select("id").eq("id", colC2Pendente?.id);
    registrarResultado(
      "5. Colunista 1 não vê coluna pendente do Colunista 2",
      !test5Data || test5Data.length === 0,
      `Itens retornados: ${test5Data?.length ?? 0}`
    );

    // 6. Colunista 1 pode ver sua própria coluna pendente
    const { data: test6Data } = await clientC1.from("colunas").select("id").eq("id", colC1Pendente?.id);
    registrarResultado(
      "6. Colunista 1 vê sua própria coluna pendente",
      Boolean(test6Data && test6Data.length === 1),
      `Encontrado: ${test6Data?.length === 1}`
    );

    // 7. Colunista 1 NÃO consegue alterar coluna do Colunista 2
    await clientC1.from("colunas").update({ nome: "Coluna Invasora" }).eq("id", colC2Pendente?.id);
    const { data: checkC2Col } = await adminClient.from("colunas").select("nome").eq("id", colC2Pendente?.id).single();
    registrarResultado(
      "7. Colunista 1 não consegue alterar coluna do Colunista 2",
      checkC2Col?.nome !== "Coluna Invasora",
      `Nome mantido: "${checkC2Col?.nome}"`
    );

    // 8. Colunista NÃO pode auto-aprovar o status de sua própria coluna para 'ativa'
    await clientC1.from("colunas").update({ status: "ativa" }).eq("id", colC1Pendente?.id);
    const { data: checkC1Status } = await adminClient.from("colunas").select("status").eq("id", colC1Pendente?.id).single();
    registrarResultado(
      "8. Colunista não pode auto-aprovar coluna pendente",
      checkC1Status?.status === "pendente",
      `Status verificado: ${checkC1Status?.status}`
    );

    // 9. Público anônimo lê matéria publicada
    const { data: test9Data } = await anonClient.from("materias").select("id").eq("id", matE1Publicada?.id);
    registrarResultado(
      "9. Público anônimo acessa matéria publicada",
      Boolean(test9Data && test9Data.length === 1),
      `Acesso público confirmado`
    );

    // 10. Público anônimo NÃO lê matéria rascunho
    const { data: test10Data } = await anonClient.from("materias").select("id").eq("id", matE1Rascunho?.id);
    registrarResultado(
      "10. Público anônimo não acessa matéria rascunho",
      !test10Data || test10Data.length === 0,
      `Itens retornados: ${test10Data?.length ?? 0}`
    );

    // 11. Público anônimo vê coluna ativa
    const { data: test11Data } = await anonClient.from("colunas").select("id").eq("id", colC1Ativa?.id);
    registrarResultado(
      "11. Público anônimo acessa coluna ativa",
      Boolean(test11Data && test11Data.length === 1),
      `Acesso a coluna ativa confirmado`
    );

    // 12. Público anônimo NÃO vê coluna pendente
    const { data: test12Data } = await anonClient.from("colunas").select("id").eq("id", colC1Pendente?.id);
    registrarResultado(
      "12. Público anônimo não acessa coluna pendente",
      !test12Data || test12Data.length === 0,
      `Itens retornados: ${test12Data?.length ?? 0}`
    );

    // 13. View autores_publicos expõe apenas colunistas/editores ativos
    const { data: test13Data } = await anonClient.from("autores_publicos").select("id, nome, role").eq("id", userC1.user.id);
    registrarResultado(
      "13. View autores_publicos expõe dados sanitizados de autor ativo",
      Boolean(test13Data && test13Data.length === 1),
      `Autor retornado com segurança`
    );

    // 14. Colunista 1 cria artigo na sua própria coluna ativa
    const { data: artC1, error: errArtC1 } = await clientC1.from("materias").insert({
      portal_id: portalId,
      autor_id: userC1.user.id,
      coluna_id: colC1Ativa?.id,
      categoria_id: categoriaId,
      titulo: "Artigo de Opinião Colunista 1",
      slug: `art-c1-${Date.now()}`,
      status: "publicado",
      publicado_em: new Date().toISOString(),
    }).select().single();
    registrarResultado(
      "14. Colunista 1 cria e publica artigo vinculado à sua coluna",
      Boolean(artC1 && !errArtC1),
      `Artigo criado com id: ${artC1?.id?.slice(0, 8)}...`
    );

    // 15. Colunista 2 NÃO consegue editar o artigo do Colunista 1
    await clientC2.from("materias").update({ titulo: "Invadido por Colunista 2" }).eq("id", artC1?.id);
    const { data: checkArtC1 } = await adminClient.from("materias").select("titulo").eq("id", artC1?.id).single();
    registrarResultado(
      "15. Colunista 2 não consegue editar o artigo do Colunista 1",
      checkArtC1?.titulo !== "Invadido por Colunista 2",
      `Título mantido: "${checkArtC1?.titulo}"`
    );

    // 16. Colunista 2 NÃO consegue excluir a coluna do Colunista 1
    await clientC2.from("colunas").delete().eq("id", colC1Ativa?.id);
    const { data: checkColC1Exists } = await adminClient.from("colunas").select("id").eq("id", colC1Ativa?.id);
    registrarResultado(
      "16. Colunista 2 não consegue excluir a coluna do Colunista 1",
      Boolean(checkColC1Exists && checkColC1Exists.length === 1),
      `Coluna permaneceu no banco`
    );

    // Cleanup dos usuários de teste
    console.log("\n>> Limpando dados de teste...");
    await adminClient.auth.admin.deleteUser(userE1.user.id);
    await adminClient.auth.admin.deleteUser(userE2.user.id);
    await adminClient.auth.admin.deleteUser(userC1.user.id);
    await adminClient.auth.admin.deleteUser(userC2.user.id);

    console.log("\n=================================================================");
    const total = resultados.length;
    const aprovados = resultados.filter((r) => r.passou).length;
    console.log(`RESULTADO FINAL: ${aprovados}/${total} REGRAS DE RLS PASSARAM COM SUCESSO`);
    console.log("=================================================================\n");

    if (aprovados !== total) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\x1b[31mErro durante execução dos testes de RLS:\x1b[0m", error);
    process.exit(1);
  }
}

runRLSTests();
