"use client";

import { useMemo, useState, useTransition } from "react";
import { importCostRows } from "@/app/admin/cost-actions";
import { CURRENCIES, money, normName, tierLabel } from "@/lib/costs";
import { detectColumns, detectSupplier, extractRows, keyLabel, STD_COLS, templateExample, templateHeaders, type ColKey, type ColMap, type RawRow } from "@/lib/price-import";
import { parseCsv, parseXlsx, type Sheet } from "@/lib/sheet-parse";
import { buildXlsx } from "@/lib/sheet-write";

type Existing = { id: string; code: string | null; name: string; category: string };
const inp = "w-full rounded-md border border-[var(--line)] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#0066ff]";
const lbl = "mb-1 block text-xs font-semibold text-neutral-500";

export function PriceImport({ existing, suppliers, categories, fields }: { existing: Existing[]; suppliers: string[]; categories: string[]; fields: { id: string; label: string }[] }) {
  const [file, setFile] = useState("");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [si, setSi] = useState(0);
  const [header, setHeader] = useState(0);
  const [cols, setCols] = useState<ColMap[]>([]);
  const [rows, setRows] = useState<RawRow[]>([]);
  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [pending, start] = useTransition();

  const byCode = useMemo(() => new Map(existing.filter((p) => p.code).map((p) => [normName(p.code!), p])), [existing]);
  const byNameCat = useMemo(() => new Map(existing.map((p) => [`${normName(p.name)}|${normName(p.category)}`, p])), [existing]);
  const byName = useMemo(() => new Map(existing.map((p) => [normName(p.name), p])), [existing]);
  const match = (r: RawRow) => (r.code && byCode.get(normName(r.code))) || byNameCat.get(`${normName(r.name)}|${normName(r.category || category)}`) || byName.get(normName(r.name)) || null;

  function build(sheet: Sheet, h: number, c: ColMap[]) {
    setRows(extractRows(sheet.rows, h, c).map((r) => ({ ...r, productId: match(r)?.id ?? null })));
  }

  async function onFile(f: File) {
    setErr(""); setDone("");
    try {
      const list = /\.csv$/i.test(f.name) ? parseCsv(await f.text()) : parseXlsx(await f.arrayBuffer());
      if (!list.length) throw new Error();
      const scored = list.map((s, i) => {
        const d = detectColumns(s.rows, fields);
        const n = extractRows(s.rows, d.header, d.cols).filter((r) => r.include).length;
        return { i, d, w: n ? d.score * 10 + Math.min(n, 50) : -1 };
      });
      const best = scored.reduce((a, b) => (b.w > a.w ? b : a));
      setFile(f.name); setSheets(list); setSi(best.i); setHeader(best.d.header); setCols(best.d.cols);
      setSupplier(best.d.cols.some((c) => c.key === "supplier") ? "" : detectSupplier(list[best.i].rows, f.name, best.d.header));
      build(list[best.i], best.d.header, best.d.cols);
    } catch {
      setErr("Fayl oxunmadı. .xlsx və ya .csv seçin (köhnə .xls faylını Excel-də .xlsx kimi saxlayın).");
    }
  }
  const rebuild = (h: number, c: ColMap[]) => { setHeader(h); setCols(c); build(sheets[si], h, c); };
  const patch = (key: string, p: Partial<RawRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));

  function downloadTemplate() {
    const head = templateHeaders(fields);
    const data = buildXlsx("Qiymət bazası", [head, templateExample(fields)], head.map((h) => (/adı|xüsusiyyət|Təchizatçı/.test(h) ? 30 : Math.max(10, h.length + 2))));
    const url = URL.createObjectURL(new Blob([data as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const a = document.createElement("a");
    a.href = url; a.download = "Lemur-qiymet-bazasi-sablon.xlsx"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const chosen = rows.filter((r) => r.include);
  const final = chosen.map((r) => ({ ...r, supplier: r.supplier || supplier, category: r.category || category }));
  const problems = final.filter((r) => !r.supplier.trim() || (!r.productId && (!r.name.trim() || !r.category.trim())) || r.unitPrice == null).length;
  const sheet = sheets[si];
  const headRow = sheet?.rows[header] ?? [];
  const width = Math.max(headRow.length, cols.length);
  const keys: ColKey[] = ["skip", ...STD_COLS.map((c) => c.key), "tier", ...fields.map((f) => `x:${f.id}` as ColKey)];

  function submit() {
    setErr(""); setDone("");
    start(async () => {
      const r = await importCostRows(final.map((x) => ({ ...x, vat: Boolean(x.vat) })), file);
      if (r.error) setErr(r.error);
      else {
        setDone(`Hazırdır: ${r.offers} qiymət yazıldı · ${r.products} yeni məhsul (kodu avtomatik) · ${r.suppliers} yeni təchizatçı · ${r.categories} yeni kateqoriya. Təkrar məhsul yaradılmadı.`);
        setRows([]); setSheets([]); setFile("");
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-white p-5">
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-[var(--surface)] p-3 text-sm">
          <button type="button" onClick={downloadTemplate} className="rounded-md bg-[#1b1d1f] px-3 py-1.5 font-semibold text-white">Standart şablonu yüklə (.xlsx)</button>
          <span className="text-neutral-600">Şablonda formanın bütün xanaları var, əlavə etdiyiniz xanalar da. Hər sətir: bir məhsul + bir təchizatçının qiyməti.</span>
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block font-bold">Faylı seçin (.xlsx, .csv)</span>
          <input type="file" accept=".xlsx,.csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="block text-sm" />
        </label>
        <p className="mt-2 text-xs text-neutral-500">Eyni kodlu və ya eyni ad + kateqoriyalı məhsul bazada varsa, yenisi yaradılmır: qiymət ona yazılır. Eyni təchizatçının köhnə qiyməti yenilənir.</p>
        {err && <p className="mt-3 text-sm font-semibold text-accent">{err}</p>}
        {done && <p className="mt-3 text-sm font-semibold text-[#1f7a3a]">{done}</p>}
      </section>

      {sheet && (
        <>
          <section className="grid gap-3 rounded-xl bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
            <label><span className={lbl}>Təchizatçı (faylda sütun yoxdursa)</span>
              <input className={inp} list="imp-sup" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder={cols.some((c) => c.key === "supplier") ? "faylda var" : "yazın"} />
              <datalist id="imp-sup">{suppliers.map((s) => <option key={s} value={s} />)}</datalist>
            </label>
            <label><span className={lbl}>Kateqoriya (boş sətirlər üçün)</span>
              <input className={inp} list="imp-cat" value={category} onChange={(e) => setCategory(e.target.value)} />
              <datalist id="imp-cat">{categories.map((s) => <option key={s} value={s} />)}</datalist>
            </label>
            {sheets.length > 1 && (
              <label><span className={lbl}>Vərəq</span>
                <select className={inp} value={si} onChange={(e) => { const i = Number(e.target.value); const d = detectColumns(sheets[i].rows, fields); setSi(i); setHeader(d.header); setCols(d.cols); build(sheets[i], d.header, d.cols); }}>
                  {sheets.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
                </select>
              </label>
            )}
            <label><span className={lbl}>Başlıq sətri (Excel-də nömrə)</span>
              <input type="number" min={1} className={inp} value={header + 1} onChange={(e) => rebuild(Math.max(0, (Number(e.target.value) || 1) - 1), cols)} />
            </label>
          </section>

          <section className="rounded-xl bg-white p-5">
            <h3 className="mb-3 font-bold">Sütunlar</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: width }, (_, ci) => {
                const c = cols[ci] ?? { key: "skip" as ColKey };
                return (
                  <div key={ci} className={`w-44 shrink-0 rounded-lg border p-2 ${c.key === "skip" ? "border-[var(--line)] opacity-60" : "border-[#0066ff]/50"}`}>
                    <p className="truncate text-xs font-semibold" title={headRow[ci]}>{headRow[ci] || `Sütun ${ci + 1}`}</p>
                    <p className="truncate text-[11px] text-neutral-500">{sheet.rows[header + 1]?.[ci] ?? ""}</p>
                    <select className={`${inp} mt-1`} value={c.key} onChange={(e) => rebuild(header, cols.map((x, i) => (i === ci ? { key: e.target.value as ColKey, qty: e.target.value === "tier" ? x.qty ?? 100 : undefined } : x)))}>
                      {keys.map((k) => <option key={k} value={k}>{keyLabel(k, fields)}</option>)}
                    </select>
                    {c.key === "tier" && (
                      <label className="mt-1 flex items-center gap-1 text-xs">X = <input type="number" min={1} className={inp} value={c.qty ?? 1} onChange={(e) => rebuild(header, cols.map((x, i) => (i === ci ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x)))} /></label>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">Önizləmə: {chosen.length} / {rows.length} sətir</h3>
              <p className="text-xs text-neutral-500">Narıncı: bazada var (yeni məhsul yaranmayacaq). Qırmızı fon: məcburi xana boşdur.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[70rem] text-sm">
                <thead className="text-left text-xs text-neutral-500">
                  <tr><th className="w-8 py-2" /><th className="w-56 pr-2">Məhsul adı *</th><th className="pr-2">Kateqoriya * / alt</th><th className="pr-2">Təchizatçı *</th><th className="w-24 pr-2">Alış *</th><th className="w-20 pr-2">Valyuta</th><th className="w-24 pr-2">Vahid / min.</th><th className="pr-2">Digər</th><th className="pr-2">Bazada</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] align-top">
                  {rows.map((r) => {
                    const sup = r.supplier || supplier, cat = r.category || category;
                    const bad = r.include && (!sup.trim() || (!r.productId && (!r.name.trim() || !cat.trim())) || r.unitPrice == null);
                    const m = r.productId ? existing.find((x) => x.id === r.productId) : null;
                    return (
                      <tr key={r.key} className={`${!r.include ? "opacity-40" : ""} ${bad ? "bg-[#c42b0d]/5" : ""}`}>
                        <td className="py-2"><input type="checkbox" checked={r.include} onChange={(e) => patch(r.key, { include: e.target.checked })} /></td>
                        <td className="py-1.5 pr-2"><input className={inp} value={r.name} onChange={(e) => patch(r.key, { name: e.target.value })} /></td>
                        <td className="py-1.5 pr-2">
                          <input className={inp} list="imp-cat" value={r.category} placeholder={category || "kateqoriya"} onChange={(e) => patch(r.key, { category: e.target.value })} />
                          <input className={`${inp} mt-1`} value={r.subcategory} placeholder="alt kateqoriya" onChange={(e) => patch(r.key, { subcategory: e.target.value })} />
                        </td>
                        <td className="py-1.5 pr-2"><input className={inp} list="imp-sup" value={r.supplier} placeholder={supplier || "təchizatçı"} onChange={(e) => patch(r.key, { supplier: e.target.value })} /></td>
                        <td className="py-1.5 pr-2"><input className={inp} inputMode="decimal" value={r.unitPrice == null ? "" : String(r.unitPrice).replace(".", ",")} onChange={(e) => { const v = Number(e.target.value.replace(",", ".")); patch(r.key, { unitPrice: e.target.value === "" || !Number.isFinite(v) ? null : v }); }} /></td>
                        <td className="py-1.5 pr-2"><select className={inp} value={r.currency} onChange={(e) => patch(r.key, { currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></td>
                        <td className="py-1.5 pr-2 text-xs">{r.priceUnit}<br />min. {r.minOrder ?? "—"}</td>
                        <td className="py-1.5 pr-2 text-xs text-neutral-600">
                          {Object.entries(r.tiers).map(([q, p]) => <span key={q} className="mr-1.5 inline-block">{tierLabel(Number(q))}+: {money(p, 3)}</span>)}
                          <span className="block">{[r.material, r.leadDays != null && `${r.leadDays} gün`, r.vat && "ƏDV daxil", r.deliveryFee ? `çatd. ${r.deliveryFee}` : "", r.priceDate].filter(Boolean).join(" · ")}</span>
                        </td>
                        <td className="py-1.5 pr-2 text-xs">
                          {m ? (
                            <span className="block rounded bg-[#0066ff]/10 px-2 py-1 text-[#0047b3]">{m.code} · {m.name} <button type="button" onClick={() => patch(r.key, { productId: null })} className="font-semibold underline">ayrı yarat</button></span>
                          ) : (
                            <span className="text-neutral-500">yeni məhsul{match(r) && <button type="button" onClick={() => patch(r.key, { productId: match(r)!.id })} className="ml-1 font-semibold underline">bazadakına bağla</button>}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!rows.length && <p className="py-6 text-center text-sm text-neutral-500">Qiymət sətri tapılmadı. Başlıq sətrini və sütunları yoxlayın.</p>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={submit} disabled={pending || !chosen.length || problems > 0} className="rounded-md bg-[#0066ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0052cc] disabled:opacity-50">
                {pending ? "Yazılır…" : `${chosen.length} sətri bazaya yaz`}
              </button>
              {problems > 0 && <span className="text-sm text-accent">{problems} sətirdə ad, kateqoriya, təchizatçı və ya alış qiyməti boşdur.</span>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
