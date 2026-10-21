import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";
import { applyOrderFilters } from "@/lib/order-filters";
import { OrderRow, signThumbs } from "@/components/admin/OrderRow";

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

  const thumbs = await signThumbs(supabase, orders ?? []);

  const tab = "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors";
  const input = "px-3 py-2 text-sm font-medium outline-none";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Sifarişlər</h1>
          <p className="mt-1 text-sm text-neutral-500">{total} sifariş{filtered ? " tapıldı" : ""}</p>
        </div>
        <a
          href={`/admin/export${qs({ page: undefined })}`}
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--surface)]"
        >
          CSV kimi yüklə
        </a>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-[var(--surface)] p-1">
        <Link href={`/admin/orders${qs({ status: undefined, page: undefined })}`} className={`${tab} ${!sp.status ? "bg-white" : "text-neutral-600 hover:text-foreground"}`}>
          Hamısı
        </Link>
        {Object.entries(STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/orders${qs({ status: k, page: undefined })}`} className={`${tab} ${sp.status === k ? "bg-white" : "text-neutral-600 hover:text-foreground"}`}>
            <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: v.dot }} />
            {v.label}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/orders">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input name="q" defaultValue={sp.q} placeholder="Ad, telefon və ya məhsul axtar" className={`${input} min-w-52 flex-1`} />
        <input type="date" name="from" defaultValue={sp.from} className={input} aria-label="Başlanğıc tarix" />
        <span className="text-neutral-400">–</span>
        <input type="date" name="to" defaultValue={sp.to} className={input} aria-label="Son tarix" />
        <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white hover:bg-black">Axtar</button>
        {filtered && <Link href="/admin/orders" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:underline">Filtri sıfırla</Link>}
      </form>

      <div className="overflow-hidden rounded-xl bg-white">
        {orders?.length ? (
          <>
            <div className="hidden grid-cols-[3rem_1.5fr_1fr_5.5rem_7.5rem] gap-3 border-b border-[var(--line)] px-4 py-2 text-xs font-medium text-neutral-500 sm:grid">
              <span />
              <span>Sifariş</span>
              <span>Müştəri</span>
              <span className="text-right">Məbləğ</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {orders.map((o) => (
                <OrderRow key={o.id} o={o} thumb={thumbs.get(o.id)} />
              ))}
            </div>
          </>
        ) : (
          <p className="px-5 py-12 text-center text-neutral-500">
            {filtered ? "Bu filtrə uyğun sifariş yoxdur. Filtri sıfırlayıb yenidən yoxlayın." : "Hələ sifariş yoxdur. Müştəri sifariş verəndə burada görünəcək."}
          </p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm font-semibold">
          {page > 1 ? <Link href={`/admin/orders${qs({ page: String(page - 1) })}`} className="rounded-md bg-white px-4 py-2">Əvvəlki</Link> : <span className="px-4 py-2 text-neutral-400">Əvvəlki</span>}
          <span className="num text-neutral-500">{page} / {pages}</span>
          {page < pages ? <Link href={`/admin/orders${qs({ page: String(page + 1) })}`} className="rounded-md bg-white px-4 py-2">Növbəti</Link> : <span className="px-4 py-2 text-neutral-400">Növbəti</span>}
        </div>
      )}
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
