"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animasiyalı Lemur loqosu (3 san, bir dəfə oynayır, sonda son kadrda qalır; üstünə gələndə təkrarlanır).
 * Video 1920×1080 ağ fonlu olduğu üçün yalnız yazının olduğu hissəyə kəsilir (CSS ilə), ağ fon isə
 * SVG filteri ilə şəffaf edilir (blend rejimi bulanıq başlıqda işləmir).
 * "Hərəkəti azalt" seçənlərdə yalnız son kadr göstərilir.
 */
const CROP = { x: 500, y: 390, w: 940, h: 300 }; // 1920×1080 kadrdan
export function LogoVideo({ label, className = "h-9" }: { label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const replay = () => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  };

  return (
    <span
      role="img"
      aria-label={label}
      onMouseEnter={still ? undefined : replay}
      className={`logo-video relative block shrink-0 overflow-hidden ${className}`}
      style={{ aspectRatio: `${CROP.w} / ${CROP.h}` }}
    >
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          {/* tünd tema (rənglər çevrildikdən sonra): qara fon -> şəffaf */}
          <filter id="lemur-key-dark" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0.9 1.8 0.3 0 0" />
          </filter>
          {/* açıq tema: ağ fon -> şəffaf (mavi kanal nə qədər aşağıdırsa, o qədər qatı) */}
          <filter id="lemur-key-light" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 -1 0 1" />
          </filter>
        </defs>
      </svg>
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/brand/lemur-logo-last.jpg" alt="" className="absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] max-w-none" />
      ) : (
        <video
          ref={ref}
          src="/brand/lemur-logo.mp4"
          poster="/brand/lemur-logo-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute max-w-none"
          style={{
            width: `${(1920 / CROP.w) * 100}%`,
            height: `${(1080 / CROP.h) * 100}%`,
            left: `${(-CROP.x / CROP.w) * 100}%`,
            top: `${(-CROP.y / CROP.h) * 100}%`,
          }}
        />
      )}
    </span>
  );
}
