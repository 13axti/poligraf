/** Excel/CSV-dən qiymət bazasına idxal: standart şablon sütunları, başqa formatlar üçün avtomatik tanıma, rəqəm və tarix oxuma. */
import { normName, QTY_PRESETS, tierLabel } from "./costs";

export type ColKey =
  | "skip" | "code" | "name" | "category" | "subcategory" | "supplier" | "material" | "width" | "length" | "thickness" | "sizeUnit" | "specs"
  | "unitPrice" | "currency" | "priceUnit" | "minOrder" | "tier" | "vat" | "deliveryFee" | "leadDays" | "priceDate" | "note" | `x:${string}`;
export interface ColMap { key: ColKey; qty?: number }

/** Standart şablonun sütunları (sıra = şablondakı sıra). alias: başqa fayllarda tanımaq üçün */
export const STD_COLS: { key: Exclude<ColKey, "skip" | "tier" | `x:${string}`>; label: string; alias: RegExp }[] = [
  { key: "code", label: "Məhsul kodu", alias: /(\bkod|\bcode\b|артикул|\bsku\b)/ },
  { key: "name", label: "Məhsul adı *", alias: /(məhsul|mehsul|^ad$|adı|\bname\b|product|naimen|наимен|товар|xidmət)/ },
  { key: "category", label: "Kateqoriya *", alias: /^(kateqoriya|category|категор)/ },
  { key: "subcategory", label: "Alt kateqoriya", alias: /(alt kateqoriya|subcategory|подкатегор)/ },
  { key: "supplier", label: "Təchizatçı *", alias: /(təchizatçı|techizatci|şirkət|sirket|supplier|vendor|поставщик)/ },
  { key: "material", label: "Material", alias: /^(material|материал)/ },
  { key: "width", label: "En", alias: /^(en|width|ширина)$/ },
  { key: "length", label: "Uzunluq", alias: /^(uzunluq|length|длина)$/ },
  { key: "thickness", label: "Qalınlıq", alias: /^(qalınlıq|qalinliq|thickness|толщина)$/ },
  { key: "sizeUnit", label: "Ölçü vahidi (mm/sm/m)", alias: /^ölçü vahidi|^olcu vahidi|size unit/ },
  { key: "specs", label: "Texniki xüsusiyyətlər", alias: /(texniki|spesifik|xüsusiyy|description|описание|характер|təsvir)/ },
  { key: "unitPrice", label: "Alış qiyməti *", alias: /(alış|alis|qiym|price|цена|stoim|məbləğ|azn|₼)/ },
  { key: "currency", label: "Valyuta *", alias: /^(valyuta|currency|валюта)/ },
  { key: "priceUnit", label: "Qiymət vahidi *", alias: /^(qiymət vahidi|vahid|unit|ед\.?\s*изм|ед\.)$|qiymət vahidi/ },
  { key: "minOrder", label: "Minimum sifariş", alias: /(minimum|min\.? ?sifari|min\.? ?say|^say$|miqdar|qty|tiraj|кол-во|количество)/ },
  { key: "vat", label: "ƏDV daxil (bəli/xeyr)", alias: /(ədv|edv|vat|ндс)/ },
  { key: "deliveryFee", label: "Çatdırılma haqqı", alias: /(çatdırılma|catdirilma|delivery|доставка)/ },
  { key: "leadDays", label: "Hazırlanma müddəti (gün)", alias: /(hazırlan|hazirlan|müddət|lead|срок)/ },
  { key: "priceDate", label: "Qiymət tarixi (GG.AA.İİİİ)", alias: /(qiymət tarixi|tarix|date|дата)/ },
  { key: "note", label: "Qeyd", alias: /^(qeyd($|[^a-zəıöüşçğ])|qeydlər|note|примечан|comment)/ },
];
export const TIER_LABEL = (q: number) => `${tierLabel(q)} əd.`;

const low = (s: string) => String(s ?? "").toLocaleLowerCase("az").replace(/\s+/g, " ").trim();
const bare = (s: string) => low(s).replace(/\*/g, "").replace(/\(.*?\)/g, "").trim();

export function templateHeaders(fields: { id: string; label: string }[]) {
  const head: string[] = [];
  for (const c of STD_COLS) {
    head.push(c.label);
    if (c.key === "minOrder") for (const q of QTY_PRESETS) head.push(TIER_LABEL(q));
  }
  return [...head, ...fields.map((f) => f.label)];
}
export function templateExample(fields: { id: string; label: string }[]) {
  const ex: Record<string, string> = {
    code: "", name: "NÜMUNƏ: T-shirt pambıq, dairəvi yaxa", category: "Tekstil", subcategory: "Köynəklər", supplier: "NÜMUNƏ: Print az MMC",
    material: "100% pambıq, 180 qr/m²", width: "", length: "", thickness: "", sizeUnit: "sm", specs: "1 rəng ipək çap, ön tərəf", unitPrice: "6",
    currency: "AZN", priceUnit: "ədəd", minOrder: "10", vat: "xeyr", deliveryFee: "15", leadDays: "5", priceDate: "02.11.2026", note: "Bu sətri silin",
  };
  const tiers = ["6", "5,2", "4,8", "4,5", "4,2", "4", "3,9", "3,8"];
  const row: string[] = [];
  for (const c of STD_COLS) {
    row.push(ex[c.key] ?? "");
    if (c.key === "minOrder") row.push(...tiers);
  }
  return [...row, ...fields.map(() => "")];
}

/** "3,50" "3.50" "1 200,00" "0,035 AZN" "9–15" (aşağı rəqəm) → rəqəm */
export function parseNum(raw: string): number | null {
  let src = String(raw ?? "");
  const range = /(\d[\d\s.,]*?)\s*[–—-]\s*\d/.exec(src);
  if (range && !/^\s*-/.test(src)) src = range[1];
  const s = src.replace(/[^\d.,-]/g, "");
  if (!/\d/.test(s)) return null;
  let t = s;
  const lc = t.lastIndexOf(","), ld = t.lastIndexOf(".");
  if (lc >= 0 && ld >= 0) {
    const dec = lc > ld ? "," : ".";
    t = t.split(dec === "," ? "." : ",").join("").replace(dec, ".");
  } else t = t.replace(",", ".");
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Başlıqdakı say pilləsi: "100 əd.", "2000+ əd.", "500 шт", "1000 pcs" */
export function tierQty(header: string): number | null {
  const m = /(\d[\d\s.]*)\s*(\+)?\s*(əd|ədəd|eded|ed\b|pcs|pc\b|шт)/i.exec(header);
  if (!m) return null;
  const n = Number(m[1].replace(/[\s.]/g, ""));
  return n > 0 ? n + (m[2] ? 1 : 0) : null;
}

/** "01.02.2027", "2027-02-01" və ya Excel tarix nömrəsi → "2027-02-01" */
export function parseDate(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(t);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if (/^\d{5}(\.\d+)?$/.test(t)) return new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(t)) * 86400000).toISOString().slice(0, 10);
  return null;
}

/** Başlıq sətrini və sütunları tanıyır. Əvvəl şablon adları (dəqiq), sonra oxşar adlar. */
export function detectColumns(rows: string[][], fields: { id: string; label: string }[]): { header: number; cols: ColMap[]; score: number } {
  let best = { header: 0, cols: [] as ColMap[], score: -1 };
  for (let r = 0; r < Math.min(rows.length, 25); r++) {
    const row = rows[r] ?? [];
    const cols: ColMap[] = row.map((h) => {
      const b = bare(h), l = low(h);
      if (!b) return { key: "skip" };
      const f = fields.find((x) => bare(x.label) === b);
      if (f) return { key: `x:${f.id}` as ColKey };
      const exact = STD_COLS.find((c) => bare(c.label) === b);
      if (exact) return { key: exact.key };
      const tq = tierQty(l);
      if (tq && !/minimum|min\.|^say/.test(l)) return { key: "tier", qty: tq };
      const al = STD_COLS.find((c) => c.alias.test(l));
      return al ? { key: al.key } : { key: "skip" };
    });
    // eyni açar bir neçə sütunda olarsa yalnız birincisi qalır
    const seen = new Set<string>();
    for (let i = 0; i < cols.length; i++) {
      const k = cols[i].key;
      if (k === "skip" || k === "tier") continue;
      if (seen.has(k)) cols[i] = { key: "skip" };
      seen.add(k);
    }
    const keys = cols.map((c) => c.key);
    const score = (keys.includes("name") ? 4 : 0) + (keys.includes("unitPrice") || keys.includes("tier") ? 4 : 0) + keys.filter((k) => k !== "skip").length;
    if (score > best.score) best = { header: r, cols, score };
  }
  return { ...best, cols: Array.from(best.cols, (c) => c ?? { key: "skip" as ColKey }) };
}

export function detectSupplier(rows: string[][], fileName: string, header: number): string {
  const real = (c: string) => Boolean(c) && !/^(nümunə|numune)/i.test(c);
  const pools = [rows.slice(0, Math.max(header, 8)).flat().filter(real), rows.slice(0, 60).flat().filter(real)];
  for (const pool of pools) {
    for (const cell of pool) {
      const lab = /(təchizatçı|şirkət|sirket|firma|company|supplier|поставщик|компания)\s*[:\-–]\s*(.+)/i.exec(cell);
      if (lab && lab[2].trim().length > 1) return lab[2].trim().slice(0, 120);
    }
    for (const cell of pool) if (/\b(MMC|LLC|QSC|ASC|Ltd|LTD|ООО|ОАО|MTK)\b|şirkəti/.test(cell) && cell.length < 80) return cell.trim();
  }
  return fileName.replace(/\.(xlsx|csv)$/i, "").replace(/[_-]+/g, " ").trim().slice(0, 120);
}

const yes = (v: string) => /^(bəli|beli|hə|he|yes|да|1|true|var|daxil)/i.test(v.trim());

export interface RawRow {
  key: string; include: boolean; productId: string | null;
  code: string; name: string; category: string; subcategory: string; supplier: string;
  material: string; width: number | null; length: number | null; thickness: number | null; sizeUnit: string; specs: string;
  unitPrice: number | null; currency: string; priceUnit: string; minOrder: number | null; tiers: Record<string, number>;
  vat: boolean | null; deliveryFee: number; leadDays: number | null; priceDate: string | null; note: string; extra: Record<string, string>;
}

export function extractRows(rows: string[][], header: number, cols: ColMap[]): RawRow[] {
  const at = (r: string[], k: ColKey) => { const i = cols.findIndex((c) => c.key === k); return i >= 0 ? String(r[i] ?? "").trim() : ""; };
  const out: RawRow[] = [];
  rows.slice(header + 1).forEach((r, i) => {
    if (!r || !r.some(Boolean)) return;
    const tiers: Record<string, number> = {};
    cols.forEach((c, ci) => { if (c.key === "tier" && c.qty) { const p = parseNum(r[ci] ?? ""); if (p != null && p >= 0) tiers[String(c.qty)] = p; } });
    let unitPrice = parseNum(at(r, "unitPrice"));
    const minOrder = parseNum(at(r, "minOrder"));
    const tk = Object.keys(tiers).map(Number).sort((a, b) => a - b);
    if (unitPrice == null && tk.length) unitPrice = tiers[String(tk[0])];
    const name = at(r, "name");
    if (unitPrice == null && !tk.length) return;           // qiyməti olmayan sətir (başlıq, boş, cəmi)
    if (/^(cəmi|cemi|yekun|total|итого|всего)/i.test(name)) return;
    const extra: Record<string, string> = {};
    cols.forEach((c, ci) => { if (c.key.startsWith("x:") && r[ci]) extra[c.key.slice(2)] = String(r[ci]).trim(); });
    const sample = /^(nümunə|numune)/i.test(name) || /^(nümunə|numune)/i.test(at(r, "supplier"));
    const cur = at(r, "currency").toUpperCase().replace("₼", "AZN").replace("MANAT", "AZN").replace("$", "USD").replace("€", "EUR");
    const v = at(r, "vat");
    out.push({
      key: `r${i}`, include: !sample && /\p{L}/u.test(name), productId: null,
      code: at(r, "code"), name, category: at(r, "category"), subcategory: at(r, "subcategory"), supplier: at(r, "supplier"),
      material: at(r, "material"), width: parseNum(at(r, "width")), length: parseNum(at(r, "length")), thickness: parseNum(at(r, "thickness")),
      sizeUnit: at(r, "sizeUnit") || "mm", specs: at(r, "specs"),
      unitPrice, currency: cur || "AZN", priceUnit: at(r, "priceUnit") || "ədəd",
      minOrder: minOrder != null ? Math.max(1, Math.round(minOrder)) : (tk[0] ?? null), tiers,
      vat: v ? yes(v) : null, deliveryFee: parseNum(at(r, "deliveryFee")) ?? 0,
      leadDays: parseNum(at(r, "leadDays")) != null ? Math.round(parseNum(at(r, "leadDays"))!) : null,
      priceDate: parseDate(at(r, "priceDate")), note: at(r, "note"), extra,
    });
  });
  return out;
}

export const keyLabel = (k: ColKey, fields: { id: string; label: string }[]) =>
  k === "skip" ? "Götürmə" : k === "tier" ? "Qiymət: X ədəddən" : k.startsWith("x:") ? fields.find((f) => f.id === k.slice(2))?.label ?? "Əlavə xana" : STD_COLS.find((c) => c.key === k)?.label.replace(" *", "") ?? k;

export { normName };
