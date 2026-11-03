"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { CURRENCIES, DEFAULT_RATES, nextCode, normName, siteTiers, today, type CostOffer, type Rates } from "@/lib/costs";
import { loadRates } from "@/lib/costs-server";
import { slugify } from "@/lib/slug";

type SB = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

const s = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);
/** "3,50" və "3.50" qəbul olunur; boş → null */
const num = (v: unknown): number | null => {
  const t = String(v ?? "").replace(/\s/g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const back = (path: string, msg?: string): never =>
  redirect(msg ? `${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(msg)}` : path);

async function freshCode(supabase: SB) {
  const { data } = await supabase.from("cost_products").select("code").not("code", "is", null).limit(50000);
  return nextCode((data ?? []).map((x) => x.code as string));
}

/** Kateqoriyanı adına görə tapır, yoxdursa yaradır (alt kateqoriya üçün parentId verilir) */
async function ensureCategory(supabase: SB, name: string, parentId: string | null): Promise<string | null> {
  const n = name.trim().slice(0, 80);
  if (!n) return null;
  let q = supabase.from("cost_categories").select("id, name");
  q = parentId ? q.eq("parent_id", parentId) : q.is("parent_id", null);
  const { data } = await q;
  const found = (data ?? []).find((c) => c.name.toLocaleLowerCase("az") === n.toLocaleLowerCase("az"));
  if (found) return found.id as string;
  const { data: created, error } = await supabase.from("cost_categories").insert({ name: n, parent_id: parentId }).select("id").single();
  if (error || !created) throw new Error(`Kateqoriya yaradılmadı: ${n}`);
  return created.id as string;
}

async function customValues(supabase: SB, f: FormData) {
  const { data: fields } = await supabase.from("cost_fields").select("id, label, required");
  const extra: Record<string, string> = {};
  const missing: string[] = [];
  for (const x of fields ?? []) {
    const v = s(f, `extra_${x.id}`, 1000);
    if (v) extra[x.id] = v;
    else if (x.required) missing.push(x.label);
  }
  return { extra, missing };
}

/* ======================== MƏHSUL ======================== */

async function productRow(supabase: SB, f: FormData) {
  const categoryId = await ensureCategory(supabase, s(f, "category", 80), null);
  const subcategoryId = categoryId ? await ensureCategory(supabase, s(f, "subcategory", 80), categoryId) : null;
  return {
    name: s(f, "name", 160),
    category_id: categoryId,
    subcategory_id: subcategoryId,
    category: s(f, "category", 80),
    material: s(f, "material", 200),
    width: num(f.get("width")),
    length: num(f.get("length")),
    thickness: num(f.get("thickness")),
    size_unit: s(f, "size_unit", 5) || "mm",
    specs: s(f, "specs", 2000),
    description: s(f, "description", 2000),
  };
}

function offerRow(f: FormData) {
  let tiers: Record<string, number> = {};
  try {
    const raw = JSON.parse(String(f.get("tiers") ?? "[]")) as { qty: unknown; price: unknown }[];
    for (const t of raw) {
      const q = num(t.qty), p = num(t.price);
      if (q && q > 0 && p != null && p >= 0) tiers[String(Math.round(q))] = p;
    }
  } catch { tiers = {}; }
  const cur = s(f, "currency", 5).toUpperCase();
  return {
    unit_price: num(f.get("unit_price")),
    currency: (CURRENCIES as readonly string[]).includes(cur) ? cur : "AZN",
    price_unit: s(f, "price_unit", 20) || "ədəd",
    min_order: num(f.get("min_order")) != null ? Math.max(1, Math.round(num(f.get("min_order"))!)) : null,
    tiers,
    vat_included: f.get("vat_included") === "on",
    delivery_fee: Math.max(0, num(f.get("delivery_fee")) ?? 0),
    lead_days: num(f.get("lead_days")) != null ? Math.max(0, Math.round(num(f.get("lead_days"))!)) : null,
    price_date: s(f, "price_date", 10) || today(),
    note: s(f, "note", 500),
    updated_at: new Date().toISOString(),
  };
}

/** Manual əlavə: məhsul + ilk təchizatçı qiyməti. Eyni ad və kateqoriyada məhsul varsa, təkrar yaradılmır, qiymət ona əlavə olunur. */
export async function createCostProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/costs/new";
  if (!s(formData, "name")) back(path, "Məhsulun adını yazın");
  if (!s(formData, "category")) back(path, "Kateqoriyanı seçin və ya yazın");
  const supplierId = s(formData, "supplier_id", 60);
  if (!supplierId) back(path, "Təchizatçını seçin");
  const offer = offerRow(formData);
  if (offer.unit_price == null || offer.unit_price < 0) back(path, "Alış qiymətini yazın");
  const { extra, missing } = await customValues(supabase, formData);
  if (missing.length) back(path, `Doldurun: ${missing.join(", ")}`);

  let row: Awaited<ReturnType<typeof productRow>>;
  try { row = await productRow(supabase, formData); } catch (e) { return back(path, (e as Error).message); }

  const { data: same } = await supabase.from("cost_products").select("id, name, category_id");
  const dup = (same ?? []).find((x) => normName(x.name) === normName(row.name) && (x.category_id ?? null) === row.category_id);
  let id = dup?.id as string | undefined;
  if (!id) {
    const { data, error } = await supabase.from("cost_products").insert({ ...row, extra, code: await freshCode(supabase) }).select("id").single();
    if (error || !data) back(path, `Əlavə olunmadı: ${error?.message ?? ""}`);
    id = data!.id as string;
  }
  const { error } = await supabase.from("cost_offers").upsert({ ...offer, product_id: id, supplier_id: supplierId }, { onConflict: "product_id,supplier_id" });
  if (error) back(`/admin/costs/${id}`, `Qiymət yazılmadı: ${error.message}`);
  back(`/admin/costs/${id}`, dup ? "Bu məhsul artıq bazada var idi: yeni məhsul yaradılmadı, qiymət ona əlavə olundu" : "Məhsul əlavə olundu");
}

export async function updateCostProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const path = `/admin/costs/${id}`;
  if (!s(formData, "name")) back(path, "Məhsulun adını yazın");
  if (!s(formData, "category")) back(path, "Kateqoriyanı seçin və ya yazın");
  const { extra, missing } = await customValues(supabase, formData);
  if (missing.length) back(path, `Doldurun: ${missing.join(", ")}`);
  let row: Awaited<ReturnType<typeof productRow>>;
  try { row = await productRow(supabase, formData); } catch (e) { return back(path, (e as Error).message); }
  const { error } = await supabase.from("cost_products").update({ ...row, extra }).eq("id", id);
  back(path, error ? error.message : "Saxlanıldı");
}

export async function deleteCostProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_products").delete().eq("id", s(formData, "id", 60));
  back("/admin/costs", "Məhsul silindi");
}

/* ======================== TƏCHİZATÇI QİYMƏTİ ======================== */

export async function saveOffer(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = s(formData, "product_id", 60);
  const path = `/admin/costs/${productId}`;
  const supplierId = s(formData, "supplier_id", 60);
  if (!supplierId) back(path, "Təchizatçını seçin");
  const offer = offerRow(formData);
  if (offer.unit_price == null || offer.unit_price < 0) back(path, "Alış qiymətini yazın");
  const { error } = await supabase.from("cost_offers").upsert({ ...offer, product_id: productId, supplier_id: supplierId }, { onConflict: "product_id,supplier_id" });
  back(path, error ? `Saxlanmadı: ${error.message}` : "Qiymət saxlanıldı");
}

export async function deleteOffer(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_offers").delete().eq("id", s(formData, "id", 60));
  back(s(formData, "back", 200) || `/admin/costs/${s(formData, "product_id", 60)}`, "Qiymət silindi");
}

/* ======================== TƏCHİZATÇI ======================== */

export async function saveSupplier(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const path = s(formData, "back", 200) || (id ? `/admin/suppliers/${id}` : "/admin/suppliers");
  const name = s(formData, "name", 120);
  const phone = s(formData, "phone", 60);
  if (!name) back(path, "Şirkətin adını yazın");
  if (!phone) back(path, "Telefon nömrəsini yazın");
  const row = {
    name, phone, whatsapp: s(formData, "whatsapp", 60), email: s(formData, "email", 120), contact_person: s(formData, "contact_person", 120),
    address: s(formData, "address", 200), website: s(formData, "website", 200), note: s(formData, "note", 500),
  };
  if (id) {
    const { error } = await supabase.from("suppliers").update(row).eq("id", id);
    back(path, error ? (error.code === "23505" ? "Bu adda təchizatçı var" : error.message) : "Saxlanıldı");
  }
  const { data, error } = await supabase.from("suppliers").insert(row).select("id").single();
  if (error || !data) back(path, error?.code === "23505" ? "Bu adda təchizatçı artıq var" : `Əlavə olunmadı: ${error?.message ?? ""}`);
  back(s(formData, "back", 200) || `/admin/suppliers/${data!.id}`, "Təchizatçı əlavə olundu");
}

export async function deleteSupplier(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("suppliers").delete().eq("id", s(formData, "id", 60));
  back("/admin/suppliers", "Təchizatçı silindi");
}

/* ======================== FORMA XANALARI, KATEQORİYALAR, MƏZƏNNƏ ======================== */

const FIELD_TYPES = ["text", "number", "textarea", "select"];

export async function saveField(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const label = s(formData, "label", 80);
  if (!label) back("/admin/costs/settings", "Xananın adını yazın");
  const type = FIELD_TYPES.includes(s(formData, "type", 10)) ? s(formData, "type", 10) : "text";
  const row = {
    label, type, required: formData.get("required") === "on", sort: Math.round(num(formData.get("sort")) ?? 0),
    options: s(formData, "options", 1000).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 50),
  };
  const { error } = id ? await supabase.from("cost_fields").update(row).eq("id", id) : await supabase.from("cost_fields").insert(row);
  back("/admin/costs/settings", error ? error.message : "Xana saxlanıldı");
}

export async function deleteField(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_fields").delete().eq("id", s(formData, "id", 60));
  back("/admin/costs/settings", "Xana silindi");
}

export async function saveCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const name = s(formData, "name", 80);
  const parentId = s(formData, "parent_id", 60) || null;
  if (!name) back("/admin/costs/settings", "Adı yazın");
  const { error } = id
    ? await supabase.from("cost_categories").update({ name }).eq("id", id)
    : await supabase.from("cost_categories").insert({ name, parent_id: parentId });
  back("/admin/costs/settings", error ? (error.code === "23505" ? "Bu adda kateqoriya var" : error.message) : "Kateqoriya saxlanıldı");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_categories").delete().eq("id", s(formData, "id", 60));
  back("/admin/costs/settings", "Kateqoriya silindi (məhsullar silinmir)");
}

export async function saveRates(formData: FormData) {
  const { supabase } = await requireAdmin();
  const value: Rates = { AZN: 1 };
  for (const c of CURRENCIES) if (c !== "AZN") { const v = num(formData.get(`rate_${c}`)); value[c] = v && v > 0 ? v : DEFAULT_RATES[c]; }
  const { error } = await supabase.from("settings").upsert({ key: "cost_rates", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  back("/admin/costs/settings", error ? error.message : "Məzənnələr saxlanıldı");
}

/* ======================== EXCEL İDXALI ======================== */

export interface ImportRow {
  productId: string | null;
  code: string; name: string; category: string; subcategory: string; supplier: string;
  material: string; width: number | null; length: number | null; thickness: number | null; sizeUnit: string; specs: string;
  unitPrice: number | null; currency: string; priceUnit: string; minOrder: number | null; tiers: Record<string, number>;
  vat: boolean; deliveryFee: number; leadDays: number | null; priceDate: string | null; note: string;
  extra: Record<string, string>;
}

/** Hər sətir: məhsul (kod → ad+kateqoriya → yeni) + təchizatçı qiyməti (məhsul+təchizatçı üzrə yenilənir). Təkrar məhsul yaranmır. */
export async function importCostRows(rows: ImportRow[], source: string): Promise<{ error?: string; products?: number; offers?: number; suppliers?: number; categories?: number }> {
  const { supabase } = await requireAdmin();
  const list = (rows ?? []).slice(0, 5000);
  if (!list.length) return { error: "İdxal üçün sətir yoxdur" };
  const bad = list.findIndex((r) => (!r.productId && !r.name.trim()) || !r.supplier.trim() || r.unitPrice == null);
  if (bad >= 0) return { error: `${bad + 1}-ci sətirdə ad, təchizatçı və ya alış qiyməti boşdur` };

  const [{ data: sups }, { data: prods }, { data: cats }] = await Promise.all([
    supabase.from("suppliers").select("id, name"),
    supabase.from("cost_products").select("id, code, name, category_id"),
    supabase.from("cost_categories").select("id, name, parent_id"),
  ]);
  const supId = new Map((sups ?? []).map((x) => [normName(x.name), x.id as string]));
  const catKey = (name: string, parent: string | null) => `${parent ?? "-"}|${normName(name)}`;
  const catId = new Map((cats ?? []).map((c) => [catKey(c.name, c.parent_id), c.id as string]));
  let newSup = 0, newCat = 0, newProd = 0;

  const cat = async (name: string, parent: string | null) => {
    if (!name.trim()) return null;
    const k = catKey(name, parent);
    if (catId.has(k)) return catId.get(k)!;
    const { data, error } = await supabase.from("cost_categories").insert({ name: name.trim().slice(0, 80), parent_id: parent }).select("id").single();
    if (error || !data) throw new Error(`Kateqoriya yaradılmadı: ${name}`);
    catId.set(k, data.id); newCat++;
    return data.id as string;
  };

  const byCode = new Map((prods ?? []).filter((x) => x.code).map((x) => [normName(x.code), x.id as string]));
  const byNameCat = new Map((prods ?? []).map((x) => [`${normName(x.name)}|${x.category_id ?? "-"}`, x.id as string]));
  const codes = (prods ?? []).map((x) => x.code as string | null);
  const offers = new Map<string, Record<string, unknown>>();

  try {
    for (const r of list) {
      const sn = normName(r.supplier);
      if (!supId.has(sn)) {
        const { data, error } = await supabase.from("suppliers").insert({ name: r.supplier.trim().slice(0, 120), phone: "" }).select("id").single();
        if (error || !data) return { error: `Təchizatçı yaradılmadı: ${r.supplier}` };
        supId.set(sn, data.id); newSup++;
      }
      const categoryId = await cat(r.category, null);
      const subcategoryId = categoryId ? await cat(r.subcategory, categoryId) : null;
      let id = r.productId ?? (r.code ? byCode.get(normName(r.code)) : undefined) ?? byNameCat.get(`${normName(r.name)}|${categoryId ?? "-"}`);
      if (!id) {
        const code = nextCode(codes);
        const { data, error } = await supabase.from("cost_products").insert({
          code, name: r.name.trim().slice(0, 160), category_id: categoryId, subcategory_id: subcategoryId, category: r.category.trim().slice(0, 80),
          material: r.material.slice(0, 200), width: r.width, length: r.length, thickness: r.thickness, size_unit: r.sizeUnit || "mm",
          specs: r.specs.slice(0, 2000), extra: r.extra ?? {},
        }).select("id").single();
        if (error || !data) return { error: `Məhsul yaradılmadı: ${r.name} (${error?.message ?? ""})` };
        id = data.id as string; codes.push(code); newProd++;
        byNameCat.set(`${normName(r.name)}|${categoryId ?? "-"}`, id);
      }
      offers.set(`${id}|${supId.get(sn)}`, {
        product_id: id, supplier_id: supId.get(sn), unit_price: r.unitPrice, currency: (CURRENCIES as readonly string[]).includes(r.currency) ? r.currency : "AZN",
        price_unit: r.priceUnit || "ədəd", min_order: r.minOrder, tiers: r.tiers ?? {}, vat_included: r.vat, delivery_fee: r.deliveryFee || 0,
        lead_days: r.leadDays, price_date: r.priceDate || today(), note: (r.note || `Excel: ${source}`).slice(0, 500), updated_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    return { error: (e as Error).message };
  }
  const all = Array.from(offers.values());
  for (let i = 0; i < all.length; i += 500) {
    const { error } = await supabase.from("cost_offers").upsert(all.slice(i, i + 500), { onConflict: "product_id,supplier_id" });
    if (error) return { error: `Qiymətlər yazılmadı: ${error.message}` };
  }
  return { products: newProd, offers: all.length, suppliers: newSup, categories: newCat };
}

/* ======================== SAYTDA GÖSTƏR ======================== */

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
  if (margin == null || margin < 0) back(path, "Marjanı yazın, məsələn 30");

  const [{ data: p }, { data: offs }, rates] = await Promise.all([
    supabase.from("cost_products").select("*").eq("id", id).single(),
    supabase.from("cost_offers").select("*").eq("product_id", id),
    loadRates(supabase),
  ]);
  if (!p) back("/admin/costs", "Məhsul tapılmadı");
  const offers: CostOffer[] = (offs ?? []).map((x) => ({
    id: x.id, productId: x.product_id, supplierId: x.supplier_id, supplier: "", unitPrice: Number(x.unit_price ?? 0), currency: x.currency ?? "AZN",
    priceUnit: x.price_unit ?? "ədəd", minOrder: x.min_order, tiers: x.tiers ?? {}, vatIncluded: x.vat_included, deliveryFee: Number(x.delivery_fee ?? 0),
    leadDays: x.lead_days, priceDate: x.price_date, validUntil: x.valid_until, note: x.note ?? "", updatedAt: x.updated_at,
  }));
  const priceTiers = siteTiers(offers, margin!, rates, today());
  if (!priceTiers.length) back(path, "Əvvəl ən azı bir etibarlı təchizatçı qiyməti əlavə edin");

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

  const size = [p!.width, p!.length, p!.thickness].filter((v: unknown) => v != null).join(" × ");
  const desc = [s(formData, "site_description", 3000) || p!.description, p!.material && `Material: ${p!.material}.`, size && `Ölçü: ${size} ${p!.size_unit}.`, p!.specs]
    .filter(Boolean)
    .join(" ");
  const row = {
    name, category_id: categoryId, description: desc, pricing_model: "per_unit", min_order_qty: priceTiers[0].minQty, price_tiers: priceTiers,
    active: formData.get("active") === "on", ...(image ? { image } : {}),
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
    const slug = `${slugify(name)}-${p!.code ?? randomUUID().slice(0, 4)}`;
    const { data, error } = await supabase.from("products").insert({ ...row, slug, variants: [], mockups: [], featured: false, sort_order: 0 }).select("id").single();
    if (error || !data) back(path, `Saytda yaradılmadı: ${error?.message ?? ""}`);
    siteId = data!.id;
    await supabase.from("cost_products").update({ site_product_id: siteId }).eq("id", id);
  }
  updateTag("catalog");
  back(path, row.active ? "Məhsul saytda yayımlandı" : "Saytdakı məhsul yeniləndi (gizli)");
}
