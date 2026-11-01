import { CostHeader, CostTablesMissing } from "@/components/admin/CostHeader";
import { QuoteBuilder } from "@/components/admin/QuoteBuilder";
import { requireAdmin } from "@/lib/admin-auth";
import { today } from "@/lib/costs";
import { loadCosts } from "@/lib/costs-server";

export default async function QuotePage() {
  const { supabase } = await requireAdmin();
  const { error, products, prices } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;
  return (
    <div className="space-y-6">
      <CostHeader />
      <QuoteBuilder products={products} prices={prices} day={today()} />
    </div>
  );
}

export const instant = false;
