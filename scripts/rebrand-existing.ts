/** Artıq yüklənmiş moongroup şəkillərinə (image URL-də /moongroup/ olanlara) Lemur Group nişanını tətbiq edir. Bir dəfə işlədin. */
import { createClient } from "@supabase/supabase-js";
import WS from "next/dist/compiled/ws";
import { brandImage } from "./brand-image";

(async () => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: WS as never } });
  const { data } = await sb.from("products").select("id, slug, image").like("image", "%/products/moongroup/%").not("image", "like", "%?v=lg3%").limit(5000);
  let n = 0;
  for (const p of data ?? []) {
    const clean = p.image.split("?")[0];
    const path = clean.split("/products/")[1];
    const res = await fetch(clean);
    if (!res.ok) { console.log("✗", p.slug, res.status); continue; }
    const { data: out, type } = await brandImage(Buffer.from(await res.arrayBuffer()));
    const { error } = await sb.storage.from("products").upload(path, out, { contentType: type, cacheControl: "31536000", upsert: true });
    if (error) { console.log("✗", p.slug, error.message); continue; }
    await sb.from("products").update({ image: `${clean}?v=lg3` }).eq("id", p.id);
    n++; console.log("✓", p.slug);
  }
  console.log(`Hazırdır: ${n} şəkil.`);
  process.exit(0);
})();
