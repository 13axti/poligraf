"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { cheapestByTier, MIN_QTY, nextCode, TIERS, today, type CostOffer } from "@/lib/costs";
import { slugify } from "@/lib/slug";

type SB = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

const s = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);
/** "3,50" və "3.50" hər ikisi qəbul olunur; boş → NaN */
const num = (v: unknown) => {
  const t = String(v ?? "").replace(/\s/g, "").replace(",", ".");
  if (!t) return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};
const back = (path: string, msg?: string): never =>
  redirect(msg ? `${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(msg)}` : path);
const norm = (x: string) =>
  x.toLocaleLowerCase("az").replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/[^a-z0-9а-я]+/g, " ").trim();

async function freshCode(supabase: SB) {
  const { data } = await supabase.from("cost_products").select("code").not("code", "is", null).limit(20000);
  return nextCode((data ?? []).map((x) => x.code as string));
}

/* -------- Məhsul (kod avtomatik verilir və dəyişmir) -------- */

const productFields = (f: FormData) => ({
  name: s(f, "name", 160),
  category: s(f, "category", 80),
  unit: s(f, "unit", 20) || "ədəd",
  description: s(f, "description", 2000),
  material: s(f, "material", 200),
  size: s(f, "size", 200),
  color: s(f, "color", 200),
  spec: s(f, "spec", 500),
});

export async function saveCostProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const row = productFields(formData);
  if (!row.name) back(id ? `/admin/costs/${id}` : "/admin/costs", "Məhsulun adını yazın");
  if (id) {
    const { error } = await supabase.from("cost_products").update(row).eq("id", id);
    back(`/admin/costs/${id}`, error ? error.message : "Saxlanıldı");
  }
  const { data, error } = await supabase.from("cost_products").insert({ ...row, code: await freshCode(supabase), min_qty: MIN_QTY }).select("id").single();
  if (error || !data) back("/admin/costs", `Əlavə olunmadı: ${error?.message ?? ""}`);
  redirect(`/admin/costs/${data!.id}?msg=${encodeURIComponent("Məhsul yaradıldı. İndi təchizatçı qiymətlərini əlavə edin.")}`);
}

export async function deleteCostProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_products").delete().eq("id", s(formData, "id", 60));
  redirect("/admin/costs");
}

/* -------- Təklif: bir təchizatçının bir məhsul üçün 8 pilləli qiyməti -------- */

/** Təchizatçını adına görə tapır, yoxdursa yaradır */
async function supplierId(supabase: SB, name: string) {
  const { data: all } = await supabase.from("suppliers").select("id, name");
  const found = (all ?? []).find((x) => norm(x.name) === norm(name));
  if (found) return found.id as string;
  const { data, error } = await supabase.from("suppliers").insert({ name: name.slice(0, 120) }).select("id").single();
  if (error || !data) throw new Error("Təchizatçı yaradılmadı");
  return data.id as string;
}

export async function saveOffer(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = s(formData, "product_id", 60);
  const path = `/admin/costs/${productId}`;
  const supplier = s(formData, "supplier", 120);
  if (!supplier) back(path, "Təchizatçını seçin və ya yazın");
  const tiers: Record<string, number> = {};
  for (const t of TIERS) {
    const v = num(formData.get(`t_${t}`));
    if (Number.isFinite(v) && v >= 0) tiers[String(t)] = v;
  }
  if (!Object.keys(tiers).length) back(path, "Ən azı bir say üçün qiymət yazın");
  const lead = num(formData.get("lead_days"));
  let sid: string;
  try { sid = await supplierId(supabase, supplier); } catch { return back(path, "Təchizatçı yaradılmadı"); }
  const { error } = await supabase.from("cost_offers").upsert(
    {
      product_id: productId, supplier_id: sid, tiers,
      lead_days: Number.isFinite(lead) ? Math.max(0, Math.round(lead)) : null,
      vat_included: formData.get("vat_included") === "on",
      valid_until: s(formData, "valid_until", 10) || null,
      note: s(formData, "note", 300),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id,supplier_id" }
  );
  back(path, error ? `Saxlanmadı: ${error.message}` : "Təklif saxlanıldı");
}

export async function deleteOffer(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_offers").delete().eq("id", s(formData, "id", 60));
  back(`/admin/costs/${s(formData, "product_id", 60)}`, "Təklif silindi");
}

/* -------- Təchizatçı -------- */

export async function saveSupplier(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const name = s(formData, "name", 120);
  if (!name) back("/admin/costs/suppliers", "Şirkətin adını yazın");
  const lead = num(formData.get("lead_days"));
  const row = {
    name, phone: s(formData, "phone", 60), email: s(formData, "email", 120), contact_person: s(formData, "contact_person", 120),
    address: s(formData, "address", 200), voen: s(formData, "voen", 30), website: s(formData, "website", 200),
    payment_terms: s(formData, "payment_terms", 200), delivery: s(formData, "delivery", 200), note: s(formData, "note", 500),
    lead_days: Number.isFinite(lead) ? Math.max(0, Math.round(lead)) : null,
  };
  const { error } = id ? await supabase.from("suppliers").update(row).eq("id", id) : await supabase.from("suppliers").insert(row);
  back("/admin/costs/suppliers", error ? (error.code === "23505" ? "Bu adda təchizatçı var" : error.message) : "Saxlanıldı");
}

export async function deleteSupplier(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("suppliers").delete().eq("id", s(formData, "id", 60));
  back("/admin/costs/suppliers", "Silindi");
}

/* -------- Excel idxalı -------- */

export interface ImportPayload {
  supplier: string;
  vat: boolean;
  validUntil: string | null;
  source: string;
  category: string;
  rows: {
    productId: string | null;
    name: string; code: string; category: string; description: string; material: string; size: string; color: string; unit: string;
    supplier: string; vat: boolean | null; leadDays: number | null; validUntil: string | null; note: string;
    tiers: { minQty: number; price: number }[];
  }[];
}

const tierKey = (q: number) => { let t = TIERS[0] as number; for (const k of TIERS) if (q >= k) t = k; return String(t); };

export async function importCostPrices(payload: ImportPayload): Promise<{ error?: string; products?: number; offers?: number; suppliers?: number }> {
  const { supabase } = await requireAdmin();
  const rows = (payload.rows ?? []).slice(0, 3000).filter((r) => r.tiers?.length);
  if (!rows.length) return { error: "İdxal üçün sətir yoxdur" };
  if (rows.some((r) => !r.productId && !r.name.trim())) return { error: "Bəzi yeni məhsulların adı boşdur" };
  if (rows.some((r) => !(r.supplier || payload.supplier).trim())) return { error: "Təchizatçının adını yazın" };

  const { data: sups } = await supabase.from("suppliers").select("id, name");
  const supId = new Map((sups ?? []).map((x) => [norm(x.name), x.id as string]));
  let newSup = 0;
  for (const name of new Set(rows.map((r) => (r.supplier || payload.supplier).trim()))) {
    if (supId.has(norm(name))) continue;
    const { data, error } = await supabase.from("suppliers").insert({ name: name.slice(0, 120) }).select("id").single();
    if (error || !data) return { error: `Təchizatçı yaradılmadı: ${name}` };
    supId.set(norm(name), data.id);
    newSup++;
  }

  // Məhsul: seçilmiş id → bazadakı kod → eyni ad → yeni (yeni məhsula həmişə avtomatik kod verilir)
  const { data: prods } = await supabase.from("cost_products").select("id, code, name");
  const byCode = new Map((prods ?? []).filter((x) => x.code).map((x) => [norm(x.code), x.id as string]));
  const byName = new Map((prods ?? []).map((x) => [norm(x.name), x.id as string]));
  const codes = (prods ?? []).map((x) => x.code as string | null);
  let newProd = 0;
  const ids: string[] = [];
  for (const r of rows) {
    let id = r.productId ?? (r.code && byCode.get(norm(r.code))) ?? byName.get(norm(r.name));
    if (!id) {
      const code = nextCode(codes);
      const { data, error } = await supabase
        .from("cost_products")
        .insert({
          code, name: r.name.trim().slice(0, 160), category: (r.category || payload.category).trim().slice(0, 80),
          description: r.description.slice(0, 2000), material: r.material.slice(0, 200), size: r.size.slice(0, 200), color: r.color.slice(0, 200),
          unit: r.unit.trim().slice(0, 20) || "ədəd", min_qty: MIN_QTY,
        })
        .select("id")
        .single();
      if (error || !data) return { error: `Məhsul yaradılmadı: ${r.name} (${error?.message ?? ""})` };
      id = data.id as string;
      codes.push(code);
      byName.set(norm(r.name), id);
      newProd++;
    }
    ids.push(id);
  }

  // Təkliflər: eyni məhsul+təchizatçı varsa, yeni pillələr köhnələrin üstünə yazılır
  const keys = rows.map((r, i) => ({ product_id: ids[i], supplier_id: supId.get(norm((r.supplier || payload.supplier).trim()))! }));
  const { data: old } = await supabase.from("cost_offers").select("product_id, supplier_id, tiers").in("product_id", Array.from(new Set(ids)));
  const merged = new Map<string, Record<string, unknown>>();
  for (const o of old ?? []) merged.set(`${o.product_id}|${o.supplier_id}`, { tiers: o.tiers });
  rows.forEach((r, i) => {
    const k = `${keys[i].product_id}|${keys[i].supplier_id}`;
    const prev = (merged.get(k)?.tiers ?? {}) as Record<string, number>;
    const tiers = { ...prev };
    for (const t of r.tiers) if (Number.isFinite(t.price) && t.price >= 0) tiers[tierKey(t.minQty)] = t.price;
    merged.set(k, {
      ...keys[i], tiers,
      lead_days: r.leadDays,
      vat_included: r.vat ?? payload.vat,
      valid_until: r.validUntil || payload.validUntil || null,
      note: (r.note || `Excel: ${payload.source}`).slice(0, 300),
      updated_at: new Date().toISOString(),
    });
  });
  const upserts = Array.from(merged.values()).filter((x) => "supplier_id" in x);
  for (let i = 0; i < upserts.length; i += 500) {
    const { error } = await supabase.from("cost_offers").upsert(upserts.slice(i, i + 500), { onConflict: "product_id,supplier_id" });
    if (error) return { error: `Qiymətlər yazılmadı: ${error.message}` };
  }
  return { products: newProd, offers: upserts.length, suppliers: newSup };
}

/* -------- Sayta göndərmə: qiymət bazasındakı məhsuldan saytda məhsul yaradır/yeniləyir -------- */

const IMG = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function publishToSite(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const path = `/admin/costs/${id}`;
  const margin = num(formData.get("margin"));
  const categoryId = s(formData, "category_id", 60);
  const name = s(formData, "site_name", 160);
  if (!name) back(path, "Saytdakı adı yazın");
  if (!categoryId) back(path, "Saytda hansı kateqoriyada görünəcəyini seçin");
  if (!(margin >= 0)) back(path, "Marjanı yazın, məsələn 30");

  const [{ data: p }, { data: offs }] = await Promise.all([
    supabase.from("cost_products").select("*").eq("id", id).single(),
    supabase.from("cost_offers").select("*").eq("product_id", id),
  ]);
  if (!p) back("/admin/costs", "Məhsul tapılmadı");
  const offers: CostOffer[] = (offs ?? []).map((x) => ({
    id: x.id, productId: x.product_id, supplierId: x.supplier_id, supplier: "", tiers: x.tiers ?? {}, leadDays: x.lead_days,
    vatIncluded: x.vat_included, validUntil: x.valid_until, note: x.note, updatedAt: x.updated_at,
  }));
  // Saytdakı qiymət pillələri: hər pillədə ən ucuz maya × (1 + marja)
  const priceTiers = cheapestByTier(offers, today())
    .filter((t) => t.best)
    .map((t) => ({ minQty: t.tier, unitPrice: Math.round(t.best!.net * (1 + margin / 100) * 100) / 100 }));
  if (!priceTiers.length) back(path, "Əvvəl ən azı bir təchizatçı qiyməti əlavə edin");

  let image: string | undefined;
  const file = formData.get("image");
  if (file instanceof File && file.size) {
    if (!IMG.includes(file.type)) back(path, "Şəkil JPG, PNG və ya WebP olmalıdır");
    if (file.size > 6 * 1024 * 1024) back(path, "Şəkil 6 MB-dan böyükdür");
    const fp = `items/${randomUUID()}.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
    const { error } = await supabase.storage.from("products").upload(fp, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000" });
    if (error) back(path, `Şəkil yüklənmədi: ${error.message}`);
    image = supabase.storage.from("products").getPublicUrl(fp).data.publicUrl;
  }

  const desc = [s(formData, "site_description", 2000) || p!.description, p!.material && `Material: ${p!.material}.`, p!.size && `Ölçü: ${p!.size}.`, p!.color && `Rənglər: ${p!.color}.`]
    .filter(Boolean)
    .join(" ");
  const row = {
    name,
    category_id: categoryId,
    description: desc,
    pricing_model: "per_unit",
    min_order_qty: priceTiers[0].minQty,
    price_tiers: priceTiers,
    active: formData.get("active") === "on",
    ...(image ? { image } : {}),
  };

  let siteId: string | null = p!.site_product_id;
  if (siteId) {
    const { data: exists } = await supabase.from("products").select("id").eq("id", siteId).maybeSingle();
    if (!exists) siteId = null;
  }
  if (siteId) {
    const { error } = await supabase.from("products").update(row).eq("id", siteId);
    if (error) back(path, `Saytda yenilənmədi: ${error.message}`);
  } else {
    if (!image) back(path, "Saytda ilk dəfə göstərmək üçün şəkil yükləyin");
    const slug = `${slugify(name)}-${p!.code ?? ""}`.replace(/-+$/, "");
    const { data, error } = await supabase.from("products").insert({ ...row, slug, variants: [], mockups: [], featured: false, sort_order: 0 }).select("id").single();
    if (error || !data) back(path, `Saytda yaradılmadı: ${error?.message ?? ""}`);
    siteId = data!.id;
    await supabase.from("cost_products").update({ site_product_id: siteId }).eq("id", id);
  }
  updateTag("catalog");
  back(path, "Saytdakı məhsul yeniləndi");
}
