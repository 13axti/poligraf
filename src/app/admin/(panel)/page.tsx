import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";
import { OrderRow, signThumbs } from "@/components/admin/OrderRow";

const TZ = "Asia/Baku";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD

const money = (n: number) => `${n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼`;

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const since = new Date(Date.now() - 90 * 86400_000).toISOString();

  const [{ data: rows }, products, queue] = await Promise.all([
    supabase.from("orders").select("created_at, status, product_name, computed_price").gte("created_at", since).limit(5000),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, created_at, status, product_name, variant_name, customer_name, computed_price, quantity, width_cm, height_cm, pricing_model, mockup_path")
      .in("status", ["new", "in_progress", "ready"])
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const orders = rows ?? [];
  const active = orders.filter((o) => o.status !== "cancelled");

  // --- bu ay ---
  const monthKey = dayKey(new Date()).slice(0, 7);
  const thisMonth = active.filter((o) => dayKey(new Date(o.created_at)).startsWith(monthKey));
  const revenue = thisMonth.reduce((s, o) => s + Number(o.computed_price), 0);
  const avg = thisMonth.length ? revenue / thisMonth.length : 0;
  const newCount = orders.filter((o) => o.status === "new").length;

  // --- son 14 gün ---
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400_000);
    return { key: dayKey(d), label: d.toLocaleDateString("az-AZ", { timeZone: TZ, day: "numeric", month: "short" }), count: 0 };
  });
  for (const o of orders) {
    const d = days.find((x) => x.key === dayKey(new Date(o.created_at)));
    if (d) d.count++;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  // --- status bölgüsü ---
  const byStatus = Object.keys(STATUS).map((k) => ({ k, n: orders.filter((o) => o.status === k).length }));

  // --- ən çox satan (90 gün, ləğv olunmayanlar) ---
  const top = new Map<string, { n: number; sum: number }>();
  for (const o of active) {
    const t = top.get(o.product_name) ?? { n: 0, sum: 0 };
    t.n++;
    t.sum += Number(o.computed_price);
    top.set(o.product_name, t);
  }
  const topList = [...top.entries()].sort((a, b) => b[1].sum - a[1].sum).slice(0, 5);

  const waiting = queue.data ?? [];
  const thumbs = await signThumbs(supabase, waiting);
  const maxTop = Math.max(1, ...topList.map(([, t]) => t.sum));
  const totalStatus = Math.max(1, byStatus.reduce((a, b) => a + b.n, 0));

  const stats: { label: string; value: string; hot?: boolean }[] = [
    { label: "Yeni sifariş", value: String(newCount), hot: newCount > 0 },
    { label: "Bu ay sifariş", value: String(thisMonth.length) },
    { label: "Bu ay dövriyyə", value: money(revenue) },
    { label: "Orta sifariş", value: money(avg) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-bold">Ümumi baxış</h1>
        <p className="text-sm text-neutral-500">{new Date().toLocaleDateString("az-AZ", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Xülasə: bir sətir, dörd rəqəm */}
      <dl className="grid grid-cols-2 divide-x divide-y divide-[var(--line)] overflow-hidden rounded-xl bg-white lg:grid-cols-4 lg:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <dt className="text-sm text-neutral-500">{s.label}</dt>
            <dd className={`num mt-1 font-display text-3xl font-bold ${s.hot ? "text-[#ff5a1f]" : ""}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      {/* Əsas iş: gözləyən sifarişlər */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">İndi görülməli işlər</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">
            Bütün sifarişlər
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl bg-white">
          {waiting.length ? (
            <div className="divide-y divide-[var(--line)]">
              {waiting.map((o) => (
                <OrderRow key={o.id} o={o} thumb={thumbs.get(o.id)} />
              ))}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-neutral-500">Gözləyən sifariş yoxdur. Yeni sifariş gələndə burada görünəcək.</p>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-3 text-xl font-bold">Son 14 gün</h2>
          <div className="rounded-xl bg-white p-5">
            <div className="flex h-40 items-end gap-1.5">
              {days.map((d) => (
                <div key={d.key} className="group flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${d.count} sifariş`}>
                  <span className="num mb-1 text-center text-xs font-semibold text-neutral-500">{d.count || ""}</span>
                  <div
                    className={d.count ? "bg-[#1b1d1f]" : "bg-[var(--surface)]"}
                    style={{ height: `${d.count ? Math.max(8, (d.count / maxDay) * 100) : 4}%`, borderRadius: "3px 3px 0 0" }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-neutral-500">
              <span>{days[0].label}</span>
              <span>{days[13].label}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Statuslar (90 gün)</h2>
          <div className="rounded-xl bg-white p-5">
            <div className="flex h-3 overflow-hidden rounded-[4px] bg-[var(--surface)]">
              {byStatus.map(({ k, n }) => (
                <div key={k} style={{ width: `${(n / totalStatus) * 100}%`, background: STATUS[k].dot }} />
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {byStatus.map(({ k, n }) => (
                <li key={k}>
                  <Link href={`/admin/orders?status=${k}`} className="flex items-center gap-2.5 text-sm hover:underline">
                    <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: STATUS[k].dot }} />
                    <span className="flex-1">{STATUS[k].label}</span>
                    <span className="num font-bold">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Ən çox gəlir gətirən məhsullar</h2>
        <div className="rounded-xl bg-white p-5">
          {topList.length ? (
            <ul className="space-y-3">
              {topList.map(([name, t]) => (
                <li key={name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-semibold">{name}</span>
                    <span className="num shrink-0 text-neutral-500">{t.n} sifariş · <b className="text-foreground">{money(t.sum)}</b></span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-[3px] bg-[var(--surface)]">
                    <div className="h-full rounded-[3px] bg-[#1b1d1f]" style={{ width: `${(t.sum / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500">Hələ məlumat yoxdur.</p>
          )}
          <p className="mt-4 text-xs text-neutral-500">Son 90 gün, ləğv edilənlər nəzərə alınmır. Kataloqda {products.count ?? 0} məhsul var.</p>
        </div>
      </section>
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
