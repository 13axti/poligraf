import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { loadCosts } from "@/lib/costs-server";
import { MIN_QTY, money, offersFor, today } from "@/lib/costs";
import { CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { saveCostProduct } from "../../cost-actions";

type SP = { q?: string; cat?: string; qty?: string; msg?: string };

export default async function CostsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, products, offers } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;

  const day = today();
  const qty = Math.max(MIN_QTY, Number(sp.qty) || 100);
  const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const term = (sp.q ?? "").trim().toLowerCase();
  const list = products.filter(
    (p) => (!sp.cat || p.category === sp.cat) && (!term || `${p.code ?? ""} ${p.name} ${p.description} ${p.material}`.toLowerCase().includes(term))
  );
  const byProduct = new Map<string, typeof offers>();
  for (const o of offers) byProduct.set(o.productId, [...(byProduct.get(o.productId) ?? []), o]);

  return (
    <div className="space-y-6">
      <CostHeader msg={sp.msg} />

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-3">
          <form className="flex flex-wrap gap-2">
            <input name="q" defaultValue={sp.q} placeholder="Ad, kod, material" className={`${costInput} max-w-xs`} />
            <select name="cat" defaultValue={sp.cat ?? ""} className={`${costInput} max-w-[12rem]`}>
              <option value="">Bütün kateqoriyalar</option>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-1 text-sm text-neutral-600">Say <input name="qty" type="number" min={MIN_QTY} defaultValue={qty} className={`${costInput} w-24`} /></label>
            <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Göstər</button>
          </form>
          <p className="text-sm text-neutral-500">{products.length} məhsul · qiymətlər {qty} ədəd üçün ən ucuz təchizatçıya görə.</p>

          <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl bg-white">
            {list.map((p) => {
              const own = byProduct.get(p.id) ?? [];
              const best = offersFor(own, qty, day)[0];
              return (
                <Link key={p.id} href={`/admin/costs/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface)]/60">
                  <span className="w-14 shrink-0 font-mono text-xs font-semibold text-neutral-600">{p.code ?? "—"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">{p.name}</span>
                      {p.siteProductId && <span className="shrink-0 rounded bg-[#1f7a3a]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#1f7a3a]">saytda</span>}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">{[p.category, p.material, p.size].filter(Boolean).join(" · ") || p.description}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm">
                    {best ? (
                      <>
                        <b>{money(best.net, 3)} ₼</b>
                        <span className="block text-xs text-neutral-500">{best.offer.supplier}{best.offer.leadDays != null ? ` · ${best.offer.leadDays} gün` : ""}</span>
                      </>
                    ) : (
                      <span className="text-xs text-neutral-400">qiymət yoxdur</span>
                    )}
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-neutral-500">{own.length ? `${own.length} təch.` : ""}</span>
                </Link>
              );
            })}
            {!list.length && <p className="px-5 py-10 text-center text-neutral-500">Heç nə tapılmadı.</p>}
          </div>
        </section>

        <aside>
          <form action={saveCostProduct} className="space-y-3 rounded-xl bg-white p-5 lg:sticky lg:top-6">
            <h2 className="font-bold">Yeni məhsul</h2>
            <p className="text-xs text-neutral-500">Kod avtomatik verilir və sonra dəyişmir. Qiymətləri növbəti addımda təchizatçılara görə yazacaqsınız.</p>
            <label className="block"><span className={costLabel}>Ad (model) *</span><input name="name" required className={costInput} placeholder="T-shirt, pambıq, dairəvi yaxa" /></label>
            <div className="grid grid-cols-2 gap-2">
              <label><span className={costLabel}>Kateqoriya</span>
                <input name="category" list="cost-cats" className={costInput} />
                <datalist id="cost-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
              </label>
              <label><span className={costLabel}>Vahid</span><input name="unit" defaultValue="ədəd" className={costInput} /></label>
            </div>
            <label className="block"><span className={costLabel}>Təsvir</span><textarea name="description" rows={3} className={costInput} placeholder="Məhsul haqqında qısa məlumat" /></label>
            <label className="block"><span className={costLabel}>Material</span><input name="material" className={costInput} placeholder="100% pambıq, 180 qr/m²" /></label>
            <div className="grid grid-cols-2 gap-2">
              <label><span className={costLabel}>Ölçü</span><input name="size" className={costInput} placeholder="S–XXL" /></label>
              <label><span className={costLabel}>Rənglər</span><input name="color" className={costInput} placeholder="ağ, qara" /></label>
            </div>
            <label className="block"><span className={costLabel}>Çap / əlavə məlumat</span><input name="spec" className={costInput} placeholder="1 rəng ipək çap, 20×25 sm" /></label>
            <button className="w-full rounded-md bg-[#ff5a1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">Yarat</button>
          </form>
        </aside>
      </div>
    </div>
  );
}

export const instant = false;
