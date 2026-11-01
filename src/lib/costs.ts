/** Qiymət bazası: ən ucuz təchizatçı qiymətini seçmək və müştəri qiymətini hesablamaq (server və brauzer üçün ortaq). */

export const VAT = 0.18;

export interface CostPrice {
  id: string;
  productId: string;
  supplierId: string;
  supplier: string;
  minQty: number;
  unitPrice: number;
  vatIncluded: boolean;
  validUntil: string | null; // YYYY-MM-DD
  note: string;
  createdAt: string;
}

/** ƏDV-siz vahid qiymət (müqayisə ƏDV-siz aparılır) */
export const netPrice = (p: CostPrice) => (p.vatIncluded ? p.unitPrice / (1 + VAT) : p.unitPrice);

export const expired = (p: CostPrice, today: string) => Boolean(p.validUntil && p.validUntil < today);

export interface Offer { price: CostPrice; net: number; belowMin: boolean }

/**
 * Verilən say üçün hər təchizatçının tətbiq olunan qiyməti (sayın düşdüyü ən yüksək pillə, eyni pillədə ən yenisi),
 * sonra ƏDV-siz qiymətə görə ucuzdan bahaya sıralanır. Vaxtı keçmiş qiymətlər nəzərə alınmır.
 * Heç bir pillə sayı əhatə etmirsə, ən aşağı pillə götürülür və belowMin=true olur.
 */
export function offersFor(prices: CostPrice[], qty: number, today: string): Offer[] {
  const valid = prices.filter((p) => !expired(p, today));
  const bySupplier = new Map<string, CostPrice[]>();
  for (const p of valid) bySupplier.set(p.supplierId, [...(bySupplier.get(p.supplierId) ?? []), p]);
  const out: Offer[] = [];
  for (const list of bySupplier.values()) {
    const ok = list.filter((p) => p.minQty <= qty);
    const pool = ok.length ? ok : list.filter((p) => p.minQty === Math.min(...list.map((x) => x.minQty)));
    const top = Math.max(...pool.map((p) => p.minQty));
    const pick = pool.filter((p) => p.minQty === top).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    out.push({ price: pick, net: netPrice(pick), belowMin: !ok.length });
  }
  return out.sort((a, b) => a.net - b.net);
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
