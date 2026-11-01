"use client";

import { useEffect, useMemo, useState } from "react";
import { clientUnit, money, offersFor, quoteTotals, VAT, type CostPrice, type QuoteParams } from "@/lib/costs";
import type { CostProduct } from "@/lib/costs-server";
import { DecimalInput } from "./DecimalInput";

interface Line { key: string; productId: string; qty: number; supplierId: string | null; override: number | null }

const inp = "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[#ff5a1f]";
const lbl = "mb-1 block text-xs font-semibold text-neutral-500";
const uid = () => Math.random().toString(36).slice(2, 9);
const STORE = "lemur-quote-v1";

export function QuoteBuilder({ products, prices, day }: { products: CostProduct[]; prices: CostPrice[]; day: string }) {
  const [client, setClient] = useState("");
  const [p, setP] = useState<QuoteParams>({ margin: 30, waste: 7, delivery: 0, design: 0, vat: false });
  const [lines, setLines] = useState<Line[]>([]);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Yarımçıq təklif brauzerdə saxlanır (səhifəni bağlasanız itmir)
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? "null");
      if (s) { setClient(s.client ?? ""); setP((x) => ({ ...x, ...s.p })); setLines(s.lines ?? []); }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORE, JSON.stringify({ client, p, lines })); }, [client, p, lines, loaded]);

  const byProduct = useMemo(() => {
    const m = new Map<string, CostPrice[]>();
    for (const x of prices) m.set(x.productId, [...(m.get(x.productId) ?? []), x]);
    return m;
  }, [prices]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products.filter((x) => `${x.code ?? ""} ${x.name} ${x.spec}`.toLowerCase().includes(t)).slice(0, 12);
  }, [q, products]);

  const rows = lines.map((l) => {
    const prod = products.find((x) => x.id === l.productId);
    const offers = offersFor(byProduct.get(l.productId) ?? [], l.qty, day);
    const chosen = (l.supplierId && offers.find((o) => o.price.supplierId === l.supplierId)) || offers[0];
    const cost = l.override ?? chosen?.net ?? 0;
    return { l, prod, offers, chosen, cost, unit: clientUnit(cost, p) };
  });
  const t = quoteTotals(rows.map((r) => ({ cost: r.cost, qty: r.l.qty })), p);
  const extra = (p.delivery + p.design) * (1 + p.margin / 100) * (p.vat ? 1 + VAT : 1);
  const patch = (key: string, x: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...x } : l)));

  function copy() {
    const vatTxt = p.vat ? "ƏDV daxil" : "ƏDV-siz";
    const txt = [
      `Qiymət təklifi${client ? ` — ${client}` : ""}`,
      "",
      ...rows.map((r, i) => `${i + 1}. ${r.prod?.name ?? "?"}${r.prod?.spec ? ` (${r.prod.spec})` : ""} — ${r.l.qty} ${r.prod?.unit ?? "ədəd"} × ${money(r.unit)} ₼ = ${money(r.unit * r.l.qty)} ₼`),
      ...(extra > 0 ? [`Çatdırılma və hazırlıq: ${money(extra)} ₼`] : []),
      "",
      `Cəmi: ${money(t.total)} ₼ (${vatTxt})`,
      "Lemur Group",
    ].join("\n");
    navigator.clipboard?.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <section className="rounded-xl bg-white p-5">
          <label className="block"><span className={lbl}>Müştəri</span><input className={inp} value={client} onChange={(e) => setClient(e.target.value)} placeholder="Şirkət adı" /></label>
          <label className="mt-3 block"><span className={lbl}>Məhsul əlavə et</span>
            <input className={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Axtar: t-shirt, vizit, PR-001..." />
          </label>
          {results.length > 0 && (
            <div className="mt-2 max-h-64 divide-y divide-[var(--line)] overflow-y-auto rounded-lg border border-[var(--line)]">
              {results.map((x) => {
                const best = offersFor(byProduct.get(x.id) ?? [], x.minQty ?? 100, day)[0];
                return (
                  <button key={x.id} type="button" onClick={() => { setLines((ls) => [...ls, { key: uid(), productId: x.id, qty: x.minQty ?? 100, supplierId: null, override: null }]); setQ(""); }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--surface)]">
                    <span className="w-14 shrink-0 font-mono text-xs text-neutral-500">{x.code ?? ""}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{x.name}</span>
                    <span className="shrink-0 text-xs text-neutral-500">{best ? `${money(best.net, 3)} ₼ · ${best.price.supplier}` : "qiymət yoxdur"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {rows.map(({ l, prod, offers, chosen, cost, unit }) => (
          <section key={l.key} className="rounded-xl bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{prod?.name ?? "Silinmiş məhsul"}</p>
                {prod?.spec && <p className="text-xs text-neutral-500">{prod.spec}</p>}
              </div>
              <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[7rem_1fr_8rem]">
              <label><span className={lbl}>Say ({prod?.unit ?? "ədəd"})</span><input type="number" min={1} className={inp} value={l.qty} onChange={(e) => patch(l.key, { qty: Math.max(1, Number(e.target.value) || 1) })} /></label>
              <label><span className={lbl}>Təchizatçı</span>
                <select className={inp} value={l.supplierId ?? ""} onChange={(e) => patch(l.key, { supplierId: e.target.value || null })}>
                  <option value="">Avtomatik: ən ucuz{offers[0] ? ` (${offers[0].price.supplier})` : ""}</option>
                  {offers.map((o) => <option key={o.price.supplierId} value={o.price.supplierId}>{o.price.supplier} — {money(o.net, 3)} ₼{o.belowMin ? ` (min. ${o.price.minQty})` : ""}</option>)}
                </select>
              </label>
              <label><span className={lbl}>Maya (əl ilə)</span>
                <DecimalInput className={inp} value={l.override} placeholder={chosen ? money(chosen.net, 3) : "0"} onChange={(v) => patch(l.key, { override: v })} />
              </label>
            </div>
            {!offers.length && l.override == null && <p className="mt-2 text-xs text-[#c42b0d]">Bazada bu məhsul üçün etibarlı qiymət yoxdur. Mayanı əl ilə yazın və ya bazaya qiymət əlavə edin.</p>}
            {chosen?.belowMin && l.override == null && <p className="mt-2 text-xs text-[#c42b0d]">{chosen.price.supplier} minimum {chosen.price.minQty} {prod?.unit} qəbul edir.</p>}
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="text-neutral-500">Maya: <b className="text-foreground">{money(cost, 3)} ₼</b></span>
              <span className="text-neutral-500">Müştəriyə vahid: <b className="text-foreground">{money(unit)} ₼</b></span>
              <span className="text-neutral-500">Sətir cəmi: <b className="text-foreground">{money(unit * l.qty)} ₼</b></span>
            </div>
          </section>
        ))}
        {!rows.length && <p className="rounded-xl bg-white px-5 py-8 text-center text-neutral-500">Yuxarıdan məhsul axtarıb əlavə edin.</p>}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="space-y-3 rounded-xl bg-white p-5">
          <h3 className="font-bold">Parametrlər</h3>
          <div className="grid grid-cols-2 gap-2">
            <label><span className={lbl}>Marja, %</span><DecimalInput className={inp} value={p.margin} onChange={(v) => setP((x) => ({ ...x, margin: v ?? 0 }))} /></label>
            <label><span className={lbl}>Zay ehtiyatı, %</span><DecimalInput className={inp} value={p.waste} onChange={(v) => setP((x) => ({ ...x, waste: v ?? 0 }))} /></label>
            <label><span className={lbl}>Çatdırılma, ₼</span><DecimalInput className={inp} value={p.delivery} onChange={(v) => setP((x) => ({ ...x, delivery: v ?? 0 }))} /></label>
            <label><span className={lbl}>Dizayn, ₼</span><DecimalInput className={inp} value={p.design} onChange={(v) => setP((x) => ({ ...x, design: v ?? 0 }))} /></label>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.vat} onChange={(e) => setP({ ...p, vat: e.target.checked })} /> ƏDV əlavə et (18%)</label>
        </section>
        <section className="space-y-1.5 rounded-xl bg-white p-5 text-sm">
          <div className="flex justify-between"><span className="text-neutral-500">Mal mayası (zay daxil)</span><b>{money(t.goods)} ₼</b></div>
          <div className="flex justify-between"><span className="text-neutral-500">Çatdırılma + dizayn</span><b>{money(p.delivery + p.design)} ₼</b></div>
          <div className="flex justify-between"><span className="text-neutral-500">Ümumi maya</span><b>{money(t.cost)} ₼</b></div>
          <div className="flex justify-between"><span className="text-neutral-500">Satış (ƏDV-siz)</span><b>{money(t.sale)} ₼</b></div>
          {p.vat && <div className="flex justify-between"><span className="text-neutral-500">ƏDV</span><b>{money(t.vat)} ₼</b></div>}
          <div className="flex justify-between border-t border-[var(--line)] pt-2 text-base"><span>Müştəriyə yekun</span><b>{money(t.total)} ₼</b></div>
          <div className="flex justify-between text-[#1f7a3a]"><span>Mənfəət</span><b>{money(t.profit)} ₼</b></div>
          <button type="button" onClick={copy} disabled={!rows.length} className="mt-3 w-full rounded-md bg-[#ff5a1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04810] disabled:opacity-50">{copied ? "Kopyalandı" : "Təklif mətnini kopyala"}</button>
          <button type="button" onClick={() => { if (confirm("Təklif təmizlənsin?")) { setLines([]); setClient(""); } }} className="w-full pt-1 text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Təmizlə</button>
        </section>
      </aside>
    </div>
  );
}
