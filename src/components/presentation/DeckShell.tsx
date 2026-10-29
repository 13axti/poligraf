"use client";

import { Children, useEffect, useRef, useState } from "react";
import "./deck.css";

/** Slaydları ekran enine görə kiçildir (çapda tam ölçü). Üstdə "PDF saxla" düyməsi. */
export function DeckShell({ title, children }: { title: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => setS(Math.min(1, el.clientWidth / 1280));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="dk-root" ref={root}>
      <div className="dk-bar" style={{ width: Math.min(1280, 1280 * s) }}>
        <span>{title}</span>
        <button type="button" onClick={() => window.print()}>PDF kimi saxla</button>
      </div>
      {Children.map(children, (slide, i) => (
        <div key={i} className="dk-wrap" style={{ width: 1280 * s, height: 720 * s }}>
          <div className="dk-slide" style={{ transform: `scale(${s})` }}>{slide}</div>
        </div>
      ))}
    </div>
  );
}
