"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const; // Apple-ə yaxın yumşaq əyri

/** Ekrana girəndə yumşaq şəkildə açılır (fade + qalxma + blur) */
export function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "rise",
}: {
  children: React.ReactNode;
  delay?: number; // ms
  className?: string;
  variant?: "rise" | "scale";
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const from =
    variant === "scale"
      ? { opacity: 0, scale: 0.92, filter: "blur(10px)" }
      : { opacity: 0, y: 40, filter: "blur(8px)" };
  const to = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };

  return (
    <motion.div
      initial={from}
      whileInView={to}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay: delay / 1000, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Başlıq: hər söz aşağıdan "maska"nın içindən yuxarı çıxır */
export function SplitHeading({
  text,
  className = "",
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, delay: i * 0.06, ease }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
