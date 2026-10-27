/**
 * moongroup.az məhsul şəkillərini (icazə ilə) götürür: CSV-dəki Link səhifəsindən əsas şəkil (og:image),
 * Supabase "products" bucket-inə yüklənir və məhsulun image sahəsinə yazılır. Şəkli olan məhsullara toxunulmur,
 * ona görə dayandırıb yenidən işə salmaq olar. robots.txt Crawl-delay (10 san) gözlənilir.
 *
 *   npx tsx --env-file=.env.local scripts/import-images.ts data/moongroup-all/*.csv [--limit 5] [--activate] [--dry]
 *   --activate: şəkil yazılan məhsulu saytda görünən edir
 */
import { createClient } from "@supabase/supabase-js";
import WS from "next/dist/compiled/ws";
import { readFileSync } from "node:fs";
import { slugify } from "../src/lib/slug";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const activate = args.includes("--activate");
const li = args.indexOf("--limit");
const limit = li >= 0 ? Number(args[li + 1]) : Infinity;
const files = args.filter((a) => a.endsWith(".csv"));
const DELAY = 10_000;
const UA = { "User-Agent": "Mozilla/5.0 (product images; permission granted by owner)" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  const head = rows.shift()!.map((h) => h.replace(/^﻿/, ""));
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

(async () => {
  const items = files.flatMap((f) => parseCsv(readFileSync(f, "utf8"))).filter((r) => r["Link"] && r["Ad"]);
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
    realtime: { transport: WS as never },
  });
  const { data: existing } = await sb.from("products").select("id, slug, image").limit(10000);
  const todo = new Map((existing ?? []).filter((p) => !p.image).map((p) => [p.slug, p.id]));
  const queue = items.filter((r) => todo.has(slugify(r["Ad"])));
  console.log(`${items.length} CSV sətri, şəkilsiz uyğun məhsul: ${queue.length}`);

  let done = 0, failed = 0;
  for (const r of queue) {
    if (done >= limit) break;
    const slug = slugify(r["Ad"]);
    try {
      const page = await (await fetch(r["Link"], { headers: UA })).text();
      if (page.includes("sgcaptcha")) throw new Error("captcha çıxdı, dayanıram");
      const m = /property="og:image"\s+content="([^"]+)"/.exec(page) ?? /content="([^"]+)"\s+property="og:image"/.exec(page);
      if (!m) throw new Error("şəkil tapılmadı");
      const src = new URL(m[1], r["Link"]).href;
      if (dry) { console.log("•", slug, "<-", src); done++; await sleep(DELAY); continue; }
      const res = await fetch(src, { headers: UA });
      if (!res.ok) throw new Error(`şəkil ${res.status}`);
      const type = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0];
      const ext = type.split("/")[1].replace("jpeg", "jpg");
      const path = `moongroup/${slug}.${ext}`;
      const { error: ue } = await sb.storage.from("products").upload(path, await res.arrayBuffer(), { contentType: type, cacheControl: "31536000", upsert: true });
      if (ue) throw ue;
      const url = sb.storage.from("products").getPublicUrl(path).data.publicUrl;
      const { error } = await sb.from("products").update({ image: url, ...(activate ? { active: true } : {}) }).eq("id", todo.get(slug)!);
      if (error) throw error;
      done++;
      console.log("✓", slug);
    } catch (e) {
      failed++;
      const msg = (e as Error).message ?? String(e);
      console.log("✗", slug, msg);
      if (msg.includes("captcha")) break;
    }
    await sleep(DELAY);
  }
  console.log(`Hazırdır: ${done} şəkil, ${failed} xəta.`);
  process.exit(0);
})().catch((e) => { console.error(e.message ?? e); process.exit(1); });
