import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { requireAdmin } from "@/lib/admin-auth";
import { expired, money, netPrice, offersFor, today } from "@/lib/costs";
import { loadCosts } from "@/lib/costs-server";
import { addCostPrice, deleteCostPrice, deleteCostProduct, saveCostProduct } from "../../../cost-actions";

type SP = { qty?: string; msg?: string };

export default async function CostProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { error, products, prices, suppliers } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;
  const p = products.find((x) => x.id === id);
  if (!p) notFound();

  const day = today();
  const own = prices.filter((x) => x.productId === id);
  const qty = Math.max(1, Number(sp.qty) || p.minQty || 100);
  const offers = offersFor(own, qty, day);
  const cats = Array.from(new Set(products.map((x) => x.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      <CostHeader msg={sp.msg} />
      <Link href="/admin/costs" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">Bütün məhsullar</Link>

      <div>
        <p className="font-mono text-xs text-neutral-500">{p.code ?? "kodsuz"}</p>
        <h2 className="text-2xl font-bold">{p.name}</h2>
        {p.spec && <p className="text-sm text-neutral-600">{p.spec}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          {/* Müqayisə */}
          <section className="rounded-xl bg-white p-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-lg font-bold">Kim neçəyə verir?</h3>
              <form className="flex items-end gap-2">
                <label><span className={costLabel}>Say ({p.unit})</span><input name="qty" type="number" min={1} defaultValue={qty} className={`${costInput} w-28`} /></label>
                <button className="rounded-md bg-[#1b1d1f] px-3 py-2 text-sm font-semibold text-white">Yoxla</button>
              </form>
            </div>
            {offers.length ? (
              <div className="divide-y divide-[var(--line)]">
                {offers.map((o, i) => (
                  <div key={o.price.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                    <span className={`w-16 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold ${i === 0 ? "bg-[#ff5a1f] text-white" : "bg-[var(--surface)] text-neutral-600"}`}>{i === 0 ? "ən ucuz" : `${i + 1}.`}</span>
                    <span className="min-w-0 flex-1 font-semibold">{o.price.supplier}</span>
                    <span className="text-sm text-neutral-500">{o.price.minQty}+ {p.unit}{o.belowMin && <b className="ml-1 text-[#c42b0d]">min. {o.price.minQty}</b>}</span>
                    <span className="w-28 text-right"><b>{money(o.net, 3)} ₼</b><span className="block text-xs text-neutral-500">ƏDV-siz</span></span>
                    <span className="w-28 text-right text-sm text-neutral-600">cəmi {money(o.net * qty)} ₼</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Bu say üçün etibarlı qiymət yoxdur. Sağdakı formadan əlavə edin.</p>
            )}
          </section>

          {/* Bütün qiymətlər */}
          <section className="rounded-xl bg-white p-5">
            <h3 className="mb-3 text-lg font-bold">Bütün daxil edilmiş qiymətlər ({own.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-neutral-500">
                  <tr><th className="py-2 pr-3">Təchizatçı</th><th className="pr-3">Saydan</th><th className="pr-3">Qiymət</th><th className="pr-3">ƏDV-siz</th><th className="pr-3">Etibarlı</th><th className="pr-3">Qeyd</th><th className="pr-3">Tarix</th><th /></tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {own.map((x) => (
                    <tr key={x.id} className={expired(x, day) ? "text-neutral-400 line-through" : ""}>
                      <td className="py-2 pr-3 font-semibold">{x.supplier}</td>
                      <td className="pr-3">{x.minQty}</td>
                      <td className="pr-3">{money(x.unitPrice, 3)}{x.vatIncluded && <span className="text-xs text-neutral-500"> (ƏDV daxil)</span>}</td>
                      <td className="pr-3">{money(netPrice(x), 3)}</td>
                      <td className="pr-3">{x.validUntil ?? "—"}</td>
                      <td className="max-w-48 truncate pr-3 text-neutral-600" title={x.note}>{x.note}</td>
                      <td className="pr-3 text-neutral-500">{x.createdAt.slice(0, 10)}</td>
                      <td>
                        <form action={deleteCostPrice}>
                          <input type="hidden" name="id" value={x.id} />
                          <input type="hidden" name="product_id" value={p.id} />
                          <ConfirmButton message="Bu qiymət silinsin?" className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!own.length && <p className="py-4 text-sm text-neutral-500">Hələ qiymət yoxdur.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <form action={addCostPrice} className="space-y-3 rounded-xl bg-white p-5 ring-2 ring-[#ff5a1f]/40">
            <h3 className="font-bold">Qiymət əlavə et</h3>
            <input type="hidden" name="product_id" value={p.id} />
            <label className="block"><span className={costLabel}>Təchizatçı *</span>
              <input name="supplier" required list="cost-suppliers" className={costInput} placeholder="Moongroup" />
              <datalist id="cost-suppliers">{suppliers.map((x) => <option key={x.id} value={x.name} />)}</datalist>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label><span className={costLabel}>Vahid qiymət, ₼ *</span><input name="unit_price" required inputMode="decimal" className={costInput} placeholder="3,00" /></label>
              <label><span className={costLabel}>Neçə ədəddən</span><input name="min_qty" type="number" min={1} defaultValue={p.minQty ?? 1} className={costInput} /></label>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="vat_included" /> Qiymətə ƏDV daxildir</label>
            <label className="block"><span className={costLabel}>Etibarlıdır (tarixə qədər)</span><input name="valid_until" type="date" className={costInput} /></label>
            <label className="block"><span className={costLabel}>Qeyd</span><input name="note" className={costInput} placeholder="WhatsApp, 3 günə hazır" /></label>
            <button className="w-full rounded-md bg-[#ff5a1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">Əlavə et</button>
            <p className="text-xs text-neutral-500">Yeni təchizatçı adı yazsanız, avtomatik yaradılır.</p>
          </form>

          <details className="rounded-xl bg-white p-5">
            <summary className="cursor-pointer font-bold">Məhsulu redaktə et</summary>
            <form action={saveCostProduct} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={p.id} />
              <label className="block"><span className={costLabel}>Ad</span><input name="name" defaultValue={p.name} className={costInput} /></label>
              <div className="grid grid-cols-2 gap-2">
                <label><span className={costLabel}>Kod</span><input name="code" defaultValue={p.code ?? ""} className={costInput} /></label>
                <label><span className={costLabel}>Vahid</span><input name="unit" defaultValue={p.unit} className={costInput} /></label>
              </div>
              <label className="block"><span className={costLabel}>Kateqoriya</span>
                <input name="category" defaultValue={p.category} list="cost-cats2" className={costInput} />
                <datalist id="cost-cats2">{cats.map((c) => <option key={c} value={c} />)}</datalist>
              </label>
              <label className="block"><span className={costLabel}>Spesifikasiya</span><textarea name="spec" rows={2} defaultValue={p.spec} className={costInput} /></label>
              <label className="block"><span className={costLabel}>Tipik min. say</span><input name="min_qty" type="number" min={1} defaultValue={p.minQty ?? ""} className={costInput} /></label>
              <button className="w-full rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Saxla</button>
            </form>
            <form action={deleteCostProduct} className="mt-3">
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="Məhsul və bütün qiymətləri silinsin?" className="text-sm font-semibold text-neutral-500 hover:text-[#c42b0d]">Məhsulu sil</ConfirmButton>
            </form>
          </details>
        </aside>
      </div>
    </div>
  );
}

export const instant = false;
