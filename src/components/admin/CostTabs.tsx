"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/costs", label: "Məhsullar və qiymətlər" },
  { href: "/admin/costs/quote", label: "Təklif hesabla" },
  { href: "/admin/costs/suppliers", label: "Təchizatçılar" },
];

export function CostTabs() {
  const path = usePathname();
  const on = (h: string) => (h === "/admin/costs" ? path === h || /^\/admin\/costs\/(?!quote|suppliers)/.test(path) : path.startsWith(h));
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg bg-[var(--surface)] p-1">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${on(t.href) ? "bg-white" : "text-neutral-600 hover:text-foreground"}`}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
