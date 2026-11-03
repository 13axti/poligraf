import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostHeader, CostTablesMissing } from "@/components/admin/CostHeader";
import { SupplierFields } from "@/components/admin/costs/SupplierFields";
import { requireAdmin } from "@/lib/admin-auth";
import { money, offersFor, suitable, tierLabel, today } from "@/lib/costs";
import { loadCosts } from "@/lib/costs-server";
import { deleteOffer, deleteSupplier, saveSupplier } from "../../../cost-actions";

export default async function SupplierPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { error, suppliers, offers, products, rates } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader title="Təchizatçı" /><CostTablesMissing /></div>;
  const s = suppliers.find((x) => x.id === id);
  if (!s) notFound();
  const day = today();
  const own = offers.filter((o) => o.supplierId === id);
  const prod = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <Link href="/admin/suppliers" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:underline">Bütün təchizatçılar</Link>
      <CostHeader title={s.name} sub={[s.contactPerson, s.phone, s.email, s.website, s.address].filter(Boolean).join(" · ")} msg={sp.msg} />

      <section className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold">Məhsullar və qiymətlər ({own.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="text-left text-xs text-neutral-500">
              <tr><th className="py-2 pr-3">Kod</th><th className="pr-3">Məhsul</th><th className="pr-3">Alış qiyməti</th><th className="pr-3">Miqdara görə</th><th className="pr-3">Min.</th><th className="pr-3">Hazırlanma</th><th className="pr-3">Tarix</th><th className="pr-3">Ən ucuz?</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] align-top">
              {own.map((o) => {
                const p = prod.get(o.productId);
                const q = o.minOrder ?? 1;
                const win = offersFor(offers.filter((x) => x.productId === o.productId), q, rates, day).find(suitable);
                return (
                  <tr key={o.id}>
                    <td className="py-2.5 pr-3 font-mono text-xs">{p?.code ?? "—"}</td>
                    <td className="pr-3"><Link href={`/admin/costs/${o.productId}`} className="font-semibold hover:underline">{p?.name ?? "?"}</Link><span className="block text-xs text-neutral-500">{p?.category}</span></td>
                    <td className="pr-3">{money(o.unitPrice, 3)} {o.currency} / {o.priceUnit}</td>
                    <td className="pr-3 text-xs">{Object.entries(o.tiers).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => <span key={k} className="mr-2 inline-block">{tierLabel(Number(k))}+: {money(v, 3)}</span>)}</td>
                    <td className="pr-3">{o.minOrder ?? "—"}</td>
                    <td className="pr-3">{o.leadDays != null ? `${o.leadDays} gün` : "—"}</td>
                    <td className="pr-3 text-xs">{o.priceDate ?? "—"}</td>
                    <td className="pr-3 text-xs">{win?.offer.id === o.id ? <b className="text-[#c2410c]">bəli ({q} əd.)</b> : win ? `yox, ${win.offer.supplier}` : "—"}</td>
                    <td>
                      <form action={deleteOffer}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="back" value={`/admin/suppliers/${id}`} />
                        <ConfirmButton message="Bu qiymət silinsin?" className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!own.length && <p className="py-4 text-sm text-neutral-500">Bu şirkətin hələ qiyməti yoxdur. Qiymət məhsul səhifəsindən və ya Excel importdan əlavə olunur.</p>}
        </div>
      </section>

      <form action={saveSupplier} className="space-y-3 rounded-xl bg-white p-5">
        <h3 className="font-bold">Məlumatı redaktə et</h3>
        <input type="hidden" name="id" value={s.id} />
        <SupplierFields x={s} />
        <button className="rounded-md bg-[#1b1d1f] px-5 py-2.5 text-sm font-bold text-white">Saxla</button>
      </form>
      <form action={deleteSupplier}>
        <input type="hidden" name="id" value={s.id} />
        <ConfirmButton message={`"${s.name}" və onun bütün qiymətləri silinsin?`} className="text-sm font-semibold text-neutral-500 hover:text-[#c42b0d]">Təchizatçını sil</ConfirmButton>
      </form>
    </div>
  );
}

export const instant = false;
