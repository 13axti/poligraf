"use client";

import { useState } from "react";
import { aiPresent } from "@/app/ai-actions";
import type { MockupExport } from "./MockupEditor";

/** Loqo yerləşdirildikdən sonra müştərinin istəyinə görə AI ilə 1 təqdimat şəkli hazırlayır */
export function AiPresent({
  productName,
  getMockup,
  value,
  onChange,
}: {
  productName: string;
  getMockup: () => Promise<MockupExport | null>;
  value: string | null;
  onChange: (image: string | null) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setBusy(true);
    setError("");
    try {
      const mk = await getMockup();
      if (!mk?.mockup) {
        setError("Əvvəlcə məhsul üzərinə loqonu yerləşdirin");
        return;
      }
      const res = await aiPresent({ mockupDataUrl: mk.mockup, prompt, productName });
      if (res.ok) onChange(res.image);
      else setError(res.error);
    } catch {
      setError("AI təqdimat alınmadı, yenidən cəhd edin");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-brand/30 bg-surface p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">AI</span>
        <h3 className="font-extrabold">Dizaynı AI ilə təqdim et</h3>
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Loqonu yerləşdirdikdən sonra istəyini yaz, AI məhsulu istədiyin üslubda təqdim edən 1 şəkil hazırlasın.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Məs: sahil kafesində, günəşli yay havasında, masanın üstündə"
        className="mt-3 w-full resize-none rounded-2xl border-2 border-transparent bg-card px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand"
      />
      {error && <p className="mt-2 text-sm font-semibold text-accent">{error}</p>}
      <button
        type="button"
        onClick={generate}
        disabled={busy || prompt.trim().length < 3}
        className="mt-3 w-full rounded-full bg-brand px-6 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "AI hazırlayır… (20-40 san)" : value ? "Yenidən hazırla" : "AI ilə təqdim et"}
      </button>

      {value && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="AI təqdimat" className="w-full rounded-2xl" />
          <p className="mt-2 text-xs text-neutral-500">
            Bu şəkil sifarişinizə əlavə olunacaq. Real nəticə çapdan sonra bir qədər fərqli ola bilər.
          </p>
          <button type="button" onClick={() => onChange(null)} className="mt-1 text-xs font-semibold text-neutral-500 hover:text-accent">
            Şəkli sil
          </button>
        </div>
      )}
    </div>
  );
}
