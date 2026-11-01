/** Qiymət bazası: ən ucuz təchizatçı qiymətini seçmək və müştəri qiymətini hesablamaq (server və brauzer üçün ortaq). */

export const VAT = 0.18;

/** Sabit say pillələri. 2001 = "2000+" (2000-dən çox) */
export const TIERS = [10, 50, 100, 200, 500, 1000, 2000, 2001] as const;
export type TierKey = (typeof TIERS)[number];
export const tierLabel = (t: number) => (t === 2001 ? "2000+" : String(t));
export const MIN_QTY = 10;

/** Say hansı pilləyə düşür: 10–49 → 10, 50–99 → 50, …, 2000 → 2000, 2001+ → 2000+ */
export function tierOf(qty: number): TierKey {
  let t: TierKey = TIERS[0];
  for (const k of TIERS) if (qty >= k) t = k;
  return t;
}

export interface CostOffer {
  id: string;
  productId: string;
  supplierId: string;
  supplier: string;
  tiers: Partial<Record<string, number>>; // "10" → 0.6, "2001" → ...
  leadDays: number | null;
  vatIncluded: boolean;
  validUntil: string | null; // YYYY-MM-DD
  note: string;
  updatedAt: string;
}

export const expired = (o: CostOffer, today: string) => Boolean(o.validUntil && o.validUntil < today);
const net = (o: CostOffer, v: number) => (o.vatIncluded ? v / (1 + VAT) : v);

/** Təklifin verilən say üçün qiyməti: sayın pilləsi və ya ondan aşağı ən yaxın doldurulmuş pillə. Heç biri yoxdursa ən aşağı doldurulmuş pillə (belowMin). */
export function offerPrice(o: CostOffer, qty: number): { price: number; net: number; tier: number; belowMin: boolean } | null {
  const filled = TIERS.filter((t) => typeof o.tiers[String(t)] === "number" && Number.isFinite(o.tiers[String(t)]));
  if (!filled.length) return null;
  const top = tierOf(qty);
  const ok = filled.filter((t) => t <= top);
  const tier = ok.length ? ok[ok.length - 1] : filled[0];
  const price = o.tiers[String(tier)]!;
  return { price, net: net(o, price), tier, belowMin: !ok.length };
}

export interface Offer { offer: CostOffer; price: number; net: number; tier: number; belowMin: boolean }

/** Bu say üçün bütün təchizatçılar, ƏDV-siz qiymətə görə ucuzdan bahaya. Vaxtı keçmiş təkliflər sayılmır. */
export function offersFor(offers: CostOffer[], qty: number, today: string): Offer[] {
  return offers
    .filter((o) => !expired(o, today))
    .map((o) => { const p = offerPrice(o, qty); return p ? { offer: o, ...p } : null; })
    .filter((x): x is Offer => Boolean(x))
    .sort((a, b) => Number(a.belowMin) - Number(b.belowMin) || a.net - b.net);
}

/** Hər pillədə ən ucuz ƏDV-siz maya (yalnız həmin pilləni dolduran təchizatçılar arasında) */
export function cheapestByTier(offers: CostOffer[], today: string) {
  return TIERS.map((t) => {
    const c = offers
      .filter((o) => !expired(o, today) && typeof o.tiers[String(t)] === "number")
      .map((o) => ({ offer: o, net: net(o, o.tiers[String(t)]!) }))
      .sort((a, b) => a.net - b.net)[0];
    return { tier: t, best: c ?? null };
  });
}

export interface QuoteParams { margin: number; waste: number; delivery: number; design: number; vat: boolean }

/** Excel-dəki kalkulyatorun eyni düsturu: maya × (1+zay) + çatdırılma + dizayn, sonra marja, sonra ƏDV */
export function quoteTotals(lines: { cost: number; qty: number }[], p: QuoteParams) {
  const goods = lines.reduce((s, l) => s + l.cost * l.qty * (1 + p.waste / 100), 0);
  const cost = goods + p.delivery + p.design;
  const sale = cost * (1 + p.margin / 100);
  const vat = p.vat ? sale * VAT : 0;
  return { goods, cost, sale, vat, total: sale + vat, profit: sale - cost };
}

/** Müştəriyə göstəriləcək vahid qiymət (çatdırılma/dizayn ayrıca sətirdə gedir) */
export const clientUnit = (cost: number, p: QuoteParams) => cost * (1 + p.waste / 100) * (1 + p.margin / 100) * (p.vat ? 1 + VAT : 1);

export function money(n: number, digits = 2): string {
  const [i, f] = Math.abs(n).toFixed(digits).split(".");
  return `${n < 0 ? "-" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`;
}

export const today = () => new Date().toISOString().slice(0, 10);

/**
 * Avtomatik məhsul kodu: 4 simvol (0-9, a-z), "1000"-dən başlayır və 36-lıq sayla artır: 1009 → 100a → … → 100z → 1010.
 * 4 simvol bitəndə (zzzz) 5 simvola keçir. Əl ilə yazılmış "P-001" kimi kodlar sayılmır.
 */
export const AUTO_CODE = /^[0-9a-z]{4,5}$/;
export function nextCode(existing: (string | null)[]): string {
  let max = parseInt("1000", 36) - 1;
  for (const c of existing) if (c && AUTO_CODE.test(c)) max = Math.max(max, parseInt(c, 36));
  const next = (max + 1).toString(36);
  return next.length < 4 ? next.padStart(4, "0") : next;
}
