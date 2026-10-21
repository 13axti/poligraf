"use client";

import { useActionState, useState } from "react";
import { saveProductPrice, type ActionState } from "@/app/admin/actions";

export type PriceRowProduct = {
  id: string;
  name: string;
  active: boolean;
  categoryId: string | null;
  model: "per_unit" | "per_sqm";
  tiers: { minQty: number; unitPrice: number }[];
  sqm: number;
  minW: number;
  minH: number;
  minQty: number;
};

const field = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand";

export function PriceRow({ p }: { p: PriceRowProduct }) {
  const [model, setModel] = useState(p.model);
  const [tiers, setTiers] = useState(p.tiers);
  const [state, action, pending] = useActionState<ActionState, FormData>((_, fd) => saveProductPrice(fd), undefined);

  return (
    <form action={action} className="rounded-2xl border border-neutral-200 bg-white p-4">
      <input type="hidden" name="id" value={p.id} />
      <input type="hidden" name="model" value={model} />
      <input type="hidden" name="tiers" value={JSON.stringify(tiers)} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-48 flex-1 font-bold">
          {p.name}
          {!p.active && <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">gizli</span>}
        </div>
        <div className="flex gap-1 rounded-full bg-surface p-1 text-sm font-semibold">
          {([["per_unit", "Ədədlə"], ["per_sqm", "m² ilə"]] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setModel(v)}
              className={`rounded-md px-4 py-1.5 ${model === v ? "bg-foreground text-white" : "text-neutral-600"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {model === "per_unit" ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Minimal sifariş</span>
            <input name="minQty" type="number" min={1} defaultValue={p.minQty} className={`${field} max-w-24`} />
            <span className="text-neutral-500">ədəd</span>
          </div>
          {tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <input
                type="number"
                min={1}
                value={t.minQty}
                onChange={(e) => setTiers(tiers.map((x, k) => (k === i ? { ...x, minQty: Number(e.target.value) } : x)))}
                className={`${field} max-w-28`}
                aria-label="Say"
              />
              <span className="text-neutral-500">ədədən</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={t.unitPrice}
                onChange={(e) => setTiers(tiers.map((x, k) => (k === i ? { ...x, unitPrice: Number(e.target.value) } : x)))}
                className={`${field} max-w-28`}
                aria-label="Qiymət"
              />
              <span className="text-neutral-500">₼ / ədəd</span>
              {tiers.length > 1 && (
                <button type="button" onClick={() => setTiers(tiers.filter((_, k) => k !== i))} className="ml-auto text-xl text-neutral-400 hover:text-accent" aria-label="Sil">
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTiers([...tiers, { minQty: (tiers.at(-1)?.minQty ?? 0) * 2 || 100, unitPrice: tiers.at(-1)?.unitPrice ?? 1 }])}
            className="text-sm font-semibold text-brand"
          >
            + Pillə əlavə et
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-neutral-500">1 m² qiyməti (₼)</span>
            <input name="sqm" type="number" min={0} step="0.01" defaultValue={p.sqm} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-neutral-500">Min. en (sm)</span>
            <input name="minW" type="number" min={0} defaultValue={p.minW} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-neutral-500">Min. hündürlük (sm)</span>
            <input name="minH" type="number" min={0} defaultValue={p.minH} className={field} />
          </label>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button disabled={pending} className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white disabled:opacity-60">
          {pending ? "Saxlanır…" : "Yadda saxla"}
        </button>
        {state?.ok && <span className="text-sm font-semibold text-green-600">✓ Saxlandı</span>}
        {state?.error && <span className="text-sm text-accent">{state.error}</span>}
      </div>
    </form>
  );
}
