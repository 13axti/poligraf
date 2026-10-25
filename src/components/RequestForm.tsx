"use client";

import { useState } from "react";
import { submitRequest } from "@/app/actions";

const input =
  "w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 font-semibold outline-none transition focus:border-brand";

export function RequestForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submitRequest({
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        message: String(fd.get("message") ?? ""),
        website: String(fd.get("website") ?? ""),
      });
      if (res.ok) setDone(true);
      else setError(res.error);
    } catch {
      setError("Göndərmək alınmadı. Yenidən cəhd edin və ya bizə zəng edin.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[2rem] bg-surface p-8 text-center sm:p-10">
        <p className="text-5xl" aria-hidden>🧡</p>
        <h3 className="mt-3 text-2xl font-bold">İstəyiniz bizə çatdı</h3>
        <p className="mt-2 text-neutral-600">1 saat ərzində sizinlə əlaqə saxlayıb cavab verəcəyik.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[2rem] bg-surface p-6 sm:p-8">
      <textarea
        name="message"
        required
        minLength={3}
        maxLength={2000}
        rows={5}
        placeholder="Nə lazımdır? Məsələn: telefon kabarası, 20 ədəd, üzərində şirkət loqosu"
        className={`${input} resize-none`}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required maxLength={100} placeholder="Adınız" autoComplete="name" className={input} />
        <input name="phone" required type="tel" placeholder="Telefon (+994…)" autoComplete="tel" className={input} />
      </div>
      {/* bot tələsi: insanlar görmür */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && <p className="text-sm font-semibold text-accent">{error}</p>}
      <button
        disabled={busy}
        className="w-full rounded-full bg-foreground px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {busy ? "Göndərilir…" : "İstəyi göndər"}
      </button>
      <p className="text-center text-sm text-neutral-500">Sorğunuza 1 saat ərzində cavab veririk.</p>
    </form>
  );
}
