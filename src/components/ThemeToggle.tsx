"use client";

import { useEffect, useState } from "react";

/** Qara ↔ açıq (ağ + narıncı) tema. Seçim brauzerdə saxlanır, ilk yüklənmədə titrəmə olmasın deyə atribut <head>-dəki skriptlə qoyulur. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const light = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Qara temaya keç" : "Açıq temaya keç"}
      title={light ? "Qara tema" : "Açıq tema"}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--hair)] bg-[var(--tint)] text-[var(--ink)] transition hover:border-brand hover:text-brand"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {light ? (
          <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
