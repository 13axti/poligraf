"use server";

import { randomUUID } from "node:crypto";
import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";
import { DESIGN_PRICE, SIZES } from "@/lib/designs-shared";

type Result = { ok: true } | { ok: false; error: string };

const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAX = 5 * 1024 * 1024;
const phoneOk = (p: string) => /^[+\d\s()-]{7,20}$/.test(p);
const uuidOk = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function submitDesign(formData: FormData): Promise<Result> {
  if (!supabaseConfigured) return { ok: false, error: "Kampaniya hələ aktiv deyil" };
  const title = String(formData.get("title") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const kind = formData.get("kind") === "shirt" ? "shirt" : "artwork";
  const file = formData.get("file");

  if (!title || title.length > 80) return { ok: false, error: "Dizaynın adını yazın" };
  if (!name || name.length > 100) return { ok: false, error: "Adınızı yazın" };
  if (!phoneOk(phone)) return { ok: false, error: "Telefon nömrəsi düzgün deyil" };
  if (formData.get("consent") !== "on") return { ok: false, error: "Nümayiş şərtini qəbul edin" };
  if (!(file instanceof File) || !file.size) return { ok: false, error: "Şəkil seçin" };
  const ext = TYPES[file.type];
  if (!ext) return { ok: false, error: "Yalnız PNG, JPG və ya WebP yükləyin" };
  if (file.size > MAX) return { ok: false, error: "Şəkil 5 MB-dan böyük olmasın" };

  const sb = createPublicClient();
  const id = randomUUID();
  const path = `${id}/image.${ext}`;
  const { error: upErr } = await sb.storage
    .from("designs")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (upErr) return { ok: false, error: "Şəkil yüklənmədi, yenidən cəhd edin" };

  const { error } = await sb
    .from("designs")
    .insert({ id, title, designer_name: name, designer_phone: phone, kind, image_path: path });
  if (error) return { ok: false, error: "Dizayn göndərilmədi, yenidən cəhd edin" };
  return { ok: true };
}

export async function recordDesignView(id: string) {
  if (!supabaseConfigured || !uuidOk(id)) return;
  await createPublicClient().rpc("design_view", { d: id });
}

export async function orderDesign(input: {
  designId: string;
  size: string;
  name: string;
  phone: string;
}): Promise<Result> {
  if (!supabaseConfigured || !uuidOk(input.designId)) return { ok: false, error: "Dizayn tapılmadı" };
  const name = input.name?.trim();
  if (!name || name.length > 100) return { ok: false, error: "Adınızı yazın" };
  if (!phoneOk(input.phone?.trim() ?? "")) return { ok: false, error: "Telefon nömrəsi düzgün deyil" };
  if (!(SIZES as readonly string[]).includes(input.size)) return { ok: false, error: "Ölçünü seçin" };

  const sb = createPublicClient();
  const { data: d } = await sb.from("designs").select("id, title").eq("id", input.designId).eq("approved", true).maybeSingle();
  if (!d) return { ok: false, error: "Dizayn tapılmadı" };

  const { error } = await sb.from("orders").insert({
    id: randomUUID(),
    product_slug: "kampaniya-tshirt",
    product_name: `Kampaniya T-shirt: ${d.title}`,
    variant_name: `Ölçü ${input.size}`,
    pricing_model: "per_unit",
    quantity: 1,
    computed_price: DESIGN_PRICE, // qiymət həmişə serverdə sabitdir
    customer_name: name,
    customer_phone: input.phone.trim(),
    design_id: d.id,
  });
  if (error) return { ok: false, error: "Sifariş göndərilmədi, yenidən cəhd edin" };
  await sb.rpc("design_sale", { d: d.id });
  return { ok: true };
}
