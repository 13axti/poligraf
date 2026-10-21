"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useTransition } from "react";
import { saveSettings, type SettingsPayload } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/site-config";

type Client = { key: string; name: string; logo?: string; preview?: string };

const field =
  "w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-brand";
const label = "mb-1 block text-sm font-semibold text-neutral-600";
const card = "rounded-3xl bg-white p-5 sm:p-6";
const uid = () => Math.random().toString(36).slice(2, 9);

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [s, setS] = useState({
    name: settings.name,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    hours: settings.hours,
  });
  const [socials, setSocials] = useState(settings.socials);
  const [clients, setClients] = useState<Client[]>(settings.clients.map((c) => ({ key: uid(), ...c })));
  const files = useRef(new Map<string, File>());
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= clients.length) return;
    const next = [...clients];
    [next[i], next[j]] = [next[j], next[i]];
    setClients(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const payload: SettingsPayload = {
      ...s,
      socials,
      clients: clients.map((c) => ({ name: c.name, logo: c.logo, fileKey: files.current.has(c.key) ? c.key : undefined })),
    };
    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));
    files.current.forEach((f, k) => fd.set(`file_${k}`, f));
    start(async () => {
      const res = await saveSettings(fd);
      setMsg(res?.error ? { text: res.error } : { ok: true, text: "Saxlanıldı. Sayt bir neçə saniyəyə yenilənəcək." });
    });
  }

  const text = (k: keyof typeof s, l: string, ph?: string) => (
    <div>
      <label className={label}>{l}</label>
      <input value={s[k]} placeholder={ph} onChange={(e) => setS({ ...s, [k]: e.target.value })} className={field} />
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      {msg && (
        <p className={`rounded-2xl px-5 py-3 text-sm font-bold text-white ${msg.ok ? "bg-emerald-500" : "bg-accent"}`}>{msg.text}</p>
      )}

      <section className={card}>
        <h2 className="mb-4 font-bold">Əlaqə məlumatı</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {text("name", "Şirkət adı")}
          {text("phone", "Telefon", "+994 50 000 00 00")}
          {text("email", "E-poçt")}
          {text("address", "Ünvan")}
          <div className="sm:col-span-2">{text("hours", "İş saatları")}</div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-1 font-bold">Sosial şəbəkələr</h2>
        <p className="mb-4 text-xs text-neutral-500">Boş buraxsanız, ikon saytda görünməz.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {socials.map((so, i) => (
            <div key={so.id}>
              <label className={label}>{so.label}</label>
              <input
                value={so.href}
                placeholder="https://..."
                onChange={(e) => setSocials(socials.map((x, k) => (k === i ? { ...x, href: e.target.value } : x)))}
                className={field}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-1 font-bold">Çalışdığımız şirkətlər</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Ana səhifədəki "Bizə güvənən şirkətlər" zolağı. Şəffaf fonlu PNG və ya SVG loqo yükləyin. Yalnız real müştərilərinizi əlavə edin.
        </p>
        <div className="space-y-2">
          {clients.map((c, i) => (
            <div key={c.key} className="flex items-center gap-3 rounded-2xl bg-surface p-2">
              <label className="grid h-14 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl bg-white text-[11px] font-semibold text-neutral-400">
                {c.preview || c.logo ? <img src={c.preview ?? c.logo} alt="" className="h-full w-full object-contain p-1" /> : "Loqo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    files.current.set(c.key, f);
                    setClients(clients.map((x) => (x.key === c.key ? { ...x, preview: URL.createObjectURL(f) } : x)));
                  }}
                />
              </label>
              <input value={c.name} placeholder="Şirkətin adı" onChange={(e) => setClients(clients.map((x) => (x.key === c.key ? { ...x, name: e.target.value } : x)))} className={field} />
              <div className="flex shrink-0 gap-1 text-lg text-neutral-400">
                <button type="button" onClick={() => move(i, -1)} className="px-1.5 hover:text-foreground" aria-label="Yuxarı">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="px-1.5 hover:text-foreground" aria-label="Aşağı">↓</button>
                <button type="button" onClick={() => setClients(clients.filter((x) => x.key !== c.key))} className="px-1.5 hover:text-accent" aria-label="Sil">×</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setClients([...clients, { key: uid(), name: "" }])} className="mt-3 text-sm font-semibold text-brand">
          + Şirkət əlavə et
        </button>
      </section>

      <div className="sticky bottom-3 flex justify-end">
        <button disabled={pending} className="rounded-full bg-brand px-8 py-4 font-semibold text-white shadow-xl shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60">
          {pending ? "Saxlanılır…" : "Yadda saxla"}
        </button>
      </div>
    </form>
  );
}
