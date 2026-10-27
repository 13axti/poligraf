/**
 * data/moongroup-referans.csv -> Supabase məhsulları (qaralama kimi, saytda GİZLİ).
 * Qiymət pillələri götürülür, təsvir isə göstəricilərdən öz sözlərimizlə yenidən yazılır. Şəkil yoxdur: admin əlavə edir.
 *
 *   npx tsx --env-file=.env.local scripts/import-reference.ts <fayl.csv> [--dry]
 */
import { createClient } from "@supabase/supabase-js";
import WS from "next/dist/compiled/ws";
import { readFileSync } from "node:fs";
import { slugify } from "../src/lib/slug";

const dry = process.argv.includes("--dry");
const files = process.argv.slice(2).filter((a) => a.endsWith(".csv"));

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift()!.map((h) => h.replace(/^\uFEFF/, ""));
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

// moongroup kateqoriya yolu -> bizim kateqoriya slug-ı və təsvir üçün ad
const CAT: Record<string, { slug: string; label: string }> = {
  "/metbee/bloknot-deri-uzlu/": { slug: "bloknotlar-deri-uzlu", label: "Dəri üzlü bloknot" },
  "/metbee/bloknotlar-karton-uzlu/": { slug: "bloknotlar-karton-uzlu", label: "Karton üzlü bloknot" },
  "/metbee/vizit-kart/": { slug: "vizitkartlar", label: "Vizit kart" },
  "/promo/qelem-metal/": { slug: "qelemler-metal", label: "Metal qələm" },
  "/promo/qelem-plastik/": { slug: "qelemler-plastik", label: "Plastik qələm" },
  "/promo/qelem-qutusu/": { slug: "qelem-qutulari", label: "Qələm qutusu" },
  "/metbee/qeyd-kagizi/": { slug: "qeyd-kagizlari", label: "Qeyd kağızı" },
};
const specs = (s: string) =>
  s ? Object.fromEntries(s.split(" | ").filter((kv) => kv.includes(":")).map((kv) => [kv.split(":")[0].trim(), kv.slice(kv.indexOf(":") + 1).trim()])) : {};

/** Göstəricilərdən öz sözlərimizlə təsvir (müəllif mətni kopyalanmır) */
function describe(label: string, sp: Record<string, string>) {
  const parts = [`${label}.`];
  if (sp["Vərəq sayı"]) parts.push(`${sp["Vərəq sayı"]}${sp["İç vərəqin növü"] ? `, ${sp["İç vərəqin növü"].toLowerCase()} iç vərəq` : ""}.`);
  for (const [k, v] of Object.entries(sp)) {
    if (["Vərəq sayı", "İç vərəqin növü", "Çəki"].includes(k) || v.length > 160) continue;
    parts.push(`${k}: ${v}.`);
  }
  parts.push("Loqonuzu və ya dizaynınızı üzərində mockup-da yoxlaya bilərsiniz.");
  return parts.join(" ");
}

(async () => {
  const rows = files.flatMap((f) => parseCsv(readFileSync(f, "utf8")));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key, { auth: { persistSession: false }, realtime: { transport: WS as never } });
  const { data: cats } = await sb.from("categories").select("id, slug");
  const catId = new Map((cats ?? []).map((c) => [c.slug, c.id]));

  const out: Record<string, unknown>[] = [];
  const skipped: string[] = [];
  const noteVar: string[] = [];
  const parseTiers = (t: string) =>
    (t ?? "").split(";").map((x) => x.trim()).filter(Boolean).map((x) => {
      const m = /^(\d+)\s*ədəd:\s*([\d.,]+)/.exec(x);
      return m ? { minQty: Number(m[1]), unitPrice: Number(m[2].replace(",", ".")) } : null;
    }).filter(Boolean) as { minQty: number; unitPrice: number }[];

  rows.forEach((r, i) => {
    const tiers = parseTiers(r["Qiymət pillələri"]);
    if (!tiers.length) return skipped.push(r["Ad"]);
    // Əvvəl əl ilə xəritə, yoxsa moongroup kateqoriya adından bizim slug (adlar eynidir)
    const byName = r["Kateqoriya adı"] ? { slug: slugify(r["Kateqoriya adı"]), label: r["Kateqoriya adı"].replace(/lar$|lər$/i, "") } : undefined;
    const cat = CAT[r["Kateqoriya"]] ?? (byName && catId.has(byName.slug) ? byName : undefined);
    if (!cat) return skipped.push(`${r["Ad"]} (${r["Kateqoriya adı"] ?? r["Kateqoriya"]}: uyğun kateqoriya yoxdur)`);
    tiers.sort((a, b) => a.minQty - b.minQty);

    // İkitərəfli çap qiyməti: bütün pillələrdə eyni fərq varsa, variant kimi yazılır
    let variants: { id: string; name: string; priceModifier: number }[] = [];
    const two = parseTiers(r["Qiymət pillələri (ikitərəfli)"]).sort((a, b) => a.minQty - b.minQty);
    if (two.length) {
      const diffs = tiers.map((t) => { const o = two.find((x) => x.minQty === t.minQty); return o ? Math.round((o.unitPrice - t.unitPrice) * 1000) / 1000 : NaN; });
      if (diffs.every((d) => d === diffs[0] && d > 0)) {
        variants = [
          { id: "v-bir", name: "Birtərəfli çap", priceModifier: 0 },
          { id: "v-iki", name: "İkitərəfli çap", priceModifier: diffs[0] },
        ];
      } else noteVar.push(r["Ad"]);
    }
    out.push({
      slug: slugify(r["Ad"]),
      category_id: catId.get(cat.slug) ?? null,
      name: r["Ad"],
      description: describe(cat.label, specs(r["Göstəricilər"])),
      image: "",
      pricing_model: "per_unit",
      min_order_qty: Math.min(...tiers.map((t) => t.minQty)),
      price_tiers: tiers,
      variants,
      active: false, // şəkil əlavə olunana qədər saytda görünmür
      sort_order: 1000 + i,
    });
  });
  console.log(`${out.length} məhsul hazırdır, ${skipped.length} qiymətsiz keçildi (xüsusi sorğu ilə):\n  - ${skipped.join("\n  - ")}`);
  if (noteVar.length) console.log(`İkitərəfli fərq sabit olmadığı üçün variantsız yazıldı: ${noteVar.join(", ")}`);
  console.log("Nümunə:", JSON.stringify(out[0], null, 1).slice(0, 700));
  if (dry) return console.log("\n(--dry: bazaya yazılmadı)");
  const { error, count } = await sb.from("products").upsert(out, { onConflict: "slug", ignoreDuplicates: true, count: "exact" });
  if (error) throw error;
  console.log(`\nBazaya yazıldı: ${count ?? "?"} yeni məhsul (mövcud slug-lara toxunulmadı).`);
  process.exit(0);
})().catch((e) => { console.error(e.message ?? e); process.exit(1); });
