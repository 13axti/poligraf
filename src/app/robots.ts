import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

/** Axtarış sistemləri: ictimai səhifələr açıq, admin və müştəri təqdimat linkləri bağlı */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/t/", "/coming-soon"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
