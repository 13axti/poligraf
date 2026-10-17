"use client";

import { useState } from "react";
import { submitOrder } from "@/app/actions";
import { AZN } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import type { CalcSelection } from "./PriceCalculator";
import type { MockupExport } from "./MockupEditor";

export function OrderDialog({
  product,
  selection,
  mockup,
  onClose,
}: {
  product: Product;
  selection: CalcSelection;
  mockup: MockupExport | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await submitOrder({
        productSlug: product.slug,
        variantId: selection.variantId,
        quantity: selection.quantity,
        widthCm: selection.widthCm,
        heightCm: selection.heightCm,
        customerName: name,
        customerPhone: phone,
        note,
        mockupDataUrl: mockup?.mockup,
        logoDataUrls: mockup?.logos,
      });
      if (res.ok) setDoneId(res.id);
      else setError(res.error);
    } catch {
      setError("Göndərmək alınmadı. Yenidən cəhd edin.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-3 font-semibold outline-none transition focus:border-brand";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[2rem] bg-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {doneId ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand text-3xl text-white">
              ✓
            </div>
            <h2 className="mt-5 text-2xl font-extrabold">Sifariş qəbul edildi</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Sifariş nömrəsi: <b>{doneId.slice(-8)}</b>. Tezliklə sizinlə əlaqə saxlayacağıq.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-white hover:bg-brand"
            >
              Bağla
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight">Sifarişi tamamla</h2>
              <button type="button" onClick={onClose} aria-label="Bağla" className="text-2xl leading-none text-neutral-400 hover:text-foreground">
                ×
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4 rounded-3xl bg-surface p-3">
              {mockup && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mockup.mockup} alt="Nümunə" className="h-20 w-20 rounded-2xl bg-white object-cover" />
              )}
              <div className="min-w-0 text-sm">
                <p className="truncate font-bold">{product.name}</p>
                <p className="text-neutral-600">{selection.result.breakdown}</p>
                <p className="text-xl font-extrabold">{AZN(selection.result.total)}</p>
              </div>
            </div>
            {!mockup && (
              <p className="mt-2 text-xs text-neutral-500">Loqo yüklənməyib, sifariş loqosuz göndəriləcək.</p>
            )}

            <div className="mt-5 space-y-3">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad, soyad" className={input} autoComplete="name" />
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon (+994 50 000 00 00)" inputMode="tel" className={input} autoComplete="tel" />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qeyd (istəyə bağlı)" rows={3} className={input} />
            </div>

            {error && <p className="mt-3 text-sm font-semibold text-accent">{error}</p>}

            <button
              disabled={busy}
              className="mt-5 w-full rounded-full bg-brand px-4 py-4 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? "Göndərilir…" : "Sifarişi göndər"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
