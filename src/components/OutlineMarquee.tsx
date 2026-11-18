"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Ekran enində nəhəng, içi boş (konturlu) söz; sürüşdürdükcə yana axır (buckssauce "CHOOSE YOUR WEAPON" üslubu) */
export function OutlineMarquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reverse ? ["-25%", "0%"] : ["0%", "-25%"]);
  const row = Array.from({ length: 4 }, () => text).join(" • ");
  return (
    <div ref={ref} aria-hidden className="pointer-events-none select-none overflow-hidden py-2">
      <motion.p
        style={{ x: still ? 0 : x, WebkitTextStroke: "1.5px var(--ink)", fontSize: "clamp(4rem,13vw,11rem)" }}
        className="whitespace-nowrap font-extrabold uppercase leading-[0.9] text-transparent opacity-40"
      >
        {row}
      </motion.p>
    </div>
  );
}
