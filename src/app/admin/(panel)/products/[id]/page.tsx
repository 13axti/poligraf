import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { mapProduct } from "@/lib/db-map";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteProduct } from "../../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: row }, { data: cats }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);
  if (!row) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">{row.name}</h1>
      <ProductForm categories={cats ?? []} product={{ ...mapProduct(row), active: row.active }} />
      <form action={deleteProduct}>
        <input type="hidden" name="id" value={row.id} />
        <ConfirmButton message="Məhsul silinsin?" className="text-sm font-semibold text-neutral-400 hover:text-accent">
          Məhsulu sil
        </ConfirmButton>
      </form>
    </div>
  );
}
