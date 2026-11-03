import "server-only";
import type { requireAdmin } from "./admin-auth";
import { DEFAULT_RATES, type CostOffer, type Rates } from "./costs";

type SB = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export interface CostCategory { id: string; name: string; parentId: string | null }
export interface CostField { id: string; label: string; type: "text" | "number" | "textarea" | "select"; options: string[]; required: boolean; sort: number }
export interface CostProduct {
  id: string; code: string | null; name: string;
  categoryId: string | null; subcategoryId: string | null; category: string; subcategory: string;
  material: string; width: number | null; length: number | null; thickness: number | null; sizeUnit: string;
  specs: string; description: string; unit: string; extra: Record<string, string>; siteProductId: string | null;
}
export interface Supplier {
  id: string; name: string; address: string; website: string; contactPerson: string; phone: string; whatsapp: string; email: string;
  note: string; voen: string; paymentTerms: string; delivery: string; leadDays: number | null;
}

const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

export async function loadRates(supabase: SB): Promise<Rates> {
  const { data } = await supabase.from("settings").select("value").eq("key", "cost_rates").maybeSingle();
  return { ...DEFAULT_RATES, ...((data?.value ?? {}) as Rates) };
}

export async function loadCosts(supabase: SB) {
  const [p, o, s, c, f, rates] = await Promise.all([
    supabase.from("cost_products").select("*").order("code", { nullsFirst: false }).order("name").limit(10000),
    supabase.from("cost_offers").select("*").order("updated_at", { ascending: false }).limit(50000),
    supabase.from("suppliers").select("*").order("name").limit(5000),
    supabase.from("cost_categories").select("id, name, parent_id").order("name").limit(5000),
    supabase.from("cost_fields").select("*").order("sort").order("created_at").limit(200),
    loadRates(supabase),
  ]);
  const error = p.error ?? o.error ?? s.error ?? c.error ?? f.error;
  const categories: CostCategory[] = (c.data ?? []).map((x) => ({ id: x.id, name: x.name, parentId: x.parent_id }));
  const catName = new Map(categories.map((x) => [x.id, x.name]));
  const suppliers: Supplier[] = (s.data ?? []).map((x) => ({
    id: x.id, name: x.name, address: x.address ?? "", website: x.website ?? "", contactPerson: x.contact_person ?? "", phone: x.phone ?? "",
    whatsapp: x.whatsapp ?? "", email: x.email ?? "", note: x.note ?? "", voen: x.voen ?? "", paymentTerms: x.payment_terms ?? "",
    delivery: x.delivery ?? "", leadDays: x.lead_days ?? null,
  }));
  const sup = new Map(suppliers.map((x) => [x.id, x]));
  const products: CostProduct[] = (p.data ?? []).map((x) => ({
    id: x.id, code: x.code, name: x.name, categoryId: x.category_id ?? null, subcategoryId: x.subcategory_id ?? null,
    category: (x.category_id && catName.get(x.category_id)) || x.category || "", subcategory: (x.subcategory_id && catName.get(x.subcategory_id)) || "",
    material: x.material ?? "", width: num(x.width), length: num(x.length), thickness: num(x.thickness), sizeUnit: x.size_unit ?? "mm",
    specs: x.specs || x.spec || "", description: x.description ?? "", unit: x.unit ?? "ədəd", extra: (x.extra ?? {}) as Record<string, string>,
    siteProductId: x.site_product_id ?? null,
  }));
  const offers: CostOffer[] = (o.data ?? []).map((x) => {
    const tiers = Object.fromEntries(Object.entries((x.tiers ?? {}) as Record<string, unknown>).map(([k, v]) => [k, Number(v)]).filter(([, v]) => Number.isFinite(v))) as Record<string, number>;
    const keys = Object.keys(tiers).map(Number).sort((a, b) => a - b);
    return {
      id: x.id, productId: x.product_id, supplierId: x.supplier_id, supplier: sup.get(x.supplier_id)?.name ?? "?",
      unitPrice: num(x.unit_price) ?? (keys.length ? tiers[String(keys[0])] : 0), currency: x.currency ?? "AZN", priceUnit: x.price_unit ?? "ədəd",
      minOrder: x.min_order ?? (keys[0] ?? null), tiers, vatIncluded: x.vat_included, deliveryFee: Number(x.delivery_fee ?? 0),
      leadDays: x.lead_days ?? sup.get(x.supplier_id)?.leadDays ?? null, priceDate: x.price_date ?? null, validUntil: x.valid_until, note: x.note ?? "",
      updatedAt: x.updated_at,
    };
  });
  const fields: CostField[] = (f.data ?? []).map((x) => ({ id: x.id, label: x.label, type: x.type, options: x.options ?? [], required: x.required, sort: x.sort }));
  return { error, products, offers, suppliers, categories, fields, rates };
}

export const sizeText = (p: Pick<CostProduct, "width" | "length" | "thickness" | "sizeUnit">) => {
  const parts = [p.width, p.length, p.thickness].filter((v) => v != null);
  return parts.length ? `${parts.join(" × ")} ${p.sizeUnit}` : "";
};

/** Təklif redaktoru üçün məhsul siyahısı: texniki xüsusiyyətlərə material və ölçü də qoşulur */
export function quoteProducts(products: CostProduct[]) {
  return products.map((p) => ({
    id: p.id, code: p.code, name: p.name, unit: p.unit || "ədəd",
    specs: [p.material, sizeText(p), p.specs].filter(Boolean).join(", "),
  }));
}
