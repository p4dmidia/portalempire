import { createClient } from "@supabase/supabase-js";
import { extrairDetalhesMateriaOriginal } from "../lib/captacao/extrator-conteudo";
import { otimizarUrlImagem, obterImagemEditorialContextual } from "../lib/portal/image-utils";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("=== INICIANDO CURA DE IMAGENS DO PORTAL ===");

  // 1. Corrigir as matérias do UOL com vírgula concatenada (mais.uol.com.br)
  const { data: uolMaterias } = await sb
    .from("materias")
    .select("id, titulo, imagem_url")
    .ilike("imagem_url", "%mais.uol.com.br%");

  console.log(`\n[Etapa 1] Matérias UOL com vírgula encontradas: ${uolMaterias?.length || 0}`);
  if (uolMaterias && uolMaterias.length > 0) {
    for (const m of uolMaterias) {
      if (m.imagem_url && m.imagem_url.includes(",")) {
        const partes = m.imagem_url.split(",").map((p: string) => p.trim()).filter(Boolean);
        const urlLimpa = partes[0];
        console.log(` -> Corrigindo UOL [${m.titulo}]:\n    DE:   ${m.imagem_url}\n    PARA: ${urlLimpa}`);
        await sb.from("materias").update({ imagem_url: urlLimpa }).eq("id", m.id);
      }
    }
  }

  // 2. Corrigir matérias específicas que estavam com jornal genérico na Home
  const especificas = [
    {
      id: "df423c98-07f6-43dd-8c50-7c35fb6a2c6b",
      titulo: "Ônibus tomba e deixa feridos em Niterói",
      imagem: "https://s2-redeglobo.glbimg.com/uAyb5J8FrYy_LHhBvA5Qlxcrxvs=/1200x0/smart/filters:quality(70)/https://i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2026/x/3/chBk73QX27DvBSie0Vxw/design-sem-nome-2026-10-26t181540.878.jpg"
    },
    {
      id: "23a6ccd9-cb1b-4c28-88ba-b1c52918f75a",
      titulo: "G1 lista eventos especiais para o fim de semana, em Salvador",
      imagem: "https://s2-g1.glbimg.com/mGspqfDYNnEkTs_GIM_fDJK7BqM=/1200x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2018/t/Y/0uFlPiRO6HU5hAQ27ilg/capa-rock.png"
    },
    {
      id: "3f325126-e7d2-4317-a0f6-ea0e930432d4",
      titulo: "Vitor Kley, Jammil e Pedro Pondé se apresentam em agosto",
      imagem: "https://s2-g1.glbimg.com/_TkAv2sJMmL-jrOX4ynRa508f14=/1200x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2018/l/I/hyJ2sqRNAHZw2QELSJDg/vitorkley.png"
    },
    {
      id: "3422794c-6122-4fc1-a471-56c1ec5c0bd5",
      titulo: "Giroto deixa presidência do PR",
      imagem: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "5e9e4fe6-6edb-4d9e-8dc8-35fff0262f59",
      titulo: "administração municipal de João Pessoa terá programação especial",
      imagem: "https://paraibaonline.com.br/wp-content/uploads/2024/02/2024-pmjp.jpg"
    }
  ];

  console.log(`\n[Etapa 2] Atualizando matérias de destaque com imagens corretas em alta resolução`);
  for (const esp of especificas) {
    const { error } = await sb.from("materias").update({ imagem_url: esp.imagem }).eq("id", esp.id);
    if (error) console.error(`Erro ao atualizar ${esp.titulo}:`, error);
    else console.log(` -> Sucesso: [${esp.titulo}] atualizada!`);
  }

  // 3. Buscar lote de matérias recentes com imagem genérica de jornal ("photo-1504711434969")
  const { data: materiasGenericas, error: errGen } = await sb
    .from("materias")
    .select("id, titulo, imagem_url, url_original, categoria:categorias(nome, slug)")
    .ilike("imagem_url", "%photo-1504711434969%")
    .order("created_at", { ascending: false })
    .limit(150);

  if (errGen) {
    console.error("Erro ao buscar matérias genéricas:", errGen);
  } else {
    console.log(`\n[Etapa 3] Matérias recentes com foto de jornal para curar: ${materiasGenericas?.length || 0}`);
    let reextraidas = 0;
    let contextuais = 0;

    for (const m of (materiasGenericas || [])) {
      const contexto = `${(m as any).categoria?.nome || ""} ${m.titulo || ""}`;
      let novaImagem: string | null = null;

      // Se tiver URL original e não for ponte do Google News, tenta extrair a foto real da reportagem
      if (m.url_original && m.url_original.startsWith("http") && !m.url_original.includes("news.google.com")) {
        try {
          const detalhes = await extrairDetalhesMateriaOriginal(m.url_original);
          if (detalhes.imagemUrl && !detalhes.imagemUrl.includes("photo-1504711434969")) {
            novaImagem = detalhes.imagemUrl;
            reextraidas++;
          }
        } catch {}
      }

      // Se não houver foto original válida, define foto editorial HD contextual com variedade
      if (!novaImagem) {
        novaImagem = obterImagemEditorialContextual(contexto);
        contextuais++;
      }

      await sb.from("materias").update({ imagem_url: novaImagem }).eq("id", m.id);
    }
    console.log(` -> Re-extraídas com foto real da página: ${reextraidas}`);
    console.log(` -> Atualizadas com foto editorial contextual: ${contextuais}`);
  }

  // 4. Buscar matérias recentes que ficaram com imagem_url nula
  const { data: materiasNulas, error: errNulas } = await sb
    .from("materias")
    .select("id, titulo, imagem_url, url_original, categoria:categorias(nome, slug)")
    .is("imagem_url", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (errNulas) {
    console.error("Erro ao buscar matérias nulas:", errNulas);
  } else {
    console.log(`\n[Etapa 4] Matérias recentes com imagem_url nula para curar: ${materiasNulas?.length || 0}`);
    let corrigidasNulas = 0;

    for (const m of (materiasNulas || [])) {
      const contexto = `${(m as any).categoria?.nome || ""} ${m.titulo || ""}`;
      let novaImagem: string | null = null;

      if (m.url_original && m.url_original.startsWith("http") && !m.url_original.includes("news.google.com")) {
        try {
          const detalhes = await extrairDetalhesMateriaOriginal(m.url_original);
          if (detalhes.imagemUrl) {
            novaImagem = detalhes.imagemUrl;
          }
        } catch {}
      }

      if (!novaImagem) {
        novaImagem = obterImagemEditorialContextual(contexto);
      }

      await sb.from("materias").update({ imagem_url: novaImagem }).eq("id", m.id);
      corrigidasNulas++;
    }
    console.log(` -> Matérias nulas curadas: ${corrigidasNulas}`);
  }

  console.log("\n=== CURA COMPLETA FINALIZADA COM SUCESSO ===");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
