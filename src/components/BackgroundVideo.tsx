"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Arxa fon videosu: səssiz, dövrəli, şəffaf.
 * Hərəkəti azaltmağı və ya "data saver"-i seçən istifadəçilərdə yüklənmir.
 * Fayl yoxdursa heç nə göstərmir (xəta vermir).
 */
export function BackgroundVideo({
  src,
  webm,
  poster,
  opacity = 0.22,
}: {
  src: string;
  webm?: string;
  poster?: string;
  opacity?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setAllowed(!reduce && !conn?.saveData);
  }, []);

  if (!allowed) return null;

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden
      onCanPlay={() => setReady(true)}
      onError={() => setReady(false)}
      style={{ opacity: ready ? opacity : 0 }}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-opacity duration-1000"
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
