import { NextResponse } from "next/server";
import { getClimaCidadesAleatorias, getClimaPorSlug, DadosClima } from "@/lib/portal/clima";

export const revalidate = 1800; // 30 minutos

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const cidadesParam = searchParams.get("cidades");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Caso solicite uma única cidade específica
    if (slug) {
      const clima = await getClimaPorSlug(slug);
      if (!clima) {
        return NextResponse.json(
          { error: "Cidade não encontrada ou dados indisponíveis" },
          { status: 404 }
        );
      }
      return NextResponse.json({ clima }, {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      });
    }

    // Caso solicite uma lista específica de slugs
    if (cidadesParam) {
      const slugs = cidadesParam.split(",").map((s) => s.trim().toLowerCase());
      const promessas = slugs.map((s) => getClimaPorSlug(s));
      const resultados = (await Promise.all(promessas)).filter(
        (c): c is DadosClima => c !== null
      );
      return NextResponse.json({ climas: resultados }, {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      });
    }

    // Caso padrão: retorna cidades aleatórias com dados de clima
    const climas = await getClimaCidadesAleatorias(limit);

    return NextResponse.json({ climas }, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("[API Clima] Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "Erro interno ao consultar previsão do tempo" },
      { status: 500 }
    );
  }
}
