import Link from "next/link";
import { notFound } from "next/navigation";
import { PresentationEditor, type CatalogProduct } from "@/components/admin/PresentationEditor";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeData } from "@/lib/presentations";

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: p }, { data: products }, { data: cats }] = await Promise.all([
    supabase.from("presentations").select("id, token, title, client, people, data").eq("id", id).maybeSingle(),
    supabase
      .from("products")
      .select("id, name, image, category_id, pricing_model, price_tiers, price_per_sqm, description")
      .order("name")
      .limit(3000),
    supabase.from("categories").select("id, name, sort_order").order("sort_order"),
  ]);
  if (!p) notFound();

  const catName = new Map((cats ?? []).map((c) => [c.id, c.name as string]));
  const catalog: CatalogProduct[] = (products ?? []).map((x) => ({
    id: x.id,
    name: x.name,
    image: x.image ?? "",
    category: catName.get(x.category_id) ?? "Digər",
    unit: x.pricing_model === "per_sqm" ? "m²" : "ədəd",
    tiers:
      x.pricing_model === "per_sqm"
        ? [{ minQty: 1, unitPrice: Number(x.price_per_sqm) || 0 }]
        : ((x.price_tiers ?? []) as { minQty: number; unitPrice: number }[]),
    description: String(x.description ?? "").slice(0, 600),
  }));

  return (
    <div className="space-y-5">
      <Link href="/admin/presentations" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">Təqdimatlara qayıt</Link>
      <PresentationEditor
        id={p.id}
        token={p.token}
        initial={{ title: p.title, client: p.client, people: p.people, data: normalizeData(p.data) }}
        catalog={catalog}
        categories={(cats ?? []).map((c) => c.name as string)}
      />
    </div>
  );
}

export const instant = false;
