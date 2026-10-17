"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// 3D runtime ağırdır: yalnız lazım olanda və yalnız brauzerdə yüklənir
const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

/**
 * Spline 3D səhnəsi. Ekrana girəndə yüklənir; "hərəkəti azalt" və ya "data saver"
 * seçilibsə yüklənmir (onda `fallback` göstərilir).
 */
export function SplineScene({
  scene,
  fallback,
  className = "relative",
}: {
  scene: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData) {
      setFailed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {(!ready || failed) && <div className="absolute inset-0">{fallback}</div>}
      {load && !failed && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <Spline scene={scene} onLoad={() => setReady(true)} onError={() => setFailed(true)} />
        </div>
      )}
    </div>
  );
}
