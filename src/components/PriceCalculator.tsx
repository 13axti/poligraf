"use client";

import { useMemo, useState } from "react";
import type { Product, PriceResult } from "@/lib/types";
import { calculatePrice, AZN } from "@/lib/pricing";

export interface CalcSelection {
  result: PriceResult;
  quantity?: number;
  widthCm?: number;
  heightCm?: number;
  variantId?: string;
  variantName?: string;
}

export function PriceCalculator({
  product,
  onOrder,
}: {
  product: Product;
  onOrder: (sel: CalcSelection) => void;
}) {
  const [quantity, setQuantity] = useState<number>(product.minOrderQty ?? 1);
  const [widthCm, setWidthCm] = useState<number>(product.minWidthCm ?? 100);
  const [heightCm, setHeightCm] = useState<number>(product.minHeightCm ?? 100);
  const [variantId, setVariantId] = useState<string>(
    product.variants?.[0]?.id ?? ""
  );

  const variant = product.variants?.find((v) => v.id === variantId);
  const variantModifier = variant?.priceModifier ?? 0;

  const result = useMemo(
    () =>
      calculatePrice(product, {
        quantity,
        widthCm,
        heightCm,
        variantModifier,
      }),
    [product, quantity, widthCm, heightCm, variantModifier]
  );

  const isPerUnit = product.pricingModel === "per_unit";

  return (
    <div className="rounded-[2rem] bg-surface p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold tracking-tight">Qiymət hesabla</h2>

      {/* Variant seçimi */}
      {product.variants && product.variants.length > 0 && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold">
            Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  v.id === variantId
                    ? "bg-foreground text-white"
                    : "bg-card hover:bg-foreground/10"
                }`}
              >
                {v.name}
                {v.priceModifier ? ` (+${v.priceModifier}₼)` : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* per_unit: say */}
      {isPerUnit && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold">
            Say (ədəd){" "}
            {product.minOrderQty ? `— min. ${product.minOrderQty}` : ""}
          </label>
          <input
            type="number"
            min={product.minOrderQty ?? 1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand"
          />
          {product.priceTiers && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-neutral-500">
              {product.priceTiers.map((t) => (
                <button
                  key={t.minQty}
                  onClick={() => setQuantity(t.minQty)}
                  className="rounded-full bg-card px-3 py-1.5 font-medium transition hover:bg-brand hover:text-white"
                >
                  {t.minQty}+ → {AZN(t.unitPrice)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* per_sqm: ölçü */}
      {!isPerUnit && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              En (sm)
            </label>
            <input
              type="number"
              min={product.minWidthCm ?? 1}
              value={widthCm}
              onChange={(e) => setWidthCm(Number(e.target.value))}
              className="w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Hündürlük (sm)
            </label>
            <input
              type="number"
              min={product.minHeightCm ?? 1}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand"
            />
          </div>
        </div>
      )}

      {/* Nəticə */}
      <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#241609] to-[#150e07] p-5 text-white ring-1 ring-brand/25">
        <div className="text-sm text-white/70">{result.breakdown}</div>
        <div className="mt-1 text-4xl font-extrabold tracking-tight text-[#ffb27a]">
          {result.total > 0 ? AZN(result.total) : "—"}
        </div>
      </div>

      <button
        disabled={result.total <= 0}
        onClick={() =>
          onOrder({
            result,
            quantity: isPerUnit ? quantity : undefined,
            widthCm: isPerUnit ? undefined : widthCm,
            heightCm: isPerUnit ? undefined : heightCm,
            variantId: variant?.id,
            variantName: variant?.name,
          })
        }
        className="mt-4 w-full rounded-full bg-brand px-4 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        Sifariş ver
      </button>
    </div>
  );
}
