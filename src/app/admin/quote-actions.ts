"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import type { QuoteLine } from "@/lib/costs";

type SB = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export interface QuotePayload {
  id: string | null;
  client: string; contact: string; phone: string; email: string;
  quoteDate: string; note: string; margin: number; vat: boolean; source: string;
  lines: QuoteLine[];
}

/** Növbəti təklif nömrəsi: LMR-İL-0001 (il üzrə ardıcıl) */
async function nextNumber(supabase: SB, year: string) {
  const { data } = await supabase.from("quotes").select("number").like("number", `LMR-${year}-%`);
  const max = Math.max(0, ...(data ?? []).map((x) => Number(String(x.number).split("-")[2]) || 0));
  return `LMR-${year}-${String(max + 1).padStart(4, "0")}`;
}

const clean = (l: QuoteLine): QuoteLine => ({
  key: String(l.key).slice(0, 40),
  productId: l.productId ? String(l.productId).slice(0, 60) : null,
  name: String(l.name ?? "").slice(0, 200),
  specs: String(l.specs ?? "").slice(0, 1000),
  qty: Math.max(0, Number(l.qty) || 0),
  unit: String(l.unit ?? "ədəd").slice(0, 20),
  supplierId: l.supplierId ? String(l.supplierId).slice(0, 60) : null,
  supplier: String(l.supplier ?? "").slice(0, 120),
  purchase: Math.max(0, Number(l.purchase) || 0),
  sale: Math.max(0, Number(l.sale) || 0),
  saleManual: Boolean(l.saleManual),
  supplierPinned: Boolean(l.supplierPinned),
  purchaseManual: Boolean(l.purchaseManual),
  source: l.source ? String(l.source).slice(0, 300) : undefined,
});

export async function saveQuote(p: QuotePayload): Promise<{ id?: string; number?: string; error?: string }> {
  const { supabase } = await requireAdmin();
  const lines = (p.lines ?? []).slice(0, 300).map(clean).filter((l) => l.name.trim());
  const date = /^\d{4}-\d{2}-\d{2}$/.test(p.quoteDate) ? p.quoteDate : new Date().toISOString().slice(0, 10);
  const row = {
    client: String(p.client ?? "").trim().slice(0, 160), contact: String(p.contact ?? "").trim().slice(0, 120),
    phone: String(p.phone ?? "").trim().slice(0, 60), email: String(p.email ?? "").trim().slice(0, 120),
    quote_date: date, note: String(p.note ?? "").slice(0, 3000), margin: Math.max(0, Math.min(1000, Number(p.margin) || 0)),
    vat: Boolean(p.vat), lines, source: p.source === "file" ? "file" : "manual", updated_at: new Date().toISOString(),
  };
  if (p.id) {
    const { error } = await supabase.from("quotes").update(row).eq("id", p.id);
    if (error) return { error: `Saxlanmadı: ${error.message}` };
    const { data } = await supabase.from("quotes").select("number").eq("id", p.id).single();
    return { id: p.id, number: data?.number };
  }
  // Eyni anda iki təklif yaranarsa nömrə təkrarlanmasın: unikal xəta olsa yenidən cəhd et
  for (let i = 0; i < 3; i++) {
    const number = await nextNumber(supabase, date.slice(0, 4));
    const { data, error } = await supabase.from("quotes").insert({ ...row, number }).select("id, number").single();
    if (!error && data) return { id: data.id, number: data.number };
    if (error?.code !== "23505") return { error: `Saxlanmadı: ${error?.message ?? ""}` };
  }
  return { error: "Təklif nömrəsi yaradılmadı, yenidən cəhd edin" };
}

export async function deleteQuote(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("quotes").delete().eq("id", String(formData.get("id") ?? ""));
  redirect("/admin/quotes?msg=" + encodeURIComponent("Təklif silindi"));
}
