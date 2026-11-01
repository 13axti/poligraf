/** Təchizatçı Excel-indən qiymət sətirləri çıxarmaq: sütunları tanımaq, rəqəmləri oxumaq, şirkət adını tapmaq. */

export type Role = "skip" | "name" | "code" | "spec" | "unit" | "qty" | "price" | "tier" | "supplier" | "vat";
export interface ColMap { role: Role; minQty?: number }
export const ROLE_LABEL: Record<Role, string> = {
  skip: "Götürmə", supplier: "Təchizatçı (hər sətirdə)", vat: "ƏDV daxil? (bəli/xeyr)", name: "Məhsul adı", code: "Kod", spec: "Spesifikasiya", unit: "Vahid", qty: "Say (neçə ədəddən)", price: "Vahid qiymət", tier: "Qiymət: X ədəd",
};

const low = (s: string) => s.toLocaleLowerCase("az").replace(/\s+/g, " ").trim();

/** "3,50" "3.50" "1 200,00" "0,035 AZN" "₼ 2.4" → rəqəm. Tək vergül/nöqtə kəsr sayılır (0,125 kimi maya qiymətləri üçün). */
export function parseNum(raw: string): number | null {
  let src = String(raw ?? "");
  // Aralıq ("9–15", "9 - 15 AZN"): birinci (aşağı) rəqəm götürülür
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

/** Başlıqdakı say pilləsi: "100 əd.", "Qiymət — 500 ədəd", "1000 pcs", "до 300 шт" */
export function tierQty(header: string): number | null {
  const m = /(\d[\d\s.]*)\s*(əd|ədəd|eded|ed\b|pcs|pc\b|шт|ədəd\.|əd\.)/i.exec(header);
  if (!m) return null;
  const n = Number(m[1].replace(/[\s.]/g, ""));
  return n > 0 ? n : null;
}

const RX: [Role, RegExp][] = [
  ["supplier", /(təchizatçı|techizatci|supplier|vendor|поставщик)/],
  ["vat", /(ədv|edv|vat|ндс)/],
  ["code", /(\bkod|\bcode\b|артикул|\bart\.|\bsku\b)/],
  ["unit", /^(vahid|ölçü vahidi|unit|ед\.?\s*изм|ед\.)$|ölçü vahidi/],
  ["qty", /^(say|miqdar|qty|quantity|tiraj|kol|кол-во|количество|min\.? ?say|minimum)/],
  ["price", /(qiym|price|цена|stoim|məbləğ|azn|₼|manat)/],
  ["spec", /(spesifik|xüsusiyy|texniki|ölçü|size|описание|характер|material)/],
  ["name", /(məhsul|mehsul|\bad\b|adı|name|product|təsvir|naimen|наимен|товар|xidmət|iş(in)? adı)/],
];

/** Eyni rolu bir neçə sütun alıbsa, dəyərlərinə ən uyğun olanı saxla (qiymət: ən çox rəqəm, ad: ən çox mətn) */
function dedupe(rows: string[][], header: number, cols: ColMap[]) {
  const data = rows.slice(header + 1, header + 60);
  const fit = (ci: number, role: Role) => {
    const vals = data.map((r) => r?.[ci] ?? "").filter(Boolean);
    const nums = vals.filter((v) => parseNum(v) != null && !/[a-zа-яəıöüşçğ]{3,}/i.test(v)).length;
    return role === "price" || role === "qty" ? nums : vals.length - nums;
  };
  for (const role of ["name", "price", "qty", "code", "spec", "unit", "supplier", "vat"] as Role[]) {
    const idx = cols.map((c, i) => (c.role === role ? i : -1)).filter((i) => i >= 0);
    if (role === "price" || role === "qty") for (const i of idx) if (!fit(i, role)) cols[i] = { role: "skip" };
    if (idx.length < 2) continue;
    // Qiymətdə "vahid/ədəd üçün" yazılan sütun ümumi məbləğdən üstündür
    const head = (i: number) => low(rows[header]?.[i] ?? "");
    const unitish = (i: number) => (role === "price" && /(vahid|unit|1 əd|ədəd üçün|за ед|за шт)/.test(head(i)) ? 1000 : 0);
    const keep = idx.reduce((a, b) => (fit(b, role) + unitish(b) > fit(a, role) + unitish(a) ? b : a));
    for (const i of idx) if (i !== keep) cols[i] = { role: "skip" };
  }
}

/** Başlıq sətrini və sütun rollarını təxmin edir */
export function detect(rows: string[][]): { header: number; cols: ColMap[]; score: number } {
  let best = { header: 0, score: -1, cols: [] as ColMap[] };
  for (let r = 0; r < Math.min(rows.length, 25); r++) {
    const row = rows[r] ?? [];
    const cols: ColMap[] = row.map((h) => {
      const l = low(h);
      if (!l) return { role: "skip" };
      const tq = tierQty(l);
      if (tq && !/^(say|miqdar|qty)/.test(l)) return { role: "tier", minQty: tq };
      for (const [role, rx] of RX) if (rx.test(l)) return { role };
      return { role: "skip" };
    });
    dedupe(rows, r, cols);
    const roles = cols.map((c) => c.role);
    const score = (roles.includes("name") ? 3 : 0) + (roles.includes("price") || roles.includes("tier") ? 3 : 0) + roles.filter((x) => x !== "skip").length;
    if (score > best.score) best = { header: r, score, cols };
  }
  // Ad sütunu tapılmayıbsa: başlıqdan sonrakı sətirlərdə ən çox mətn olan sütun
  if (!best.cols.some((c) => c.role === "name")) {
    const width = Math.max(0, ...rows.map((r) => r?.length ?? 0));
    let bestCol = -1, bestN = 0;
    for (let c = 0; c < width; c++) {
      if (best.cols[c] && best.cols[c].role !== "skip") continue;
      const n = rows.slice(best.header + 1, best.header + 40).filter((r) => r?.[c] && parseNum(r[c]) == null && r[c].length > 2).length;
      if (n > bestN) { bestN = n; bestCol = c; }
    }
    if (bestCol >= 0) { best.cols[bestCol] = { role: "name" }; }
  }
  return { header: best.header, cols: Array.from(best.cols, (c) => c ?? { role: "skip" as Role }), score: best.score };
}

/** Şirkət adını tapmağa çalışır: "MMC/LLC/ООО" olan xana, "Təchizatçı:/Şirkət:" yanındakı dəyər, yoxdursa fayl adı */
export function detectSupplier(rows: string[][], fileName: string, header: number): string {
  const top = rows.slice(0, Math.max(header, 8)).flat().filter(Boolean);
  const all = rows.slice(0, 60).flat().filter(Boolean);
  for (const pool of [top, all]) {
    for (const cell of pool) {
      const lab = /(təchizatçı|şirkət|sirket|firma|company|supplier|поставщик|компания)\s*[:\-–]\s*(.+)/i.exec(cell);
      if (lab && lab[2].trim().length > 1) return lab[2].trim().slice(0, 120);
    }
    for (const cell of pool) {
      if (/\b(MMC|LLC|QSC|ASC|ASC|Ltd|LTD|ООО|ОАО|MTK|İSB|ISB)\b|şirkəti/.test(cell) && cell.length < 80) return cell.trim();
    }
  }
  return fileName.replace(/\.(xlsx|csv)$/i, "").replace(/[_-]+/g, " ").trim().slice(0, 120);
}

/** Faylda "ƏDV daxil" ifadəsi varsa (sual kimi başlıq yox) */
export const mentionsVat = (rows: string[][]) =>
  rows.slice(0, 80).flat().some((c) => !/\?\s*$/.test(c ?? "") && /ədv\s*(daxil|ilə)|ндс включ|incl\.?\s*vat|vat incl/i.test(c ?? ""));
const yes = (v: string) => /^(bəli|beli|hə|he|yes|да|1|true|var|daxil)/i.test(v.trim());

export interface ImportRow {
  key: string;
  include: boolean;
  name: string;
  code: string;
  spec: string;
  unit: string;
  tiers: { minQty: number; price: number }[];
  supplier: string;      // boşdursa ümumi təchizatçı
  vat: boolean | null;   // null: ümumi seçim
}

/** Rollara görə sətirləri çıxarır. Qiyməti olmayan sətirlər (başlıq, cəmi, boş) atılır. */
export function extractRows(rows: string[][], header: number, cols: ColMap[]): ImportRow[] {
  const at = (r: string[], role: Role) => {
    const i = cols.findIndex((c) => c.role === role);
    return i >= 0 ? (r[i] ?? "").trim() : "";
  };
  const out: ImportRow[] = [];
  rows.slice(header + 1).forEach((r, i) => {
    if (!r || !r.some(Boolean)) return;
    const tiers: { minQty: number; price: number }[] = [];
    cols.forEach((c, ci) => {
      if (c.role !== "tier") return;
      const p = parseNum(r[ci] ?? "");
      if (p != null && p > 0) tiers.push({ minQty: c.minQty ?? 1, price: p });
    });
    const single = parseNum(at(r, "price"));
    if (single != null && single > 0) tiers.push({ minQty: Math.max(1, Math.round(parseNum(at(r, "qty")) ?? 1)), price: single });
    const name = at(r, "name");
    if (!tiers.length) return;
    if (/^(cəmi|cemi|yekun|total|итого|всего)/i.test(name)) return;
    const v = at(r, "vat");
    out.push({
      key: `r${i}`, include: /\p{L}/u.test(name) || Boolean(at(r, "code")), name, code: at(r, "code"), spec: at(r, "spec"), unit: at(r, "unit") || "ədəd", tiers,
      supplier: at(r, "supplier"), vat: v ? yes(v) : null,
    });
  });
  return out;
}

/** Ad müqayisəsi üçün sadələşdirmə */
export const normName = (s: string) =>
  low(s).replace(/[ə]/g, "e").replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ü]/g, "u").replace(/[ş]/g, "s").replace(/[ç]/g, "c").replace(/[ğ]/g, "g").replace(/[^a-z0-9а-я]+/g, " ").trim();
