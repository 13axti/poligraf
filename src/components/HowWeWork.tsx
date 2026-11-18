"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * "Necə işləyirik" (buckssauce.com-dakı "Why Bucks Sauce" üslubu):
 * qövs boyu əyilmiş başlıq, sonra bölmə ekrana bərkiyir və sürüşdürdükcə addımlar yana keçir;
 * nöqtəli əyri xətt boyu xrom kürə səyahət edir.
 */
const STEPS = [
  { n: "01", t: "Məhsulu seç", d: "Kataloqdan məhsulu seç və ya xüsusi sorğu göndər." },
  { n: "02", t: "Qiyməti hesabla", d: "Ölçü, material və tirajı seç, məbləğ dərhal görünür." },
  { n: "03", t: "Dizaynı təsdiqlə", d: "Eskizi sənə göndəririk, təsdiqləyəndən sonra çapa başlayırıq." },
  { n: "04", t: "Çap və çatdırılma", d: "Hazır olan kimi Bakı üzrə və regionlara çatdırırıq." },
];

// Addımlar arasında dalğalı yol (hər addım 100 vahid en)
const W = STEPS.length * 100;
const PATH = `M 0 40 ${STEPS.map((_, i) => `Q ${i * 100 + 50} ${i % 2 ? 70 : 10} ${i * 100 + 100} 40`).join(" ")}`;

export function HowWeWork() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Lent 0-dan -(n-1)/n hissəyə qədər sola sürüşür
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${((STEPS.length - 1) / STEPS.length) * 100}%`]);
  const [ball, setBall] = useState({ x: 0, y: 40, r: 0 });

  const place = (p: number) => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    const pt = el.getPointAtLength(Math.min(Math.max(p, 0), 1) * len);
    setBall({ x: pt.x, y: pt.y, r: p * 720 });
  };
  useMotionValueEvent(scrollYProgress, "change", place);
  useEffect(() => place(0), []);

  return (
    <section ref={ref} className="relative" style={{ height: still ? "auto" : `${STEPS.length * 80}vh` }}>
      <div className={`${still ? "" : "sticky top-0 h-screen"} flex flex-col justify-center overflow-hidden`}>
        {/* Qövs boyu əyilmiş başlıq */}
        <svg viewBox="0 0 600 140" className="mx-auto w-[min(92vw,46rem)] text-[var(--ink)]" aria-label="Niyə Lemur Group">
          <path id="hw-arc" d="M 30 130 Q 300 -10 570 130" fill="none" />
          <text className="fill-current font-extrabold uppercase" style={{ fontSize: 58, letterSpacing: 4 }}>
            <textPath href="#hw-arc" startOffset="50%" textAnchor="middle">Necə işləyirik</textPath>
          </text>
        </svg>

        <div className="relative mt-4 w-full">
          <motion.div style={{ x: still ? 0 : x, width: `${STEPS.length * 100}%` }} className="relative [--hw-h:7rem] sm:[--hw-h:9rem]">
            {/* Nöqtəli yol və onun üzərində səyahət edən xrom kürə */}
            <svg viewBox={`0 0 ${W} 80`} preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full sm:h-36">
              <path ref={pathRef} d={PATH} fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.2 2.4" className="text-[var(--ink-soft)]" vectorEffect="non-scaling-stroke" />
            </svg>
            <img
              src="/chrome/sphere.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute z-10 h-14 w-14 drop-shadow-[0_12px_20px_rgba(0,20,60,0.5)] sm:h-20 sm:w-20"
              style={{ left: `${(ball.x / W) * 100}%`, top: `calc(${ball.y / 80} * var(--hw-h))`, transform: `translate(-50%,-50%) rotate(${ball.r}deg)` }}
            />
            <div className="flex">
              {STEPS.map((s) => (
                <div key={s.n} style={{ width: `${100 / STEPS.length}%` }} className="flex flex-col items-center px-6 pt-32 text-center sm:pt-40">
                  <span className="font-extrabold leading-none text-transparent" style={{ fontSize: "clamp(5rem,14vw,10rem)", WebkitTextStroke: "2px var(--ink)" }}>
                    {s.n}
                  </span>
                  <span className="-mt-3 -rotate-2 rounded-lg bg-brand px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg">• {s.t} •</span>
                  <p className="mt-5 max-w-sm text-lg text-[var(--ink-soft)]">{s.d}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
