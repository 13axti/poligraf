"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveQuote } from "@/app/admin/quote-actions";
import { lineSale, money, normName, offersFor, quoteSums, suitable, type CostOffer, type QuoteLine, type Rates } from "@/lib/costs";
import { readQuoteFile, matchProduct } from "@/lib/quote-parse";
import { DecimalInput } from "../DecimalInput";

export interface QProduct { id: string; code: string | null; name: string; specs: string; unit: string; extra?: string }
export interface QuoteInit {
  id: string | null; number: string | null; client: string; contact: string; phone: string; email: string;
  quoteDate: string; note: string; margin: number; vat: boolean; source: string; lines: QuoteLine[];
}

const inp = "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[#ff5a1f]";
const lbl = "mb-1 block text-xs font-semibold text-neutral-500";
const uid = () => Math.random().toString(36).slice(2, 10);

export function QuoteEditor({ init, products, offers, rates, day, fileMode }: { init: QuoteInit; products: QProduct[]; offers: CostOffer[]; rates: Rates; day: string; fileMode?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(init);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  const byProduct = useMemo(() => {
    const m = new Map<string, CostOffer[]>();
    for (const o of offers) m.set(o.productId, [...(m.get(o.productId) ?? []), o]);
    return m;
  }, [offers]);
  const pmap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  /** Sətrin təchizatçı və mayasını say/marjaya görə yenidən hesablayır (əl ilə dəyişilənlərə toxunmur) */
  const compute = (l: QuoteLine, margin: number): QuoteLine => {
    if (!l.productId || l.purchaseManual) return l.saleManual ? l : { ...l, sale: lineSale(l.purchase, margin) };
    const list = offersFor(byProduct.get(l.productId) ?? [], Math.max(1, l.qty), rates, day);
    const pick = (l.supplierPinned && list.find((o) => o.offer.supplierId === l.supplierId)) || list.find(suitable) || list[0];
    const purchase = pick ? Math.round(pick.effAZN * 1000) / 1000 : 0;
    return { ...l, supplierId: pick?.offer.supplierId ?? null, supplier: pick?.offer.supplier ?? "", purchase, sale: l.saleManual ? l.sale : lineSale(purchase, margin) };
  };
  const update = (fn: (x: QuoteInit) => QuoteInit) => { setQ((x) => fn(x)); setDirty(true); setMsg(null); };
  const setLines = (fn: (ls: QuoteLine[]) => QuoteLine[]) => update((x) => ({ ...x, lines: fn(x.lines).map((l) => compute(l, x.margin)) }));
  const patch = (key: string, p: Partial<QuoteLine>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...p } : l)));

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const results = useMemo(() => {
    const t = normName(search);
    if (!t) return [];
    return products.filter((p) => normName(`${p.code ?? ""} ${p.name} ${p.specs}`).includes(t)).slice(0, 12);
  }, [search, products]);

  function addProduct(p: QProduct, qty = 100, source?: string) {
    setLines((ls) => [...ls, { key: uid(), productId: p.id, name: p.name, specs: p.specs, qty, unit: p.unit, supplierId: null, supplier: "", purchase: 0, sale: 0, saleManual: false, source }]);
  }

  async function onFile(f: File) {
    setBusy("Fayl oxunur…"); setMsg(null);
    try {
      const lines = await readQuoteFile(f, (p) => setBusy(`Şəkil tanınır… ${Math.round(p * 100)}%`));
      if (!lines.length) { setMsg({ text: "Faylda məhsul sətri tapılmadı. Məhsulları əl ilə əlavə edin." }); return; }
      const cands = products.map((p) => ({ ...p, extra: p.specs }));
      const added: QuoteLine[] = lines.slice(0, 200).map((l) => {
        const m = matchProduct(l.name, cands);
        const p = m?.product;
        return { key: uid(), productId: p?.id ?? null, name: p?.name ?? l.name, specs: p?.specs ?? "", qty: l.qty ?? 1, unit: p?.unit ?? "ədəd", supplierId: null, supplier: "", purchase: 0, sale: 0, saleManual: false, source: l.text };
      });
      setLines((ls) => [...ls, ...added]);
      update((x) => ({ ...x, source: "file" }));
      const found = added.filter((l) => l.productId).length;
      setMsg({ ok: true, text: `${added.length} sətir oxundu: ${found} məhsul bazada tapıldı, ${added.length - found} sətri yoxlayıb uyğun məhsulu seçin və ya qiyməti əl ilə yazın.` });
    } catch (e) {
      setMsg({ text: (e as Error).message || "Fayl oxunmadı" });
    } finally {
      setBusy("");
    }
  }

  function save() {
    start(async () => {
      const r = await saveQuote({ ...q, lines: q.lines });
      if (r.error) return setMsg({ text: r.error });
      setDirty(false);
      setMsg({ ok: true, text: `Saxlanıldı: ${r.number}` });
      if (!q.id && r.id) router.replace(`/admin/quotes/${r.id}?msg=${encodeURIComponent(`Təklif ${r.number} yaradıldı`)}`);
      else router.refresh();
    });
  }

  const sums = quoteSums(q.lines, q.vat);
  const unmatched = q.lines.filter((l) => !l.productId && !l.purchaseManual).length;

  return (
    <div className="space-y-5 pb-28">
      <section className="rounded-xl bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label><span className={lbl}>Təklif nömrəsi</span><input readOnly value={q.number ?? "Saxlayanda avtomatik veriləcək"} className={`${inp} bg-[var(--surface)] font-mono text-neutral-600`} /></label>
          <label><span className={lbl}>Təklif tarixi</span><input type="date" value={q.quoteDate} onChange={(e) => update((x) => ({ ...x, quoteDate: e.target.value }))} className={inp} /></label>
          <label className="sm:col-span-2"><span className={lbl}>Müştəri / Şirkət adı</span><input value={q.client} onChange={(e) => update((x) => ({ ...x, client: e.target.value }))} className={inp} /></label>
          <label><span className={lbl}>Əlaqədar şəxs</span><input value={q.contact} onChange={(e) => update((x) => ({ ...x, contact: e.target.value }))} className={inp} /></label>
          <label><span className={lbl}>Telefon</span><input type="tel" value={q.phone} onChange={(e) => update((x) => ({ ...x, phone: e.target.value }))} className={inp} /></label>
          <label><span className={lbl}>E-poçt</span><input type="email" value={q.email} onChange={(e) => update((x) => ({ ...x, email: e.target.value }))} className={inp} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label><span className={lbl}>Marja, %</span><DecimalInput value={q.margin} onChange={(v) => update((x) => ({ ...x, margin: v ?? 0, lines: x.lines.map((l) => compute(l, v ?? 0)) }))} className={inp} /></label>
            <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={q.vat} onChange={(e) => update((x) => ({ ...x, vat: e.target.checked }))} /> ƏDV 18%</label>
          </div>
        </div>
      </section>

      <section className={`rounded-xl bg-white p-5 ${fileMode ? "ring-2 ring-[#ff5a1f]/40" : ""}`}>
        <h3 className="mb-2 font-bold">Fayldan avtomatik təklif</h3>
        <p className="mb-3 text-sm text-neutral-500">Müştərinin göndərdiyi PDF, Excel, Word və ya şəkil. Sistem məhsulları və miqdarları oxuyur, bazada uyğun məhsulu tapır və ən ucuz alış qiyməti ilə hesablayır. Nəticəni aşağıda yoxlayıb düzəldin.</p>
        <input type="file" accept=".pdf,.xlsx,.csv,.docx,.txt,image/*" disabled={Boolean(busy)} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void onFile(f); }} className="block text-sm" />
        {busy && <p className="mt-2 text-sm font-semibold text-[#c2410c]">{busy}</p>}
      </section>

      <section className="rounded-xl bg-white p-5">
        <label className="block"><span className={lbl}>Bazadan məhsul əlavə et</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className={inp} placeholder="Axtar: ad və ya kod" />
        </label>
        {results.length > 0 && (
          <div className="mt-2 max-h-64 divide-y divide-[var(--line)] overflow-y-auto rounded-lg border border-[var(--line)]">
            {results.map((p) => {
              const best = offersFor(byProduct.get(p.id) ?? [], 100, rates, day).find(suitable);
              return (
                <button key={p.id} type="button" onClick={() => { addProduct(p); setSearch(""); }} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--surface)]">
                  <span className="w-12 shrink-0 font-mono text-xs text-neutral-500">{p.code}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{best ? `${money(best.effAZN, 3)} ₼ · ${best.offer.supplier}` : "qiymət yoxdur"}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {msg && <p className={`rounded-lg bg-white px-4 py-3 text-sm font-semibold ${msg.ok ? "text-[#1f7a3a]" : "text-accent"}`}>{msg.text}</p>}

      <section className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[72rem] text-sm">
          <thead className="border-b border-[var(--line)] text-left text-xs text-neutral-500">
            <tr>
              <th className="w-8 px-3 py-3">#</th><th className="w-64 pr-2">Məhsul</th><th className="pr-2">Texniki xüsusiyyətlər</th><th className="w-24 pr-2">Miqdar</th>
              <th className="w-52 pr-2">Ən ucuz təchizatçı</th><th className="w-24 pr-2">Alış (AZN)</th><th className="w-28 pr-2">Satış (AZN)</th><th className="w-28 pr-2 text-right">Ümumi</th><th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] align-top">
            {q.lines.map((l, i) => {
              const list = l.productId ? offersFor(byProduct.get(l.productId) ?? [], Math.max(1, l.qty), rates, day) : [];
              const chosen = list.find((o) => o.offer.supplierId === l.supplierId);
              const warn = !l.productId && !l.purchaseManual;
              return (
                <tr key={l.key} className={warn ? "bg-[#c42b0d]/5" : ""}>
                  <td className="px-3 py-2 text-neutral-500">{i + 1}</td>
                  <td className="py-2 pr-2">
                    <input value={l.name} onChange={(e) => patch(l.key, { name: e.target.value })} className={inp} />
                    <select value={l.productId ?? ""} onChange={(e) => { const p = pmap.get(e.target.value); patch(l.key, p ? { productId: p.id, name: p.name, specs: p.specs, unit: p.unit, supplierPinned: false, purchaseManual: false } : { productId: null }); }} className={`${inp} mt-1 text-xs`}>
                      <option value="">{warn ? "⚠ Bazada uyğun məhsul seçin" : "Bazada deyil (əl ilə)"}</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
                    </select>
                    {l.source && <span className="mt-1 block truncate text-[11px] text-neutral-400" title={l.source}>Fayldan: {l.source}</span>}
                  </td>
                  <td className="py-2 pr-2"><textarea rows={2} value={l.specs} onChange={(e) => patch(l.key, { specs: e.target.value })} className={inp} /></td>
                  <td className="py-2 pr-2"><input type="number" min={1} value={l.qty} onChange={(e) => patch(l.key, { qty: Math.max(1, Number(e.target.value) || 1) })} className={inp} /><span className="text-xs text-neutral-500">{l.unit}</span></td>
                  <td className="py-2 pr-2">
                    {l.productId ? (
                      <>
                        <select value={l.supplierPinned ? l.supplierId ?? "" : ""} onChange={(e) => patch(l.key, e.target.value ? { supplierId: e.target.value, supplierPinned: true } : { supplierPinned: false })} className={`${inp} text-xs`}>
                          <option value="">Avtomatik: {list.find(suitable)?.offer.supplier ?? list[0]?.offer.supplier ?? "qiymət yoxdur"}</option>
                          {list.map((o) => <option key={o.offer.id} value={o.offer.supplierId}>{o.offer.supplier} — {money(o.effAZN, 3)} ₼{o.belowMin ? " (min. azdır)" : ""}{o.expired ? " (köhnə)" : ""}</option>)}
                        </select>
                        {chosen && <span className="mt-1 block text-[11px] text-neutral-500">{[chosen.offer.leadDays != null && `${chosen.offer.leadDays} gün`, chosen.belowMin && `min. ${chosen.offer.minOrder}`, chosen.offer.currency !== "AZN" && `${money(chosen.price, 3)} ${chosen.offer.currency}`].filter(Boolean).join(" · ")}</span>}
                        {!list.length && <span className="text-xs text-[#c42b0d]">Bu məhsula qiymət yoxdur</span>}
                      </>
                    ) : <span className="text-xs text-neutral-500">—</span>}
                  </td>
                  <td className="py-2 pr-2">
                    {l.productId && !l.purchaseManual ? (
                      <span className="block py-2 font-semibold">{money(l.purchase, 3)}</span>
                    ) : (
                      <DecimalInput value={l.purchase} onChange={(v) => patch(l.key, { purchase: v ?? 0, purchaseManual: true })} className={inp} />
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    <DecimalInput value={l.sale} onChange={(v) => patch(l.key, { sale: v ?? 0, saleManual: true })} className={inp} />
                    {l.saleManual && <button type="button" onClick={() => patch(l.key, { saleManual: false })} className="text-[11px] text-neutral-500 underline">marjaya qaytar</button>}
                  </td>
                  <td className="py-2 pr-2 text-right font-semibold">{money(l.sale * l.qty)}</td>
                  <td className="py-2"><button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="px-2 text-neutral-400 hover:text-[#c42b0d]" aria-label="Sil">✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!q.lines.length && <p className="px-5 py-8 text-center text-neutral-500">Məhsul yoxdur. Bazadan axtarıb əlavə edin və ya fayl yükləyin.</p>}
        <div className="flex flex-wrap items-start justify-between gap-4 border-t border-[var(--line)] p-5">
          <button type="button" onClick={() => setLines((ls) => [...ls, { key: uid(), productId: null, name: "", specs: "", qty: 1, unit: "ədəd", supplierId: null, supplier: "", purchase: 0, sale: 0, saleManual: false, purchaseManual: true }])} className="rounded-md bg-[var(--surface)] px-3 py-2 text-sm font-semibold">+ Bazada olmayan sətir</button>
          <div className="min-w-64 space-y-1 text-sm">
            <div className="flex justify-between gap-6"><span className="text-neutral-500">Cəmi (ƏDV-siz)</span><b>{money(sums.subtotal)} ₼</b></div>
            {q.vat && <div className="flex justify-between gap-6"><span className="text-neutral-500">ƏDV 18%</span><b>{money(sums.vat)} ₼</b></div>}
            <div className="flex justify-between gap-6 border-t border-[var(--line)] pt-1 text-base"><span>Ümumi məbləğ</span><b>{money(sums.total)} ₼</b></div>
            <div className="flex justify-between gap-6 text-xs text-neutral-500"><span>Daxili: maya {money(sums.cost)} ₼</span><span className="font-semibold text-[#1f7a3a]">mənfəət {money(sums.profit)} ₼</span></div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5">
        <label className="block"><span className={lbl}>Qeyd (PDF-də görünür)</span><textarea rows={3} value={q.note} onChange={(e) => update((x) => ({ ...x, note: e.target.value }))} className={inp} placeholder="Çatdırılma şərtləri, ödəniş, təklifin etibarlılıq müddəti..." /></label>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-white/95 px-4 py-3 backdrop-blur md:left-56">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={pending} className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04810] disabled:opacity-60">{pending ? "Saxlanılır…" : "Saxla"}</button>
          {q.id && <a href={`/admin/quote-pdf/${q.id}`} target="_blank" rel="noopener noreferrer" className={`rounded-md px-4 py-2.5 text-sm font-semibold ${dirty ? "pointer-events-none bg-[var(--surface)] text-neutral-400" : "bg-[#1b1d1f] text-white hover:bg-black"}`}>PDF</a>}
          {dirty && <span className="text-sm text-neutral-500">Saxlanmamış dəyişiklik var{q.id ? ", PDF üçün əvvəl saxlayın" : ""}</span>}
          {unmatched > 0 && <span className="text-sm text-accent">{unmatched} sətirdə bazadan məhsul seçilməyib</span>}
          <span className="ml-auto text-sm font-bold">{money(sums.total)} ₼</span>
        </div>
      </div>
    </div>
  );
}
