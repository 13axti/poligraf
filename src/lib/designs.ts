import { cacheTag } from "next/cache";
import { createPublicClient, supabaseConfigured } from "./supabase/public";
import { designImageUrl, type Design } from "./designs-shared";

/** Təsdiqlənmiş dizaynlar (ən populyar öndə). Cədvəl yoxdursa boş qaytarır. */
export async function getApprovedDesigns(): Promise<Design[]> {
  "use cache";
  cacheTag("designs");
  if (!supabaseConfigured) return [];
  const { data, error } = await createPublicClient()
    .from("designs")
    .select("id, title, designer_name, kind, image_path, views, sales")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data
    .map((r) => ({
      id: r.id as string,
      title: r.title as string,
      designerName: String(r.designer_name).split(" ")[0],
      kind: r.kind === "shirt" ? ("shirt" as const) : ("artwork" as const),
      image: designImageUrl(r.image_path as string),
      views: r.views as number,
      sales: r.sales as number,
    }))
    .sort((a, b) => b.sales * 10 + b.views - (a.sales * 10 + a.views));
}
