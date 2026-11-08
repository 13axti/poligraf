import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/data";
import { SITE_URL } from "@/lib/site-config";

/** Google üçün sayt xəritəsi: əsas səhifələr, kateqoriyalar və saytda görünən bütün məhsullar */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, products] = await Promise.all([getCategories(), getAllProducts()]);
  const withProducts = new Set(products.map((p) => p.categoryId));
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/reklam-isleri`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/kataloq`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/qiymetler`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/sifaris`, changeFrequency: "monthly", priority: 0.6 },
    ...cats.filter((c) => withProducts.has(c.id)).map((c) => ({ url: `${SITE_URL}/kataloq/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${SITE_URL}/mehsul/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.6, images: p.image ? [p.image] : undefined })),
  ];
}
