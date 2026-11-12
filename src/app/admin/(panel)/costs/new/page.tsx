import { COST_LINKS, CostHeader, CostTablesMissing } from "@/components/admin/CostHeader";
import { CostProductForm } from "@/components/admin/costs/CostProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { loadCosts } from "@/lib/costs-server";
import { createCostProduct } from "../../../cost-actions";

export default async function NewCostProduct({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, categories, fields, suppliers } = await loadCosts(supabase);
  const head = <CostHeader title="Yeni məhsul" sub="Kod avtomatik verilir və dəyişmir. Eyni ad və kateqoriyada məhsul varsa, yenisi yaradılmır, qiymət mövcud məhsula əlavə olunur." msg={sp.msg} links={COST_LINKS} />;
  if (error) return <div className="space-y-4">{head}<CostTablesMissing /></div>;
  return (
    <div className="space-y-5">
      {head}
      {!suppliers.length && <p className="rounded-lg bg-white p-4 text-sm">Əvvəl <a href="/admin/suppliers?new=1" className="font-semibold text-[#0047b3] underline">təchizatçı əlavə edin</a>, sonra məhsulu yazın.</p>}
      <CostProductForm create action={createCostProduct} categories={categories} fields={fields} suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  );
}

export const instant = false;
