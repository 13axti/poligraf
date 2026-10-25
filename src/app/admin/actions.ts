"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { productToRow } from "@/lib/db-map";
import { slugify } from "@/lib/slug";
import { BRAND } from "@/lib/site-config";
import type { Product, ProductMockup } from "@/lib/types";

export type ActionState = { error?: string; ok?: boolean } | undefined;

/* ---------------- Giriş / çıxış ---------------- */

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "E-poçt və şifrəni yazın" };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-poçt və ya şifrə yanlışdır" };
  redirect("/admin");
}

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ---------------- Fayl yükləmə ---------------- */

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/avif"];

async function uploadPublic(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  file: File,
  folder: string
): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Yalnız şəkil faylı yükləyin (JPG, PNG, WebP, SVG)");
  if (file.size > 6 * 1024 * 1024) throw new Error("Fayl 6 MB-dan böyükdür");
  const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(`Şəkil yüklənmədi: ${error.message}`);
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
}

const isFile = (v: FormDataEntryValue | null): v is File => v instanceof File && v.size > 0;

/* ---------------- Məhsul ---------------- */

export interface ProductPayload {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  pricingModel: "per_unit" | "per_sqm";
  minOrderQty?: number;
  pricePerSqm?: number;
  minWidthCm?: number;
  minHeightCm?: number;
  priceTiers: { minQty: number; unitPrice: number }[];
  variants: { id: string; name: string; priceModifier?: number }[];
  mockups: (ProductMockup & { fileKey?: string })[];
  image: string;
  featured: boolean;
  active: boolean;
}

export async function saveProduct(formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  let p: ProductPayload;
  try {
    p = JSON.parse(String(formData.get("payload")));
  } catch {
    return { error: "Form məlumatı oxunmadı" };
  }
  if (!p.name?.trim()) return { error: "Məhsulun adını yazın" };
  const slug = slugify(p.slug || p.name);
  if (!slug) return { error: "Keçid (slug) boş ola bilməz" };

  try {
    let image = p.image;
    const main = formData.get("image");
    if (isFile(main)) image = await uploadPublic(supabase, main, "items");

    const mockups: ProductMockup[] = [];
    for (const m of p.mockups) {
      const file = m.fileKey ? formData.get(`file_${m.fileKey}`) : null;
      const url = isFile(file) ? await uploadPublic(supabase, file, "mockups") : m.image;
      if (!url) continue;
      const { fileKey: _k, ...rest } = m;
      void _k;
      mockups.push({ ...rest, image: url });
    }
    if (!image && mockups[0]) image = mockups[0].image;
    if (!image) return { error: "Ən azı bir şəkil yükləyin" };

    const row = productToRow({
      slug,
      categoryId: p.categoryId,
      name: p.name.trim(),
      description: p.description.trim() || undefined,
      image,
      pricingModel: p.pricingModel,
      minOrderQty: p.pricingModel === "per_unit" ? p.minOrderQty : undefined,
      priceTiers: p.pricingModel === "per_unit" ? [...p.priceTiers].sort((a, b) => a.minQty - b.minQty) : [],
      pricePerSqm: p.pricingModel === "per_sqm" ? p.pricePerSqm : undefined,
      minWidthCm: p.pricingModel === "per_sqm" ? p.minWidthCm : undefined,
      minHeightCm: p.pricingModel === "per_sqm" ? p.minHeightCm : undefined,
      variants: p.variants.filter((v) => v.name.trim()),
      mockups,
      featured: p.featured,
      active: p.active,
    } as Partial<Product> & { active: boolean });

    const q = p.id
      ? supabase.from("products").update(row).eq("id", p.id)
      : supabase.from("products").insert(row);
    const { error } = await q;
    if (error) {
      return { error: error.code === "23505" ? "Bu keçid (slug) artıq mövcuddur" : error.message };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xəta baş verdi" };
  }

  updateTag("catalog");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("products").delete().eq("id", String(formData.get("id")));
  updateTag("catalog");
  redirect("/admin/products");
}

/* ---------------- Kateqoriya ---------------- */

export async function saveCategory(formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Adı yazın" };
  const slug = slugify(String(formData.get("slug") || name));

  try {
    let image = String(formData.get("image_url") ?? "") || null;
    const file = formData.get("image");
    if (isFile(file)) image = await uploadPublic(supabase, file, "categories");

    const row = {
      name,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      sort_order: Number(formData.get("sort_order") ?? 0) || 0,
      image,
    };
    const { error } = id
      ? await supabase.from("categories").update(row).eq("id", id)
      : await supabase.from("categories").insert(row);
    if (error) return { error: error.code === "23505" ? "Bu keçid artıq mövcuddur" : error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xəta baş verdi" };
  }
  updateTag("catalog");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", String(formData.get("id")));
  updateTag("catalog");
  redirect("/admin/categories");
}

/* ---------------- Sifariş ---------------- */

const STATUSES = ["new", "in_progress", "ready", "done", "cancelled"];

export async function updateOrder(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status)) return;
  await supabase
    .from("orders")
    .update({ status, admin_note: String(formData.get("admin_note") ?? "").slice(0, 1000) })
    .eq("id", id);
  redirect(`/admin/orders/${id}`);
}

export async function deleteOrder(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data } = await supabase.from("orders").select("mockup_path, logo_path").eq("id", id).single();
  const paths = [data?.mockup_path, data?.logo_path].filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from("orders").remove(paths);
  await supabase.from("orders").delete().eq("id", id);
  redirect("/admin/orders");
}

/* ---------------- Sayt ayarları ---------------- */

export interface SettingsPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  socials: { id: string; label: string; href: string }[];
  clients: { name: string; logo?: string; fileKey?: string }[];
}

function cleanUrl(u: string) {
  const v = u.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export async function saveSettings(formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  let p: SettingsPayload;
  try {
    p = JSON.parse(String(formData.get("payload")));
  } catch {
    return { error: "Form məlumatı oxunmadı" };
  }

  try {
    const clients: { name: string; logo?: string }[] = [];
    for (const c of p.clients) {
      if (!c.name?.trim()) continue;
      const file = c.fileKey ? formData.get(`file_${c.fileKey}`) : null;
      const logo = isFile(file) ? await uploadPublic(supabase, file, "clients") : c.logo;
      clients.push({ name: c.name.trim().slice(0, 60), ...(logo ? { logo } : {}) });
    }

    const value = {
      name: p.name.trim().slice(0, 60) || BRAND,
      phone: p.phone.trim().slice(0, 40),
      email: p.email.trim().slice(0, 100),
      address: p.address.trim().slice(0, 200),
      hours: p.hours.trim().slice(0, 100),
      socials: p.socials.map((s) => ({ id: s.id, label: s.label, href: cleanUrl(s.href) })),
      clients,
    };
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "site", value, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xəta baş verdi" };
  }
  updateTag("settings");
  return { ok: true };
}

/** Sürətli status dəyişmə (daxili qeydə toxunmur) */
export async function setOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status)) return;
  await supabase.from("orders").update({ status }).eq("id", id);
  redirect(`/admin/orders/${id}`);
}

/* ---------------- Məhsul: sürətli əməliyyatlar ---------------- */

export async function toggleProductFlag(formData: FormData) {
  const { supabase } = await requireAdmin();
  const field = String(formData.get("field"));
  if (field !== "active" && field !== "featured") return;
  await supabase
    .from("products")
    .update({ [field]: formData.get("value") === "true" })
    .eq("id", String(formData.get("id")));
  updateTag("catalog");
  redirect("/admin/products");
}

export async function duplicateProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const { data: p } = await supabase.from("products").select("*").eq("id", String(formData.get("id"))).single();
  if (!p) redirect("/admin/products");
  const { id: _id, created_at: _c, ...rest } = p;
  void _id;
  void _c;
  const copy = { ...rest, name: `${p.name} (surət)`, slug: `${p.slug}-${randomUUID().slice(0, 4)}`, active: false, featured: false };
  const { data: created } = await supabase.from("products").insert(copy).select("id").single();
  updateTag("catalog");
  redirect(created ? `/admin/products/${created.id}` : "/admin/products");
}

/* ---------------- Qiymətlər: sürətli redaktə ---------------- */

export async function saveProductPrice(formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const model = formData.get("model") === "per_sqm" ? "per_sqm" : "per_unit";
  const num = (k: string) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  };

  let patch: Record<string, unknown>;
  if (model === "per_sqm") {
    if (num("sqm") <= 0) return { error: "1 m² qiymətini yazın" };
    patch = {
      pricing_model: model,
      price_per_sqm: num("sqm"),
      min_width_cm: num("minW") || null,
      min_height_cm: num("minH") || null,
    };
  } else {
    let tiers: { minQty: number; unitPrice: number }[] = [];
    try {
      tiers = JSON.parse(String(formData.get("tiers"))) as typeof tiers;
    } catch {
      return { error: "Qiymət pillələri oxunmadı" };
    }
    tiers = tiers
      .filter((t) => t.minQty > 0 && t.unitPrice > 0)
      .sort((a, b) => a.minQty - b.minQty);
    if (!tiers.length) return { error: "Ən azı bir qiymət pilləsi yazın" };
    patch = { pricing_model: model, price_tiers: tiers, min_order_qty: Math.max(num("minQty"), 1) };
  }

  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) return { error: error.message };
  updateTag("catalog");
  return { ok: true };
}

/* ---------------- T-shirt kampaniyası: dizaynlar ---------------- */

export async function setDesignApproved(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("designs")
    .update({ approved: formData.get("approved") === "true" })
    .eq("id", String(formData.get("id")));
  updateTag("designs");
  redirect("/admin/designs");
}

export async function saveDesignStats(formData: FormData) {
  const { supabase } = await requireAdmin();
  const n = (k: string) => Math.max(0, Math.floor(Number(formData.get(k)) || 0));
  await supabase
    .from("designs")
    .update({ views: n("views"), sales: n("sales"), admin_note: String(formData.get("admin_note") ?? "").slice(0, 500) })
    .eq("id", String(formData.get("id")));
  updateTag("designs");
  redirect("/admin/designs");
}

export async function deleteDesign(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data: files } = await supabase.storage.from("designs").list(id);
  if (files?.length) await supabase.storage.from("designs").remove(files.map((f) => `${id}/${f.name}`));
  await supabase.from("designs").delete().eq("id", id);
  updateTag("designs");
  redirect("/admin/designs");
}

/* ---------------- Xüsusi istəklər ---------------- */

export async function updateRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["new", "answered", "closed"].includes(status)) return;
  await supabase
    .from("requests")
    .update({ status, admin_note: String(formData.get("admin_note") ?? "").slice(0, 1000) })
    .eq("id", id);
  redirect(`/admin/requests/${id}`);
}

export async function setRequestStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["new", "answered", "closed"].includes(status)) return;
  await supabase.from("requests").update({ status }).eq("id", id);
  redirect(`/admin/requests/${id}`);
}

export async function deleteRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("requests").delete().eq("id", String(formData.get("id")));
  redirect("/admin/requests");
}
