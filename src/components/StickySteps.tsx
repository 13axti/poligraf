"use client";

import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";

const steps = [
  { t: "Məhsulu seç", d: "Kataloqdan qələm, fincan, vizitka, banner və ya vinil seç." },
  { t: "Loqonu yüklə", d: "Loqonu məhsul üzərində yerləşdir, ölçüsünü tənzimlə." },
  { t: "Qiyməti öyrən", d: "Say və ya ölçünü yaz, qiymət dərhal hesablansın." },
  { t: "Sifariş ver", d: "Bir kliklə göndər, biz dərhal işə başlayaq." },
];
const N = steps.length;

/**
 * i-ci addımın görünmə pəncərəsi: yumşaq girir, yumşaq çıxır.
 * İlk addım başdan, son addım sondan görünür. Ofsetlər həmişə 0..1 arasında və artan olmalıdır.
 */
function useWindow(p: MotionValue<number>, i: number) {
  const a = i / N;
  const b = (i + 1) / N;
  const e = 0.05;
  const first = i === 0;
  const last = i === N - 1;

  const input = first ? [b - e, b] : last ? [a - e, a] : [a - e, a, b - e, b];
  const pick = (mid: number, edge: number) =>
    first ? [mid, edge] : last ? [edge, mid] : [edge, mid, mid, edge];

  const opacity = useTransform(p, input, pick(1, 0));
  const scale = useTransform(p, input, first ? [1, 1.08] : last ? [0.9, 1] : [0.9, 1, 1, 1.08]);
  const blur = useTransform(p, input, pick(0, 12));
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  return { opacity, scale, filter };
}

function Layer({ p, i, children }: { p: MotionValue<number>; i: number; children: React.ReactNode }) {
  const w = useWindow(p, i);
  return (
    <motion.div style={w} className="absolute inset-0 grid place-items-center p-4 sm:p-8">
      {children}
    </motion.div>
  );
}

/* 1 — məhsul seçimi */
function PickStep({ p }: { p: MotionValue<number> }) {
  const cards = [
    { src: "/products/fincan.jpg", name: "Fincan" },
    { src: "/products/plastik-qelem.jpg", name: "Qələm" },
    { src: "/products/vizitka.jpg", name: "Vizitka" },
  ];
  const pick = useTransform(p, [0.08, 0.2], [0, 1]);
  const penScale = useTransform(pick, [0, 1], [1, 1.12]);
  const othersOpacity = useTransform(pick, [0, 1], [1, 0.35]);
  const ring = useTransform(pick, [0, 1], ["0 0 0 0px #3d4dff", "0 0 0 5px #3d4dff"]);
  return (
    <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3 lg:max-w-2xl lg:gap-5">
      {cards.map((c, i) => (
        <motion.div
          key={c.name}
          style={i === 1 ? { scale: penScale, boxShadow: ring } : { opacity: othersOpacity }}
          className="rounded-3xl bg-white p-2"
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
            <Image src={c.src} alt={c.name} fill sizes="140px" className="object-cover" />
          </div>
          <p className="py-2 text-center text-xs font-bold">{c.name}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* 2 — loqo mockup üzərinə düşür */
function LogoStep({ p }: { p: MotionValue<number> }) {
  const t = useTransform(p, [0.27, 0.4], [0, 1]);
  const y = useTransform(t, [0, 1], [-140, 0]);
  const scale = useTransform(t, [0, 1], [2.4, 1]);
  const opacity = useTransform(t, [0, 0.5, 1], [0, 1, 1]);
  const rotate = useTransform(t, [0, 1], [-14, 0]);
  const Logo = ({ top }: { top: string }) => (
    <motion.span
      style={{ y, scale, opacity, rotate, top }}
      className="absolute left-[63%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-white/0 text-[clamp(10px,2.2vw,18px)] font-black tracking-wide text-brand mix-blend-multiply"
    >
      ◆ LOGO
    </motion.span>
  );
  return (
    <div className="relative aspect-[3/2] max-h-full w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lg lg:max-w-2xl">
      <Image src="/mockups/qelem-ag-2.jpg" alt="Qələm mockup" fill sizes="450px" className="object-cover" />
      <Logo top="41%" />
      <Logo top="58.5%" />
    </div>
  );
}

/* 3 — say artdıqca qiymət dəyişir */
const tiers = [
  { q: 50, u: 0.9 },
  { q: 200, u: 0.7 },
  { q: 500, u: 0.55 },
  { q: 1000, u: 0.45 },
];
function PriceStep({ p }: { p: MotionValue<number> }) {
  const raw = useTransform(p, [0.52, 0.72], [0, 1]);
  const t = useSpring(raw, { stiffness: 120, damping: 24 });
  const [qty, setQty] = useState(50);
  useMotionValueEvent(t, "change", (v) => {
    const c = Math.min(1, Math.max(0, v));
    setQty(Math.round((50 + c * 950) / 10) * 10);
  });
  const unit = [...tiers].reverse().find((x) => qty >= x.q)?.u ?? 0.9;
  const knob = useTransform(t, [0, 1], ["0%", "100%"]);
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-4 shadow-lg sm:p-6 lg:max-w-md lg:p-8">
      <p className="text-sm font-semibold text-neutral-500">Say</p>
      <p className="text-3xl font-extrabold tabular-nums sm:text-4xl lg:text-5xl">{qty} <span className="text-base font-semibold">ədəd</span></p>
      <div className="relative mt-4 h-2 rounded-full bg-surface">
        <motion.div style={{ width: knob }} className="h-full rounded-full bg-brand" />
        <motion.span
          style={{ left: knob }}
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-brand bg-white"
        />
      </div>
      <div className="mt-4 rounded-2xl bg-foreground p-4 text-white sm:mt-6">
        <p className="text-xs text-white/60">Ədəd qiyməti {unit.toFixed(2)} ₼</p>
        <p className="text-3xl font-extrabold tabular-nums sm:text-4xl lg:text-5xl">{(qty * unit).toFixed(2)} ₼</p>
      </div>
    </div>
  );
}

/* 4 — sifariş göndərildi */
function DoneStep({ p }: { p: MotionValue<number> }) {
  const t = useTransform(p, [0.78, 0.9], [0, 1]);
  const pop = useSpring(t, { stiffness: 220, damping: 16 });
  const circleScale = useTransform(pop, [0, 1], [0.2, 1]);
  const lines = useTransform(t, [0.4, 1], [0, 1]);
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-lg sm:p-8 lg:max-w-md lg:p-10">
      <motion.div
        style={{ scale: circleScale }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand text-4xl text-white"
      >
        ✓
      </motion.div>
      <motion.div style={{ opacity: lines, y: useTransform(lines, [0, 1], [16, 0]) }}>
        <p className="mt-5 text-xl font-extrabold">Sifariş qəbul edildi</p>
        <p className="mt-1 text-sm text-neutral-500">Tezliklə sizinlə əlaqə saxlayacağıq</p>
      </motion.div>
    </div>
  );
}

/**
 * Böyük ekran: sol tərəfdəki səhnə yerində qalır (sticky), sağdakı addımlar isə səhifə ilə
 * normal sürətlə axır. Scroll heç vaxt "tutulmur", səhnə hansı addım görünürsə ona keçir.
 */
function PinnedSteps() {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 62%", "end 62%"] });

  useMotionValueEvent(p, "change", (v) =>
    setActive(Math.min(N - 1, Math.max(0, Math.floor(v * N))))
  );

  return (
    <div className="mx-auto max-w-[88rem] px-4">
      <div className="rounded-[2.5rem] bg-surface p-12 lg:p-16">
        <h2 className="text-5xl font-extrabold tracking-tight lg:text-6xl">Necə işləyir</h2>
        <div className="mt-10 grid grid-cols-[1.25fr_1fr] gap-14">
          <div className="sticky top-24 h-[34rem] self-start overflow-hidden rounded-[2rem] bg-white/60">
            <Layer p={p} i={0}><PickStep p={p} /></Layer>
            <Layer p={p} i={1}><LogoStep p={p} /></Layer>
            <Layer p={p} i={2}><PriceStep p={p} /></Layer>
            <Layer p={p} i={3}><DoneStep p={p} /></Layer>
          </div>

          <ol ref={ref}>
            {steps.map((s, i) => (
              <li key={s.t} className="flex min-h-[24rem] items-center">
                <div className={`flex gap-5 transition duration-500 ${i === active ? "opacity-100" : "opacity-30"}`}>
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-bold text-white transition duration-500 ${
                      i === active ? "scale-110 bg-brand shadow-lg shadow-brand/40" : "bg-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold lg:text-3xl">{s.t}</h3>
                    <p className="mt-2 text-lg text-neutral-600">{s.d}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/** Kiçik ekranlarda pinləmə yoxdur: sadə, normal scroll edən siyahı */
function StepsList() {
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4">
      <div className="rounded-[2rem] bg-surface p-5 sm:p-8">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Necə işləyir</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-3xl bg-white p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-base font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-neutral-600">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Böyük ekranda: Apple tipli pinlənmiş bölmə. Kiçik ekranda: sadə siyahı. */
export function StickySteps() {
  return (
    <>
      <div className="hidden lg:block">
        <PinnedSteps />
      </div>
      <div className="lg:hidden">
        <StepsList />
      </div>
    </>
  );
}
