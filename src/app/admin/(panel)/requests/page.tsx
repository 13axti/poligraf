import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { REQUEST_STATUS } from "@/lib/order-status";
import { ago } from "@/lib/ago";

type SP = { status?: string };

export default async function RequestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  let q = supabase.from("requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (sp.status && REQUEST_STATUS[sp.status]) q = q.eq("status", sp.status);
  const { data, error } = await q;

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Sorğular</h1>
        <p className="rounded-xl bg-white p-5 text-accent">
          Cədvəl tapılmadı. Supabase → SQL Editor-da <b>supabase/schema.sql</b> faylının mətnini yenidən işlədin.
        </p>
      </div>
    );
  }

  const tab = "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors";
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Sorğular</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Müştərilərin saytdakı "Xüsusi istək" formasından yazdıqları. Onlara 1 saat ərzində cavab vəd edilib.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-[var(--surface)] p-1">
        <Link href="/admin/requests" className={`${tab} ${!sp.status ? "bg-white" : "text-neutral-600 hover:text-foreground"}`}>Hamısı</Link>
        {Object.entries(REQUEST_STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/requests?status=${k}`} className={`${tab} ${sp.status === k ? "bg-white" : "text-neutral-600 hover:text-foreground"}`}>
            <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: v.dot }} />
            {v.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-white">
        {data?.length ? (
          <div className="divide-y divide-[var(--line)]">
            {data.map((r) => {
              const st = REQUEST_STATUS[r.status] ?? REQUEST_STATUS.new;
              const late = r.status === "new" && Date.now() - new Date(r.created_at).getTime() > 3600_000;
              return (
                <Link
                  key={r.id}
                  href={`/admin/requests/${r.id}`}
                  className="relative grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface)]/50 sm:grid-cols-[1.6fr_1fr_7rem_8rem]"
                >
                  {r.status === "new" && <span className="absolute inset-y-0 left-0 w-[3px] bg-[#ff5a1f]" />}
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{r.message}</span>
                    <span className="block truncate text-sm text-neutral-500 sm:hidden">{r.customer_name} · {ago(r.created_at)}</span>
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block truncate font-medium">{r.customer_name}</span>
                    <span className="block truncate text-sm text-neutral-500">{r.customer_phone}</span>
                  </span>
                  <span className={`hidden text-sm sm:block ${late ? "font-bold text-[#c42b0d]" : "text-neutral-500"}`}>
                    {ago(r.created_at)}
                    {late && " · gecikir"}
                  </span>
                  <span className="flex items-center justify-end gap-2 text-sm font-semibold">
                    <i className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: st.dot }} />
                    {st.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-12 text-center text-neutral-500">Hələ sorğu yoxdur. Müştəri "Xüsusi istək" formasını doldurduqda burada görünəcək.</p>
        )}
      </div>
    </div>
  );
}

export const instant = false;
