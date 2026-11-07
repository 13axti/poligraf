"use client";

import { useMemo, useState } from "react";
import type { Product, PriceResult } from "@/lib/types";
import { calculatePrice, AZN, AZNu, variantGroups, DEFAULT_GROUP } from "@/lib/pricing";

export interface CalcSelection {
  result: PriceResult;
  quantity?: number;
  widthCm?: number;
  heightCm?: number;
  variantId?: string;       // köhnə: tək variant
  variantName?: string;     // seçimlərin qısa yazısı: "Ölçü: A5 · Kağız: 170 gsm"
  variantIds?: string[];    // hər qrupdan seçilən
  calcNote?: string;        // kalkulyatordakı "Qeydlər"
}

const chip = (on: boolean) =>
  `rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition ${on ? "border-brand bg-brand/10 text-foreground" : "border-transparent bg-card hover:border-brand/40"}`;

/** Seçimin altında müştəriyə göstərilən qısa qeyd: sabit əlavə (çatdırılma, dizayn) və hazırlanma günü */
function effect(v: { fixed?: number; days?: number }) {
  const parts: string[] = [];
  if (v.fixed) parts.push(v.fixed > 0 ? `+${AZN(v.fixed)}` : AZN(v.fixed));
  if (v.days) parts.push(`${v.days} iş günü`);
  return parts.join(" · ");
}

export function PriceCalculator({ product, onOrder }: { product: Product; onOrder: (sel: CalcSelection) => void }) {
  const isPerUnit = product.pricingModel === "per_unit";
  const tiers = [...(product.priceTiers ?? [])].sort((a, b) => a.minQty - b.minQty);
  const groups = useMemo(() => variantGroups(product.variants), [product.variants]);

  const [quantity, setQuantity] = useState<number>(tiers[0]?.minQty ?? product.minOrderQty ?? 1);
  const [custom, setCustom] = useState(false);
  const [widthCm, setWidthCm] = useState<number>(product.minWidthCm ?? 100);
  const [heightCm, setHeightCm] = useState<number>(product.minHeightCm ?? 100);
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(groups.map((g) => [g.name, g.items[0].id])));
  const [note, setNote] = useState("");

  const selected = groups.map((g) => g.items.find((v) => v.id === picked[g.name]) ?? g.items[0]);
  const result = useMemo(
    () => calculatePrice(product, { quantity, widthCm, heightCm, selected }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, quantity, widthCm, heightCm, JSON.stringify(picked)]
  );
  const summary = selected.map((v) => (groupsLen(groups) ? `${v.group?.trim() || DEFAULT_GROUP}: ${v.name}` : v.name)).join(" · ");

  return (
    <div className="rounded-[2rem] bg-surface p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold tracking-tight">Qiymət hesabla</h2>

      {/* Ölçü kimi əsas seçimlər tirajdan əvvəl, qalanları sonra (print.az ardıcıllığı) */}
      {groups.slice(0, 1).map((g) => <Group key={g.name} g={g} picked={picked[g.name]} onPick={(id) => setPicked({ ...picked, [g.name]: id })} />)}

      {isPerUnit ? (
        <div className="mt-6">
          <p className="mb-2 text-sm font-bold">Tiraj{product.minOrderQty ? <span className="font-medium text-neutral-500"> · min. {product.minOrderQty}</span> : null}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {tiers.map((t) => (
              <button key={t.minQty} type="button" onClick={() => { setQuantity(t.minQty); setCustom(false); }} className={chip(!custom && quantity === t.minQty)}>
                {t.minQty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                <span className="block text-xs font-medium text-neutral-500">{AZNu(calculatePrice(product, { quantity: t.minQty, selected }).unitPrice ?? t.unitPrice)}/əd</span>
              </button>
            ))}
            <button type="button" onClick={() => setCustom(true)} className={chip(custom)}>
              Başqa say
              <span className="block text-xs font-medium text-neutral-500">özün yaz</span>
            </button>
          </div>
          {custom && (
            <input type="number" min={product.minOrderQty ?? 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} autoFocus
              className="mt-2 w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand" />
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {([["En (sm)", widthCm, setWidthCm, product.minWidthCm], ["Hündürlük (sm)", heightCm, setHeightCm, product.minHeightCm]] as const).map(([l, v, set, min]) => (
            <label key={l}>
              <span className="mb-2 block text-sm font-bold">{l}</span>
              <input type="number" min={min ?? 1} value={v} onChange={(e) => set(Number(e.target.value))}
                className="w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand" />
            </label>
          ))}
        </div>
      )}

      {groups.slice(1).map((g) => <Group key={g.name} g={g} picked={picked[g.name]} onPick={(id) => setPicked({ ...picked, [g.name]: id })} />)}

      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-bold">Qeydlər</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Mətn, rəng, yerləşdirmə və ya digər xüsusi istəkləriniz"
          className="w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 text-sm outline-none transition focus:border-brand" />
      </label>

      {/* Yekun */}
      <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#241609] to-[#150e07] p-5 text-white ring-1 ring-brand/25">
        <p className="text-xs font-bold uppercase tracking-widest text-white/50">Yekun məbləğ</p>
        <div className="mt-1 text-4xl font-extrabold tracking-tight text-[#ffb27a]">{result.total > 0 ? AZN(result.total) : "—"}</div>
        <div className="mt-3 space-y-1 text-sm text-white/75">
          {result.unitPrice != null && result.quantity ? <p className="flex justify-between"><span>{result.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ədəd × {AZNu(result.unitPrice)}</span><span>{AZN(result.unitPrice * result.quantity)}</span></p> : <p>{result.breakdown}</p>}
          {selected.filter((v) => v.fixed).map((v) => <p key={v.id} className="flex justify-between"><span>{v.name}</span><span>{AZN(v.fixed!)}</span></p>)}
          {result.days ? <p className="flex justify-between border-t border-white/10 pt-1"><span>Hazırlanma müddəti</span><span>{result.days} iş günü</span></p> : null}
        </div>
        {result.total <= 0 && <p className="mt-2 text-sm text-[#ffb27a]">{result.breakdown}</p>}
      </div>

      <button
        disabled={result.total <= 0}
        onClick={() => onOrder({
          result, quantity: isPerUnit ? quantity : undefined, widthCm: isPerUnit ? undefined : widthCm, heightCm: isPerUnit ? undefined : heightCm,
          variantIds: selected.map((v) => v.id), variantId: selected[0]?.id, variantName: summary || undefined, calcNote: note.trim() || undefined,
        })}
        className="mt-4 w-full rounded-full bg-brand px-4 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        Sifariş et
      </button>
    </div>
  );
}

const groupsLen = (g: unknown[]) => g.length > 1 || (g as { name: string }[])[0]?.name !== DEFAULT_GROUP;

function Group({ g, picked, onPick }: { g: { name: string; items: Product["variants"] & object }; picked?: string; onPick: (id: string) => void }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-bold">{g.name}</p>
      <div className={`grid gap-2 ${g.items.length > 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
        {g.items.map((v) => (
          <button key={v.id} type="button" onClick={() => onPick(v.id)} className={chip((picked ?? g.items[0].id) === v.id)}>
            {v.name}
            {effect(v) && <span className="block text-xs font-medium text-neutral-500">{effect(v)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
