import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const [newOrders, allOrders, products, latest] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("id, created_at, status, product_name, customer_name, computed_price").order("created_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    { label: "Yeni sifariş", value: newOrders.count ?? 0, hot: true },
    { label: "Bütün sifarişlər", value: allOrders.count ?? 0 },
    { label: "Məhsullar", value: products.count ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Ümumi baxış</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-3xl p-6 ${s.hot ? "bg-accent text-white" : "bg-white"}`}>
            <p className={`text-sm font-semibold ${s.hot ? "text-white/80" : "text-neutral-500"}`}>{s.label}</p>
            <p className="mt-1 text-5xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Son sifarişlər</h2>
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
    </div>
  );
}
