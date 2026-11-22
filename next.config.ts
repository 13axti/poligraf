import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel Hobby planında şəkil optimallaşdırma limiti bitir (402), ona görə şəkillər birbaşa verilir.
    // Saytdakı şəkillər onsuz da əvvəlcədən sıxılıb (webp); yeni yüklənənləri də kiçik saxlayın.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
