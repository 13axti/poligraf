"use client";

import { useState } from "react";
import { CURRENCIES, PRICE_UNITS, QTY_PRESETS, tierLabel, today, type CostOffer } from "@/lib/costs";

export const inp = "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[#0066ff]";
export const lbl = "mb-1 block text-xs font-semibold text-neutral-500";

/** Təchizatçı qiyməti xanaları: alış qiyməti, valyuta, vahid, minimum, miqdara görə qiymətlər, ƏDV, çatdırılma, hazırlanma, tarix, qeyd */
export function OfferFields({ offer, suppliers, fixedSupplier }: { offer?: CostOffer; suppliers: { id: string; name: string }[]; fixedSupplier?: boolean }) {
  const init = offer ? Object.entries(offer.tiers).map(([q, p]) => ({ qty: q, price: String(p).replace(".", ",") })).sort((a, b) => Number(a.qty) - Number(b.qty)) : [];
  const [tiers, setTiers] = useState<{ qty: string; price: string }[]>(init);
  const set = (i: number, k: "qty" | "price", v: string) => setTiers((t) => t.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  return (
    <div className="space-y-3">
      {fixedSupplier && offer ? (
        <input type="hidden" name="supplier_id" value={offer.supplierId} />
      ) : (
        <label className="block"><span className={lbl}>Şirkət / Təchizatçı *</span>
          <select name="supplier_id" required defaultValue={offer?.supplierId ?? ""} className={inp}>
            <option value="">Seçin</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <a href="/admin/suppliers?new=1" target="_blank" className="mt-1 inline-block text-xs font-semibold text-[#0047b3] underline">+ Yeni təchizatçı əlavə et</a>
        </label>
      )}
      <div className="grid gap-2 sm:grid-cols-4">
        <label><span className={lbl}>Alış qiyməti *</span><input name="unit_price" required inputMode="decimal" defaultValue={offer ? String(offer.unitPrice).replace(".", ",") : ""} className={inp} placeholder="0,60" /></label>
        <label><span className={lbl}>Valyuta *</span>
          <select name="currency" defaultValue={offer?.currency ?? "AZN"} className={inp}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label><span className={lbl}>Qiymət vahidi *</span>
          <input name="price_unit" list="price-units" defaultValue={offer?.priceUnit ?? "ədəd"} className={inp} />
          <datalist id="price-units">{PRICE_UNITS.map((u) => <option key={u} value={u} />)}</datalist>
        </label>
        <label><span className={lbl}>Minimum sifariş</span><input name="min_order" type="number" min={1} defaultValue={offer?.minOrder ?? ""} className={inp} placeholder="10" /></label>
      </div>

      <div className="rounded-lg bg-[var(--surface)] p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-neutral-600">Miqdara görə qiymətlər (saydan başlayaraq vahid qiymət)</span>
          <span className="flex gap-2">
            <button type="button" onClick={() => setTiers(QTY_PRESETS.map((q) => ({ qty: String(q), price: tiers.find((t) => t.qty === String(q))?.price ?? "" })))} className="rounded bg-white px-2 py-1 text-xs font-semibold">Standart saylar</button>
            <button type="button" onClick={() => setTiers((t) => [...t, { qty: "", price: "" }])} className="rounded bg-white px-2 py-1 text-xs font-semibold">+ Pillə</button>
          </span>
        </div>
        <input type="hidden" name="tiers" value={JSON.stringify(tiers.filter((t) => t.qty && t.price))} />
        {tiers.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((t, i) => (
              <div key={i} className="flex items-center gap-1">
                <input value={t.qty} onChange={(e) => set(i, "qty", e.target.value.replace(/\D/g, ""))} className={`${inp} w-20 px-2`} placeholder="say" title={t.qty === "2001" ? "2000-dən çox" : ""} />
                <span className="text-xs text-neutral-500">{t.qty === "2001" ? "(2000+)" : "+"}</span>
                <input value={t.price} inputMode="decimal" onChange={(e) => set(i, "price", e.target.value)} className={`${inp} px-2`} placeholder="qiymət" />
                <button type="button" onClick={() => setTiers((x) => x.filter((_, j) => j !== i))} className="px-1 text-neutral-400 hover:text-[#c42b0d]" aria-label="Sil">✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">Pillə yoxdur: hər say üçün alış qiyməti götürülür. Məsələn 10+: 0,60 · 50+: 0,47 · 100+: 0,40 · {tierLabel(2001)}: ...</p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" name="vat_included" defaultChecked={offer?.vatIncluded} /> Qiymətə ƏDV daxildir</label>
        <label><span className={lbl}>Çatdırılma haqqı (cəmi)</span><input name="delivery_fee" inputMode="decimal" defaultValue={offer?.deliveryFee ? String(offer.deliveryFee).replace(".", ",") : ""} className={inp} placeholder="0" /></label>
        <label><span className={lbl}>Hazırlanma müddəti (gün)</span><input name="lead_days" type="number" min={0} defaultValue={offer?.leadDays ?? ""} className={inp} /></label>
        <label><span className={lbl}>Qiymət tarixi</span><input name="price_date" type="date" defaultValue={offer?.priceDate ?? today()} className={inp} /></label>
      </div>
      <label className="block"><span className={lbl}>Qeyd</span><input name="note" defaultValue={offer?.note ?? ""} className={inp} placeholder="Ödəniş şərti, xüsusi şərtlər" /></label>
    </div>
  );
}
