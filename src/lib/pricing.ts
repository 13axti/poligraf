import type { Product, PriceResult, PriceTier } from "./types";

const AZN = (n: number) => `${n.toFixed(2)} ₼`;

/** per_unit: sayına uyğun ən yaxşı tier-i tapır */
function findTier(tiers: PriceTier[], qty: number): PriceTier {
  // minQty-yə görə azalan sırala, qty-dən böyük olmayan ilk tier-i götür
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  return sorted.find((t) => qty >= t.minQty) ?? sorted[sorted.length - 1];
}

/**
 * Qiyməti hesablayır — hər iki model (sayla + m²).
 * Yanlış/yarımçıq input olanda total = 0 və izah qaytarır (UI-da "ölçü daxil edin" deyə bilərik).
 */
export function calculatePrice(
  product: Product,
  opts: {
    quantity?: number;
    widthCm?: number;
    heightCm?: number;
    variantModifier?: number;
  }
): PriceResult {
  const mod = opts.variantModifier ?? 0;

  if (product.pricingModel === "per_unit") {
    const qty = Math.max(opts.quantity ?? 0, 0);
    const minQty = product.minOrderQty ?? 1;

    if (!product.priceTiers?.length || qty <= 0) {
      return { total: 0, quantity: qty, breakdown: "Say daxil edin" };
    }
    if (qty < minQty) {
      return {
        total: 0,
        quantity: qty,
        breakdown: `Minimal sifariş: ${minQty} ədəd`,
      };
    }

    const tier = findTier(product.priceTiers, qty);
    const unitPrice = tier.unitPrice + mod;
    const total = unitPrice * qty;
    return {
      total,
      unitPrice,
      quantity: qty,
      appliedTier: tier,
      breakdown: `${qty} ədəd × ${AZN(unitPrice)} = ${AZN(total)}`,
    };
  }

  // per_sqm
  const w = Math.max(opts.widthCm ?? 0, 0);
  const h = Math.max(opts.heightCm ?? 0, 0);
  const minW = product.minWidthCm ?? 0;
  const minH = product.minHeightCm ?? 0;

  if (!product.pricePerSqm || w <= 0 || h <= 0) {
    return { total: 0, areaSqm: 0, breakdown: "En və hündürlük daxil edin (sm)" };
  }
  if (w < minW || h < minH) {
    return {
      total: 0,
      areaSqm: 0,
      breakdown: `Minimal ölçü: ${minW}×${minH} sm`,
    };
  }

  const areaSqm = (w / 100) * (h / 100);
  const rate = product.pricePerSqm + mod;
  const total = areaSqm * rate;
  return {
    total,
    areaSqm,
    breakdown: `${w}×${h} sm (${areaSqm.toFixed(2)} m²) × ${AZN(rate)}/m² = ${AZN(total)}`,
  };
}

export { AZN };
