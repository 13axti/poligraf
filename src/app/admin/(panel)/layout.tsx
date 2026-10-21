import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { logout } from "../actions";
import { NewOrderWatcher } from "@/components/admin/NewOrderWatcher";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireAdmin();
  const { count: newCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="print:hidden flex shrink-0 flex-col border-b border-[var(--line)] bg-white md:sticky md:top-0 md:h-screen md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2.5 px-4 py-4 md:py-5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#ff5a1f] font-display text-base font-bold text-white">L</span>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-bold">Lemur Group</p>
            <p className="text-xs text-neutral-500">Sifariş masası</p>
          </div>
        </div>
        <AdminNav newCount={newCount ?? 0} />
        <div className="hidden border-t border-[var(--line)] p-4 md:mt-auto md:block">
          <p className="truncate text-xs text-neutral-500">{user.email}</p>
          <form action={logout}>
            <button className="mt-2 text-sm font-semibold text-neutral-700 underline-offset-4 hover:underline">Çıx</button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-6xl">
          {/* Səhifələr arası keçid dərhal cavab versin: səhifə datası yüklənərkən skelet göstərilir */}
          <Suspense
            fallback={
              <div className="animate-pulse space-y-4">
                <div className="h-9 w-56 rounded-md bg-[var(--surface)]" />
                <div className="h-56 rounded-xl bg-[var(--surface)]" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
      <NewOrderWatcher />
    </div>
  );
}
