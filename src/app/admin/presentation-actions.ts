"use server";

import { redirect } from "next/navigation";
import { randomBytes, randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { emptyData, normalizeData } from "@/lib/presentations";

export type PState = { error?: string; ok?: boolean } | undefined;

export async function createPresentation(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim().slice(0, 120) || "Yeni təqdimat";
  const client = String(formData.get("client") ?? "").trim().slice(0, 120);
  const people = Math.max(0, Math.round(Number(formData.get("people")) || 0));
  const { data, error } = await supabase
    .from("presentations")
    .insert({ token: randomBytes(12).toString("hex"), title, client, people, data: emptyData() })
    .select("id")
    .single();
  if (error || !data) redirect("/admin/presentations?error=1");
  redirect(`/admin/presentations/${data.id}`);
}

export async function savePresentation(formData: FormData): Promise<PState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  let p: { title: string; client: string; people: number; data: unknown };
  try {
    p = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Məlumat oxunmadı" };
  }
  const title = String(p.title ?? "").trim().slice(0, 120);
  if (!title) return { error: "Başlığı yazın" };
  const { error } = await supabase
    .from("presentations")
    .update({
      title,
      client: String(p.client ?? "").trim().slice(0, 120),
      people: Math.max(0, Math.round(Number(p.people) || 0)),
      data: normalizeData(p.data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: `Saxlanmadı: ${error.message}` };
  return { ok: true };
}

export async function deletePresentation(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("presentations").delete().eq("id", String(formData.get("id") ?? ""));
  redirect("/admin/presentations");
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Slayd üçün öz mockup şəklini yükləyir, ictimai URL qaytarır */
export async function uploadPresentationImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const { supabase } = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Fayl seçilməyib" };
  if (!ALLOWED.includes(file.type)) return { error: "Yalnız JPG, PNG, WebP yükləyin" };
  if (file.size > 6 * 1024 * 1024) return { error: "Fayl 6 MB-dan böyükdür" };
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `presentations/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("products").upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000" });
  if (error) return { error: `Yüklənmədi: ${error.message}` };
  return { url: supabase.storage.from("products").getPublicUrl(path).data.publicUrl };
}
