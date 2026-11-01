import "server-only";
import type { requireAdmin } from "./admin-auth";
import type { CostPrice } from "./costs";

type SB = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export interface CostProduct { id: string; code: string | null; category: string; name: string; unit: string; spec: string; minQty: number | null }

export async function loadCosts(supabase: SB) {
  const [p, c, s] = await Promise.all([
    supabase.from("cost_products").select("*").order("code", { nullsFirst: false }).order("name").limit(5000),
    supabase.from("cost_prices").select("*").order("created_at", { ascending: false }).limit(20000),
    supabase.from("suppliers").select("id, name, phone, note").order("name").limit(2000),
  ]);
  const error = p.error ?? c.error ?? s.error;
  const sup = new Map((s.data ?? []).map((x) => [x.id as string, x.name as string]));
  const products: CostProduct[] = (p.data ?? []).map((x) => ({
    id: x.id, code: x.code, category: x.category, name: x.name, unit: x.unit, spec: x.spec, minQty: x.min_qty,
  }));
  const prices: CostPrice[] = (c.data ?? []).map((x) => ({
    id: x.id, productId: x.product_id, supplierId: x.supplier_id, supplier: sup.get(x.supplier_id) ?? "?",
    minQty: x.min_qty, unitPrice: Number(x.unit_price), vatIncluded: x.vat_included, validUntil: x.valid_until,
    note: x.note, createdAt: x.created_at,
  }));
  return { error, products, prices, suppliers: (s.data ?? []) as { id: string; name: string; phone: string; note: string }[] };
}
