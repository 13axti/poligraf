"use client";

import { MotionConfig } from "motion/react";

/**
 * "Hərəkəti azalt" seçən istifadəçilərdə transform animasiyaları avtomatik söndürülür,
 * amma server və brauzer eyni HTML-i render edir (hydration uyğunsuzluğu olmur).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
