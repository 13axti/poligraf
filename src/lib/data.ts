import { cacheLife, cacheTag } from "next/cache";
import type { Category, Product } from "./types";
import * as mock from "./mock-data.source";
import { createPublicClient, supabaseConfigured } from "./supabase/public";
import { mapCategory, mapProduct } from "./db-map";

// Kataloq oxunuşları. Supabase env-ləri yoxdursa mock data göstərilir (lokal sınaq üçün).
// Admin dəyişiklik edəndə `updateTag("catalog")` cache-i dərhal yeniləyir.

/** Development-də baza hazır deyilsə (cədvəl yoxdur) mock-a keç; production-da xətanı göstər */
function fallback<T>(what: string, message: string, mockValue: () => T): T {
  if (process.env.NODE_ENV === "production") throw new Error(`${what}: ${message}`);
  console.warn(`[data] ${what}: ${message} — mock data göstərilir. supabase/schema.sql işlədilibmi?`);
  return mockValue();
}

/**
 * Development-də bazada hələ məhsul yoxdursa, sayt boş qalmasın deyə mock kataloq göstərilir.
 * Production-da bu işləmir: orada boş baza = boş kataloq.
 */
async function shouldUseMock(): Promise<boolean> {
  if (!supabaseConfigured) return true;
  if (process.env.NODE_ENV === "production") return false;
  const { count, error } = await createPublicClient()
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("active", true);
  if (error || !count) {
    console.warn("[data] bazada aktiv məhsul yoxdur, mock kataloq göstərilir (yalnız development). Seed: npx tsx --env-file=.env.local scripts/seed.ts");
    return true;
  }
  return false;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  if (await shouldUseMock()) return mock.getCategories();
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) return fallback("categories", error.message, mock.getCategories);
  return (data ?? []).map(mapCategory);
}

export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  if (await shouldUseMock()) return mock.getAllProducts();
  const { data, error } = await createPublicClient()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) return fallback("products", error.message, mock.getAllProducts);
  return (data ?? []).map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.featured);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.categoryId === categoryId);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.slug === slug);
}
