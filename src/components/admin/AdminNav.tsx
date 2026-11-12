"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups: { title?: string; items: { href: string; label: string; icon: React.ReactNode }[] }[] = [
  {
    items: [
      { href: "/admin", label: "Ümumi baxış", icon: <path d="M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" /> },
      { href: "/admin/orders", label: "Sifarişlər", icon: <path d="M6 3h12l2 4v14H4V7l2-4zM4 7h16M9 11h6" /> },
      { href: "/admin/requests", label: "Sorğular", icon: <path d="M4 5h16v11H8l-4 4V5zM8 9h8M8 12h5" /> },
      { href: "/admin/presentations", label: "Təqdimatlar", icon: <path d="M3 4h18v12H3V4zM12 16v4M8 20h8M7 12l3-3 3 2 4-4" /> },

    ],
  },
  {
    title: "Qiymət",
    items: [
      { href: "/admin/costs", label: "Qiymət bazası", icon: <path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /> },
      { href: "/admin/suppliers", label: "Təchizatçılar", icon: <path d="M3 21V8l6-4v4l6-4v4l6-4v17H3zM8 17h2M14 17h2M8 13h2M14 13h2" /> },
      { href: "/admin/quotes", label: "Qiymət təklifləri", icon: <path d="M7 3h7l5 5v13H7V3zM14 3v5h5M10 13h6M10 17h4" /> },
    ],
  },
  {
    title: "Kataloq",
    items: [
      { href: "/admin/products", label: "Məhsullar", icon: <path d="M12 3l9 5v8l-9 5-9-5V8l9-5zM3 8l9 5 9-5M12 13v8" /> },
      { href: "/admin/prices", label: "Qiymətlər", icon: <path d="M4 4h8l8 8-8 8-8-8V4zM8.5 8.5h.01" /> },
      { href: "/admin/categories", label: "Kateqoriyalar", icon: <path d="M4 5h16M4 12h16M4 19h10" /> },
    ],
  },
  {
    items: [{ href: "/admin/settings", label: "Sayt ayarları", icon: <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM19 12l2-1-2-4-2.2.7-1.6-1.2L14.8 4h-4.6l-.4 2.5-1.6 1.2L6 7 4 11l2 1v0l-2 1 2 4 2.2-.7 1.6 1.2.4 2.5h4.6l.4-2.5 1.6-1.2L18 17l2-4-2-1z" /> }],
  },
];

export function AdminNav({ newCount, requestCount = 0 }: { newCount: number; requestCount?: number }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  return (
    <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:gap-0 md:px-3 md:pb-0">
      {groups.map((g, gi) => (
        <div key={gi} className="flex gap-1 md:mb-3 md:flex-col md:gap-0.5">
          {g.title && <p className="hidden px-3 pb-1 pt-2 text-xs font-medium text-neutral-400 md:block">{g.title}</p>}
          {g.items.map((n) => {
            const on = active(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  on ? "bg-[var(--surface)] text-foreground" : "text-neutral-600 hover:bg-[var(--surface)]/60 hover:text-foreground"
                }`}
              >
                {on && <span className="absolute inset-y-1.5 left-0 hidden w-[3px] rounded-full bg-[#0066ff] md:block" />}
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {n.icon}
                </svg>
                {n.label}
                {n.href === "/admin/orders" && newCount > 0 && (
                  <span className="num ml-auto rounded bg-[#0066ff] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{newCount}</span>
                )}
                {n.href === "/admin/requests" && requestCount > 0 && (
                  <span className="num ml-auto rounded bg-[#0066ff] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{requestCount}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0 md:mt-2 md:flex-col md:items-stretch md:gap-0.5 md:border-t md:border-[var(--line)] md:pt-3">
        <Link href="/" target="_blank" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-[var(--surface)]/60 hover:text-foreground">
          Saytı aç
        </Link>
        <Link href="/coming-soon" target="_blank" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-[var(--surface)]/60 hover:text-foreground">
          Tezliklə səhifəsi
        </Link>
      </div>
    </nav>
  );
}
