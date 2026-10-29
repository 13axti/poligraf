/** Təqdimat modeli və hesablamalar (server və brauzer üçün ortaq, asılılıqsız). */

export interface Tier { minQty: number; unitPrice: number }

export interface PItem {
  id: string;
  productId?: string;
  group: string;            // slayd bölməsi (adətən kateqoriya adı)
  name: string;
  image: string;
  colors: string[];
  spec: string[];
  qty: number;
  unit: string;             // "ədəd" | "m²"
  tiers: Tier[];            // kataloq qiymət pillələri (snapshot)
  priceOverride: number | null; // doludursa pilləyə və marjaya baxılmır
}

export interface PSet { id: string; title: string; desc: string; itemIds: string[] }

export interface PData {
  intro: string;
  markup: number;           // % (kataloq qiymətinin üstünə)
  items: PItem[];
  sets: PSet[];
  notes: string[];
}

export const emptyData = (): PData => ({
  intro: "",
  markup: 0,
  items: [],
  sets: [],
  notes: [
    "Qiymətlər ƏDV-siz göstərilib, ƏDV (18%) əlavə olunur.",
    "Qiymətlər göstərilən say üçün hesablanıb; say dəyişəndə qiymət dəyişə bilər.",
    "Şəkillər nümunədir. Loqonuz məhsul üzərində mockup ilə yerləşdirilib təsdiqinizə göndəriləcək.",
  ],
});

/** Sayın düşdüyü pillənin ədəd qiyməti. Eyni pillədə bir neçə qiymət varsa (kataloqda təkrarlanma) ən aşağısı götürülür. */
export function tierPrice(tiers: Tier[], qty: number): number {
  if (!tiers.length) return 0;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let eligible = sorted.filter((t) => t.minQty <= qty);
  if (!eligible.length) eligible = sorted.filter((t) => t.minQty === sorted[0].minQty);
  const top = Math.max(...eligible.map((t) => t.minQty));
  return Math.min(...eligible.filter((t) => t.minQty === top).map((t) => t.unitPrice));
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function unitPrice(item: PItem, markup: number): number {
  if (item.priceOverride != null && Number.isFinite(item.priceOverride)) return round2(item.priceOverride);
  return round2(tierPrice(item.tiers, item.qty) * (1 + (Number(markup) || 0) / 100));
}

export const lineTotal = (item: PItem, markup: number) => round2(unitPrice(item, markup) * item.qty);

export function setTotal(set: PSet, data: PData) {
  const items = set.itemIds.map((id) => data.items.find((i) => i.id === id)).filter((i): i is PItem => Boolean(i));
  return { items, total: round2(items.reduce((s, i) => s + lineTotal(i, data.markup), 0)) };
}

/** 1092.5 -> "1.092,50" (brauzer və serverdə eyni nəticə: Intl-dən asılı deyil) */
export function money(n: number): string {
  const [i, f] = Math.abs(n).toFixed(2).split(".");
  return `${n < 0 ? "-" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${f}`;
}

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
export const monthYear = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()] ?? ""} ${d.getUTCFullYear()}`;
};

/** Sistem məlumatını bazadan gələn (etibarsız ola bilən) JSON-dan təmiz modelə çevirir */
export function normalizeData(raw: unknown): PData {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<PData>;
  const base = emptyData();
  const str = (v: unknown, max = 300) => String(v ?? "").slice(0, max);
  const num = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const items: PItem[] = (Array.isArray(r.items) ? r.items : []).slice(0, 100).map((i) => ({
    id: str(i.id, 40),
    productId: i.productId ? str(i.productId, 60) : undefined,
    group: str(i.group, 80) || "Digər",
    name: str(i.name, 160),
    image: str(i.image, 600),
    colors: (Array.isArray(i.colors) ? i.colors : []).slice(0, 12).map((c) => str(c, 30)).filter(Boolean),
    spec: (Array.isArray(i.spec) ? i.spec : []).slice(0, 6).map((c) => str(c, 160)).filter(Boolean),
    qty: Math.max(1, Math.round(num(i.qty, 1))),
    unit: str(i.unit, 10) || "ədəd",
    tiers: (Array.isArray(i.tiers) ? i.tiers : []).slice(0, 30).map((t) => ({ minQty: num(t.minQty), unitPrice: num(t.unitPrice) })),
    priceOverride: i.priceOverride == null || i.priceOverride === ("" as unknown) ? null : num(i.priceOverride),
  }));
  const ids = new Set(items.map((i) => i.id));
  const sets: PSet[] = (Array.isArray(r.sets) ? r.sets : []).slice(0, 12).map((s) => ({
    id: str(s.id, 40),
    title: str(s.title, 80),
    desc: str(s.desc, 200),
    itemIds: (Array.isArray(s.itemIds) ? s.itemIds : []).map((x) => str(x, 40)).filter((x) => ids.has(x)),
  }));
  return {
    intro: str(r.intro, 400),
    markup: Math.max(0, Math.min(500, num(r.markup))),
    items,
    sets,
    notes: Array.isArray(r.notes) ? r.notes.slice(0, 20).map((n) => str(n, 400)).filter(Boolean) : base.notes,
  };
}

/** Rəng adı -> göstərici nöqtə rəngi (bilinməyənlər üçün nöqtə çəkilmir) */
export const COLOR_DOT: Record<string, string> = {
  qara: "#161616", ağ: "#f4f4f4", narıncı: "#ff7a1a", qırmızı: "#d6202b", göy: "#1f3f9a", mavi: "#2f86d6",
  "açıq mavi": "#8ec5ee", yaşıl: "#2e8b3e", "açıq yaşıl": "#8cc63f", sarı: "#f2c200", boz: "#8a8f94", "açıq boz": "#c9cdd1",
  qəhvəyi: "#7a4a2a", bənövşəyi: "#6a3ea1", turkuaz: "#1fb5ad", çəhrayı: "#ec7fa9", qızılı: "#c9a24b", gümüşü: "#bfc3c7",
  "təbii kətan": "#e8dcc4", bej: "#d8c8a8",
};
