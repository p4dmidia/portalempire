import { MetadataRoute } from "next";
import { obterSiteUrl } from "@/lib/portal/texto-utils";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = obterSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/painel/", "/api/", "/aguardando-aprovacao", "/bloqueado"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
