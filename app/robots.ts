import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://portalempire.com.br";

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
