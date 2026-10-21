/**
 * Kateqoriya siyahısını Supabase-ə əlavə edir (admin paneldən əlavə olunmuş kimi). Təkrar işlətmək təhlükəsizdir:
 * slug-a görə yeniləyir, dublikat yaratmır.
 *
 *   npx tsx --env-file=.env.local scripts/add-categories.ts
 */
import { createClient } from "@supabase/supabase-js";
import WS from "next/dist/compiled/ws";
import { slugify } from "../src/lib/slug";

const NAMES = [
  // Mətbəə
  "Vizitkartlar", "Flayerlər", "Bukletlər", "Zərflər", "Açıqcalar", "Firma blankı və sertifikatlar", "Qovluqlar", "Çantalar",
  "Qeyd kağızları", "Bloknotlar Dəri üzlü", "Bloknotlar Karton üzlü", "Avtoqoxular", "Dəvətnamələr", "Posterlər", "Etiketlər",
  "Təqvimlər", "Kataloqlar", "Qaimələr və göndərişlər", "Qutular", "Şelftokerlər", "Voblerlər", "Digər mətbəə",
  // Promo
  "Qələmlər metal", "Qələmlər plastik", "Qələm qutuları", "Hədiyyə dəstləri", "Yaddaş kartları", "Powerbanklar",
  "Termoslar və fincanlar", "Kart qabları", "Köynəklər", "Kepkalar", "Tekstil məhsulları", "Açarlıqlar", "Maqnitlər",
  "Bayraqlar", "Plaketlər", "Yaxa kartı və lentlər", "Rozetlər", "Saatlar", "Plastik kartlar", "Maus və fincan altlıqları",
  "Digər promo",
  // Reklam
  "Reklam lövhələri", "Bannerlər", "Məlumat lövhələri", "Vinillər", "Roll up'lar",
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY .env.local-da olmalıdır");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false }, realtime: { transport: WS as never } });

(async () => {
  const rows = NAMES.map((name, i) => ({ slug: slugify(name), name, sort_order: 100 + i }));
  const slugs = new Set(rows.map((r) => r.slug));
  if (slugs.size !== rows.length) throw new Error("Təkrarlanan slug var");
  const { error } = await sb.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  const { count } = await sb.from("categories").select("*", { count: "exact", head: true });
  console.log(`${rows.length} kateqoriya əlavə/yeniləndi. Cəmi: ${count}`);
  process.exit(0);
})().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
