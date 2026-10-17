import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";

const TZ = "Asia/Baku";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD

const money = (n: number) => `${n.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼`;

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const since = new Date(Date.now() - 90 * 86400_000).toISOString();

  const [{ data: rows }, products, latest] = await Promise.all([
    supabase.from("orders").select("created_at, status, product_name, computed_price").gte("created_at", since).limit(5000),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("id, created_at, status, product_name, customer_name, computed_price").order("created_at", { ascending: false }).limit(6),
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

  const stats = [
    { label: "Yeni sifariş", value: String(newCount), hot: true, href: "/admin/orders?status=new" },
    { label: "Bu ay sifariş", value: String(thisMonth.length) },
    { label: "Bu ay dövriyyə", value: money(revenue) },
    { label: "Orta sifariş", value: money(avg) },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Ümumi baxış</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <div className={`h-full rounded-3xl p-6 ${s.hot ? "bg-accent text-white" : "bg-white"}`}>
              <p className={`text-sm font-semibold ${s.hot ? "text-white/80" : "text-neutral-500"}`}>{s.label}</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{s.value}</p>
            </div>
          );
          return s.href ? <Link key={s.label} href={s.href}>{body}</Link> : <div key={s.label}>{body}</div>;
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl bg-white p-6">
          <h2 className="mb-5 font-extrabold">Son 14 gün: sifarişlər</h2>
          <div className="flex h-44 items-end gap-1.5 sm:gap-2">
            {days.map((d) => (
              <div key={d.key} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[11px] font-bold text-neutral-500 opacity-0 transition group-hover:opacity-100">{d.count}</span>
                <div
                  className={`w-full rounded-t-xl transition ${d.count ? "bg-brand group-hover:bg-brand-dark" : "bg-surface"}`}
                  style={{ height: `${Math.max(6, (d.count / maxDay) * 100)}%` }}
                  title={`${d.label}: ${d.count}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-neutral-400">
            <span>{days[0].label}</span>
            <span>{days[13].label}</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6">
          <h2 className="mb-4 font-extrabold">Status üzrə (90 gün)</h2>
          <ul className="space-y-2.5">
            {byStatus.map(({ k, n }) => (
              <li key={k}>
                <Link href={`/admin/orders?status=${k}`} className="flex items-center justify-between gap-3 hover:opacity-70">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[k].cls}`}>{STATUS[k].label}</span>
                  <span className="font-extrabold">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold">Son sifarişlər</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand">Hamısı →</Link>
          </div>
          {latest.data?.length ? (
            <ul className="divide-y divide-neutral-100">
              {latest.data.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-70">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.product_name}</p>
                      <p className="truncate text-sm text-neutral-500">{o.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{Number(o.computed_price).toFixed(2)} ₼</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500">Hələ sifariş yoxdur.</p>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6">
          <h2 className="mb-4 font-extrabold">Ən çox satan məhsullar (90 gün)</h2>
          {topList.length ? (
            <ol className="space-y-3">
              {topList.map(([name, t], i) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-sm font-extrabold">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{name}</p>
                    <p className="text-xs text-neutral-500">{t.n} sifariş</p>
                  </div>
                  <span className="font-extrabold">{money(t.sum)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-neutral-500">Hələ məlumat yoxdur.</p>
          )}
          <p className="mt-4 text-xs text-neutral-400">Məhsul sayı: {products.count ?? 0}. Rəqəmlər ləğv edilmiş sifarişləri hesablamır.</p>
        </div>
      </div>
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
