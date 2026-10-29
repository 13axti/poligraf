"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { savePresentation, uploadPresentationImage } from "@/app/admin/presentation-actions";
import { lineTotal, money, setTotal, tierPrice, unitPrice, type PData, type PItem, type PSet, type Tier } from "@/lib/presentations";

export interface CatalogProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  unit: string;
  tiers: Tier[];
  description: string;
}
interface Meta { title: string; client: string; people: number }

const inp = "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[#ff5a1f]";
const lbl = "mb-1 block text-xs font-semibold text-neutral-500";
const card = "rounded-xl bg-white p-5";
const uid = () => Math.random().toString(36).slice(2, 10);

/** Təsvirdən "Rənglər: a, b, c." siyahısını çıxarır */
function colorsOf(desc: string): string[] {
  const m = /Rənglər:\s*([^.]+)\./i.exec(desc);
  return m ? Array.from(new Set(m[1].split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))) : [];
}
/** Təsvirdən ümumi cümlələri atıb 3 qısa xüsusiyyət saxlayır */
function specOf(desc: string): string[] {
  return desc
    .split(/\.\s+/)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter((s) => s && !/^(Üzərinə loqonuz|Loqonuzu|Rənglər:)/i.test(s))
    .slice(0, 3);
}

export function PresentationEditor({
  id, token, initial, catalog, categories,
}: {
  id: string; token: string; initial: { title: string; client: string; people: number; data: PData };
  catalog: CatalogProduct[]; categories: string[];
}) {
  const [meta, setMeta] = useState<Meta>({ title: initial.title, client: initial.client, people: initial.people });
  const [data, setData] = useState<PData>(initial.data);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [upErr, setUpErr] = useState("");
  const fileFor = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const edit = (fn: (d: PData) => PData) => { setData(fn); setDirty(true); setMsg(null); };
  const editMeta = (m: Partial<Meta>) => { setMeta((x) => ({ ...x, ...m })); setDirty(true); setMsg(null); };

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term && !cat) return [];
    return catalog.filter((p) => (!cat || p.category === cat) && (!term || p.name.toLowerCase().includes(term))).slice(0, 40);
  }, [q, cat, catalog]);

  function add(p: CatalogProduct) {
    const qty = meta.people || 100;
    const item: PItem = {
      id: uid(), productId: p.id, group: p.category, name: p.name, image: p.image,
      colors: [], spec: specOf(p.description), qty, unit: p.unit, tiers: p.tiers, priceOverride: null,
    };
    edit((d) => ({ ...d, items: [...d.items, item] }));
  }
  const patch = (iid: string, p: Partial<PItem>) => edit((d) => ({ ...d, items: d.items.map((i) => (i.id === iid ? { ...i, ...p } : i)) }));
  const move = (i: number, dir: -1 | 1) => edit((d) => {
    const j = i + dir;
    if (j < 0 || j >= d.items.length) return d;
    const items = [...d.items];
    [items[i], items[j]] = [items[j], items[i]];
    return { ...d, items };
  });
  const remove = (iid: string) => edit((d) => ({
    ...d,
    items: d.items.filter((i) => i.id !== iid),
    sets: d.sets.map((s) => ({ ...s, itemIds: s.itemIds.filter((x) => x !== iid) })),
  }));
  const patchSet = (sid: string, p: Partial<PSet>) => edit((d) => ({ ...d, sets: d.sets.map((s) => (s.id === sid ? { ...s, ...p } : s)) }));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    const iid = fileFor.current;
    e.target.value = "";
    if (!f || !iid) return;
    setUpErr("");
    const fd = new FormData();
    fd.set("file", f);
    const r = await uploadPresentationImage(fd);
    if (r.url) patch(iid, { image: r.url });
    else setUpErr(r.error ?? "Yüklənmədi");
  }

  function save() {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("payload", JSON.stringify({ ...meta, data }));
    start(async () => {
      const r = await savePresentation(fd);
      if (r?.ok) { setDirty(false); setMsg({ ok: true, text: "Saxlanıldı" }); }
      else setMsg({ text: r?.error ?? "Saxlanmadı" });
    });
  }

  const grand = data.items.reduce((s, i) => s + lineTotal(i, data.markup), 0);
  const link = typeof window === "undefined" ? `/t/${token}` : `${window.location.origin}/t/${token}`;

  return (
    <div className="space-y-5 pb-24">
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />

      <section className={card}>
        <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr_1fr]">
          <label><span className={lbl}>Başlıq</span><input className={inp} value={meta.title} onChange={(e) => editMeta({ title: e.target.value })} /></label>
          <label><span className={lbl}>Müştəri</span><input className={inp} value={meta.client} onChange={(e) => editMeta({ client: e.target.value })} /></label>
          <label><span className={lbl}>Nəfər sayı</span><input type="number" min={0} className={inp} value={meta.people} onChange={(e) => editMeta({ people: Number(e.target.value) || 0 })} /></label>
          <label><span className={lbl}>Marja, %</span><input type="number" min={0} max={500} className={inp} value={data.markup} onChange={(e) => edit((d) => ({ ...d, markup: Number(e.target.value) || 0 }))} /></label>
        </div>
        <label className="mt-3 block"><span className={lbl}>Üz qabığında qısa mətn (istəyə görə)</span>
          <input className={inp} value={data.intro} onChange={(e) => edit((d) => ({ ...d, intro: e.target.value }))} placeholder="Bloknot, qələm, çanta və stiker" />
        </label>
        <p className="mt-3 text-xs text-neutral-500">Marja kataloq qiymətinin üstünə vurulur. Məhsulda qiymət əl ilə yazılıbsa, marja ona tətbiq olunmur.</p>
      </section>

      <section className={card}>
        <h2 className="mb-3 text-lg font-bold">Kataloqdan məhsul əlavə et</h2>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <input className={inp} placeholder="Ad üzrə axtarış: bloknot, qələm, çanta..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inp} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Bütün kateqoriyalar</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        {results.length > 0 && (
          <div className="mt-3 max-h-72 divide-y divide-[var(--line)] overflow-y-auto rounded-lg border border-[var(--line)]">
            {results.map((p) => (
              <button key={p.id} type="button" onClick={() => add(p)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--surface)]">
                {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" /> : <span className="h-10 w-10 rounded bg-[var(--surface)]" />}
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="text-xs text-neutral-500">{p.category}</span></span>
                <span className="shrink-0 text-xs text-neutral-500">{p.tiers.length ? `${money(Math.min(...p.tiers.map((t) => t.unitPrice)))} ₼-dən` : "qiymət yoxdur"}</span>
                <span className="shrink-0 rounded bg-[#ff5a1f] px-2 py-1 text-xs font-bold text-white">+ əlavə et</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Təqdimatdakı məhsullar ({data.items.length})</h2>
        {upErr && <p className="text-sm text-accent">{upErr}</p>}
        {data.items.map((it, i) => {
          const base = catalog.find((c) => c.id === it.productId);
          const avail = base ? colorsOf(base.description) : [];
          const minQty = it.tiers.length ? Math.min(...it.tiers.map((t) => t.minQty)) : 0;
          return (
            <div key={it.id} className={`${card} grid gap-4 md:grid-cols-[96px_1fr]`}>
              <div>
                <button type="button" title="Öz şəklini yüklə" onClick={() => { fileFor.current = it.id; fileInput.current?.click(); }} className="group relative block h-24 w-24 overflow-hidden rounded-lg bg-[var(--surface)]">
                  {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[11px] font-semibold text-white">Şəkli dəyiş</span>
                </button>
                <div className="mt-2 flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="rounded bg-[var(--surface)] px-2 py-1 text-xs font-bold" aria-label="Yuxarı">↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="rounded bg-[var(--surface)] px-2 py-1 text-xs font-bold" aria-label="Aşağı">↓</button>
                  <button type="button" onClick={() => remove(it.id)} className="rounded bg-[var(--surface)] px-2 py-1 text-xs font-bold text-[#c42b0d]" aria-label="Sil">✕</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                  <label><span className={lbl}>Ad</span><input className={inp} value={it.name} onChange={(e) => patch(it.id, { name: e.target.value })} /></label>
                  <label><span className={lbl}>Bölmə (slayd başlığı)</span><input className={inp} value={it.group} list="pg-groups" onChange={(e) => patch(it.id, { group: e.target.value })} /></label>
                </div>
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr]">
                  <label><span className={lbl}>Rənglər (vergüllə)</span>
                    <input className={inp} value={it.colors.join(", ")} onChange={(e) => patch(it.id, { colors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="qara, narıncı" />
                  </label>
                  <label><span className={lbl}>Say ({it.unit})</span><input type="number" min={1} className={inp} value={it.qty} onChange={(e) => patch(it.id, { qty: Math.max(1, Number(e.target.value) || 1) })} /></label>
                  <label><span className={lbl}>Qiymət (özün yaz)</span>
                    <input type="number" step="0.01" min={0} className={inp} value={it.priceOverride ?? ""} placeholder={money(round(tierPrice(it.tiers, it.qty) * (1 + data.markup / 100)))}
                      onChange={(e) => patch(it.id, { priceOverride: e.target.value === "" ? null : Number(e.target.value) })} />
                  </label>
                  <div><span className={lbl}>Cəmi</span><p className="py-2 text-sm font-bold">{money(lineTotal(it, data.markup))} ₼</p><p className="text-xs text-neutral-500">vahid {money(unitPrice(it, data.markup))}</p></div>
                </div>
                {avail.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-neutral-500">Mövcud rənglər:</span>
                    {avail.map((c) => {
                      const on = it.colors.includes(c);
                      return <button key={c} type="button" onClick={() => patch(it.id, { colors: on ? it.colors.filter((x) => x !== c) : [...it.colors, c] })} className={`rounded-full px-2.5 py-1 font-semibold ${on ? "bg-[#1b1d1f] text-white" : "bg-[var(--surface)] text-neutral-600"}`}>{c}</button>;
                    })}
                  </div>
                )}
                {minQty > it.qty && it.priceOverride == null && <p className="text-xs text-[#c42b0d]">Kataloqda minimum sifariş {minQty} {it.unit}dir; qiymət ən aşağı pilləyə görə hesablanıb.</p>}
                <label className="block"><span className={lbl}>Xüsusiyyətlər (hər sətir ayrı)</span>
                  <textarea rows={2} className={inp} value={it.spec.join("\n")} onChange={(e) => patch(it.id, { spec: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 6) })} />
                </label>
              </div>
            </div>
          );
        })}
        <datalist id="pg-groups">{Array.from(new Set(data.items.map((i) => i.group))).map((g) => <option key={g} value={g} />)}</datalist>
        {!data.items.length && <p className="rounded-xl bg-white px-5 py-8 text-center text-neutral-500">Yuxarıdan axtarıb məhsul əlavə edin.</p>}
        {data.items.length > 0 && <p className="text-right text-sm text-neutral-600">Bütün məhsulların cəmi (hamısı bir-birinə əlavə olunsa): <b>{money(grand)} ₼</b></p>}
      </section>

      <section className={card}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Dəst variantları (büdcə slaydı)</h2>
          <button type="button" onClick={() => edit((d) => ({ ...d, sets: [...d.sets, { id: uid(), title: `Variant ${d.sets.length + 1}`, desc: "", itemIds: [] }] }))} className="rounded-md bg-[#1b1d1f] px-3 py-1.5 text-sm font-semibold text-white">+ Variant</button>
        </div>
        <p className="mb-3 text-sm text-neutral-500">Hər variantda hansı məhsulların birlikdə getdiyini seçin. Variant yoxdursa, büdcə slaydı bütün məhsulları siyahı kimi göstərir.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {data.sets.map((s) => {
            const t = setTotal(s, data);
            return (
              <div key={s.id} className="space-y-2 rounded-lg border border-[var(--line)] p-3">
                <input className={inp} value={s.title} onChange={(e) => patchSet(s.id, { title: e.target.value })} />
                <input className={inp} value={s.desc} placeholder="Qısa izah" onChange={(e) => patchSet(s.id, { desc: e.target.value })} />
                <div className="max-h-44 space-y-1 overflow-y-auto text-sm">
                  {data.items.map((it) => (
                    <label key={it.id} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" checked={s.itemIds.includes(it.id)} onChange={(e) => patchSet(s.id, { itemIds: e.target.checked ? [...s.itemIds, it.id] : s.itemIds.filter((x) => x !== it.id) })} />
                      <span>{it.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm font-bold">Cəmi: {money(t.total)} ₼{meta.people > 0 && <span className="font-normal text-neutral-500"> · nəfərə {money(t.total / meta.people)}</span>}</p>
                <button type="button" onClick={() => edit((d) => ({ ...d, sets: d.sets.filter((x) => x.id !== s.id) }))} className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Variantı sil</button>
              </div>
            );
          })}
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-2 text-lg font-bold">Qeydlər slaydı</h2>
        <textarea rows={5} className={inp} value={data.notes.join("\n")} onChange={(e) => edit((d) => ({ ...d, notes: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))} />
        <p className="mt-1 text-xs text-neutral-500">Hər sətir ayrı maddə kimi çıxır.</p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-white/95 px-4 py-3 backdrop-blur md:left-56">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={pending} className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e04810] disabled:opacity-60">{pending ? "Saxlanılır…" : "Saxla"}</button>
          {dirty && !msg && <span className="text-sm text-neutral-500">Saxlanmamış dəyişiklik var</span>}
          {msg && <span className={`text-sm font-semibold ${msg.ok ? "text-[#1f7a3a]" : "text-accent"}`}>{msg.text}</span>}
          <span className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={() => navigator.clipboard?.writeText(link).then(() => setMsg({ ok: true, text: "Link kopyalandı" }))} className="rounded-md bg-[var(--surface)] px-3 py-2 text-sm font-semibold hover:bg-[var(--line)]">Linki kopyala</button>
            <a href={`/t/${token}`} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#1b1d1f] px-3 py-2 text-sm font-semibold text-white hover:bg-black">Baxış / PDF</a>
          </span>
        </div>
        {dirty && <p className="mx-auto mt-1 max-w-6xl text-xs text-neutral-500">Baxış saxlanmış versiyanı göstərir: əvvəl "Saxla" basın.</p>}
      </div>
    </div>
  );
}

const round = (n: number) => Math.round(n * 100) / 100;
