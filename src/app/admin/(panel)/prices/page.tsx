import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { PriceRow, type PriceRowProduct } from "@/components/admin/PriceRow";

export default async function PricesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: products }, { data: cats }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, pricing_model, price_tiers, price_per_sqm, min_order_qty, min_width_cm, min_height_cm, category_id, active")
      .order("name"),
    supabase.from("categories").select("id, name, sort_order").order("sort_order"),
  ]);

  const rows: PriceRowProduct[] = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    active: p.active,
    categoryId: p.category_id,
    model: p.pricing_model === "per_sqm" ? "per_sqm" : "per_unit",
    tiers: p.price_tiers?.length ? p.price_tiers : [{ minQty: 100, unitPrice: 1 }],
    sqm: p.price_per_sqm != null ? Number(p.price_per_sqm) : 10,
    minW: p.min_width_cm != null ? Number(p.min_width_cm) : 0,
    minH: p.min_height_cm != null ? Number(p.min_height_cm) : 0,
    minQty: p.min_order_qty ?? 1,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Qiymətlər</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Hər məhsul üçün qiymət növünü seçin: <b>ədədlə</b> (say artdıqca ucuzlaşan pillələr) və ya <b>m² ilə</b> (en × hündürlük). Yadda saxlayan kimi saytda dəyişir.
        </p>
      </div>
      {(cats ?? []).map((c) => {
        const list = rows.filter((r) => r.categoryId === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id} className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-400">{c.name}</h2>
            {list.map((r) => (
              <PriceRow key={r.id} p={r} />
            ))}
          </section>
        );
      })}
      {!rows.length && (
        <div className="rounded-xl bg-white px-5 py-12 text-center">
          <p className="text-neutral-500">Qiymət təyin etmək üçün əvvəl məhsul lazımdır.</p>
          <Link href="/admin/products/new" className="mt-3 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">İlk məhsulu əlavə et</Link>
        </div>
      )}
    </div>
  );
}

export const instant = false;
