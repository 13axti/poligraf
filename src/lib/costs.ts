/** Qiymət sistemi: təchizatçı təklifləri, ən ucuz uyğun təchizatçı, valyuta çevirmə, sayt və təklif qiymətləri. Server və brauzer üçün ortaq. */

export const VAT = 0.18;
export const CURRENCIES = ["AZN", "USD", "EUR", "TRY", "RUB", "GBP", "CNY"] as const;
export const PRICE_UNITS = ["ədəd", "m²", "metr", "kq", "dəst", "paket", "vərəq", "rulon", "litr"] as const;
export const SIZE_UNITS = ["mm", "sm", "m"] as const;
/** Miqdara görə qiymət üçün hazır saylar (2001 = "2000+") */
export const QTY_PRESETS = [10, 50, 100, 200, 500, 1000, 2000, 2001] as const;
export const tierLabel = (t: number) => (t === 2001 ? "2000+" : String(t));

export type Rates = Record<string, number>;
/** 1 vahid valyuta neçə manatdır. Admin "Ayarlar"da dəyişir. */
export const DEFAULT_RATES: Rates = { AZN: 1, USD: 1.7, EUR: 1.85, TRY: 0.05, RUB: 0.02, GBP: 2.15, CNY: 0.24 };
export const rate = (cur: string, rates: Rates) => rates[cur] ?? DEFAULT_RATES[cur] ?? 1;
export const toAZN = (v: number, cur: string, rates: Rates) => v * rate(cur, rates);

export interface CostOffer {
  id: string;
  productId: string;
  supplierId: string;
  supplier: string;
  unitPrice: number;          // əsas alış qiyməti (minimum sifariş üçün), öz valyutasında
  currency: string;
  priceUnit: string;
  minOrder: number | null;
  tiers: Record<string, number>; // miqdara görə qiymət: "500" → 0.42 (öz valyutasında)
  vatIncluded: boolean;
  deliveryFee: number;        // cəmi, öz valyutasında
  leadDays: number | null;
  priceDate: string | null;   // YYYY-MM-DD
  validUntil: string | null;
  note: string;
  updatedAt: string;
}

export const expired = (o: CostOffer, today: string) => Boolean(o.validUntil && o.validUntil < today);

/** Bu say üçün təklifin vahid qiyməti (öz valyutasında): sayı keçməyən ən böyük pillə, yoxdursa əsas qiymət */
export function priceAt(o: CostOffer, qty: number): number {
  let best: number | null = null, key = -1;
  for (const [k, v] of Object.entries(o.tiers)) {
    const n = Number(k);
    if (Number.isFinite(v) && n <= qty && n > key) { key = n; best = v; }
  }
  return best ?? o.unitPrice;
}

export interface Offer {
  offer: CostOffer;
  price: number;      // vahid qiymət, öz valyutasında
  unitAZN: number;    // vahid qiymət, manatla, ƏDV-siz
  effAZN: number;     // vahid maya: unitAZN + çatdırılma / say
  belowMin: boolean;  // say minimum sifarişdən azdır
  expired: boolean;
}

/** Bütün təchizatçılar bu say üçün: əvvəl uyğun olanlar (min. sifariş və tarix), sonra ən ucuz vahid mayaya görə */
export function offersFor(offers: CostOffer[], qty: number, rates: Rates, today: string): Offer[] {
  const q = Math.max(1, qty);
  return offers
    .map((o) => {
      const price = priceAt(o, q);
      const net = o.vatIncluded ? price / (1 + VAT) : price;
      const unitAZN = toAZN(net, o.currency, rates);
      const effAZN = unitAZN + toAZN(o.deliveryFee || 0, o.currency, rates) / q;
      return { offer: o, price, unitAZN, effAZN, belowMin: q < (o.minOrder ?? 1), expired: expired(o, today) };
    })
    .sort((a, b) => Number(a.belowMin || a.expired) - Number(b.belowMin || b.expired) || a.effAZN - b.effAZN);
}
export const bestOffer = (offers: CostOffer[], qty: number, rates: Rates, today: string) => offersFor(offers, qty, rates, today)[0] ?? null;
export const suitable = (o: Offer) => !o.belowMin && !o.expired;

/** Saytdakı qiymət pillələri: bütün təkliflərdəki saylarda ən ucuz uyğun maya × (1 + marja) */
export function siteTiers(offers: CostOffer[], margin: number, rates: Rates, today: string) {
  const points = new Set<number>();
  for (const o of offers) {
    points.add(Math.max(1, o.minOrder ?? 1));
    for (const k of Object.keys(o.tiers)) points.add(Number(k));
  }
  return Array.from(points)
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
    .map((q) => {
      const b = offersFor(offers, q, rates, today).find(suitable);
      return b ? { minQty: q, unitPrice: Math.round(b.effAZN * (1 + margin / 100) * 100) / 100 } : null;
    })
    .filter((x): x is { minQty: number; unitPrice: number } => Boolean(x));
}

/* -------- Qiymət təklifi -------- */

export interface QuoteLine {
  key: string;
  productId: string | null;
  name: string;
  specs: string;
  qty: number;
  unit: string;
  supplierId: string | null;   // daxili: hansı təchizatçıdan alınır
  supplier: string;
  purchase: number;            // daxili: vahid maya, AZN
  sale: number;                // müştəriyə vahid qiymət, AZN (ƏDV-siz)
  saleManual: boolean;         // satış qiyməti əl ilə yazılıb (marja dəyişəndə toxunulmur)
  supplierPinned?: boolean;    // təchizatçı əl ilə seçilib (yoxsa həmişə ən ucuz uyğun götürülür)
  purchaseManual?: boolean;    // maya əl ilə yazılıb (bazada olmayan məhsul üçün)
  source?: string;             // fayldan gələndə orijinal sətir
}

export const lineSale = (purchase: number, margin: number) => Math.round(purchase * (1 + margin / 100) * 100) / 100;

export function quoteSums(lines: QuoteLine[], vat: boolean) {
  const subtotal = lines.reduce((s, l) => s + l.sale * l.qty, 0);
  const cost = lines.reduce((s, l) => s + l.purchase * l.qty, 0);
  const vatSum = vat ? subtotal * VAT : 0;
  return { subtotal, vat: vatSum, total: subtotal + vatSum, cost, profit: subtotal - cost };
}

/* -------- Ümumi -------- */

export function money(n: number, digits = 2): string {
  const [i, f] = Math.abs(n).toFixed(digits).split(".");
  return `${n < 0 ? "-" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`;
}

export const today = () => new Date().toISOString().slice(0, 10);

/**
 * Avtomatik məhsul kodu: 4 simvol (0-9, a-z), "1000"-dən başlayır və 36-lıq sayla artır: 1009 → 100a → … → 100z → 1010.
 * 4 simvol bitəndə 5 simvola keçir. Əl ilə yazılmış "P-001" kimi kodlar sayılmır. Kod bazada kilidlənir, dəyişmir.
 */
export const AUTO_CODE = /^[0-9a-z]{4,5}$/;
export function nextCode(existing: (string | null)[]): string {
  let max = parseInt("1000", 36) - 1;
  for (const c of existing) if (c && AUTO_CODE.test(c)) max = Math.max(max, parseInt(c, 36));
  const next = (max + 1).toString(36);
  return next.length < 4 ? next.padStart(4, "0") : next;
}

/** Ad müqayisəsi üçün sadələşdirmə (təkrar məhsul və fayldan uyğunlaşdırma) */
export const normName = (s: string) =>
  String(s ?? "").toLocaleLowerCase("az").replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/[^a-z0-9а-яё]+/g, " ").trim();
