import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { GROUP_ORDER, groupOf } from "@/lib/catalog-groups";
import { duplicateProduct, toggleProductFlag } from "../../actions";

const PAGE = 30;
type SP = { q?: string; cat?: string; st?: string; page?: string };

function Toggle({ id, field, value, on, off, back }: { id: string; field: "active" | "featured"; value: boolean; on: string; off: string; back: string }) {
  return (
    <form action={toggleProductFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(!value)} />
      <input type="hidden" name="back" value={back} />
      <button
        title={value ? "Söndürmək üçün klik" : "Yandırmaq üçün klik"}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
          value ? (field === "featured" ? "bg-[#ff5a1f] text-white" : "bg-[#1b1d1f] text-white") : "bg-[var(--surface)] text-neutral-600 hover:bg-[var(--line)]"
        }`}
      >
        {value ? on : off}
      </button>
    </form>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { supabase } = await requireAdmin();

  let q = supabase
    .from("products")
    .select("id, name, slug, image, active, featured, pricing_model, category_id, price_tiers, price_per_sqm", { count: "exact" })
    .order("category_id")
    .order("sort_order")
    .order("name")
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (sp.cat) q = q.eq("category_id", sp.cat);
  if (sp.st === "on") q = q.eq("active", true);
  if (sp.st === "off") q = q.eq("active", false);
  const term = sp.q?.replace(/[,()%*\\]/g, " ").trim();
  if (term) q = q.ilike("name", `%${term}%`);

  const [{ data: products, count }, { data: cats }, { data: all }] = await Promise.all([
    q,
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order"),
    supabase.from("products").select("category_id, active").limit(10000),
  ]);
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));

  // kateqoriya üzrə say (hamısı / saytda)
  const n = new Map<string, { all: number; on: number }>();
  for (const p of all ?? []) {
    const k = p.category_id ?? "none";
    const v = n.get(k) ?? { all: 0, on: 0 };
    v.all++;
    if (p.active) v.on++;
    n.set(k, v);
  }
  const groups = GROUP_ORDER.map((g) => ({ g, items: (cats ?? []).filter((c) => groupOf(c.slug) === g) })).filter((x) => x.items.length);

  const qs = (over: Partial<SP>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...over })) if (v) p.set(k, String(v));
    const s = p.toString();
    return `/admin/products${s ? `?${s}` : ""}`;
  };
  const here = qs({});
  const price = (p: { pricing_model: string; price_tiers: { unitPrice: number }[] | null; price_per_sqm: number | null }) =>
    p.pricing_model === "per_sqm"
      ? p.price_per_sqm ? `${Number(p.price_per_sqm).toFixed(2)} ₼/m²` : "—"
      : p.price_tiers?.length ? `${Math.min(...p.price_tiers.map((t) => t.unitPrice)).toFixed(2)} ₼-dən` : "—";
  const tab = "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Məhsullar</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {sp.cat ? `${catName.get(sp.cat) ?? "Kateqoriya"}: ` : ""}
            {total} məhsul
          </p>
        </div>
        <Link href="/admin/products/new" className="rounded-md bg-[#ff5a1f] px-4 py-2 text-sm font-bold text-white hover:bg-[#e04810]">+ Yeni məhsul</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        {/* Kateqoriyalar */}
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <nav className="rounded-xl bg-white p-2 text-sm">
            <Link href={qs({ cat: undefined, page: undefined })} className={`flex justify-between rounded-md px-3 py-2 font-semibold ${!sp.cat ? "bg-[var(--surface)]" : "hover:bg-[var(--surface)]/60"}`}>
              Hamısı <span className="num text-neutral-500">{all?.length ?? 0}</span>
            </Link>
            {groups.map(({ g, items }) => (
              <div key={g} className="mt-2 border-t border-[var(--line)] pt-2">
                <p className="px-3 pb-1 text-xs font-medium text-neutral-500">{g}</p>
                {items.map((c) => {
                  const v = n.get(c.id) ?? { all: 0, on: 0 };
                  return (
                    <Link
                      key={c.id}
                      href={qs({ cat: c.id, page: undefined })}
                      className={`flex items-center justify-between gap-2 rounded-md px-3 py-1.5 ${sp.cat === c.id ? "bg-[var(--surface)] font-semibold" : v.all ? "hover:bg-[var(--surface)]/60" : "text-neutral-400 hover:bg-[var(--surface)]/60"}`}
                    >
                      <span className="truncate">{c.name}</span>
                      {v.all > 0 && <span className="num shrink-0 text-xs text-neutral-500" title={`${v.on} saytda`}>{v.on}/{v.all}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-4">
          <form action="/admin/products" className="flex flex-wrap items-center gap-2">
            {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
            <input name="q" defaultValue={sp.q} placeholder="Məhsul adı ilə axtar" className="min-w-52 flex-1 px-3 py-2 text-sm font-medium outline-none" />
            <select name="st" defaultValue={sp.st ?? ""} className="px-3 py-2 text-sm font-medium outline-none">
              <option value="">Hamısı</option>
              <option value="on">Saytda</option>
              <option value="off">Gizli</option>
            </select>
            <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white hover:bg-black">Axtar</button>
            {(sp.q || sp.st) && <Link href={qs({ q: undefined, st: undefined, page: undefined })} className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:underline">Sıfırla</Link>}
          </form>

          <div className="overflow-hidden rounded-xl bg-white">
            {products?.length ? (
              <ul className="divide-y divide-[var(--line)]">
                {products.map((p, i) => {
                  const head = !sp.cat && (i === 0 || products[i - 1].category_id !== p.category_id);
                  return (
                    <li key={p.id}>
                      {head && (
                        <p className="bg-[var(--surface)]/60 px-4 py-2 text-sm font-bold">{catName.get(p.category_id) ?? "Kateqoriyasız"}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                        <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 basis-60 items-center gap-3">
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[var(--surface)]">
                            {p.image && <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{p.name}</span>
                            <span className="num block text-xs text-neutral-500">{price(p)}</span>
                          </span>
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <Toggle id={p.id} field="active" value={p.active} on="Saytda" off="Gizli" back={here} />
                          <Toggle id={p.id} field="featured" value={p.featured} on="Populyar" off="Populyar deyil" back={here} />
                          <Link href={`/mehsul/${p.slug}`} target="_blank" className="rounded-md bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold hover:bg-[var(--line)]">Bax</Link>
                          <form action={duplicateProduct}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className="rounded-md bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold hover:bg-[var(--line)]">Kopyala</button>
                          </form>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-neutral-500">{sp.q || sp.cat || sp.st ? "Bu seçimə uyğun məhsul yoxdur." : "Kataloqda hələ məhsul yoxdur."}</p>
                <Link href="/admin/products/new" className="mt-3 inline-block rounded-md bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white">Məhsul əlavə et</Link>
              </div>
            )}
          </div>

          {pages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm font-semibold">
              {page > 1 && <Link href={qs({ page: String(page - 1) })} className="rounded-md bg-white px-3 py-1.5">Əvvəlki</Link>}
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((x) => x === 1 || x === pages || Math.abs(x - page) <= 2)
                .map((x, i, arr) => (
                  <span key={x} className="flex items-center gap-1.5">
                    {i > 0 && x - arr[i - 1] > 1 && <span className="text-neutral-400">…</span>}
                    <Link href={qs({ page: String(x) })} className={`${tab} num ${x === page ? "bg-[#1b1d1f] text-white" : "bg-white"}`}>{x}</Link>
                  </span>
                ))}
              {page < pages && <Link href={qs({ page: String(page + 1) })} className="rounded-md bg-white px-3 py-1.5">Növbəti</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
