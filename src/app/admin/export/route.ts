import { createServerSupabase } from "@/lib/supabase/server";
import { applyOrderFilters } from "@/lib/order-filters";
import { STATUS } from "@/lib/order-status";

const esc = (v: unknown) => {
  let s = v == null ? "" : String(v);
  // Excel formula inyeksiyasından qorun
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const sp = new URL(request.url).searchParams;
  const base = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5000);
  const { data, error } = await applyOrderFilters(base, {
    q: sp.get("q") ?? undefined,
    status: sp.get("status") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });
  if (error) return new Response(error.message, { status: 500 });

  const head = ["Tarix", "Nömrə", "Status", "Məhsul", "Variant", "Say", "En (sm)", "Hündürlük (sm)", "Qiymət (₼)", "Müştəri", "Telefon", "Qeyd"];
  const rows = (data ?? []).map((o) => [
    new Date(o.created_at).toLocaleString("az-AZ"),
    o.id.slice(0, 8),
    STATUS[o.status]?.label ?? o.status,
    o.product_name,
    o.variant_name,
    o.quantity,
    o.width_cm,
    o.height_cm,
    Number(o.computed_price).toFixed(2),
    o.customer_name,
    o.customer_phone,
    o.note,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sifarisler-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
