/**
 * Fayldan təklif: PDF, Excel/CSV, Word (.docx) və şəkildən məhsul adlarını və miqdarları çıxarır,
 * qiymət bazasındakı məhsullarla uyğunlaşdırır. Yalnız brauzerdə işləyir (PDF və OCR kitabxanaları lazım olanda yüklənir).
 */
import { strFromU8, unzipSync } from "fflate";
import { normName } from "./costs";
import { detectColumns, parseNum } from "./price-import";
import { parseCsv, parseXlsx } from "./sheet-parse";

export interface ParsedLine { text: string; name: string; qty: number | null }

const UNIT = "(ədəd|edəd|əd\\.?|eded|ed\\.|pcs|pc|шт\\.?|dəst|dest|paket|m²|m2|metr|kq|kg|vərəq)";
const HEADERISH = /^(?:№|#|(?:n|məhsul|mehsul|adı|ad|say|miqdar|qiymət|cəmi|yekun|total|итого|наимен|кол|qty|quantity)(?!\p{L}))/iu;

/** Bir mətn sətrindən ad və miqdar: "1. T-shirt ağ — 200 ədəd", "Vizit kart x 1000", "Qələm 300" */
export function parseLine(raw: string, requireQty = false): ParsedLine | null {
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length < 3 || !/\p{L}{2,}/u.test(text) || HEADERISH.test(text)) return null;
  let t = text.replace(/^\s*(\d{1,3}\s*[.)]|№\s*\d+|[-•*])\s+/, "");
  let qty: number | null = null;
  let m = new RegExp(`(\\d[\\d\\s.,]*)\\s*${UNIT}(?![\\p{L}])`, "iu").exec(t);
  if (m) { qty = parseNum(m[1]); t = t.replace(m[0], " "); }
  else if ((m = /[x×*]\s*(\d[\d\s.,]*)\s*$/i.exec(t))) { qty = parseNum(m[1]); t = t.slice(0, m.index); }
  else if ((m = /(?:say|miqdar|qty|кол-?во)\s*[:\-]?\s*(\d[\d\s.,]*)/i.exec(t))) { qty = parseNum(m[1]); t = t.replace(m[0], " "); }
  else if ((m = /[\s:–—-](\d{1,7})\s*$/.exec(t))) { qty = Number(m[1]); t = t.slice(0, m.index); }
  const name = t.replace(/[–—:;|,-]+\s*$/, "").replace(/\s+/g, " ").trim();
  if (!/\p{L}{2,}/u.test(name)) return null;
  if (requireQty && qty == null) return null;   // sərbəst mətndə miqdarsız sətir adi cümlədir ("Hörmətli ...")
  return { text, name, qty: qty != null && qty > 0 ? Math.round(qty) : null };
}

/** Cədvəldən (Excel/CSV/Word cədvəli): ad və say sütunlarını tap, yoxdursa hər sətri mətn kimi oxu */
function fromRows(rows: string[][]): ParsedLine[] {
  const d = detectColumns(rows, []);
  const ni = d.cols.findIndex((c) => c.key === "name");
  const qi = d.cols.findIndex((c) => c.key === "minOrder");
  if (ni >= 0 && qi >= 0) {
    const specs = d.cols.findIndex((c) => c.key === "specs");
    return rows.slice(d.header + 1).flatMap((r) => {
      const name = String(r?.[ni] ?? "").trim();
      if (!/\p{L}{2,}/u.test(name) || /^(cəmi|yekun|total|итого)/i.test(name)) return [];
      const q = parseNum(String(r?.[qi] ?? ""));
      const extra = specs >= 0 && r?.[specs] ? ` (${r[specs]})` : "";
      return [{ text: r.filter(Boolean).join(" | "), name: name + extra, qty: q != null && q > 0 ? Math.round(q) : null }];
    });
  }
  return rows.map((r) => (r ?? []).filter(Boolean).join(" ")).map((l) => parseLine(l)).filter((x): x is ParsedLine => Boolean(x));
}

function docxRows(buf: ArrayBuffer): { rows: string[][]; lines: string[] } {
  const xml = strFromU8(unzipSync(new Uint8Array(buf))["word/document.xml"] ?? new Uint8Array());
  const txt = (s: string) => Array.from(s.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)).map((m) => m[1]).join("").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const rows = Array.from(xml.matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g)).map((tr) => Array.from(tr[0].matchAll(/<w:tc[\s>][\s\S]*?<\/w:tc>/g)).map((tc) => txt(tc[0]).trim()));
  const body = xml.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, "");
  const lines = Array.from(body.matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)).map((p) => txt(p[0]).trim()).filter(Boolean);
  return { rows, lines };
}

async function pdfLines(buf: ArrayBuffer): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const out: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // eyni hündürlükdəki parçaları bir sətrə yığ
    const byY = new Map<number, { x: number; s: string }[]>();
    for (const it of content.items as { str: string; transform: number[] }[]) {
      if (!it.str?.trim()) continue;
      const y = Math.round(it.transform[5] / 3);
      byY.set(y, [...(byY.get(y) ?? []), { x: it.transform[4], s: it.str }]);
    }
    Array.from(byY.entries()).sort((a, b) => b[0] - a[0]).forEach(([, parts]) => out.push(parts.sort((a, b) => a.x - b.x).map((p) => p.s).join(" ")));
  }
  return out;
}

async function imageLines(file: File, onProgress?: (p: number) => void): Promise<string[]> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["aze", "eng", "rus"], 1, { logger: (m: { status: string; progress: number }) => m.status === "recognizing text" && onProgress?.(m.progress) });
  try {
    const { data } = await worker.recognize(file);
    return data.text.split(/\r?\n/);
  } finally {
    await worker.terminate();
  }
}

export async function readQuoteFile(file: File, onProgress?: (p: number) => void): Promise<ParsedLine[]> {
  const n = file.name.toLowerCase();
  if (n.endsWith(".xlsx")) return parseXlsx(await file.arrayBuffer()).flatMap((s) => fromRows(s.rows));
  if (n.endsWith(".csv")) return fromRows(parseCsv(await file.text())[0].rows);
  if (n.endsWith(".docx")) {
    const { rows, lines } = docxRows(await file.arrayBuffer());
    return [...(rows.length ? fromRows(rows) : []), ...lines.map((l) => parseLine(l, true)).filter((x): x is ParsedLine => Boolean(x))];
  }
  const free = (ls: string[]) => ls.map((l) => parseLine(l, true)).filter((x): x is ParsedLine => Boolean(x));
  if (n.endsWith(".pdf")) return free(await pdfLines(await file.arrayBuffer()));
  if (/\.(png|jpe?g|webp|bmp|gif)$/.test(n)) return free(await imageLines(file, onProgress));
  if (n.endsWith(".txt")) return free((await file.text()).split(/\r?\n/));
  throw new Error("Bu fayl növü dəstəklənmir. PDF, Excel (.xlsx, .csv), Word (.docx) və ya şəkil yükləyin. Köhnə .doc/.xls faylını yeni formatda saxlayın.");
}

/** Ən uyğun bazadakı məhsul: kod tam düşərsə dərhal, yoxsa söz oxşarlığı (Dice). 0.35-dən aşağı uyğun sayılmır. */
export function matchProduct<T extends { id: string; code: string | null; name: string; extra?: string }>(name: string, products: T[]): { product: T; score: number } | null {
  const words = (s: string) => new Set(normName(s).split(" ").filter((w) => w.length >= 2));
  const a = words(name);
  if (!a.size) return null;
  let best: { product: T; score: number } | null = null;
  for (const p of products) {
    if (p.code && a.has(normName(p.code))) return { product: p, score: 1 };
    const b = words(`${p.name} ${p.extra ?? ""}`);
    const nameOnly = words(p.name);
    let common = 0;
    for (const w of a) if (b.has(w) || Array.from(b).some((x) => x.length >= 4 && w.length >= 4 && (x.startsWith(w.slice(0, 4)) || w.startsWith(x.slice(0, 4))))) common++;
    const score = (2 * common) / (a.size + nameOnly.size);
    if (!best || score > best.score) best = { product: p, score };
  }
  return best && best.score >= 0.35 ? best : null;
}
