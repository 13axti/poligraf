import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostHeader, CostTablesMissing } from "@/components/admin/CostHeader";
import { QuoteEditor } from "@/components/admin/costs/QuoteEditor";
import { requireAdmin } from "@/lib/admin-auth";
import { today, type QuoteLine } from "@/lib/costs";
import { loadCosts, quoteProducts } from "@/lib/costs-server";
import { deleteQuote } from "../../../quote-actions";

export default async function QuotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const [{ data: x }, costs] = await Promise.all([supabase.from("quotes").select("*").eq("id", id).maybeSingle(), loadCosts(supabase)]);
  if (costs.error) return <div className="space-y-4"><CostHeader title="Təklif" /><CostTablesMissing /></div>;
  if (!x) notFound();
  return (
    <div className="space-y-5">
      <Link href="/admin/quotes" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:underline">Bütün təkliflər</Link>
      <CostHeader title={`Təklif ${x.number}`} msg={sp.msg} />
      <QuoteEditor
        day={today()}
        rates={costs.rates}
        offers={costs.offers}
        products={quoteProducts(costs.products)}
        init={{ id: x.id, number: x.number, client: x.client, contact: x.contact, phone: x.phone, email: x.email, quoteDate: x.quote_date, note: x.note, margin: Number(x.margin), vat: x.vat, source: x.source, lines: (x.lines ?? []) as QuoteLine[] }}
      />
      <form action={deleteQuote}>
        <input type="hidden" name="id" value={x.id} />
        <ConfirmButton message={`${x.number} silinsin?`} className="text-sm font-semibold text-neutral-500 hover:text-[#c42b0d]">Təklifi sil</ConfirmButton>
      </form>
    </div>
  );
}

export const instant = false;
