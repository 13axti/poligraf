import { requireAdmin } from "@/lib/admin-auth";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: cats } = await supabase.from("categories").select("id, name").order("sort_order");
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Yeni məhsul</h1>
      <ProductForm categories={cats ?? []} />
    </div>
  );
}
