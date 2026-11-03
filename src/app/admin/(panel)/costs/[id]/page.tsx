/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { COST_LINKS, CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { CostProductForm } from "@/components/admin/costs/CostProductForm";
import { OfferFields } from "@/components/admin/costs/OfferFields";
import { requireAdmin } from "@/lib/admin-auth";
import { money, offersFor, siteTiers, suitable, tierLabel, today } from "@/lib/costs";
import { loadCosts, sizeText } from "@/lib/costs-server";
import { deleteCostProduct, deleteOffer, publishToSite, saveOffer, updateCostProduct } from "../../../cost-actions";

export default async function CostProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; qty?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { error, products, offers, suppliers, categories, fields, rates } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader links={COST_LINKS} /><CostTablesMissing /></div>;
  const p = products.find((x) => x.id === id);
  if (!p) notFound();

  const day = today();
  const own = offers.filter((x) => x.productId === id);
  const minQ = Math.min(...own.map((o) => o.minOrder ?? 1), Infinity);
  const qty = Math.max(1, Number(sp.qty) || (Number.isFinite(minQ) ? minQ : 100));
  const ranked = offersFor(own, qty, rates, day);
  const winner = ranked.find(suitable);
  const used = new Set(own.map((o) => o.supplierId));
  const [{ data: siteCats }, { data: site }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    p.siteProductId ? supabase.from("products").select("id, slug, name, image, active, category_id").eq("id", p.siteProductId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const preview = siteTiers(own, 30, rates, day);
  const sList = suppliers.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-6">
      <CostHeader title={p.name} msg={sp.msg} links={COST_LINKS} />

      <div className="flex flex-wrap items-start gap-4">
        <div className="rounded-lg bg-[#1b1d1f] px-3 py-2 text-center text-white" title="Kod avtomatik verilib və dəyişmir">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Kod 🔒</p>
          <p className="font-mono text-xl font-bold tracking-widest">{p.code ?? "—"}</p>
        </div>
        <div className="min-w-0 flex-1 text-sm text-neutral-700">
          <p className="font-semibold">{[p.category, p.subcategory].filter(Boolean).join(" › ") || "Kateqoriyasız"}</p>
          <p>{[p.material && `Material: ${p.material}`, sizeText(p) && `Ölçü: ${sizeText(p)}`].filter(Boolean).join(" · ")}</p>
          {p.specs && <p className="mt-1 whitespace-pre-line text-neutral-600">{p.specs}</p>}
          {fields.filter((f) => p.extra?.[f.id]).map((f) => <p key={f.id} className="text-neutral-600">{f.label}: {p.extra[f.id]}</p>)}
        </div>
      </div>

      {/* Təchizatçı qiymətləri */}
      <section className="rounded-xl bg-white p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Təchizatçı qiymətləri</h3>
            <p className="text-xs text-neutral-500">Müqayisə manatla, ƏDV-siz, çatdırılma haqqı saya bölünərək aparılır. Minimum sifarişi ödəməyən və ya köhnəlmiş qiymətlər seçilmir.</p>
          </div>
          <form className="flex items-end gap-2">
            <label><span className={costLabel}>Say</span><input name="qty" type="number" min={1} defaultValue={qty} className={`${costInput} w-28`} /></label>
            <button className="rounded-md bg-[#1b1d1f] px-3 py-2 text-sm font-semibold text-white">Yoxla</button>
          </form>
        </div>
        {winner && (
          <p className="mb-3 rounded-lg bg-[#ff5a1f]/10 px-3 py-2 text-sm">
            <b>{qty} {winner.offer.priceUnit}</b> üçün ən ucuz uyğun təchizatçı: <b>{winner.offer.supplier}</b>, vahid maya <b>{money(winner.effAZN, 3)} ₼</b>, cəmi <b>{money(winner.effAZN * qty)} ₼</b>{winner.offer.leadDays != null && `, ${winner.offer.leadDays} günə hazır`}.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="text-left text-xs text-neutral-500">
              <tr><th className="py-2 pr-3">Təchizatçı</th><th className="pr-3">Alış qiyməti</th><th className="pr-3">Miqdara görə</th><th className="pr-3">Min.</th><th className="pr-3">Çatdırılma</th><th className="pr-3">Hazırlanma</th><th className="pr-3 text-right">Bu sayda (AZN)</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] align-top">
              {ranked.map((r) => {
                const o = r.offer;
                const win = winner?.offer.id === o.id;
                return (
                  <tr key={o.id} className={!suitable(r) ? "text-neutral-400" : ""}>
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/suppliers/${o.supplierId}`} className="font-semibold hover:underline">{o.supplier}</Link>
                      {win && <span className="ml-2 rounded bg-[#ff5a1f] px-1.5 py-0.5 text-[10px] font-bold text-white">ƏN UCUZ</span>}
                      <span className="block text-xs">{[o.priceDate && `tarix ${o.priceDate}`, o.vatIncluded && "ƏDV daxil", r.expired && "köhnəlib", o.note].filter(Boolean).join(" · ")}</span>
                    </td>
                    <td className="pr-3">{money(o.unitPrice, 3)} {o.currency}<span className="block text-xs text-neutral-500">/ {o.priceUnit}</span></td>
                    <td className="pr-3 text-xs">{Object.entries(o.tiers).sort((a, b) => Number(a[0]) - Number(b[0])).map(([q, v]) => <span key={q} className="mr-2 inline-block">{tierLabel(Number(q))}+: {money(v, 3)}</span>)}{!Object.keys(o.tiers).length && "—"}</td>
                    <td className="pr-3">{o.minOrder ?? "—"}{r.belowMin && <span className="block text-xs text-[#c42b0d]">say azdır</span>}</td>
                    <td className="pr-3">{o.deliveryFee ? `${money(o.deliveryFee)} ${o.currency}` : "—"}</td>
                    <td className="pr-3">{o.leadDays != null ? `${o.leadDays} gün` : "—"}</td>
                    <td className={`pr-3 text-right ${win ? "font-bold text-[#c2410c]" : ""}`}>{money(r.effAZN, 3)}</td>
                    <td className="pl-2 text-right">
                      <details className="relative inline-block text-left">
                        <summary className="cursor-pointer text-xs font-semibold text-neutral-600 hover:text-foreground">Redaktə</summary>
                        <div className="absolute right-0 z-20 mt-2 w-[36rem] max-w-[90vw] rounded-xl bg-white p-4 text-foreground shadow-xl ring-1 ring-[var(--line)]">
                          <p className="mb-2 font-semibold">{o.supplier}</p>
                          <form action={saveOffer} className="space-y-3">
                            <input type="hidden" name="product_id" value={p.id} />
                            <OfferFields offer={o} suppliers={sList} fixedSupplier />
                            <button className="w-full rounded-md bg-[#ff5a1f] px-4 py-2 text-sm font-bold text-white">Saxla</button>
                          </form>
                          <form action={deleteOffer} className="mt-2 text-center">
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="product_id" value={p.id} />
                            <ConfirmButton message={`${o.supplier} qiyməti silinsin?`} className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Bu qiyməti sil</ConfirmButton>
                          </form>
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!own.length && <p className="py-4 text-sm text-neutral-500">Hələ qiymət yoxdur.</p>}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl bg-white p-5 ring-2 ring-[#ff5a1f]/30">
          <h3 className="mb-3 font-bold">Başqa təchizatçının qiymətini əlavə et</h3>
          <form action={saveOffer} className="space-y-3">
            <input type="hidden" name="product_id" value={p.id} />
            <OfferFields suppliers={sList.filter((s) => !used.has(s.id))} />
            <button className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">Qiyməti əlavə et</button>
          </form>
        </section>

        <section id="sayt" className="scroll-mt-6 rounded-xl bg-white p-5">
          <h3 className="font-bold">{site ? "Saytdakı məhsulu yenilə" : "Saytda göstər"}</h3>
          <p className="mb-3 text-xs text-neutral-500">Saytdakı qiymət hər sayda ən ucuz uyğun maya + marja kimi hesablanır.</p>
          {site && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-[var(--surface)] p-2">
              {site.image && <img src={site.image} alt="" className="h-12 w-12 rounded object-cover" />}
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">{site.name}</p>
                <p className="text-xs text-neutral-500">{site.active ? "Saytda görünür" : "Gizlidir"} · <a href={`/mehsul/${site.slug}`} target="_blank" className="underline">saytda bax</a></p>
              </div>
            </div>
          )}
          {preview.length > 0 && (
            <p className="mb-3 text-xs text-neutral-600">30% marja ilə nümunə: {preview.slice(0, 6).map((t) => `${tierLabel(t.minQty)}+: ${money(t.unitPrice)} ₼`).join(" · ")}</p>
          )}
          <form action={publishToSite} className="space-y-3">
            <input type="hidden" name="id" value={p.id} />
            <label className="block"><span className={costLabel}>Saytdakı ad</span><input name="site_name" defaultValue={site?.name ?? p.name} className={costInput} /></label>
            <label className="block"><span className={costLabel}>Saytda kateqoriya *</span>
              <select name="category_id" defaultValue={site?.category_id ?? ""} className={costInput}>
                <option value="">Seçin</option>
                {(siteCats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block"><span className={costLabel}>Marja, %</span><input name="margin" inputMode="decimal" defaultValue="30" className={costInput} /></label>
            <label className="block"><span className={costLabel}>Açıqlama (boş qalsa məhsulun açıqlaması)</span><textarea name="site_description" rows={3} defaultValue={p.description} className={costInput} /></label>
            <label className="block"><span className={costLabel}>Şəkil {site ? "(dəyişmək üçün)" : "*"}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={site ? site.active : true} /> Saytda görünsün</label>
            <button className="w-full rounded-md bg-[#1b1d1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-black">{site ? "Saytda yenilə" : "Saytda göstər"}</button>
          </form>
        </section>
      </div>

      <details className="rounded-xl bg-white p-5">
        <summary className="cursor-pointer font-bold">Məhsul məlumatını redaktə et</summary>
        <div className="mt-4">
          <CostProductForm action={updateCostProduct} product={p} categories={categories} fields={fields} suppliers={sList} />
          <form action={deleteCostProduct} className="mt-4">
            <input type="hidden" name="id" value={p.id} />
            <ConfirmButton message="Məhsul və bütün qiymətləri silinsin? (Saytdakı məhsula toxunulmur)" className="text-sm font-semibold text-neutral-500 hover:text-[#c42b0d]">Məhsulu sil</ConfirmButton>
          </form>
        </div>
      </details>
    </div>
  );
}

export const instant = false;
