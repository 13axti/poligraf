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

/** İki addımı birləşdirən xətt: scroll-la yuxarıdan aşağı dolur */
function Connector({ p, i }: { p: MotionValue<number>; i: number }) {
  const fill = useTransform(p, [i / N + 0.04, (i + 1) / N - 0.02], [0, 1], { clamp: true });
  return (
    <div className="absolute left-[22px] top-[52px] -bottom-[28px] w-0.5 -translate-x-1/2 rounded-full bg-foreground/10">
      <motion.div style={{ scaleY: fill }} className="h-full origin-top rounded-full bg-brand" />
    </div>
  );
}

/** Apple tipli: bölmə yerində qalır, scroll hər şeyi irəli aparır */
export function StickySteps() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = scrollYProgress;

  useMotionValueEvent(p, "change", (v) =>
    setActive(Math.min(N - 1, Math.max(0, Math.floor(v * N))))
  );

  return (
    <div ref={ref} style={{ height: `${N * 100 + 40}vh` }} className="relative">
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center">
        <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4">
          <div className="grid max-h-[calc(100svh-5rem)] items-center gap-5 overflow-hidden rounded-[2rem] bg-surface p-4 sm:gap-8 sm:rounded-[2.5rem] sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:p-16">
            {/* Səhnə */}
            <div className="relative h-[34svh] min-h-[230px] overflow-hidden rounded-[1.5rem] bg-white/60 sm:h-[42svh] sm:rounded-[2rem] lg:h-[min(62svh,640px)]">
              <Layer p={p} i={0}><PickStep p={p} /></Layer>
              <Layer p={p} i={1}><LogoStep p={p} /></Layer>
              <Layer p={p} i={2}><PriceStep p={p} /></Layer>
              <Layer p={p} i={3}><DoneStep p={p} /></Layer>
            </div>

            {/* Siyahı */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Necə işləyir</h2>
              <ol className="mt-5 space-y-6 sm:mt-8 sm:space-y-8 lg:mt-12">
                {steps.map((s, i) => (
                  <li key={s.t} className="relative flex gap-4 sm:gap-5">
                    {i < N - 1 && <Connector p={p} i={i} />}
                    <span
                      className={`z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-bold text-white transition duration-500 ${
                        i === active ? "scale-110 bg-brand shadow-lg shadow-brand/40" : i < active ? "bg-brand" : "bg-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className={`pt-0.5 transition duration-500 ${i === active ? "opacity-100" : "opacity-40"}`}>
                      <h3 className="text-lg font-bold sm:text-xl lg:text-2xl">{s.t}</h3>
                      <p
                        className={`overflow-hidden text-sm text-neutral-600 transition-all duration-500 sm:text-base lg:text-lg ${
                          i === active ? "mt-1 max-h-24 opacity-100" : "max-h-0 opacity-0 lg:mt-1 lg:max-h-24 lg:opacity-100"
                        }`}
                      >
                        {s.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
