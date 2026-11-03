import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AddMenu, COST_LINKS, CostHeader, CostTablesMissing, costInput } from "@/components/admin/CostHeader";
import { requireAdmin } from "@/lib/admin-auth";
import { bestOffer, money, normName, offersFor, suitable, today } from "@/lib/costs";
import { loadCosts, sizeText } from "@/lib/costs-server";
import { deleteCostProduct } from "../../cost-actions";

type SP = { q?: string; cat?: string; sub?: string; sup?: string; qty?: string; site?: string; msg?: string };

export default async function CostsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, products, offers, suppliers, categories, rates } = await loadCosts(supabase);
  const header = (
    <CostHeader
      sub="Təchizatçılardan alınan maya qiymətləri. Eyni məhsula bir neçə təchizatçının qiyməti yazılır, sistem sayına görə ən ucuz uyğun təchizatçını seçir. Yalnız admin görür."
      msg={sp.msg}
      links={COST_LINKS}
      action={<AddMenu label="+ Məhsul əlavə et" items={[{ href: "/admin/costs/new", label: "Manual", hint: "Formanı doldurub bir məhsul əlavə edin" }, { href: "/admin/costs/import", label: "Excel Import", hint: "Standart şablonla çoxlu məhsul" }]} />}
    />
  );
  if (error) return <div className="space-y-4">{header}<CostTablesMissing /></div>;

  const day = today();
  const qty = Math.max(1, Number(sp.qty) || 0);
  const mains = categories.filter((c) => !c.parentId);
  const subs = categories.filter((c) => c.parentId && (!sp.cat || c.parentId === sp.cat));
  const byProduct = new Map<string, typeof offers>();
  for (const o of offers) byProduct.set(o.productId, [...(byProduct.get(o.productId) ?? []), o]);
  const term = normName(sp.q ?? "");
  const list = products.filter((p) => {
    const own = byProduct.get(p.id) ?? [];
    if (sp.cat && p.categoryId !== sp.cat) return false;
    if (sp.sub && p.subcategoryId !== sp.sub) return false;
    if (sp.sup && !own.some((o) => o.supplierId === sp.sup)) return false;
    if (sp.site === "1" && !p.siteProductId) return false;
    if (sp.site === "0" && p.siteProductId) return false;
    return !term || normName(`${p.code ?? ""} ${p.name} ${p.material} ${p.specs} ${p.category} ${p.subcategory}`).includes(term);
  });

  return (
    <div className="space-y-5">
      {header}
      <form className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-3">
        <input name="q" defaultValue={sp.q} placeholder="Axtar: ad, kod, material" className={`${costInput} max-w-xs`} />
        <select name="cat" defaultValue={sp.cat ?? ""} className={`${costInput} max-w-[11rem]`}><option value="">Kateqoriya: hamısı</option>{mains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="sub" defaultValue={sp.sub ?? ""} className={`${costInput} max-w-[11rem]`}><option value="">Alt kateqoriya</option>{subs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="sup" defaultValue={sp.sup ?? ""} className={`${costInput} max-w-[11rem]`}><option value="">Təchizatçı: hamısı</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select name="site" defaultValue={sp.site ?? ""} className={`${costInput} max-w-[9rem]`}><option value="">Sayt: hamısı</option><option value="1">Saytda</option><option value="0">Saytda deyil</option></select>
        <label className="flex items-center gap-1 text-sm text-neutral-600">Say <input name="qty" type="number" min={1} defaultValue={sp.qty ?? ""} placeholder="min." className={`${costInput} w-20`} /></label>
        <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Göstər</button>
        {(sp.q || sp.cat || sp.sub || sp.sup || sp.site || sp.qty) && <Link href="/admin/costs" className="px-2 py-2 text-sm font-semibold text-neutral-500 underline">Təmizlə</Link>}
      </form>
      <p className="text-sm text-neutral-500">{list.length} / {products.length} məhsul · qiymət {qty > 1 ? `${qty} ədəd üçün` : "hər təchizatçının minimum sifarişi üçün"}, manatla, ƏDV-siz.</p>

      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[60rem] text-sm">
          <thead className="border-b border-[var(--line)] text-left text-xs text-neutral-500">
            <tr><th className="px-4 py-3">Kod</th><th>Məhsul</th><th>Kateqoriya</th><th>Ən ucuz təchizatçı</th><th className="text-right">Alış (AZN)</th><th className="text-center">Təch.</th><th className="px-4 text-right">Əməliyyat</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {list.map((p) => {
              const own = byProduct.get(p.id) ?? [];
              const q = qty > 1 ? qty : Math.min(...own.map((o) => o.minOrder ?? 1), Infinity);
              const best = own.length ? (qty > 1 ? offersFor(own, q, rates, day).find(suitable) ?? bestOffer(own, q, rates, day) : bestOffer(own, Number.isFinite(q) ? q : 1, rates, day)) : null;
              return (
                <tr key={p.id} className="align-top hover:bg-[var(--surface)]/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-neutral-600">{p.code ?? "—"}</td>
                  <td className="py-3 pr-3">
                    <Link href={`/admin/costs/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
                    <span className="block text-xs text-neutral-500">{[p.material, sizeText(p)].filter(Boolean).join(" · ")}</span>
                  </td>
                  <td className="py-3 pr-3 text-neutral-600">{p.category || "—"}{p.subcategory && <span className="block text-xs text-neutral-500">{p.subcategory}</span>}</td>
                  <td className="py-3 pr-3">
                    {best ? (
                      <>
                        <span className="font-semibold">{best.offer.supplier}</span>
                        <span className="block text-xs text-neutral-500">
                          {best.offer.minOrder ? `min. ${best.offer.minOrder} ${best.offer.priceUnit}` : best.offer.priceUnit}
                          {best.offer.leadDays != null ? ` · ${best.offer.leadDays} gün` : ""}{best.belowMin ? " · say azdır" : ""}{best.expired ? " · köhnə" : ""}
                        </span>
                      </>
                    ) : <span className="text-xs text-neutral-400">qiymət yoxdur</span>}
                  </td>
                  <td className="py-3 pr-3 text-right font-semibold">{best ? money(best.effAZN, 3) : "—"}{best && best.offer.currency !== "AZN" && <span className="block text-xs font-normal text-neutral-500">{money(best.price, 3)} {best.offer.currency}</span>}</td>
                  <td className="py-3 text-center text-neutral-600">{own.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Link href={`/admin/costs/${p.id}#sayt`} className={`rounded px-2 py-1 text-xs font-semibold ${p.siteProductId ? "bg-[#1f7a3a]/10 text-[#1f7a3a]" : "bg-[#ff5a1f] text-white"}`}>{p.siteProductId ? "Saytda ✓" : "Saytda göstər"}</Link>
                      <Link href={`/admin/costs/${p.id}`} className="rounded bg-[var(--surface)] px-2 py-1 text-xs font-semibold">Redaktə</Link>
                      <form action={deleteCostProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message={`"${p.name}" və bütün qiymətləri silinsin?`} className="rounded px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!list.length && <p className="px-5 py-10 text-center text-neutral-500">Heç nə tapılmadı.</p>}
      </div>
    </div>
  );
}

export const instant = false;
