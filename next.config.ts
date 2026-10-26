import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  eslint: {
    // Evita que avisos de linting bloqueiem deploys em produção na Vercel
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24h de cache para imagens otimizadas
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
