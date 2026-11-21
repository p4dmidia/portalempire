import { MetadataRoute } from "next";
import { obterSiteUrl } from "@/lib/portal/texto-utils";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = obterSiteUrl();

  return {
    rules: [
      // Bloquear robôs de treinamento de IA e scrapers agressivos
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "ClaudeBot",
          "Bytespider",
          "PerplexityBot",
          "Amazonbot",
        ],
        disallow: ["/"],
      },
      // Permitir buscadores e crawlers sociais (Googlebot, Bingbot, facebookexternalhit, WhatsApp, Twitterbot, LinkedInBot)
      // Bloquear apenas rotas internas e painel administrativo
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/painel/",
          "/api/",
          "/aguardando-aprovacao",
          "/bloqueado",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
