import { createClient } from "@/lib/supabase/server";
export * from "./revistas-types";
import type { RevistaData, FiltrosRevistas } from "./revistas-types";

// Catálogo demonstrativo idêntico ao modelo visual solicitado (Conecte Online / Empire Magazine)
export const REVISTAS_DEMO: RevistaData[] = [
  {
    id: "rev-00000000-0001",
    titulo: "Vem ai a Revista Empire Magazine de Carmópolis de Minas",
    subtitulo: "EMPIRE CARMÓPOLIS DE MINAS",
    slug: "empire-magazine-carmopolis-de-minas",
    capa_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    link_url: "https://conecteonline.com.br/#top-revistas",
    cidade: "Carmópolis de Minas",
    estado: "MG",
    escritor: "Redação Empire",
    categoria: "ENTRETENIMENTO",
    tipo_acesso: "GRATUITA",
    data_publicacao: "2024-04-16",
    destaque: true,
    ativo: true,
    ordem: 1,
    visualizacoes: 4890,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: "rev-00000000-0002",
    titulo: "Empire Magazine Ribeirão Preto — 2024 Fashion & Trends",
    subtitulo: "EMPIRE RIBEIRÃO PRETO",
    slug: "empire-magazine-ribeirao-preto",
    capa_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    link_url: "https://conecteonline.com.br/#top-revistas",
    cidade: "Ribeirão Preto",
    estado: "SP",
    escritor: "Redação Empire",
    categoria: "DIVERSOS",
    tipo_acesso: "GRATUITA",
    data_publicacao: "2024-04-16",
    destaque: true,
    ativo: true,
    ordem: 2,
    visualizacoes: 6120,
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
  },
  {
    id: "rev-00000000-0003",
    titulo: "Empire Magazine 25 de Março — Edição Especial Comércio & Moda",
    subtitulo: "EMPIRE 25 DE MARÇO",
    slug: "empire-magazine-25-de-marco",
    capa_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    link_url: "https://conecteonline.com.br/#top-revistas",
    cidade: "São Paulo",
    estado: "SP",
    escritor: "Redação Empire",
    categoria: "DIVERSOS",
    tipo_acesso: "GRATUITA",
    data_publicacao: "2024-04-16",
    destaque: true,
    ativo: true,
    ordem: 3,
    visualizacoes: 7850,
    created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
  },
  {
    id: "rev-00000000-0004",
    titulo: "Empire Magazine Brás — Tendências Têxteis & Empreendedorismo",
    subtitulo: "EMPIRE BRÁS",
    slug: "empire-magazine-bras",
    capa_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    link_url: "https://conecteonline.com.br/#top-revistas",
    cidade: "São Paulo",
    estado: "SP",
    escritor: "Redação Empire",
    categoria: "DIVERSOS",
    tipo_acesso: "GRATUITA",
    data_publicacao: "2024-04-16",
    destaque: true,
    ativo: true,
    ordem: 4,
    visualizacoes: 5410,
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: "rev-00000000-0005",
    titulo: "Empire Magazine Franca — Polo Calçadista, Inovação e Negócios",
    subtitulo: "EMPIRE FRANCA",
    slug: "empire-magazine-franca-polo-calcadista",
    capa_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    link_url: "https://conecteonline.com.br/#top-revistas",
    cidade: "Franca",
    estado: "SP",
    escritor: "Marcos Vinícius",
    categoria: "NEGÓCIOS",
    tipo_acesso: "GRATUITA",
    data_publicacao: "2024-05-10",
    destaque: true,
    ativo: true,
    ordem: 5,
    visualizacoes: 3200,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: "rev-00000000-0006",
    titulo: "Empire Magazine Uberlândia — O Gigante do Agronegócio e Logística",
    subtitulo: "EMPIRE UBERLÂNDIA",
    slug: "empire-magazine-uberlandia-agronegocio",
    capa_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    link_url: "https://conecteonline.com.br/#top-revistas",
    cidade: "Uberlândia",
    estado: "MG",
    escritor: "Luciana Alencar",
    categoria: "AGRONEGÓCIO",
    tipo_acesso: "EDIÇÃO ESPECIAL",
    data_publicacao: "2024-06-01",
    destaque: true,
    ativo: true,
    ordem: 6,
    visualizacoes: 4100,
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
];

export async function getRevistas(filtros: FiltrosRevistas = {}): Promise<RevistaData[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("revistas")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("data_publicacao", { ascending: false });

    if (filtros.destaque) {
      query = query.eq("destaque", true);
    }

    if (filtros.categoria && filtros.categoria !== "Todas") {
      query = query.ilike("categoria", `%${filtros.categoria}%`);
    }

    if (filtros.cidade && filtros.cidade !== "Todas") {
      query = query.ilike("cidade", `%${filtros.cidade}%`);
    }

    if (filtros.escritor && filtros.escritor !== "Todos") {
      query = query.ilike("escritor", `%${filtros.escritor}%`);
    }

    if (filtros.busca && filtros.busca.trim()) {
      const termo = filtros.busca.trim();
      query = query.or(
        `titulo.ilike.%${termo}%,subtitulo.ilike.%${termo}%,cidade.ilike.%${termo}%,escritor.ilike.%${termo}%,categoria.ilike.%${termo}%`
      );
    }

    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data as RevistaData[];
    }
  } catch (err) {
    console.warn("[Portal Empire] Tabela de revistas do banco inacessível, utilizando catálogo demonstrativo:", err);
  }

  // Fallback nos dados demonstrativos
  let itens = [...REVISTAS_DEMO];

  if (filtros.destaque) {
    itens = itens.filter((r) => r.destaque);
  }

  if (filtros.categoria && filtros.categoria !== "Todas") {
    itens = itens.filter(
      (r) => r.categoria.toLowerCase() === filtros.categoria!.toLowerCase()
    );
  }

  if (filtros.cidade && filtros.cidade !== "Todas") {
    itens = itens.filter(
      (r) => r.cidade?.toLowerCase() === filtros.cidade!.toLowerCase()
    );
  }

  if (filtros.escritor && filtros.escritor !== "Todos") {
    itens = itens.filter(
      (r) => r.escritor?.toLowerCase().includes(filtros.escritor!.toLowerCase())
    );
  }

  if (filtros.busca && filtros.busca.trim()) {
    const termo = filtros.busca.toLowerCase().trim();
    itens = itens.filter(
      (r) =>
        r.titulo.toLowerCase().includes(termo) ||
        (r.subtitulo && r.subtitulo.toLowerCase().includes(termo)) ||
        (r.cidade && r.cidade.toLowerCase().includes(termo)) ||
        (r.escritor && r.escritor.toLowerCase().includes(termo)) ||
        r.categoria.toLowerCase().includes(termo)
    );
  }

  if (filtros.limit) {
    itens = itens.slice(0, filtros.limit);
  }

  return itens;
}

export async function getRevistasDestaque(): Promise<RevistaData[]> {
  return getRevistas({ destaque: true });
}

// Busca todas as revistas para o painel administrativo (inclui inativas)
export async function getRevistasAdmin(): Promise<RevistaData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("revistas")
      .select("*")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as RevistaData[];
    }
  } catch (err) {
    console.warn("[Portal Empire Admin] Erro ao carregar revistas do banco:", err);
  }

  return [...REVISTAS_DEMO];
}
