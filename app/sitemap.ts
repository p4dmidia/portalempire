import { MetadataRoute } from "next";
import { getCategorias, getCidades, getColunasAtivas, getMaterias } from "@/lib/portal/queries";
import { obterSiteUrl } from "@/lib/portal/texto-utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = obterSiteUrl();

  const [categorias, cidades, colunas, materias] = await Promise.all([
    getCategorias(),
    getCidades(),
    getColunasAtivas(),
    getMaterias({ limit: 100 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/cidades`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/colunas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/anuncie`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoriaRoutes: MetadataRoute.Sitemap = categorias.map((cat) => ({
    url: `${siteUrl}/categoria/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const cidadeRoutes: MetadataRoute.Sitemap = cidades.map((cid) => ({
    url: `${siteUrl}/cidade/${cid.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const colunaRoutes: MetadataRoute.Sitemap = colunas.map((col) => ({
    url: `${siteUrl}/coluna/${col.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const materiaRoutes: MetadataRoute.Sitemap = materias.map((mat) => ({
    url: `${siteUrl}/materia/${mat.slug}`,
    lastModified: mat.publicado_em ? new Date(mat.publicado_em) : new Date(mat.created_at),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [
    ...staticRoutes,
    ...categoriaRoutes,
    ...cidadeRoutes,
    ...colunaRoutes,
    ...materiaRoutes,
  ];
}
