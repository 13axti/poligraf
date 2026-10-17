import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";
import { applyOrderFilters } from "@/lib/order-filters";

const PAGE = 20;

type SP = { status?: string; q?: string; from?: string; to?: string; page?: string };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { supabase } = await requireAdmin();

  const base = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  const { data: orders, count } = await applyOrderFilters(base, sp);
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  const qs = (over: Partial<SP>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...over })) if (v) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const filtered = !!(sp.q || sp.status || sp.from || sp.to);

  const tab = "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition";
  const input = "rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold outline-none ring-1 ring-black/5 focus:ring-brand";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Sifarişlər</h1>
        <a
          href={`/admin/export${qs({ page: undefined })}`}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground hover:text-white"
        >
          Excel-ə yüklə (CSV)
        </a>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        <Link href={`/admin/orders${qs({ status: undefined, page: undefined })}`} className={`${tab} ${!sp.status ? "bg-foreground text-white" : "bg-white"}`}>Hamısı</Link>
        {Object.entries(STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/orders${qs({ status: k, page: undefined })}`} className={`${tab} ${sp.status === k ? "bg-foreground text-white" : "bg-white"}`}>
            {v.label}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/orders">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input name="q" defaultValue={sp.q} placeholder="Ad, telefon və ya məhsul…" className={`${input} min-w-52 flex-1`} />
        <input type="date" name="from" defaultValue={sp.from} className={input} aria-label="Başlanğıc tarix" />
        <span className="text-neutral-400">—</span>
        <input type="date" name="to" defaultValue={sp.to} className={input} aria-label="Son tarix" />
        <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Axtar</button>
        {filtered && <Link href="/admin/orders" className="text-sm font-semibold text-neutral-500 hover:text-foreground">Təmizlə</Link>}
      </form>

      <p className="text-sm text-neutral-500">{total} sifariş</p>

      <div className="overflow-hidden rounded-3xl bg-white">
        {orders?.length ? (
          <ul className="divide-y divide-neutral-100">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 transition hover:bg-neutral-50 sm:grid-cols-[1.4fr_1fr_auto_auto]">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{o.product_name}</p>
                    <p className="text-xs text-neutral-500">
                      #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString("az-AZ", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate font-semibold">{o.customer_name}</p>
                    <p className="text-sm text-neutral-500">{o.customer_phone}</p>
                  </div>
                  <span className="hidden font-extrabold sm:block">{Number(o.computed_price).toFixed(2)} ₼</span>
                  <span className={`justify-self-end rounded-full px-3 py-1 text-xs font-bold ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-neutral-500">Sifariş tapılmadı.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm font-semibold">
          {page > 1 ? <Link href={`/admin/orders${qs({ page: String(page - 1) })}`} className="rounded-full bg-white px-4 py-2">← Əvvəlki</Link> : <span className="px-4 py-2 text-neutral-300">← Əvvəlki</span>}
          <span className="text-neutral-500">{page} / {pages}</span>
          {page < pages ? <Link href={`/admin/orders${qs({ page: String(page + 1) })}`} className="rounded-full bg-white px-4 py-2">Növbəti →</Link> : <span className="px-4 py-2 text-neutral-300">Növbəti →</span>}
        </div>
      )}
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
