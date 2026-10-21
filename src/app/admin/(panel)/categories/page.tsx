import { requireAdmin } from "@/lib/admin-auth";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Kateqoriyalar</h1>
        <p className="mt-1 text-sm text-neutral-500">{cats?.length ?? 0} kateqoriya. Sıra kiçik olan əvvəldə görünür, saytda menyuda və kataloqda bu ardıcıllıqla düzülür.</p>
      </div>
      <details className="group rounded-xl bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-[#ff5a1f] marker:hidden">+ Yeni kateqoriya əlavə et</summary>
        <div className="border-t border-[var(--line)]">
          <CategoryForm />
        </div>
      </details>
      <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl bg-white">
        {cats?.map((c) => (
          <CategoryForm key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
