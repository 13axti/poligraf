"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * Səhifə boyu kənarlarda üzən xrom obyektlər (buckssauce.com üslubu):
 * sürüşdürdükcə hər biri öz sürəti ilə qalxır və fırlanır, dərinlik hissi yaranır.
 * Valideyn "relative" olmalıdır; obyektlər klikləri bloklamır.
 */
const ITEMS = [
  { src: "cube", top: "14%", side: "left-[-2.5rem] sm:left-[1%]", w: "w-20 sm:w-28 lg:w-36", speed: 0.35, rot: 0.12, blur: false },
  { src: "sphere", top: "22%", side: "right-[-1.5rem] sm:right-[2%]", w: "w-14 sm:w-20", speed: 0.6, rot: 0, blur: true },
  { src: "knot", top: "36%", side: "right-[-3rem] sm:right-[1%]", w: "w-24 sm:w-32 lg:w-40", speed: 0.25, rot: -0.1, blur: false },
  { src: "capsule", top: "48%", side: "left-[-1.5rem] sm:left-[3%]", w: "w-14 sm:w-20", speed: 0.5, rot: 0.2, blur: true },
  { src: "ring", top: "62%", side: "left-[-2rem] sm:left-[1%]", w: "w-20 sm:w-28", speed: 0.3, rot: -0.15, blur: false },
  { src: "torus", top: "74%", side: "right-[-2rem] sm:right-[3%]", w: "w-20 sm:w-28 lg:w-32", speed: 0.45, rot: 0.1, blur: false },
  { src: "sphere", top: "88%", side: "left-[-1rem] sm:left-[6%]", w: "w-10 sm:w-14", speed: 0.7, rot: 0, blur: true },
];

function Floater({ item, scrollY, still }: { item: (typeof ITEMS)[number]; scrollY: MotionValue<number>; still: boolean }) {
  const y = useTransform(scrollY, (v) => (still ? 0 : -v * item.speed * 0.4));
  const rotate = useTransform(scrollY, (v) => (still ? 0 : v * item.rot));
  return (
    <motion.img
      src={`/chrome/${item.src}.webp`}
      alt=""
      draggable={false}
      style={{ y, rotate, top: item.top }}
      className={`absolute h-auto select-none drop-shadow-[0_20px_30px_rgba(0,20,60,0.45)] ${item.side} ${item.w} ${item.blur ? "opacity-70 blur-[2px]" : ""}`}
    />
  );
}

export function ScrollFloaters() {
  const { scrollY } = useScroll();
  const still = !!useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {ITEMS.map((it, i) => (
        <Floater key={i} item={it} scrollY={scrollY} still={still} />
      ))}
    </div>
  );
}
