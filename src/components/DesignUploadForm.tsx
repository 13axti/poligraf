"use client";

import { useState } from "react";
import { submitDesign } from "@/app/campaign-actions";

const input =
  "w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand";

export function DesignUploadForm() {
  const [kind, setKind] = useState<"artwork" | "shirt">("artwork");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("kind", kind);
    try {
      const res = await submitDesign(fd);
      if (res.ok) setDone(true);
      else setError(res.error);
    } catch {
      setError("Göndərmək alınmadı. Şəkil çox böyük ola bilər, yenidən cəhd edin.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[2rem] border border-brand/30 bg-surface p-8 text-center">
        <p className="text-5xl">🧡</p>
        <h3 className="mt-3 text-2xl font-extrabold">Dizaynın bizə çatdı!</h3>
        <p className="mt-2 text-neutral-600">
          Komandamız baxıb təsdiqləyəcək, sonra dizaynın burada görünəcək. Sizinlə əlaqə saxlayacağıq.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[2rem] bg-surface p-6 sm:p-8">
      <h3 className="text-2xl font-extrabold">Öz dizaynını göndər</h3>

      <div className="flex gap-2 rounded-full bg-card p-1 text-sm font-semibold">
        {([["artwork", "Yalnız dizayn şəkli"], ["shirt", "Hazır t-shirt şəkli"]] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setKind(v)}
            className={`flex-1 rounded-full px-3 py-2 transition ${kind === v ? "bg-brand text-black" : "text-neutral-600"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        {kind === "artwork"
          ? "Dizaynını (PNG, şəffaf fonlu olsa ən yaxşısı) yüklə, biz onu t-shirtin üzərinə yerləşdirib göstərəcəyik."
          : "T-shirt üzərində hazır dizayn şəklini yüklə, o olduğu kimi göstəriləcək."}
      </p>

      <label className="grid cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-white/15 bg-card py-8 text-center transition hover:border-brand">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Seçilən şəkil" className="max-h-52 object-contain" />
        ) : (
          <span className="px-4 text-sm font-semibold text-neutral-500">+ Şəkil seç (PNG, JPG, WebP · 5 MB-a qədər)</span>
        )}
        <input
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : "");
          }}
        />
      </label>

      <input name="title" required maxLength={80} placeholder="Dizaynın adı" className={input} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required maxLength={100} placeholder="Adın" autoComplete="name" className={input} />
        <input name="phone" required type="tel" placeholder="Telefon (+994…)" autoComplete="tel" className={input} />
      </div>

      <label className="flex items-start gap-3 text-sm text-neutral-600">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#ff5a1f]" />
        <span>Dizaynımın saytda nümayiş olunmasına və kampaniya şərtlərinə razıyam.</span>
      </label>

      {error && <p className="text-sm font-semibold text-accent">{error}</p>}
      <button
        disabled={busy}
        className="w-full rounded-full bg-brand px-6 py-3.5 font-bold text-black transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {busy ? "Göndərilir…" : "Dizaynı göndər"}
      </button>
    </form>
  );
}
