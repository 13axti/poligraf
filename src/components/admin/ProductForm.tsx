"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useTransition } from "react";
import { saveProduct, type ProductPayload } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import type { Product, ProductMockup } from "@/lib/types";

type Draft = ProductMockup & { fileKey?: string; preview?: string };

const field =
  "w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-brand";
const label = "mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500";
const card = "rounded-3xl bg-white p-5 sm:p-6";
const uid = () => Math.random().toString(36).slice(2, 9);

function readSize(file: File): Promise<{ w: number; h: number; url: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight, url });
    img.onerror = () => resolve({ w: 800, h: 800, url });
    img.src = url;
  });
}

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: Product & { active?: boolean };
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [model, setModel] = useState<"per_unit" | "per_sqm">(product?.pricingModel ?? "per_unit");
  const [minQty, setMinQty] = useState(product?.minOrderQty ?? 50);
  const [sqm, setSqm] = useState(product?.pricePerSqm ?? 12);
  const [minW, setMinW] = useState(product?.minWidthCm ?? 50);
  const [minH, setMinH] = useState(product?.minHeightCm ?? 50);
  const [tiers, setTiers] = useState(product?.priceTiers ?? [{ minQty: 50, unitPrice: 1 }]);
  const [variants, setVariants] = useState(product?.variants ?? []);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [mockups, setMockups] = useState<Draft[]>(product?.mockups ?? []);

  const [mainPreview, setMainPreview] = useState(product?.image ?? "");
  const mainFile = useRef<File | null>(null);
  const files = useRef(new Map<string, File>());

  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function patchMockup(i: number, patch: Partial<Draft>) {
    setMockups((m) => m.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  }
  function patchPlacement(i: number, patch: Partial<ProductMockup["placement"]>) {
    setMockups((m) => m.map((x, k) => (k === i ? { ...x, placement: { ...x.placement, ...patch } } : x)));
  }

  async function addMockupFile(f: File) {
    const { w, h, url } = await readSize(f);
    const key = uid();
    files.current.set(key, f);
    setMockups((m) => [
      ...m,
      {
        id: `m-${key}`,
        name: `Nümunə ${m.length + 1}`,
        image: "",
        preview: url,
        fileKey: key,
        width: w,
        height: h,
        placement: { cx: 0.5, cy: 0.5, w: 0.25, h: 0.08, rotation: 0 },
      },
    ]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload: ProductPayload = {
      id: product?.id,
      name,
      slug,
      description,
      categoryId,
      pricingModel: model,
      minOrderQty: minQty,
      pricePerSqm: sqm,
      minWidthCm: minW,
      minHeightCm: minH,
      priceTiers: tiers,
      variants: variants.map((v) => ({ ...v, id: v.id || `v-${uid()}` })),
      mockups: mockups.map(({ preview, ...m }) => {
        void preview;
        return m;
      }),
      image: product?.image ?? "",
      featured,
      active,
    };
    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));
    if (mainFile.current) fd.set("image", mainFile.current);
    files.current.forEach((f, key) => fd.set(`file_${key}`, f));

    start(async () => {
      const res = await saveProduct(fd);
      if (res?.error) {
        setError(res.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white">{error}</p>}

      {/* Əsas */}
      <section className={card}>
        <h2 className="mb-4 font-extrabold">Əsas məlumat</h2>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div>
            <span className={label}>Əsas şəkil</span>
            <label className="grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-3xl bg-surface text-xs font-semibold text-neutral-500">
              {mainPreview ? <img src={mainPreview} alt="" className="h-full w-full object-cover" /> : "Şəkil seç"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  mainFile.current = f;
                  setMainPreview(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>
          <div className="space-y-3">
            <div>
              <label className={label}>Ad</label>
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className={field}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label}>Keçid (URL)</label>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  className={field}
                />
              </div>
              <div>
                <label className={label}>Kateqoriya</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={field}>
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Təsvir</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={field} />
            </div>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-brand" />
                Populyar (ana səhifədə)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-brand" />
                Saytda göstər
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Qiymət */}
      <section className={card}>
        <h2 className="mb-4 font-extrabold">Qiymət</h2>
        <div className="mb-4 flex gap-2">
          {([["per_unit", "Say ilə (ədəd)"], ["per_sqm", "Ölçü ilə (m²)"]] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setModel(v)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${model === v ? "bg-foreground text-white" : "bg-surface"}`}
            >
              {l}
            </button>
          ))}
        </div>

        {model === "per_unit" ? (
          <div className="space-y-3">
            <div className="max-w-48">
              <label className={label}>Minimal sifariş (ədəd)</label>
              <input type="number" min={1} value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} className={field} />
            </div>
            <span className={label}>Say pillələri (nə qədər çox, o qədər ucuz)</span>
            {tiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="number" min={1} value={t.minQty} onChange={(e) => setTiers(tiers.map((x, k) => (k === i ? { ...x, minQty: Number(e.target.value) } : x)))} className={`${field} max-w-32`} aria-label="Say" />
                <span className="text-sm text-neutral-500">ədədən</span>
                <input type="number" min={0} step="0.01" value={t.unitPrice} onChange={(e) => setTiers(tiers.map((x, k) => (k === i ? { ...x, unitPrice: Number(e.target.value) } : x)))} className={`${field} max-w-32`} aria-label="Qiymət" />
                <span className="text-sm text-neutral-500">₼ / ədəd</span>
                <button type="button" onClick={() => setTiers(tiers.filter((_, k) => k !== i))} className="ml-auto text-xl text-neutral-400 hover:text-accent" aria-label="Sil">×</button>
              </div>
            ))}
            <button type="button" onClick={() => setTiers([...tiers, { minQty: (tiers.at(-1)?.minQty ?? 0) * 2 || 100, unitPrice: 1 }])} className="text-sm font-semibold text-brand">+ Pillə əlavə et</button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={label}>1 m² qiyməti (₼)</label>
              <input type="number" min={0} step="0.01" value={sqm} onChange={(e) => setSqm(Number(e.target.value))} className={field} />
            </div>
            <div>
              <label className={label}>Min. en (sm)</label>
              <input type="number" min={1} value={minW} onChange={(e) => setMinW(Number(e.target.value))} className={field} />
            </div>
            <div>
              <label className={label}>Min. hündürlük (sm)</label>
              <input type="number" min={1} value={minH} onChange={(e) => setMinH(Number(e.target.value))} className={field} />
            </div>
          </div>
        )}
      </section>

      {/* Variantlar */}
      <section className={card}>
        <h2 className="mb-1 font-extrabold">Variantlar</h2>
        <p className="mb-4 text-xs text-neutral-500">Rəng, material və s. Əlavə qiymət ədəd (və ya m²) başınadır, 0 yazsanız fərq yoxdur.</p>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={v.name} placeholder="Məs: Qara" onChange={(e) => setVariants(variants.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} className={field} />
              <input type="number" step="0.01" value={v.priceModifier ?? 0} onChange={(e) => setVariants(variants.map((x, k) => (k === i ? { ...x, priceModifier: Number(e.target.value) } : x)))} className={`${field} max-w-28`} aria-label="Əlavə qiymət" />
              <span className="text-sm text-neutral-500">₼</span>
              <button type="button" onClick={() => setVariants(variants.filter((_, k) => k !== i))} className="text-xl text-neutral-400 hover:text-accent" aria-label="Sil">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setVariants([...variants, { id: `v-${uid()}`, name: "", priceModifier: 0 }])} className="mt-3 text-sm font-semibold text-brand">+ Variant əlavə et</button>
      </section>

      {/* Mockup */}
      <section className={card}>
        <h2 className="mb-1 font-extrabold">Mockup şəkilləri (loqo yoxlama)</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Şəkil yükləyin və loqonun düşəcəyi yeri şəkildə klik edərək seçin. Müştəri sonra loqosunu bu şəkildə görəcək.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {mockups.map((m, i) => {
            const src = m.preview ?? m.image;
            const p = m.placement;
            return (
              <div key={m.id} className="rounded-3xl bg-surface p-3">
                <div
                  className="relative cursor-crosshair overflow-hidden rounded-2xl bg-white"
                  style={{ aspectRatio: `${m.width} / ${m.height}` }}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    patchPlacement(i, {
                      cx: Math.round(((e.clientX - r.left) / r.width) * 1000) / 1000,
                      cy: Math.round(((e.clientY - r.top) / r.height) * 1000) / 1000,
                    });
                  }}
                >
                  <img src={src} alt="" className="pointer-events-none h-full w-full object-cover" draggable={false} />
                  <span
                    className="pointer-events-none absolute grid place-items-center border-2 border-dashed border-brand bg-brand/20 text-[10px] font-black text-brand"
                    style={{
                      left: `${p.cx * 100}%`,
                      top: `${p.cy * 100}%`,
                      width: `${p.w * 100}%`,
                      aspectRatio: `${p.w / p.h}`,
                      transform: `translate(-50%,-50%) rotate(${p.rotation}deg)`,
                    }}
                  >
                    LOQO
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <input value={m.name} onChange={(e) => patchMockup(i, { name: e.target.value })} className={field} aria-label="Ad" />
                  </div>
                  <div>
                    <label className={label}>En %</label>
                    <input type="number" min={1} max={100} value={Math.round(p.w * 100)} onChange={(e) => patchPlacement(i, { w: Number(e.target.value) / 100 })} className={field} />
                  </div>
                  <div>
                    <label className={label}>Hündürlük %</label>
                    <input type="number" min={1} max={100} value={Math.round(p.h * 100)} onChange={(e) => patchPlacement(i, { h: Number(e.target.value) / 100 })} className={field} />
                  </div>
                  <div>
                    <label className={label}>Dönmə °</label>
                    <input type="number" min={-180} max={180} value={p.rotation} onChange={(e) => patchPlacement(i, { rotation: Number(e.target.value) })} className={field} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={m.darkProduct ?? false} onChange={(e) => patchMockup(i, { darkProduct: e.target.checked })} className="h-4 w-4 accent-brand" />
                    Tünd məhsul (loqo ağ olsun)
                  </label>
                  <button type="button" onClick={() => setMockups(mockups.filter((_, k) => k !== i))} className="text-neutral-400 hover:text-accent">Sil</button>
                </div>
              </div>
            );
          })}
          <label className="grid min-h-48 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-neutral-300 text-sm font-semibold text-neutral-500 transition hover:border-brand hover:text-brand">
            + Mockup şəkli əlavə et
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) addMockupFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-3 flex justify-end">
        <button disabled={pending} className="rounded-full bg-brand px-8 py-4 font-semibold text-white shadow-xl shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60">
          {pending ? "Saxlanılır…" : "Yadda saxla"}
        </button>
      </div>
    </form>
  );
}
