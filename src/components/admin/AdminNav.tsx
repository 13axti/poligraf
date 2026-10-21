"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups: { title?: string; items: { href: string; label: string; icon: React.ReactNode }[] }[] = [
  {
    items: [
      { href: "/admin", label: "Ümumi baxış", icon: <path d="M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" /> },
      { href: "/admin/orders", label: "Sifarişlər", icon: <path d="M6 3h12l2 4v14H4V7l2-4zM4 7h16M9 11h6" /> },
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

export function AdminNav({ newCount }: { newCount: number }) {
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
                {on && <span className="absolute inset-y-1.5 left-0 hidden w-[3px] rounded-full bg-[#ff5a1f] md:block" />}
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {n.icon}
                </svg>
                {n.label}
                {n.href === "/admin/orders" && newCount > 0 && (
                  <span className="num ml-auto rounded bg-[#ff5a1f] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{newCount}</span>
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
