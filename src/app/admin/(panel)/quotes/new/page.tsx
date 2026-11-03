import Link from "next/link";
import { CostHeader, CostTablesMissing } from "@/components/admin/CostHeader";
import { QuoteEditor } from "@/components/admin/costs/QuoteEditor";
import { requireAdmin } from "@/lib/admin-auth";
import { today } from "@/lib/costs";
import { loadCosts, quoteProducts } from "@/lib/costs-server";

export default async function NewQuote({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, products, offers, rates } = await loadCosts(supabase);
  const file = sp.mode === "file";
  const head = <CostHeader title={file ? "Fayldan avtomatik təklif" : "Manual təklif"} />;
  if (error) return <div className="space-y-4">{head}<CostTablesMissing /></div>;
  const day = today();
  return (
    <div className="space-y-5">
      <Link href="/admin/quotes" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:underline">Bütün təkliflər</Link>
      {head}
      <QuoteEditor
        fileMode={file}
        day={day}
        rates={rates}
        offers={offers}
        products={quoteProducts(products)}
        init={{ id: null, number: null, client: "", contact: "", phone: "", email: "", quoteDate: day, note: "", margin: 30, vat: false, source: file ? "file" : "manual", lines: [] }}
      />
    </div>
  );
}

export const instant = false;
