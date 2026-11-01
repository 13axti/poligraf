import { CostHeader, CostTablesMissing } from "@/components/admin/CostHeader";
import { PriceImport } from "@/components/admin/PriceImport";
import { requireAdmin } from "@/lib/admin-auth";
import { loadCosts } from "@/lib/costs-server";

export default async function ImportPage() {
  const { supabase } = await requireAdmin();
  const { error, products, suppliers } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;
  return (
    <div className="space-y-6">
      <CostHeader />
      <PriceImport existing={products.map((p) => ({ id: p.id, code: p.code, name: p.name }))} suppliers={suppliers.map((s) => s.name)} />
    </div>
  );
}

export const instant = false;
