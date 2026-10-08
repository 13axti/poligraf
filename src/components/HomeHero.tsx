"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

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

  // Scroll edəndə kart kiçilir və yuvarlaqlaşır, şəkillər fərqli sürətlə yüksəlir
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const speeds = [-120, -40, -200, -80];
  const y0 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : speeds[0]]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : speeds[1]]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : speeds[2]]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : speeds[3]]);
  const ys = [y0, y1, y2, y3];

  const fade = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.9, delay: d, ease },
  });

  return (
    <section ref={ref} className="relative px-4">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-brand" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          style={{ scale: cardScale }}
          className="relative grid origin-top items-center gap-8 overflow-hidden rounded-[2.5rem] bg-surface px-6 py-12 sm:px-14 lg:grid-cols-2 lg:py-16"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/10" />
          <motion.div style={{ y: textY, opacity: textOpacity }}>
            <motion.span
              {...fade(0.05)}
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Promo & poliqrafiya · Bakı
            </motion.span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {["Dəqiqlik çap", "mükəmməlliyi ilə", "görüşür"].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.1em]">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p {...fade(0.55)} className="mt-5 max-w-md text-neutral-600">
              Loqonu yüklə, məhsul üzərində nəticəni gör, qiyməti dərhal öyrən və sifarişini bir kliklə ver.
            </motion.p>
            <motion.div {...fade(0.7)} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/kataloq"
                className="rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand"
              >
                Kataloqa bax
              </Link>
              <a
                href={phoneHref}
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                {phone}
              </a>
            </motion.div>
          </motion.div>

          <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-3">
            {items.slice(0, 4).map((p, i) => (
              <motion.div key={p.id} style={{ y: ys[i] }} className={i % 2 ? "translate-y-6" : ""}>
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.8, rotate: i % 2 ? 6 : -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.12, ease }}
                  className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-xl"
                >
                  <Image src={p.image} alt={p.name} fill sizes="220px" className="object-cover" priority={i < 2} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
