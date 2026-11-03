import { COST_LINKS, CostHeader, CostTablesMissing } from "@/components/admin/CostHeader";
import { PriceImport } from "@/components/admin/PriceImport";
import { requireAdmin } from "@/lib/admin-auth";
import { loadCosts } from "@/lib/costs-server";

export default async function ImportPage() {
  const { supabase } = await requireAdmin();
  const { error, products, suppliers, categories, fields } = await loadCosts(supabase);
  const head = <CostHeader title="Excel import" sub="Standart şablonu yükləyin, doldurun və geri yükləyin. Başqa formatlar da qəbul olunur, sütunları yoxlamaq lazım ola bilər." links={COST_LINKS} />;
  if (error) return <div className="space-y-4">{head}<CostTablesMissing /></div>;
  return (
    <div className="space-y-6">
      {head}
      <PriceImport
        existing={products.map((p) => ({ id: p.id, code: p.code, name: p.name, category: p.category }))}
        suppliers={suppliers.map((s) => s.name)}
        categories={categories.filter((c) => !c.parentId).map((c) => c.name)}
        fields={fields.map((f) => ({ id: f.id, label: f.label }))}
      />
    </div>
  );
}

export const instant = false;
