import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { duplicateProduct, toggleProductFlag } from "../../actions";

type SP = { q?: string; cat?: string };

function Toggle({ id, field, value, on, off }: { id: string; field: "active" | "featured"; value: boolean; on: string; off: string }) {
  return (
    <form action={toggleProductFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(!value)} />
      <button
        title={value ? "Söndürmək üçün klik" : "Yandırmaq üçün klik"}
        className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
          value ? (field === "featured" ? "bg-accent text-white" : "bg-emerald-500 text-white") : "bg-surface text-neutral-500 hover:bg-neutral-200"
        }`}
      >
        {value ? on : off}
      </button>
    </form>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();

  let q = supabase
    .from("products")
    .select("id, name, slug, image, active, featured, pricing_model, category_id")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (sp.cat) q = q.eq("category_id", sp.cat);
  const term = sp.q?.replace(/[,()%*\\]/g, " ").trim();
  if (term) q = q.ilike("name", `%${term}%`);

  const [{ data: products }, { data: cats }] = await Promise.all([q, supabase.from("categories").select("id, name").order("sort_order")]);
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));
  const input = "rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold outline-none ring-1 ring-black/5 focus:ring-brand";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Məhsullar</h1>
        <Link href="/admin/products/new" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">+ Yeni məhsul</Link>
      </div>

      <form action="/admin/products" className="flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Məhsul axtar…" className={`${input} min-w-52 flex-1`} />
        <select name="cat" defaultValue={sp.cat ?? ""} className={input}>
          <option value="">Bütün kateqoriyalar</option>
          {cats?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand">Axtar</button>
        {(sp.q || sp.cat) && <Link href="/admin/products" className="text-sm font-semibold text-neutral-500 hover:text-foreground">Təmizlə</Link>}
      </form>

      <p className="text-sm text-neutral-500">{products?.length ?? 0} məhsul</p>

      <div className="overflow-hidden rounded-3xl bg-white">
        {products?.length ? (
          <ul className="divide-y divide-neutral-100">
            {products.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 transition hover:bg-neutral-50">
                <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 basis-60 items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-surface">
                    {p.image && <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {catName.get(p.category_id) ?? "Kateqoriyasız"} · {p.pricing_model === "per_sqm" ? "m² ilə" : "say ilə"}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Toggle id={p.id} field="active" value={p.active} on="Saytda" off="Gizli" />
                  <Toggle id={p.id} field="featured" value={p.featured} on="Populyar" off="Populyar deyil" />
                  <Link href={`/mehsul/${p.slug}`} target="_blank" className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold hover:bg-neutral-200">Bax ↗</Link>
                  <form action={duplicateProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold hover:bg-neutral-200">Kopyala</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-neutral-500">Məhsul tapılmadı.</p>
        )}
      </div>
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
