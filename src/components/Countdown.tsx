"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Açılışa qalan vaxt. `to` ISO tarixdir (məs. 2026-12-01T10:00:00+04:00). */
export function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(to).getTime();
    if (Number.isNaN(target)) return;
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [to]);

  if (left === null) return <div className="h-[84px]" aria-hidden />;
  const s = Math.floor(left / 1000);
  const parts = [
    ["gün", Math.floor(s / 86400)],
    ["saat", Math.floor((s % 86400) / 3600)],
    ["dəq", Math.floor((s % 3600) / 60)],
    ["san", s % 60],
  ] as const;

  return (
    <div className="flex gap-3" role="timer" aria-label="Açılışa qalan vaxt">
      {parts.map(([label, n]) => (
        <div key={label} className="w-[72px] rounded-2xl border border-white/10 bg-white/5 py-3 text-center backdrop-blur">
          <div className="text-3xl font-extrabold tabular-nums text-white">{pad(n)}</div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#ff8a2a]">{label}</div>
        </div>
      ))}
    </div>
  );
}
