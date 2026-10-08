import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();

  let q = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && STATUS[status]) q = q.eq("status", status);
  const { data: orders } = await q;

  const tab = "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition";
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Sifarişlər</h1>
      <div className="flex gap-2 overflow-x-auto">
        <Link href="/admin/orders" className={`${tab} ${!status ? "bg-foreground text-white" : "bg-white"}`}>Hamısı</Link>
        {Object.entries(STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/orders?status=${k}`} className={`${tab} ${status === k ? "bg-foreground text-white" : "bg-white"}`}>
            {v.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl bg-white">
        {orders?.length ? (
          <ul className="divide-y divide-neutral-100">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 transition hover:bg-neutral-50 sm:grid-cols-[1.4fr_1fr_auto_auto]">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{o.product_name}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(o.created_at).toLocaleString("az-AZ", { dateStyle: "medium", timeStyle: "short" })}
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
    </div>
  );
}
