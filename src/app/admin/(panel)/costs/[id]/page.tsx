/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { requireAdmin } from "@/lib/admin-auth";
import { cheapestByTier, expired, money, TIERS, tierLabel, today, type CostOffer } from "@/lib/costs";
import { loadCosts } from "@/lib/costs-server";
import { deleteCostProduct, deleteOffer, publishToSite, saveCostProduct, saveOffer } from "../../../cost-actions";

function OfferForm({ productId, offer, suppliers }: { productId: string; offer?: CostOffer; suppliers: { name: string; leadDays: number | null }[] }) {
  return (
    <form action={saveOffer} className="space-y-3">
      <input type="hidden" name="product_id" value={productId} />
      {offer ? (
        <input type="hidden" name="supplier" value={offer.supplier} />
      ) : (
        <label className="block"><span className={costLabel}>Təchizatçı *</span>
          <input name="supplier" required list="cost-suppliers" className={costInput} placeholder="Siyahıdan seçin və ya yeni ad yazın" />
          <datalist id="cost-suppliers">{suppliers.map((x) => <option key={x.name} value={x.name} />)}</datalist>
        </label>
      )}
      <div>
        <span className={costLabel}>Vahid qiymət (₼), sayına görə. Boş qoyulan pillə satılmır.</span>
        <div className="grid grid-cols-4 gap-2">
          {TIERS.map((t) => (
            <label key={t} className="text-xs font-semibold text-neutral-500">{tierLabel(t)} əd.
              <input name={`t_${t}`} inputMode="decimal" defaultValue={offer?.tiers[String(t)] != null ? String(offer.tiers[String(t)]).replace(".", ",") : ""} className={`${costInput} mt-0.5 px-2`} placeholder="—" />
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label><span className={costLabel}>Hazırlanma (gün)</span><input name="lead_days" type="number" min={0} defaultValue={offer?.leadDays ?? ""} className={costInput} /></label>
        <label><span className={costLabel}>Etibarlıdır (tarixə qədər)</span><input name="valid_until" type="date" defaultValue={offer?.validUntil ?? ""} className={costInput} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="vat_included" defaultChecked={offer?.vatIncluded} /> Qiymətlərə ƏDV daxildir</label>
      <label className="block"><span className={costLabel}>Qeyd</span><input name="note" defaultValue={offer?.note ?? ""} className={costInput} placeholder="WhatsApp ilə göndərib, ödəniş 50/50" /></label>
      <button className="w-full rounded-md bg-[#ff5a1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">{offer ? "Yadda saxla" : "Təklifi əlavə et"}</button>
    </form>
  );
}

export default async function CostProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { error, products, offers, suppliers } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;
  const p = products.find((x) => x.id === id);
  if (!p) notFound();

  const day = today();
  const own = offers.filter((x) => x.productId === id).sort((a, b) => a.supplier.localeCompare(b.supplier));
  const cheap = cheapestByTier(own, day);
  const cats = Array.from(new Set(products.map((x) => x.category).filter(Boolean)));
  const [{ data: siteCats }, { data: site }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    p.siteProductId ? supabase.from("products").select("id, slug, name, image, active, category_id, description").eq("id", p.siteProductId).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="space-y-6">
      <CostHeader msg={sp.msg} />
      <Link href="/admin/costs" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">Bütün məhsullar</Link>

      <div className="flex flex-wrap items-start gap-4">
        <div className="rounded-lg bg-[#1b1d1f] px-3 py-2 text-center text-white" title="Kod avtomatik verilib və dəyişmir">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Kod 🔒</p>
          <p className="font-mono text-xl font-bold tracking-widest">{p.code ?? "—"}</p>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold">{p.name}</h2>
          <p className="text-sm text-neutral-600">{[p.category, p.unit].filter(Boolean).join(" · ")}</p>
          {p.description && <p className="mt-1 max-w-3xl text-sm">{p.description}</p>}
          <p className="mt-1 text-sm text-neutral-600">{[p.material && `Material: ${p.material}`, p.size && `Ölçü: ${p.size}`, p.color && `Rənglər: ${p.color}`, p.spec].filter(Boolean).join(" · ")}</p>
        </div>
      </div>

      {/* Müqayisə cədvəli */}
      <section className="rounded-xl bg-white p-5">
        <h3 className="mb-1 text-lg font-bold">Təchizatçı qiymətləri (₼ / {p.unit})</h3>
        <p className="mb-3 text-xs text-neutral-500">Hər sütunda ən ucuz qiymət narıncıdır. ƏDV daxil yazılan qiymətlər müqayisədə ƏDV-siz hesablanır.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="text-left text-xs text-neutral-500">
              <tr>
                <th className="py-2 pr-3">Təchizatçı</th>
                {TIERS.map((t) => <th key={t} className="px-1 text-right">{tierLabel(t)}</th>)}
                <th className="px-2 text-right">Hazırlanma</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              <tr className="bg-[var(--surface)]/60 font-semibold">
                <td className="py-2 pr-3">Ən ucuz maya</td>
                {cheap.map((c) => <td key={c.tier} className="px-1 text-right">{c.best ? money(c.best.net, 3) : "—"}</td>)}
                <td /><td />
              </tr>
              {own.map((o) => {
                const old = expired(o, day);
                return (
                  <tr key={o.id} className={old ? "text-neutral-400" : ""}>
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{o.supplier}</span>
                      <span className="block text-xs text-neutral-500">{o.vatIncluded ? "ƏDV daxil · " : ""}{old ? "vaxtı keçib · " : ""}{o.updatedAt.slice(0, 10)}{o.note ? ` · ${o.note}` : ""}</span>
                    </td>
                    {TIERS.map((t) => {
                      const v = o.tiers[String(t)];
                      const best = !old && cheap.find((c) => c.tier === t)?.best?.offer.id === o.id;
                      return <td key={t} className={`px-1 text-right ${best ? "font-bold text-[#c2410c]" : ""}`}>{v != null ? money(v, 3) : "—"}</td>;
                    })}
                    <td className="px-2 text-right">{o.leadDays != null ? `${o.leadDays} gün` : "—"}</td>
                    <td className="pl-2 text-right">
                      <details className="relative inline-block text-left">
                        <summary className="cursor-pointer text-xs font-semibold text-neutral-600 hover:text-foreground">Redaktə</summary>
                        <div className="absolute right-0 z-20 mt-2 w-96 rounded-xl bg-white p-4 shadow-xl ring-1 ring-[var(--line)]">
                          <OfferForm productId={p.id} offer={o} suppliers={suppliers} />
                          <form action={deleteOffer} className="mt-2 text-center">
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="product_id" value={p.id} />
                            <ConfirmButton message={`${o.supplier} təklifi silinsin?`} className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Təklifi sil</ConfirmButton>
                          </form>
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!own.length && <p className="py-4 text-sm text-neutral-500">Hələ təklif yoxdur. Aşağıdakı formadan əlavə edin.</p>}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-5 ring-2 ring-[#ff5a1f]/40">
          <h3 className="mb-3 font-bold">Yeni təchizatçı təklifi</h3>
          <OfferForm productId={p.id} suppliers={suppliers} />
        </section>

        {/* Sayta göndər */}
        <section className="rounded-xl bg-white p-5">
          <h3 className="font-bold">{site ? "Saytdakı məhsulu yenilə" : "Sayta göndər"}</h3>
          <p className="mb-3 text-xs text-neutral-500">Saytdakı qiymət hər say pilləsində ən ucuz maya + marja kimi hesablanır.</p>
          {site && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-[var(--surface)] p-2">
              {site.image && <img src={site.image} alt="" className="h-12 w-12 rounded object-cover" />}
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">{site.name}</p>
                <p className="text-xs text-neutral-500">{site.active ? "Saytda görünür" : "Gizlidir"} · <a href={`/mehsul/${site.slug}`} target="_blank" className="underline">bax</a></p>
              </div>
            </div>
          )}
          <form action={publishToSite} className="space-y-3">
            <input type="hidden" name="id" value={p.id} />
            <label className="block"><span className={costLabel}>Saytdakı ad</span><input name="site_name" defaultValue={site?.name ?? p.name} className={costInput} /></label>
            <label className="block"><span className={costLabel}>Kateqoriya (saytda)</span>
              <select name="category_id" defaultValue={site?.category_id ?? ""} className={costInput}>
                <option value="">Seçin</option>
                {(siteCats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block"><span className={costLabel}>Marja, %</span><input name="margin" inputMode="decimal" defaultValue="30" className={costInput} /></label>
            <label className="block"><span className={costLabel}>Saytdakı təsvir (boş qalsa bazadakı)</span><textarea name="site_description" rows={2} className={costInput} /></label>
            <label className="block"><span className={costLabel}>Şəkil {site ? "(dəyişmək üçün)" : "*"}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={site ? site.active : true} /> Saytda görünsün</label>
            <button className="w-full rounded-md bg-[#1b1d1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-black">{site ? "Saytda yenilə" : "Sayta göndər"}</button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5">
          <h3 className="mb-3 font-bold">Məhsul məlumatı</h3>
          <form action={saveCostProduct} className="space-y-3">
            <input type="hidden" name="id" value={p.id} />
            <label className="block"><span className={costLabel}>Ad (model)</span><input name="name" defaultValue={p.name} className={costInput} /></label>
            <div className="grid grid-cols-2 gap-2">
              <label><span className={costLabel}>Kateqoriya</span>
                <input name="category" defaultValue={p.category} list="cost-cats2" className={costInput} />
                <datalist id="cost-cats2">{cats.map((c) => <option key={c} value={c} />)}</datalist>
              </label>
              <label><span className={costLabel}>Vahid</span><input name="unit" defaultValue={p.unit} className={costInput} /></label>
            </div>
            <label className="block"><span className={costLabel}>Təsvir</span><textarea name="description" rows={3} defaultValue={p.description} className={costInput} /></label>
            <label className="block"><span className={costLabel}>Material</span><input name="material" defaultValue={p.material} className={costInput} /></label>
            <div className="grid grid-cols-2 gap-2">
              <label><span className={costLabel}>Ölçü</span><input name="size" defaultValue={p.size} className={costInput} /></label>
              <label><span className={costLabel}>Rənglər</span><input name="color" defaultValue={p.color} className={costInput} /></label>
            </div>
            <label className="block"><span className={costLabel}>Çap / əlavə məlumat</span><input name="spec" defaultValue={p.spec} className={costInput} /></label>
            <button className="w-full rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Saxla</button>
          </form>
          <form action={deleteCostProduct} className="mt-3">
            <input type="hidden" name="id" value={p.id} />
            <ConfirmButton message="Məhsul və bütün təklifləri silinsin? (Saytdakı məhsula toxunulmur)" className="text-sm font-semibold text-neutral-500 hover:text-[#c42b0d]">Məhsulu sil</ConfirmButton>
          </form>
        </section>
      </div>
    </div>
  );
}

export const instant = false;
