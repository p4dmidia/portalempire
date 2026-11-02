import fs from "fs";
import path from "path";
import type { ClassificadoData } from "./classificados-types";
import { CLASSIFICADOS_DEMO } from "./classificados-demo";

const STORE_PATH = path.join(process.cwd(), "data", "classificados-store.json");

// Anúncio da Moto cadastrado no teste adicionado aos registros iniciais
const ANUNCIO_TESTE_MOTO: ClassificadoData = {
  id: "cls-teste-moto-fazer-2024",
  titulo: "Moto Fazer 2024/2024",
  slug: "moto-fazer-2024",
  descricao: "Moto Yamaha Fazer impecável, revisões em concessionária, documentação 100% em dia. Excelente estado e pronta para rodar.",
  tipo: "venda",
  categoria: "veiculos",
  preco: 15000,
  preco_sob_consulta: false,
  imagem_principal: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200",
  galeria_fotos: [],
  cidade_nome: "Belo Horizonte",
  bairro: "Centro",
  uf: "MG",
  contato_nome: "Administrador Empire Cidades",
  contato_whatsapp: "11999999999",
  destaque_home: true,
  destaque_classificados: true,
  paginas_exibicao: ["todas", "home", "classificados"],
  status: "ativo",
  visualizacoes: 1,
  created_at: new Date().toISOString(),
};

export function obterClassificadosLocais(): ClassificadoData[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const conteudo = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(conteudo);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    }
  } catch (err) {
    console.warn("[Portal Empire] Erro ao ler classificados locais:", err);
  }

  // Inicializa a base com o anúncio da moto + os demos
  const inicial = [ANUNCIO_TESTE_MOTO, ...CLASSIFICADOS_DEMO];
  salvarClassificadosLocais(inicial);
  return inicial;
}

export function salvarClassificadosLocais(itens: ClassificadoData[]): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(itens, null, 2), "utf-8");
  } catch (err) {
    console.error("[Portal Empire] Falha ao salvar classificados locais em disco:", err);
  }
}

export function adicionarOuAtualizarClassificadoLocal(novo: ClassificadoData): void {
  const atuais = obterClassificadosLocais();
  const index = atuais.findIndex((i) => i.id === novo.id || i.slug === novo.slug);

  if (index >= 0) {
    atuais[index] = { ...atuais[index], ...novo, updated_at: new Date().toISOString() };
  } else {
    atuais.unshift(novo);
  }

  salvarClassificadosLocais(atuais);
}

export function excluirClassificadoLocal(id: string): void {
  const atuais = obterClassificadosLocais();
  const filtrados = atuais.filter((i) => i.id !== id);
  salvarClassificadosLocais(filtrados);
}
