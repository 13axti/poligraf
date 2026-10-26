"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface NavGroup {
  title: string;
  items: { slug: string; name: string; count: number }[];
}

const norm = (s: string) => s.toLocaleLowerCase("az").normalize("NFD").replace(/[̀-ͯ]/g, "");

function List({ groups, active, total, onNavigate }: { groups: NavGroup[]; active?: string; total: number; onNavigate?: () => void }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return groups;
    return groups.map((g) => ({ ...g, items: g.items.filter((i) => norm(i.name).includes(t)) })).filter((g) => g.items.length);
  }, [groups, q]);

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Kateqoriya axtar"
        aria-label="Kateqoriya axtar"
        className="mb-3 w-full rounded-xl border border-[var(--hair)] bg-[var(--tint)] px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-brand"
      />
      <Link
        href="/kataloq"
        onClick={onNavigate}
        className={`relative flex items-center justify-between rounded-lg px-3 py-2 text-[15px] font-bold transition-colors ${!active ? "bg-[var(--tint)]" : "hover:bg-[var(--tint)]"}`}
      >
        {!active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand" />}
        Bütün məhsullar
        <span className="text-sm font-medium tabular-nums text-neutral-500">{total}</span>
      </Link>

      {shown.map((g) => (
        <details key={g.title} open className="group mt-3 border-t border-[var(--hair)] pt-2">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-1.5 text-sm font-bold marker:hidden [&::-webkit-details-marker]:hidden">
            {g.title}
            <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-current text-neutral-500 transition group-open:rotate-180" strokeWidth={2} aria-hidden>
              <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <ul className="mt-0.5">
            {g.items.map((i) => {
              const on = active === i.slug;
              return (
                <li key={i.slug}>
                  <Link
                    href={`/kataloq/${i.slug}`}
                    onClick={onNavigate}
                    aria-current={on ? "page" : undefined}
                    className={`relative flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      on ? "bg-[var(--tint)] font-semibold text-[var(--ink)]" : i.count ? "text-neutral-700 hover:bg-[var(--tint)] hover:text-[var(--ink)]" : "text-neutral-400 hover:bg-[var(--tint)]"
                    }`}
                  >
                    {on && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand" />}
                    <span className="truncate">{i.name}</span>
                    {i.count > 0 && <span className="shrink-0 text-xs tabular-nums text-neutral-500">{i.count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
      {!shown.length && <p className="px-3 py-6 text-sm text-neutral-500">Bu adda kateqoriya yoxdur.</p>}
    </div>
  );
}

/** Kataloq naviqasiyası: böyük ekranda sol indeks, telefonda açılan siyahı */
export function CategoryNav({ groups, active, activeName, total }: { groups: NavGroup[]; active?: string; activeName?: string; total: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Telefon: cari kateqoriyanı göstərən düymə */}
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-[var(--hair)] bg-[var(--tint)] px-4 py-3 text-left lg:hidden"
        aria-haspopup="dialog"
      >
        <span>
          <span className="block text-xs text-neutral-500">Kateqoriya</span>
          <span className="block font-bold">{activeName ?? "Bütün məhsullar"}</span>
        </span>
        <span className="text-sm font-semibold text-brand">Dəyiş</span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Kateqoriyalar" className="fixed inset-0 z-50 flex flex-col bg-[var(--panel)] lg:hidden">
          <div className="flex items-center justify-between border-b border-[var(--hair)] px-4 py-3">
            <p className="text-lg font-bold">Kateqoriyalar</p>
            <button onClick={() => setOpen(false)} className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand">Bağla</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <List groups={groups} active={active} total={total} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Masaüstü: sabit sol indeks */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <List groups={groups} active={active} total={total} />
        </div>
      </aside>
    </>
  );
}
