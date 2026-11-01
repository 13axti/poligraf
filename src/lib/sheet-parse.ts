/** Kitabxanasız cədvəl oxuyucusu: .xlsx (fflate ilə açılır, XML regex ilə oxunur) və .csv. Brauzerdə və Node-da işləyir. */
import { strFromU8, unzipSync } from "fflate";

export interface Sheet { name: string; rows: string[][] }

const ent = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
const texts = (xml: string) => Array.from(xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)).map((m) => ent(m[1])).join("");
const colIndex = (ref: string) => {
  const letters = ref.replace(/\d+/g, "");
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

export function parseXlsx(buf: ArrayBuffer | Uint8Array): Sheet[] {
  const files = unzipSync(buf instanceof Uint8Array ? buf : new Uint8Array(buf));
  const read = (p: string) => (files[p] ? strFromU8(files[p]) : "");
  const shared = Array.from(read("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)).map((m) => texts(m[1]));
  const rels = new Map(
    Array.from(read("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*>/g)).map((m) => [
      /Id="([^"]+)"/.exec(m[0])?.[1] ?? "",
      (/Target="([^"]+)"/.exec(m[0])?.[1] ?? "").replace(/^\/?(xl\/)?/, ""),
    ])
  );
  const sheets: Sheet[] = [];
  for (const m of read("xl/workbook.xml").matchAll(/<sheet\b[^>]*>/g)) {
    const name = ent(/name="([^"]*)"/.exec(m[0])?.[1] ?? "Vərəq");
    const rid = /r:id="([^"]+)"/.exec(m[0])?.[1] ?? "";
    const xml = read(`xl/${rels.get(rid) ?? ""}`);
    if (!xml) continue;
    const rows: string[][] = [];
    for (const r of xml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
      const ri = Number(/\br="(\d+)"/.exec(r[0])?.[1] ?? rows.length + 1) - 1;
      const row: string[] = [];
      for (const c of (r[1] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = c[1];
        const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1];
        const t = /\bt="([^"]+)"/.exec(attrs)?.[1];
        const body = c[2] ?? "";
        const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
        let val = "";
        if (t === "s" && v != null) val = shared[Number(v)] ?? "";
        else if (t === "inlineStr") val = texts(body);
        else if (v != null) val = ent(v);
        row[ref ? colIndex(ref) : row.length] = val.trim();
      }
      rows[ri] = Array.from(row, (x) => x ?? "");
    }
    sheets.push({ name, rows: Array.from(rows, (x) => x ?? []) });
  }
  return sheets;
}

/** CSV: ayırıcı avtomatik (; , tab), dırnaqlı xanalar dəstəklənir */
export function parseCsv(text: string): Sheet[] {
  const t = text.replace(/^﻿/, "");
  const first = t.split(/\r?\n/, 1)[0] ?? "";
  const sep = [";", "\t", ","].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell.trim()); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      row.push(cell.trim()); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return [{ name: "CSV", rows }];
}
