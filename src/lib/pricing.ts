import type { Product, PriceResult, PriceTier, ProductVariant } from "./types";

export const DEFAULT_GROUP = "Variant";
export const groupOf = (v: ProductVariant) => v.group?.trim() || DEFAULT_GROUP;

/** Variantları qruplara ayırır (sıra admində yazıldığı kimidir) */
export function variantGroups(variants: ProductVariant[] = []) {
  const out: { name: string; items: ProductVariant[] }[] = [];
  for (const v of variants) {
    const g = out.find((x) => x.name === groupOf(v));
    if (g) g.items.push(v);
    else out.push({ name: groupOf(v), items: [v] });
  }
  return out;
}

/** Hər qrupdan bir seçim: id-lər siyahısından etibarlıları götürür, qrupda seçilməyibsə birincisi */
export function resolveSelection(product: Product, ids: string[] = []): ProductVariant[] {
  return variantGroups(product.variants).map((g) => g.items.find((v) => ids.includes(v.id)) ?? g.items[0]);
}

const AZN = (n: number) => `${n.toFixed(2)} ₼`;
/** Ədəd qiyməti: 1 ₼-dan ucuzdursa 3 onluq (0,415 ₼), yoxsa 2 */
const AZNu = (n: number) => `${n.toFixed(Math.abs(n) < 1 ? 3 : 2)} ₼`;

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
    /** Qruplu seçimlər: hər qrupdan biri (verilərsə variantModifier əvəzinə istifadə olunur) */
    selected?: ProductVariant[];
  }
): PriceResult {
  const sel = opts.selected;
  const mod = sel ? sel.reduce((s, v) => s + (Number(v.priceModifier) || 0), 0) : (opts.variantModifier ?? 0);
  const mult = sel ? sel.reduce((m, v) => m * (Number(v.multiplier) > 0 ? Number(v.multiplier) : 1), 1) : 1;
  const extras = sel ? sel.reduce((s, v) => s + (Number(v.fixed) || 0), 0) : 0;
  const days = sel?.map((v) => v.days).find((d) => typeof d === "number" && d > 0);
  const extraText = extras ? ` + ${AZN(extras)}` : "";

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
    const unitPrice = Math.round((tier.unitPrice * mult + mod) * 10000) / 10000;
    const total = Math.round((unitPrice * qty + extras) * 100) / 100;
    return {
      total,
      unitPrice,
      quantity: qty,
      appliedTier: tier,
      extras,
      days,
      breakdown: `${qty} ədəd × ${AZNu(unitPrice)}${extraText} = ${AZN(total)}`,
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
  const rate = product.pricePerSqm * mult + mod;
  const total = Math.round((areaSqm * rate + extras) * 100) / 100;
  return {
    total,
    areaSqm,
    extras,
    days,
    breakdown: `${w}×${h} sm (${areaSqm.toFixed(2)} m²) × ${AZN(rate)}/m²${extraText} = ${AZN(total)}`,
  };
}

export { AZN, AZNu };
