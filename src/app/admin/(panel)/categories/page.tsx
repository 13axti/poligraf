import { requireAdmin } from "@/lib/admin-auth";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Kateqoriyalar</h1>
      <CategoryForm />
      {cats?.map((c) => (
        <CategoryForm key={c.id} category={c} />
      ))}
    </div>
  );
}
