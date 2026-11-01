import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { loadCosts } from "@/lib/costs-server";
import { money, offersFor, today } from "@/lib/costs";
import { CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { saveCostProduct } from "../../cost-actions";

type SP = { q?: string; cat?: string; msg?: string };

export default async function CostsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, products, prices } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;

  const day = today();
  const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const term = (sp.q ?? "").trim().toLowerCase();
  const list = products.filter(
    (p) => (!sp.cat || p.category === sp.cat) && (!term || `${p.code ?? ""} ${p.name} ${p.spec}`.toLowerCase().includes(term))
  );
  const byProduct = new Map<string, typeof prices>();
  for (const pr of prices) byProduct.set(pr.productId, [...(byProduct.get(pr.productId) ?? []), pr]);
  const withPrice = products.filter((p) => byProduct.has(p.id)).length;

  return (
    <div className="space-y-6">
      <CostHeader msg={sp.msg} />

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-3">
          <form className="flex flex-wrap gap-2">
            <input name="q" defaultValue={sp.q} placeholder="Ad, kod və ya spesifikasiya" className={`${costInput} max-w-sm`} />
            <select name="cat" defaultValue={sp.cat ?? ""} className={`${costInput} max-w-xs`}>
              <option value="">Bütün kateqoriyalar</option>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Axtar</button>
          </form>
          <p className="text-sm text-neutral-500">{products.length} məhsul, {withPrice} məhsulun qiyməti var.</p>

          <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl bg-white">
            {list.map((p) => {
              const own = byProduct.get(p.id) ?? [];
              const q = p.minQty ?? 100;
              const best = offersFor(own, q, day)[0];
              return (
                <Link key={p.id} href={`/admin/costs/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface)]/60">
                  <span className="w-14 shrink-0 font-mono text-xs text-neutral-500">{p.code ?? "—"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name}</span>
                    <span className="block truncate text-xs text-neutral-500">{p.spec || p.category}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm">
                    {best ? (
                      <>
                        <b>{money(best.net, 3)} ₼</b>
                        <span className="block text-xs text-neutral-500">{best.price.supplier} · {q} {p.unit}</span>
                      </>
                    ) : (
                      <span className="text-xs text-neutral-400">qiymət yoxdur</span>
                    )}
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-neutral-500">{own.length ? `${own.length}×` : ""}</span>
                </Link>
              );
            })}
            {!list.length && <p className="px-5 py-10 text-center text-neutral-500">Heç nə tapılmadı.</p>}
          </div>
        </section>

        <aside>
          <form action={saveCostProduct} className="space-y-3 rounded-xl bg-white p-5 lg:sticky lg:top-6">
            <h2 className="font-bold">Yeni məhsul</h2>
            <label className="block"><span className={costLabel}>Ad *</span><input name="name" required className={costInput} placeholder="T-shirt, pambıq, ağ" /></label>
            <div className="grid grid-cols-2 gap-2">
              <label><span className={costLabel}>Kod</span><input name="code" className={costInput} placeholder="PR-030" /></label>
              <label><span className={costLabel}>Vahid</span><input name="unit" defaultValue="ədəd" className={costInput} /></label>
            </div>
            <label className="block"><span className={costLabel}>Kateqoriya</span>
              <input name="category" list="cost-cats" className={costInput} />
              <datalist id="cost-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
            </label>
            <label className="block"><span className={costLabel}>Spesifikasiya</span><textarea name="spec" rows={2} className={costInput} placeholder="180 qr, 100% pambıq, 1 rəng çap" /></label>
            <label className="block"><span className={costLabel}>Tipik min. say</span><input name="min_qty" type="number" min={1} className={costInput} placeholder="100" /></label>
            <button className="w-full rounded-md bg-[#ff5a1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">Əlavə et</button>
          </form>
        </aside>
      </div>
    </div>
  );
}

export const instant = false;
