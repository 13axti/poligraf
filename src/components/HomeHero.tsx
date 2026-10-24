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
    initial: { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.9, delay: d, ease },
  });

  const collage = (
          <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-3">
            {items.slice(0, 4).map((p, i) => (
              <motion.div key={p.id} style={{ y: ys[i] }} className={i % 2 ? "translate-y-6" : ""}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: i % 2 ? 6 : -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.12, ease }}
                  className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-xl"
                >
                  <Image src={p.image} alt={p.name} fill sizes="220px" className="object-cover" priority={i < 2} />
                </motion.div>
              </motion.div>
            ))}
          </div>
  );

  return (
    <section ref={ref} className="relative px-4">
      <div className="hidden" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          style={{ scale: cardScale }}
          className="relative grid origin-top items-center gap-8 overflow-hidden rounded-[2.5rem] hero-card px-6 py-12 ring-1 ring-white/10 text-white sm:px-14 lg:min-h-[34rem] lg:grid-cols-2 lg:py-16"
        >
          {/* Lemur: böyük ekranda sağda; şəklin fonu da qaradır, kənar görünmür */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[62%] lg:block">
            <Image
              src="/coming-soon/lemur-alpha.webp"
              alt=""
              fill
              priority
              sizes="62vw"
              className="object-contain object-right-bottom"
            />
          </div>
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10">
            <motion.span
              {...fade(0.05)}
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              Promo & poliqrafiya · Bakı
            </motion.span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {["Loqonu yüklə,", "nəticəni gör,", "sifariş ver."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.1em]">
                  <motion.span
                    className={`block bg-clip-text text-transparent ${i === 1 ? "bg-gradient-to-r from-[#ffd2b8] to-[#ff6a2b]" : "bg-gradient-to-r from-white to-[#ffd9c4]"}`}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p {...fade(0.55)} className="mt-5 max-w-md text-white/70">
              Loqonu yüklə, məhsul üzərində nəticəni gör, qiyməti dərhal öyrən və sifarişini bir kliklə ver.
            </motion.p>
            <motion.div {...fade(0.7)} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/kataloq"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-brand hover:text-black"
              >
                Kataloqa bax
              </Link>
              {/* T-shirt kampaniyası düyməsi müvəqqəti söndürülüb:
              <a href="#kampaniya" className="rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-[#ff7a45]">T-shirt kampaniyası ↓</a> */}
              <a
                href={phoneHref}
                className="rounded-full bg-white/10 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                {phone}
              </a>
            </motion.div>
          </motion.div>

          {/* Kiçik ekranda: məhsul kolajı */}
          <div className="lg:hidden">{collage}</div>
        </motion.div>
      </div>
    </section>
  );
}
