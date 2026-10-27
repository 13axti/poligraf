import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { GROUP_ORDER, groupOf } from "@/lib/catalog-groups";
import { PriceRow, type PriceRowProduct } from "@/components/admin/PriceRow";

const PAGE = 15;
type SP = { cat?: string; page?: string };

export default async function PricesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { supabase } = await requireAdmin();

  const [{ data: cats }, { data: counts }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order"),
    supabase.from("products").select("category_id").limit(10000),
  ]);
  const n = new Map<string, number>();
  for (const p of counts ?? []) n.set(p.category_id ?? "none", (n.get(p.category_id ?? "none") ?? 0) + 1);
  const withProducts = (cats ?? []).filter((c) => n.get(c.id));
  const cur = withProducts.find((c) => c.id === sp.cat) ?? withProducts[0];

  let rows: PriceRowProduct[] = [];
  let total = 0;
  if (cur) {
    const { data: products, count } = await supabase
      .from("products")
      .select("id, name, pricing_model, price_tiers, price_per_sqm, min_order_qty, min_width_cm, min_height_cm, category_id, active", { count: "exact" })
      .eq("category_id", cur.id)
      .order("sort_order")
      .order("name")
      .range((page - 1) * PAGE, page * PAGE - 1);
    total = count ?? 0;
    rows = (products ?? []).map((p) => ({
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
  }
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (cat: string, p = 1) => `/admin/prices?cat=${cat}${p > 1 ? `&page=${p}` : ""}`;
  const groups = GROUP_ORDER.map((g) => ({ g, items: withProducts.filter((c) => groupOf(c.slug) === g) })).filter((x) => x.items.length);
  const pg = "rounded-md bg-white px-3 py-1.5 text-sm font-semibold";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Qiymətlər</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Kateqoriya seçin, sonra hər məhsul üçün qiymət növünü təyin edin: <b>ədədlə</b> (say artdıqca ucuzlaşan pillələr) və ya <b>m² ilə</b>. Yadda saxlayan kimi saytda dəyişir.
        </p>
      </div>

      {groups.map(({ g, items }) => (
        <div key={g}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-neutral-400">{g}</p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((c) => (
              <Link
                key={c.id}
                href={href(c.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  c.id === cur?.id ? "bg-[#1b1d1f] text-white" : "bg-white text-neutral-700 hover:bg-[var(--line)]"
                }`}
              >
                {c.name} <span className="opacity-60">{n.get(c.id)}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {cur && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-neutral-400">{cur.name} · {total} məhsul</h2>
          {rows.map((r) => (
            <PriceRow key={r.id} p={r} />
          ))}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {page > 1 && <Link href={href(cur.id, page - 1)} className={pg}>← Əvvəlki</Link>}
              <span className="text-sm text-neutral-500">{page} / {pages}</span>
              {page < pages && <Link href={href(cur.id, page + 1)} className={pg}>Növbəti →</Link>}
            </div>
          )}
        </section>
      )}

      {!cur && (
        <div className="rounded-xl bg-white px-5 py-12 text-center">
          <p className="text-neutral-500">Qiymət təyin etmək üçün əvvəl məhsul lazımdır.</p>
          <Link href="/admin/products/new" className="mt-3 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">İlk məhsulu əlavə et</Link>
        </div>
      )}
    </div>
  );
}

export const instant = false;
