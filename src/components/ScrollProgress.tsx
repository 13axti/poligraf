"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Səhifənin yuxarısında nazik scroll göstəricisi */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand"
    />
  );
}
