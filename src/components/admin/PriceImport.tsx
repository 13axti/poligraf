"use client";

import { useMemo, useState, useTransition } from "react";
import { importCostPrices } from "@/app/admin/cost-actions";
import { money } from "@/lib/costs";
import { detect, detectSupplier, extractRows, mentionsVat, normName, ROLE_LABEL, type ColMap, type ImportRow, type Role } from "@/lib/price-import";
import { parseCsv, parseXlsx, type Sheet } from "@/lib/sheet-parse";
import { DecimalInput } from "./DecimalInput";

type Existing = { id: string; code: string | null; name: string };
type Row = ImportRow & { productId: string | null };

const inp = "w-full rounded-md border border-[var(--line)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#ff5a1f]";
const lbl = "mb-1 block text-xs font-semibold text-neutral-500";

export function PriceImport({ existing, suppliers }: { existing: Existing[]; suppliers: string[] }) {
  const [file, setFile] = useState("");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [si, setSi] = useState(0);
  const [header, setHeader] = useState(0);
  const [cols, setCols] = useState<ColMap[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [supplier, setSupplier] = useState("");
  const [vat, setVat] = useState(false);
  const [validUntil, setValidUntil] = useState("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [pending, start] = useTransition();

  const byCode = useMemo(() => new Map(existing.filter((p) => p.code).map((p) => [normName(p.code!), p.id])), [existing]);
  const byName = useMemo(() => new Map(existing.map((p) => [normName(p.name), p.id])), [existing]);
  const nameOf = useMemo(() => new Map(existing.map((p) => [p.id, `${p.code ? `${p.code} · ` : ""}${p.name}`])), [existing]);
  const match = (r: ImportRow) => (r.code && byCode.get(normName(r.code))) || byName.get(normName(r.name)) || null;

  function build(sheet: Sheet, h: number, c: ColMap[]) {
    setRows(extractRows(sheet.rows, h, c).map((r) => ({ ...r, productId: match(r) })));
  }

  async function onFile(f: File) {
    setErr(""); setDone("");
    try {
      const list = /\.csv$/i.test(f.name) ? parseCsv(await f.text()) : parseXlsx(await f.arrayBuffer());
      if (!list.length) throw new Error();
      // Başlıqları ən aydın tanınan (sonra ən çox qiymət sətri olan) vərəqi seç
      const scored = list.map((s, i) => {
        const d = detect(s.rows);
        const n = extractRows(s.rows, d.header, d.cols).filter((r) => r.include).length;
        return { i, d, w: n ? d.score * 10 + Math.min(n, 50) : -1 };
      });
      const best = scored.reduce((a, b) => (b.w > a.w ? b : a));
      setFile(f.name); setSheets(list); setSi(best.i); setHeader(best.d.header); setCols(best.d.cols);
      setSupplier(detectSupplier(list[best.i].rows, f.name, best.d.header));
      setVat(mentionsVat(list[best.i].rows));
      build(list[best.i], best.d.header, best.d.cols);
    } catch {
      setErr("Fayl oxunmadı. .xlsx və ya .csv seçin (köhnə .xls formatını Excel-də .xlsx kimi saxlayın).");
    }
  }

  function chooseSheet(i: number) {
    const d = detect(sheets[i].rows);
    setSi(i); setHeader(d.header); setCols(d.cols);
    setSupplier(detectSupplier(sheets[i].rows, file, d.header));
    build(sheets[i], d.header, d.cols);
  }
  function setRole(ci: number, role: Role) {
    const next = cols.map((c, i) => (i === ci ? { role, minQty: role === "tier" ? c.minQty ?? 100 : undefined } : c));
    setCols(next); build(sheets[si], header, next);
  }
  function setTierQty(ci: number, q: number) {
    const next = cols.map((c, i) => (i === ci ? { ...c, minQty: q } : c));
    setCols(next); build(sheets[si], header, next);
  }
  function setHeaderRow(h: number) {
    setHeader(h); build(sheets[si], h, cols);
  }
  const patch = (key: string, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));

  const chosen = rows.filter((r) => r.include);
  const missingName = chosen.filter((r) => !r.productId && !r.name.trim()).length;
  const missingSupplier = !supplier.trim() && chosen.some((r) => !r.supplier.trim());
  const sheet = sheets[si];
  const headRow = sheet?.rows[header] ?? [];
  const width = Math.max(headRow.length, cols.length);

  function submit() {
    setErr(""); setDone("");
    start(async () => {
      const r = await importCostPrices({
        supplier, vat, validUntil: validUntil || null, source: file, category,
        rows: chosen.map((x) => ({ productId: x.productId, name: x.name, code: x.code, spec: x.spec, unit: x.unit, supplier: x.supplier, vat: x.vat, tiers: x.tiers })),
      });
      if (r.error) setErr(r.error);
      else {
        setDone(`Hazırdır: ${r.prices} qiymət yazıldı, ${r.products} yeni məhsul, ${r.suppliers} yeni təchizatçı.`);
        setRows([]); setSheets([]); setFile("");
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-white p-5">
        <label className="block">
          <span className="mb-2 block font-bold">Təchizatçının Excel faylı</span>
          <input type="file" accept=".xlsx,.csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="block text-sm" />
        </label>
        <p className="mt-2 text-xs text-neutral-500">Sütunlar (məhsul adı, kod, qiymət, say pillələri) və şirkət adı avtomatik tanınır. Tanınmayanı aşağıda əl ilə düzəldin.</p>
        {err && <p className="mt-3 text-sm font-semibold text-accent">{err}</p>}
        {done && <p className="mt-3 text-sm font-semibold text-[#1f7a3a]">{done}</p>}
      </section>

      {sheet && (
        <>
          <section className="grid gap-3 rounded-xl bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
            <label className="lg:col-span-2"><span className={lbl}>Təchizatçı (şirkət adı)</span>
              <input className={`${inp} ${missingSupplier ? "border-[#c42b0d]" : ""}`} list="imp-sup" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Faylda tapılmadı, yazın" />
              <datalist id="imp-sup">{suppliers.map((s) => <option key={s} value={s} />)}</datalist>
            </label>
            <label><span className={lbl}>Etibarlıdır (tarixə qədər)</span><input type="date" className={inp} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></label>
            <label><span className={lbl}>Yeni məhsulların kateqoriyası</span><input className={inp} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="məs. Tekstil" /></label>
            <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} /> Qiymətlərə ƏDV daxildir</label>
            {sheets.length > 1 && (
              <label><span className={lbl}>Vərəq</span>
                <select className={inp} value={si} onChange={(e) => chooseSheet(Number(e.target.value))}>{sheets.map((s, i) => <option key={i} value={i}>{s.name}</option>)}</select>
              </label>
            )}
            <label><span className={lbl}>Başlıq sətri (Excel-də nömrə)</span>
              <input type="number" min={1} className={inp} value={header + 1} onChange={(e) => setHeaderRow(Math.max(0, (Number(e.target.value) || 1) - 1))} />
            </label>
          </section>

          <section className="rounded-xl bg-white p-5">
            <h3 className="mb-3 font-bold">Sütunlar</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: width }, (_, ci) => {
                const c = cols[ci] ?? { role: "skip" as Role };
                return (
                  <div key={ci} className={`w-44 shrink-0 rounded-lg border p-2 ${c.role === "skip" ? "border-[var(--line)] opacity-70" : "border-[#ff5a1f]/50"}`}>
                    <p className="truncate text-xs font-semibold" title={headRow[ci]}>{headRow[ci] || `Sütun ${ci + 1}`}</p>
                    <p className="truncate text-[11px] text-neutral-500">{sheet.rows[header + 1]?.[ci] ?? ""}</p>
                    <select className={`${inp} mt-1`} value={c.role} onChange={(e) => setRole(ci, e.target.value as Role)}>
                      {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                    </select>
                    {c.role === "tier" && (
                      <label className="mt-1 flex items-center gap-1 text-xs">X = <input type="number" min={1} className={inp} value={c.minQty ?? 1} onChange={(e) => setTierQty(ci, Math.max(1, Number(e.target.value) || 1))} /> ədəd</label>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">Önizləmə: {chosen.length} / {rows.length} sətir</h3>
              <p className="text-xs text-neutral-500">Narıncı: bazada tapıldı. Boz: yeni məhsul yaradılacaq. Qırmızı: ad boşdur, yazın.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-sm">
                <thead className="text-left text-xs text-neutral-500">
                  <tr><th className="w-8 py-2" /><th className="pr-2">Məhsul adı</th><th className="w-24 pr-2">Kod</th><th className="pr-2">Spesifikasiya</th><th className="w-20 pr-2">Vahid</th><th className="pr-2">Qiymətlər (saydan: ₼)</th><th className="pr-2">Bazada</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] align-top">
                  {rows.map((r) => {
                    const bad = r.include && !r.productId && !r.name.trim();
                    return (
                      <tr key={r.key} className={`${!r.include ? "opacity-40" : ""} ${bad ? "bg-[#c42b0d]/5" : ""}`}>
                        <td className="py-2"><input type="checkbox" checked={r.include} onChange={(e) => patch(r.key, { include: e.target.checked })} /></td>
                        <td className="py-1.5 pr-2"><input className={`${inp} ${bad ? "border-[#c42b0d]" : ""}`} value={r.name} placeholder="Məhsul adını yazın" onChange={(e) => patch(r.key, { name: e.target.value, productId: r.productId && e.target.value !== r.name ? null : r.productId })} /></td>
                        <td className="py-1.5 pr-2"><input className={inp} value={r.code} placeholder={r.productId ? "" : "avtomatik"} onChange={(e) => patch(r.key, { code: e.target.value })} /></td>
                        <td className="py-1.5 pr-2"><input className={inp} value={r.spec} onChange={(e) => patch(r.key, { spec: e.target.value })} /></td>
                        <td className="py-1.5 pr-2"><input className={inp} value={r.unit} onChange={(e) => patch(r.key, { unit: e.target.value })} /></td>
                        <td className="py-1.5 pr-2">
                          <div className="flex flex-wrap gap-1">
                            {r.tiers.map((t, ti) => (
                              <span key={ti} className="flex items-center gap-1 rounded bg-[var(--surface)] px-1.5 py-1 text-xs">
                                {t.minQty}+:
                                <DecimalInput className="w-16 rounded border border-[var(--line)] bg-white px-1 py-0.5 text-xs" value={t.price}
                                  onChange={(v) => patch(r.key, { tiers: r.tiers.map((x, xi) => (xi === ti ? { ...x, price: v ?? 0 } : x)) })} />
                              </span>
                            ))}
                          </div>
                          {r.supplier && <span className="mt-1 block text-xs text-neutral-500">{r.supplier}</span>}
                        </td>
                        <td className="py-1.5 pr-2 text-xs">
                          {r.productId ? (
                            <span className="block rounded bg-[#ff5a1f]/10 px-2 py-1 text-[#b8400f]">
                              {nameOf.get(r.productId)}
                              <button type="button" onClick={() => patch(r.key, { productId: null })} className="ml-1 font-semibold underline">ayrı yarat</button>
                            </span>
                          ) : (
                            <span className="text-neutral-500">yeni məhsul{match(r) && <button type="button" onClick={() => patch(r.key, { productId: match(r) })} className="ml-1 font-semibold underline">bazadakına bağla</button>}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!rows.length && <p className="py-6 text-center text-sm text-neutral-500">Qiymət sətri tapılmadı. Yuxarıda başlıq sətrini və sütunları yoxlayın.</p>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={submit} disabled={pending || !chosen.length || missingName > 0 || missingSupplier}
                className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04810] disabled:opacity-50">
                {pending ? "Yazılır…" : `${chosen.reduce((s, r) => s + r.tiers.length, 0)} qiyməti bazaya yaz`}
              </button>
              {missingName > 0 && <span className="text-sm text-accent">{missingName} sətirdə məhsul adı boşdur.</span>}
              {missingSupplier && <span className="text-sm text-accent">Təchizatçının adını yazın.</span>}
              {chosen.length > 0 && <span className="text-xs text-neutral-500">Ən ucuz nümunə: {money(Math.min(...chosen.flatMap((r) => r.tiers.map((t) => t.price))), 3)} ₼</span>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
