import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: products }, { data: cats }] = await Promise.all([
    supabase.from("products").select("id, name, slug, image, active, featured, pricing_model, category_id").order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name"),
  ]);
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Məhsullar</h1>
        <Link href="/admin/products/new" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">+ Yeni məhsul</Link>
      </div>
      <div className="overflow-hidden rounded-3xl bg-white">
        {products?.length ? (
          <ul className="divide-y divide-neutral-100">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-4 p-3 transition hover:bg-neutral-50">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-surface">
                    {p.image && <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {catName.get(p.category_id) ?? "Kateqoriyasız"} · {p.pricing_model === "per_sqm" ? "m² ilə" : "say ilə"}
                    </p>
                  </div>
                  {p.featured && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white">Populyar</span>}
                  {!p.active && <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-[11px] font-bold">Gizli</span>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-neutral-500">Hələ məhsul yoxdur.</p>
        )}
      </div>
    </div>
  );
}
