import { NextResponse } from "next/server";
import { getMaterias, getPortalData } from "@/lib/portal/queries";
import { obterSiteUrl, decodificarEntidadesHtml } from "@/lib/portal/texto-utils";

export async function GET() {
  const [portal, materias] = await Promise.all([
    getPortalData(),
    getMaterias({ limit: 50 }),
  ]);
  const siteUrl = obterSiteUrl(portal?.dominio);

  const tituloPortal = portal?.nome || "Empire Cidades";
  const descricaoPortal = portal?.descricao_seo || "Notícias em tempo real da região e cidades.";

  const itemsXml = materias
    .map((mat) => {
      const link = `${siteUrl}/materia/${mat.slug}`;
      const pubDate = mat.publicado_em
        ? new Date(mat.publicado_em).toUTCString()
        : new Date(mat.created_at).toUTCString();

      const imagemXml = mat.imagem_url
        ? `<enclosure url="${mat.imagem_url}" type="image/jpeg" />`
        : "";

      return `
    <item>
      <title><![CDATA[${decodificarEntidadesHtml(mat.titulo)}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${decodificarEntidadesHtml(mat.subtitulo || mat.resumo || "")}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${mat.categoria ? `<category><![CDATA[${mat.categoria.nome}]]></category>` : ""}
      ${imagemXml}
    </item>`;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${tituloPortal}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${descricaoPortal}]]></description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
