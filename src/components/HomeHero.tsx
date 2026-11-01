"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Şəbəkədəki şəkillər müvəqqətidir (Unsplash, pulsuz lisenziya): public/hero/.
 * Sütunlar ortaya doğru yüksəlir (V forması); h = şəklin hündürlüyü, top = sütunun yuxarıdan boşluğu (hər ikisi ~200px enə nisbətdə).
 */
const COLS: { top: number; tiles: { src: string; alt: string; h: number }[]; show: string }[] = [
  { top: 150, show: "hidden lg:flex", tiles: [{ src: "tote", alt: "Kətan çanta", h: 150 }] },
  { top: 80, show: "hidden sm:flex", tiles: [{ src: "bottle", alt: "Termos", h: 290 }] },
  { top: 45, show: "flex", tiles: [{ src: "cap", alt: "Kepka", h: 200 }, { src: "card", alt: "Vizit kart", h: 150 }] },
  { top: 0, show: "flex", tiles: [{ src: "mug", alt: "Fincan", h: 250 }, { src: "stickers", alt: "Stikerlər", h: 190 }] },
  { top: 45, show: "flex", tiles: [{ src: "notebook", alt: "Bloknot", h: 150 }, { src: "box", alt: "Qutu", h: 200 }] },
  { top: 125, show: "hidden sm:flex", tiles: [{ src: "tshirt", alt: "Köynək", h: 200 }] },
  { top: 150, show: "hidden lg:flex", tiles: [{ src: "cup", alt: "Kağız stəkan", h: 150 }] },
];
const SPEEDS = [-30, -70, -110, -150, -110, -70, -30];

function Column({ col, i, y }: { col: (typeof COLS)[number]; i: number; y: MotionValue<number> }) {
  return (
    <motion.div style={{ y }} className={`${col.show} min-w-0 flex-1 flex-col gap-3`}>
      {/* Yuxarı boşluq sütunun öz eninə nisbətdə (padding % konteynerə görə hesablanardı) */}
      {col.top > 0 && <div aria-hidden className="-mb-3" style={{ aspectRatio: `200 / ${col.top}` }} />}
      {col.tiles.map((t, k) => (
        <motion.div
          key={t.src}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 + Math.abs(i - 3) * 0.08 + k * 0.1, ease }}
          className="group relative overflow-hidden rounded-2xl bg-[var(--surface)] ring-1 ring-[var(--hair)]"
          style={{ aspectRatio: `200 / ${t.h}` }}
        >
          <Image
            src={`/hero/${t.src}.webp`}
            alt={t.alt}
            fill
            sizes="(min-width: 1024px) 190px, (min-width: 640px) 20vw, 33vw"
            priority={i === 3}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function HomeHero({
  items,
  phone,
  phoneHref,
}: {
  items: { id: string; name: string; image: string }[];
  phone: string;
  phoneHref: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const k = reduce ? 0 : 1;
  // Scroll edəndə sütunlar fərqli sürətlə yüksəlir (ortadakı daha sürətli)
  const y0 = useTransform(scrollYProgress, [0, 1], [0, SPEEDS[0] * k]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, SPEEDS[1] * k]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, SPEEDS[2] * k]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, SPEEDS[3] * k]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, SPEEDS[4] * k]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, SPEEDS[5] * k]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, SPEEDS[6] * k]);
  const ys = [y0, y1, y2, y3, y4, y5, y6];

  const fade = (d: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, delay: d, ease },
  });
  const float = (d: number, dist = 10) =>
    reduce ? {} : { animate: { y: [0, -dist, 0] }, transition: { duration: 5 + d, repeat: Infinity, ease: "easeInOut" as const, delay: d } };

  // Başlıqdakı kiçik dairələr: seçilmiş məhsulların şəkilləri (yoxdursa şəbəkədəkilər)
  const thumbs = (items.length ? items.map((p) => p.image) : ["/hero/mug.webp", "/hero/cap.webp", "/hero/tote.webp"]).slice(0, 3);

  return (
    <section ref={ref} className="relative overflow-hidden px-4 pb-10 pt-10 sm:pt-14">
      {/* Fon: yumşaq narıncı işıq */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10rem] h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />
      </div>

      {/* Sağda şaquli konturlu yazı */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-2 top-24 hidden select-none font-extrabold leading-none text-transparent opacity-40 [writing-mode:vertical-rl] xl:block"
        style={{ fontSize: "9rem", WebkitTextStroke: "1.5px var(--hair)", letterSpacing: "0.05em" }}
      >
        LEMUR
      </div>

      {/* Uçan bəzəklər */}
      <motion.svg {...float(0)} aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute left-[6%] top-16 hidden h-8 w-8 md:block">
        <path d="M6 30 L20 4 L26 34 Z" fill="#ff5a1f" />
        <path d="M20 4 L26 34 L34 22 Z" fill="#c43d0f" />
      </motion.svg>
      <motion.div {...float(1.2, 14)} aria-hidden className="pointer-events-none absolute right-[14%] top-24 hidden h-14 w-14 rounded-full bg-gradient-to-br from-[#ffd2b8] to-brand/30 blur-[1px] md:block" />
      <motion.div {...float(0.6, 12)} aria-hidden className="pointer-events-none absolute left-[11%] top-[19rem] hidden rotate-[-8deg] rounded-xl bg-[var(--card)] p-2 shadow-xl ring-1 ring-[var(--hair)] lg:block">
        <div className="mb-1.5 flex gap-1">
          {["#ff5a1f", "#ffb347", "#f6e05e", "#6ee7b7"].map((c) => <i key={c} className="block h-1.5 w-4 rounded-full" style={{ background: c }} />)}
        </div>
        <div className="space-y-1">
          <i className="block h-1.5 w-14 rounded-full bg-[var(--hair)]" />
          <i className="block h-1.5 w-10 rounded-full bg-[var(--hair)]" />
          <i className="block h-1.5 w-12 rounded-full bg-[var(--hair)]" />
        </div>
      </motion.div>
      <motion.svg {...float(2, 8)} aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute left-[7%] top-[30rem] hidden h-12 w-12 lg:block">
        <defs>
          <linearGradient id="hh-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd2b8" />
            <stop offset="1" stopColor="#ff5a1f" />
          </linearGradient>
        </defs>
        <path d="M2 6 L38 6 L20 38 Z" fill="url(#hh-g)" />
      </motion.svg>

      <div className="relative mx-auto max-w-4xl text-center text-[var(--ink)]">
        <motion.div
          {...fade(0.05)}
          className="mx-auto inline-flex items-center gap-3 rounded-full bg-[var(--card)] px-4 py-1.5 text-sm shadow-sm ring-1 ring-[var(--hair)]"
        >
          <span className="flex items-center gap-1.5 font-semibold text-brand">
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
              <circle cx="10" cy="10" r="10" fill="currentColor" />
              <path d="M6 10.5l2.6 2.5L14 7.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Promo & poliqrafiya
          </span>
          <span className="h-4 w-px bg-[var(--hair)]" />
          <span className="text-[var(--ink-soft)]">Bakı</span>
        </motion.div>

        <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
          <motion.span {...fade(0.15)} className="block">
            Brendiniz üçün{" "}
            <span className="relative inline-block bg-gradient-to-r from-[#ff8a4c] to-[#ff3d00] bg-clip-text text-transparent">
              yaradıcı
              <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-[#ff8a4c] to-[#ff3d00] sm:-bottom-2 sm:h-1" />
            </span>
          </motion.span>
          <motion.span {...fade(0.28)} className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="hidden items-center gap-3 rounded-full px-3 py-1.5 ring-2 ring-brand/60 sm:inline-flex">
              <span className="relative h-0.5 w-8 rounded-full bg-brand">
                <span className="absolute left-1/2 top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />
              </span>
              <span className="flex -space-x-3">
                {thumbs.map((src, i) => (
                  <span key={i} className="relative h-11 w-11 overflow-hidden rounded-full bg-[var(--surface)] ring-2 ring-[var(--card)]">
                    <Image src={src} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                ))}
              </span>
            </span>
            çap və promo
            <span className="hidden items-center sm:inline-flex" aria-hidden>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand">
                <span className="h-6 w-6 rounded-full border-[5px] border-white" />
              </span>
              <span className="-ml-4 h-12 w-12 rounded-full bg-[#ffb347]/80" />
              <svg viewBox="0 0 70 30" className="ml-2 h-8 w-16 text-brand">
                <path d="M2 18 C 20 6, 40 6, 64 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M54 8 L65 16 L53 23" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </motion.span>
        </h1>

        <motion.p {...fade(0.42)} className="mx-auto mt-6 max-w-xl text-base text-[var(--ink-soft)] sm:text-lg">
          Loqonu yüklə, məhsul üzərində nəticəni gör, qiyməti dərhal öyrən və sifarişini bir kliklə ver.
        </motion.p>

        <motion.div {...fade(0.55)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/kataloq"
            className="group inline-flex items-center gap-3 rounded-full bg-brand py-1.5 pl-1.5 pr-6 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-[#ff6f3a]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand transition group-hover:translate-x-0.5">→</span>
            Kataloqa bax
          </Link>
          <a
            href={phoneHref}
            className="group inline-flex items-center gap-3 rounded-full bg-[var(--card)] py-1.5 pl-1.5 pr-6 text-sm font-semibold text-[var(--ink)] ring-2 ring-brand/50 transition hover:-translate-y-0.5 hover:ring-brand"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
              </svg>
            </span>
            {phone}
          </a>
        </motion.div>

        <motion.ul {...fade(0.68)} className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-[var(--ink-soft)]">
          {["Canlı mockup", "Qiymət dərhal", "Bir kliklə sifariş"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-brand" aria-hidden>
                <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.5 10.3l2.3 2.2 4.7-4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Məhsul şəbəkəsi */}
      <div className="relative mx-auto mt-12 flex max-w-[92rem] items-start gap-3 sm:mt-16">
        {COLS.map((c, i) => <Column key={i} col={c} i={i} y={ys[i]} />)}
      </div>
    </section>
  );
}
