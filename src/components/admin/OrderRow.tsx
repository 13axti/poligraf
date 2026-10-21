import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { STATUS } from "@/lib/order-status";
import { ago } from "@/lib/ago";

export interface OrderRowData {
  id: string;
  created_at: string;
  status: string;
  product_name: string;
  variant_name?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  computed_price: number | string;
  quantity?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  pricing_model?: string | null;
}

/** Sifariş "bilet"i: şəkil, nə sifariş olunub, kim, nə qədər, nə vaxt, status. Yeni sifarişin sol kənarı narıncıdır. */
export function OrderRow({ o, thumb }: { o: OrderRowData; thumb?: string | null }) {
  const st = STATUS[o.status] ?? STATUS.new;
  const size = o.pricing_model === "per_sqm" ? `${o.width_cm}×${o.height_cm} sm` : o.quantity ? `${o.quantity} ədəd` : "";
  return (
    <Link
      href={`/admin/orders/${o.id}`}
      className="group relative grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface)]/50 sm:grid-cols-[3rem_1.5fr_1fr_5.5rem_7.5rem]"
    >
      {o.status === "new" && <span className="absolute inset-y-0 left-0 w-[3px] bg-[#ff5a1f]" />}
      <span className="h-12 w-12 overflow-hidden rounded-md bg-[var(--surface)]">
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{o.product_name}</span>
        <span className="block truncate text-sm text-neutral-500">
          {[o.variant_name, size].filter(Boolean).join(", ") || "—"}
          <span className="sm:hidden"> · {o.customer_name}</span>
        </span>
      </span>
      <span className="hidden min-w-0 sm:block">
        <span className="block truncate font-medium">{o.customer_name}</span>
        <span className="block truncate text-sm text-neutral-500">{ago(o.created_at)}</span>
      </span>
      <span className="num hidden text-right font-bold sm:block">{Number(o.computed_price).toFixed(2)} ₼</span>
      <span className="flex items-center justify-end gap-2 text-sm font-semibold">
        <i className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: st.dot }} />
        <span className={o.status === "cancelled" ? "text-neutral-500" : ""}>{st.label}</span>
      </span>
    </Link>
  );
}

export async function signThumbs(
  supabase: SupabaseClient,
  orders: { id: string; mockup_path?: string | null }[],
) {
  const withPath = orders.filter((o) => o.mockup_path);
  const map = new Map<string, string>();
  if (!withPath.length) return map;
  const { data } = await supabase.storage.from("orders").createSignedUrls(withPath.map((o) => o.mockup_path as string), 3600);
  for (const o of withPath) {
    const hit = data?.find((d) => d.path === o.mockup_path);
    if (hit?.signedUrl) map.set(o.id, hit.signedUrl);
  }
  return map;
}
