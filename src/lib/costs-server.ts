import "server-only";
import type { requireAdmin } from "./admin-auth";
import type { CostOffer } from "./costs";

type SB = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export interface CostProduct {
  id: string; code: string | null; category: string; name: string; unit: string; spec: string; minQty: number | null;
  description: string; material: string; size: string; color: string; siteProductId: string | null;
}
export interface Supplier {
  id: string; name: string; phone: string; note: string; contactPerson: string; email: string; address: string;
  voen: string; website: string; paymentTerms: string; delivery: string; leadDays: number | null;
}

export async function loadCosts(supabase: SB) {
  const [p, o, s] = await Promise.all([
    supabase.from("cost_products").select("*").order("code", { nullsFirst: false }).order("name").limit(5000),
    supabase.from("cost_offers").select("*").order("updated_at", { ascending: false }).limit(20000),
    supabase.from("suppliers").select("*").order("name").limit(2000),
  ]);
  const error = p.error ?? o.error ?? s.error;
  const suppliers: Supplier[] = (s.data ?? []).map((x) => ({
    id: x.id, name: x.name, phone: x.phone ?? "", note: x.note ?? "", contactPerson: x.contact_person ?? "", email: x.email ?? "",
    address: x.address ?? "", voen: x.voen ?? "", website: x.website ?? "", paymentTerms: x.payment_terms ?? "", delivery: x.delivery ?? "",
    leadDays: x.lead_days ?? null,
  }));
  const sup = new Map(suppliers.map((x) => [x.id, x]));
  const products: CostProduct[] = (p.data ?? []).map((x) => ({
    id: x.id, code: x.code, category: x.category, name: x.name, unit: x.unit, spec: x.spec, minQty: x.min_qty,
    description: x.description ?? "", material: x.material ?? "", size: x.size ?? "", color: x.color ?? "", siteProductId: x.site_product_id ?? null,
  }));
  const offers: CostOffer[] = (o.data ?? []).map((x) => ({
    id: x.id, productId: x.product_id, supplierId: x.supplier_id, supplier: sup.get(x.supplier_id)?.name ?? "?",
    tiers: Object.fromEntries(Object.entries((x.tiers ?? {}) as Record<string, unknown>).map(([k, v]) => [k, Number(v)]).filter(([, v]) => Number.isFinite(v))),
    leadDays: x.lead_days ?? sup.get(x.supplier_id)?.leadDays ?? null, vatIncluded: x.vat_included, validUntil: x.valid_until, note: x.note ?? "", updatedAt: x.updated_at,
  }));
  return { error, products, offers, suppliers };
}
