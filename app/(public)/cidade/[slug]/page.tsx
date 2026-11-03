import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCidades, getMaterias, getColunasAtivas, getPortalData } from "@/lib/portal/queries";
import { getClassificados } from "@/lib/portal/classificados-queries";
import { getClimaPorSlug } from "@/lib/portal/clima";
import { CardMateria } from "@/components/portal/CardMateria";
import { ColunistasCarrossel } from "@/components/portal/ColunistasCarrossel";
import { SidebarMaisLidas } from "@/components/portal/SidebarMaisLidas";
import { AdSlot } from "@/components/portal/AdSlot";
import { ClassificadosFaixaSection } from "@/components/portal/ClassificadosFaixaSection";
import { MapPin, Thermometer } from "lucide-react";

export const revalidate = 60;

interface CidadePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CidadePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [cidades, portal] = await Promise.all([
    getCidades(),
    getPortalData(),
  ]);

  const cidade = cidades.find((c) => c.slug === slug);
  if (!cidade) return { title: "Cidade Não Encontrada" };

  return {
    title: `Notícias de ${cidade.nome} - ${cidade.uf} | ${portal?.nome || "Portal Empire"}`,
    description: `Últimas notícias, política, colunistas, trânsito e cobertura completa em ${cidade.nome} e região.`,
  };
}

export default async function CidadeDetalhePage({ params }: CidadePageProps) {
  const { slug } = await params;
  const cidades = await getCidades();
  const cidade = cidades.find((c) => c.slug === slug);

  if (!cidade) {
    notFound();
  }

  const [materiasRaw, colunas, maisLidasRaw, clima, todosClassificados] = await Promise.all([
    getMaterias({ cidadeSlug: slug, limit: 12 }),
    getColunasAtivas(slug),
    getMaterias({ cidadeSlug: slug, ordenarPor: "visualizacoes", limit: 5 }),
    getClimaPorSlug(slug),
    getClassificados(),
  ]);

  // Garante identificação e badge local correto da cidade ({cidade.nome} - {cidade.uf})
  const materias = materiasRaw.map((m) => ({
    ...m,
    cidade: {
      id: cidade.id,
      nome: cidade.nome,
      slug: cidade.slug,
      uf: cidade.uf,
    },
  }));

  const maisLidas = maisLidasRaw.map((m) => ({
    ...m,
    cidade: {
      id: cidade.id,
      nome: cidade.nome,
      slug: cidade.slug,
      uf: cidade.uf,
    },
    // Se a matéria não tiver categoria específica além de genérica, destaca o nome da cidade
    categoria: {
      id: m.categoria?.id || "cat-cidade",
      nome: m.categoria?.slug === "cidades" || !m.categoria ? cidade.nome : m.categoria.nome,
      slug: m.categoria?.slug || "cidades",
      cor: m.categoria?.cor || "#c8102e",
    },
  }));

  // FILTRO ESTRITO DE ANÚNCIOS: Exibe APENAS classificados cadastrados para esta cidade
  const nomeCidadeLower = cidade.nome.toLowerCase().trim();
  const slugCidade = cidade.slug.toLowerCase().trim();
  const ufCidade = (cidade.uf || "").toUpperCase().trim();

  const classificadosCidade = todosClassificados.filter((c) => {
    const cNome = (c.cidade_nome || "").toLowerCase().trim();
    const cBairro = (c.bairro || "").toLowerCase().trim();
    const cUf = (c.uf || "").toUpperCase().trim();
    const cId = c.cidade_id;

    // Se tiver UF e for de OUTRO estado, descarta imediatamente (evita MG em SP ou vice-versa)
    if (cUf && ufCidade && cUf !== ufCidade) {
      return false;
    }

    // Match exato de cidade_id
    if (cId && cId === cidade.id) return true;

    // Regra específica de Alphaville (bairros e condomínios de Alphaville/Tamboré em Barueri/Santana de Parnaíba)
    if (slugCidade === "alphaville") {
      const texto = `${c.titulo} ${c.descricao} ${cNome} ${cBairro}`.toLowerCase();
      return (
        texto.includes("alphaville") ||
        texto.includes("tambore") ||
        texto.includes("tamboré")
      );
    }

    // Para qualquer outra cidade: exige que pertença ao mesmo município
    return (
      cNome === nomeCidadeLower ||
      cNome.includes(nomeCidadeLower) ||
      cBairro.includes(nomeCidadeLower)
    );
  }).slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Cabeçalho da Cidade */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Cobertura Local</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {cidade.nome} - {cidade.uf}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {clima && (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="text-amber-500 font-extrabold text-sm">{clima.temperatura}°C</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span>{clima.descricao}</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {clima.tempMin}° / {clima.tempMax}°
              </span>
            </div>
          )}

          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            {materias.length} notícias registradas
          </span>
        </div>
      </div>

      <AdSlot posicao="topo" />

      {/* Colunas da Cidade se houver */}
      {colunas.length > 0 && <ColunistasCarrossel colunas={colunas} />}

      {/* 1. Bloco Principal de Notícias da Cidade + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Notícias em {cidade.nome}
            </h2>
          </div>

          {materias.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">
                Ainda não há matérias específicas publicadas para {cidade.nome}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {materias.map((mat) => (
                <CardMateria key={mat.id} materia={mat} variacao="medio" />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SidebarMaisLidas materias={maisLidas} />
          <AdSlot posicao="lateral" />
        </div>
      </div>

      {/* 2. Bloco de Classificados da Cidade (Exibido após as notícias) */}
      <ClassificadosFaixaSection
        classificados={classificadosCidade}
        titulo={`Classificados & Oportunidades em ${cidade.nome} e Região`}
      />
    </div>
  );
}
