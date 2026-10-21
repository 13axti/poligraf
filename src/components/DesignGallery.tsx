"use client";

import { useEffect, useRef, useState } from "react";
import { orderDesign, recordDesignView } from "@/app/campaign-actions";
import { DESIGN_PRICE, SAMPLE_DESIGNS, SIZES, type Design } from "@/lib/designs-shared";
import { DesignPreview } from "./DesignPreview";

const input =
  "w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand";

export function DesignGallery({ designs }: { designs: Design[] }) {
  const [open, setOpen] = useState<Design | null>(null);
  const [size, setSize] = useState<string>("M");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const viewed = useRef(new Set<string>());

  useEffect(() => {
    if (!open) return;
    if (!viewed.current.has(open.id)) {
      viewed.current.add(open.id);
      recordDesignView(open.id).catch(() => {});
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(null);
    setDone(false);
    setError("");
  }

  async function order(e: React.FormEvent) {
    e.preventDefault();
    if (!open) return;
    setBusy(true);
    setError("");
    try {
      const res = await orderDesign({ designId: open.id, size, name, phone });
      if (res.ok) setDone(true);
      else setError(res.error);
    } catch {
      setError("Göndərmək alınmadı. Yenidən cəhd edin.");
    } finally {
      setBusy(false);
    }
  }

  if (!designs.length) {
    return (
      <>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SAMPLE_DESIGNS.map((d) => (
            <a
              key={d.id}
              href="#dizayn-gonder"
              className="group flex flex-col rounded-[1.75rem] bg-surface p-2 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative">
                <DesignPreview image={d.image} kind="artwork" alt={d.title} tee={d.tee} />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
                  Nümunə
                </span>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-1 font-semibold">{d.title}</h3>
                <p className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                  <span>Nümunə dizayn</span>
                  <span className="font-extrabold text-foreground">{DESIGN_PRICE} ₼</span>
                </p>
              </div>
            </a>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Bunlar nümunədir. İlk real dizayn sənin ola bilər, aşağıdakı formadan göndər!
        </p>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {designs.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setOpen(d)}
            className="group flex flex-col rounded-[1.75rem] bg-surface p-2 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative">
              <DesignPreview image={d.image} kind={d.kind} alt={d.title} />
              {i < 3 && d.views + d.sales > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
                  Populyar
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 font-semibold">{d.title}</h3>
              <p className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                <span>{d.designerName}</span>
                <span className="font-extrabold text-foreground">{DESIGN_PRICE} ₼</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="grid max-h-[92vh] w-full max-w-3xl gap-6 overflow-y-auto rounded-[2rem] bg-card p-5 sm:grid-cols-2 sm:p-8"
          >
            <DesignPreview image={open.image} kind={open.kind} alt={open.title} />
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold">{open.title}</h3>
                  <p className="text-sm text-neutral-500">Dizayner: {open.designerName}</p>
                </div>
                <button onClick={close} aria-label="Bağla" className="text-2xl leading-none text-neutral-400 hover:text-foreground">
                  ×
                </button>
              </div>

              {done ? (
                <div className="mt-8 text-center">
                  <p className="text-5xl">🎉</p>
                  <p className="mt-3 text-xl font-extrabold">Sifarişin qəbul olundu!</p>
                  <p className="mt-1 text-sm text-neutral-600">Tezliklə sizinlə əlaqə saxlayacağıq.</p>
                  <button onClick={close} className="mt-6 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-black">
                    Bağla
                  </button>
                </div>
              ) : (
                <form onSubmit={order} className="mt-5 space-y-4">
                  <p className="text-3xl font-extrabold text-foreground">{DESIGN_PRICE}.00 ₼</p>
                  <div>
                    <span className="mb-2 block text-sm font-semibold text-neutral-500">Ölçü</span>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(s)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${size === s ? "bg-brand text-black" : "bg-surface"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} placeholder="Adın" className={input} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" placeholder="Telefon (+994…)" className={input} />
                  {error && <p className="text-sm font-semibold text-accent">{error}</p>}
                  <button disabled={busy} className="w-full rounded-full bg-brand px-6 py-3.5 font-bold text-black disabled:opacity-60">
                    {busy ? "Göndərilir…" : "Sifariş ver"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
