import fs from "fs";
import path from "path";
import type { RevistaData } from "./revistas-types";
import { REVISTAS_DEMO } from "./revistas-demo";

const STORE_PATH = path.join(process.cwd(), "data", "revistas-store.json");

export function obterRevistasLocais(): RevistaData[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const conteudo = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(conteudo);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => {
          if ((a.ordem || 0) !== (b.ordem || 0)) {
            return (a.ordem || 0) - (b.ordem || 0);
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }
    }
  } catch (err) {
    console.warn("[Portal Empire] Erro ao ler revistas locais:", err);
  }

  // Inicializa o arquivo com o catálogo demonstrativo inicial
  const inicial = [...REVISTAS_DEMO];
  salvarRevistasLocais(inicial);
  return inicial;
}

export function salvarRevistasLocais(itens: RevistaData[]): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(itens, null, 2), "utf-8");
  } catch (err) {
    console.error("[Portal Empire] Falha ao salvar revistas locais em disco:", err);
  }
}

export function adicionarOuAtualizarRevistaLocal(nova: RevistaData): void {
  const atuais = obterRevistasLocais();
  const index = atuais.findIndex((r) => r.id === nova.id || r.slug === nova.slug);

  if (index >= 0) {
    atuais[index] = { ...atuais[index], ...nova };
  } else {
    // Insere no início
    atuais.unshift(nova);
  }

  salvarRevistasLocais(atuais);
}

export function excluirRevistaLocal(id: string): void {
  const atuais = obterRevistasLocais();
  const filtradas = atuais.filter((r) => r.id !== id);
  salvarRevistasLocais(filtradas);
}

