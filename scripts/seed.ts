/**
 * Mövcud mock məhsulları və public/ qovluğundakı şəkilləri Supabase-ə köçürür.
 *
 * İstifadə (bir dəfə, schema.sql işlədildikdən sonra):
 *   npx tsx --env-file=.env.local scripts/seed.ts
 *
 * .env.local-da lazımdır: NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY
 * (service role açarı yalnız bu skriptdə istifadə olunur — heç vaxt saytın koduna və git-ə qoymayın).
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { categories, products } from "../src/lib/mock-data.source";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY .env.local-da olmalıdır");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const cache = new Map<string, string>();
async function upload(localPath: string): Promise<string> {
  if (!localPath.startsWith("/")) return localPath; // artıq xarici URL
  if (cache.has(localPath)) return cache.get(localPath)!;
  const buf = await readFile(path.join(process.cwd(), "public", localPath));
  const ext = path.extname(localPath).slice(1).toLowerCase();
  const dest = `seed${localPath}`;
  const { error } = await sb.storage.from("products").upload(dest, buf, {
    contentType: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(`${localPath}: ${error.message}`);
  const publicUrl = sb.storage.from("products").getPublicUrl(dest).data.publicUrl;
  cache.set(localPath, publicUrl);
  console.log("yükləndi", localPath);
  return publicUrl;
}

async function main() {
  const catIds = new Map<string, string>(); // mock id -> DB uuid
  for (const c of categories) {
    const { data, error } = await sb
      .from("categories")
      .upsert(
        {
          slug: c.slug,
          name: c.name,
          description: c.description ?? null,
          image: c.image ? await upload(c.image) : null,
          sort_order: c.sortOrder,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (error) throw error;
    catIds.set(c.id, data.id);
  }

  let order = 0;
  for (const p of products) {
    const mockups = [];
    for (const m of p.mockups ?? []) mockups.push({ ...m, image: await upload(m.image) });
    const { error } = await sb.from("products").upsert(
      {
        slug: p.slug,
        category_id: catIds.get(p.categoryId) ?? null,
        name: p.name,
        description: p.description ?? null,
        image: await upload(p.image),
        pricing_model: p.pricingModel,
        min_order_qty: p.minOrderQty ?? null,
        price_tiers: p.priceTiers ?? [],
        price_per_sqm: p.pricePerSqm ?? null,
        min_width_cm: p.minWidthCm ?? null,
        min_height_cm: p.minHeightCm ?? null,
        variants: p.variants ?? [],
        mockups,
        print_area: p.printAreaPercent ?? null,
        featured: p.featured ?? false,
        views: p.views ?? 0,
        sort_order: order++,
      },
      { onConflict: "slug" }
    );
    if (error) throw error;
    console.log("məhsul:", p.name);
  }
  console.log("Hazırdır ✓");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
