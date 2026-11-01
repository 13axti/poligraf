"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";

const s = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);
/** "3,50" və "3.50" hər ikisi qəbul olunur */
const num = (f: FormData, k: string) => {
  const v = Number(String(f.get(k) ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
};
const back = (path: string, msg?: string) => redirect(msg ? `${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(msg)}` : path);

/* -------- Məhsul -------- */

export async function saveCostProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const name = s(formData, "name", 160);
  if (!name) back(id ? `/admin/costs/${id}` : "/admin/costs", "Məhsulun adını yazın");
  const minQ = num(formData, "min_qty");
  const row = {
    name,
    code: s(formData, "code", 30) || null,
    category: s(formData, "category", 80),
    unit: s(formData, "unit", 20) || "ədəd",
    spec: s(formData, "spec", 500),
    min_qty: Number.isFinite(minQ) && minQ > 0 ? Math.round(minQ) : null,
  };
  if (id) {
    const { error } = await supabase.from("cost_products").update(row).eq("id", id);
    back(`/admin/costs/${id}`, error ? (error.code === "23505" ? "Bu kod artıq var" : error.message) : "Saxlanıldı");
  }
  const { data, error } = await supabase.from("cost_products").insert(row).select("id").single();
  if (error || !data) back("/admin/costs", error?.code === "23505" ? "Bu kod artıq var" : "Əlavə olunmadı");
  redirect(`/admin/costs/${data!.id}`);
}

export async function deleteCostProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_products").delete().eq("id", s(formData, "id", 60));
  redirect("/admin/costs");
}

/* -------- Qiymət -------- */

/** Təchizatçını adına görə tapır, yoxdursa yaradır */
async function supplierId(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], name: string) {
  const { data: found } = await supabase.from("suppliers").select("id").ilike("name", name).maybeSingle();
  if (found) return found.id as string;
  const { data, error } = await supabase.from("suppliers").insert({ name }).select("id").single();
  if (error || !data) throw new Error("Təchizatçı yaradılmadı");
  return data.id as string;
}

export async function addCostPrice(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = s(formData, "product_id", 60);
  const path = `/admin/costs/${productId}`;
  const supplier = s(formData, "supplier", 120);
  const price = num(formData, "unit_price");
  const minQty = num(formData, "min_qty");
  if (!supplier) back(path, "Təchizatçının adını yazın");
  if (!(price >= 0)) back(path, "Qiyməti düzgün yazın, məsələn 3,50");
  let sid: string;
  try {
    sid = await supplierId(supabase, supplier);
  } catch {
    return back(path, "Təchizatçı yaradılmadı");
  }
  const { error } = await supabase.from("cost_prices").insert({
    product_id: productId,
    supplier_id: sid,
    unit_price: price,
    min_qty: Number.isFinite(minQty) && minQty > 0 ? Math.round(minQty) : 1,
    vat_included: formData.get("vat_included") === "on",
    valid_until: s(formData, "valid_until", 10) || null,
    note: s(formData, "note", 300),
  });
  back(path, error ? `Saxlanmadı: ${error.message}` : "Qiymət əlavə olundu");
}

export async function deleteCostPrice(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("cost_prices").delete().eq("id", s(formData, "id", 60));
  back(`/admin/costs/${s(formData, "product_id", 60)}`);
}

/* -------- Təchizatçı -------- */

export async function saveSupplier(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "id", 60);
  const name = s(formData, "name", 120);
  if (!name) back("/admin/costs/suppliers", "Adı yazın");
  const row = { name, phone: s(formData, "phone", 60), note: s(formData, "note", 300) };
  const { error } = id
    ? await supabase.from("suppliers").update(row).eq("id", id)
    : await supabase.from("suppliers").insert(row);
  back("/admin/costs/suppliers", error ? (error.code === "23505" ? "Bu adda təchizatçı var" : error.message) : "Saxlanıldı");
}

export async function deleteSupplier(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("suppliers").delete().eq("id", s(formData, "id", 60));
  back("/admin/costs/suppliers", "Silindi");
}
