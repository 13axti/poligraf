"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/kataloq", label: "Kataloq" },
  { href: "/qiymetler", label: "Qiymətlər" },
  // { href: "/#kampaniya", label: "T-shirt kampaniyası" }, // müvəqqəti söndürülüb
  { href: "/", label: "Ana səhifə" },
  { href: "/#musteriler", label: "Müştərilər" },
  { href: "/#elaqe", label: "Əlaqə" },
];

export function MobileMenu({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-full border border-neutral-300 bg-white"
      >
        <span className="relative block h-3.5 w-5">
          <span className={`absolute left-0 h-0.5 w-5 rounded bg-foreground transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-foreground transition ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-0.5 w-5 rounded bg-foreground transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
        </span>
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[73px] z-40 h-[calc(100dvh-73px)] overflow-y-auto bg-white/95 px-4 pb-8 pt-4 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-md flex-col gap-2">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={
                  i < 2
                    ? "rounded-2xl bg-brand px-5 py-4 text-lg font-extrabold text-white"
                    : "rounded-2xl bg-surface px-5 py-3.5 font-semibold"
                }
              >
                {l.label}
              </Link>
            ))}
            <a href={phoneHref} className="mt-3 rounded-2xl border border-neutral-300 px-5 py-3.5 text-center font-semibold text-brand">
              {phone}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
