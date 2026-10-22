"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

/** Kəsmə sahəsi: şəklin ölçüsünə nisbətən 0..1 */
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const FULL_CROP: Crop = { x: 0, y: 0, w: 1, h: 1 };
const MIN = 0.06;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Handle = "move" | "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";
const handles: { id: Handle; cls: string; cursor: string }[] = [
  { id: "nw", cls: "-left-2 -top-2", cursor: "nwse-resize" },
  { id: "n", cls: "left-1/2 -top-2 -translate-x-1/2", cursor: "ns-resize" },
  { id: "ne", cls: "-right-2 -top-2", cursor: "nesw-resize" },
  { id: "e", cls: "-right-2 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
  { id: "se", cls: "-right-2 -bottom-2", cursor: "nwse-resize" },
  { id: "s", cls: "left-1/2 -bottom-2 -translate-x-1/2", cursor: "ns-resize" },
  { id: "sw", cls: "-left-2 -bottom-2", cursor: "nesw-resize" },
  { id: "w", cls: "-left-2 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
];

export function CropDialog({
  src,
  nw,
  nh,
  initial,
  onApply,
  onClose,
}: {
  src: string;
  nw: number;
  nh: number;
  initial: Crop;
  onApply: (c: Crop) => void;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState<Crop>(initial);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ h: Handle; px: number; py: number; c: Crop } | null>(null);

  function down(h: Handle, e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { h, px: e.clientX, py: e.clientY, c: crop };
  }

  function move(e: React.PointerEvent) {
    const d = drag.current;
    const el = box.current;
    if (!d || !el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - d.px) / r.width;
    const dy = (e.clientY - d.py) / r.height;
    let { x, y, w, h } = d.c;
    if (d.h === "move") {
      x = clamp(x + dx, 0, 1 - w);
      y = clamp(y + dy, 0, 1 - h);
    } else {
      if (d.h.includes("w")) {
        const nx = clamp(x + dx, 0, x + w - MIN);
        w += x - nx;
        x = nx;
      }
      if (d.h.includes("e")) w = clamp(w + dx, MIN, 1 - x);
      if (d.h.includes("n")) {
        const ny = clamp(y + dy, 0, y + h - MIN);
        h += y - ny;
        y = ny;
      }
      if (d.h.includes("s")) h = clamp(h + dy, MIN, 1 - y);
    }
    setCrop({ x, y, w, h });
  }

  function square() {
    // şəkil pikselləri ilə kvadrat: ən böyük mərkəzi kvadrat
    const side = Math.min(nw, nh);
    const w = side / nw;
    const h = side / nh;
    setCrop({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
  }

  const pct = (v: number) => `${v * 100}%`;
  const px = { w: Math.round(crop.w * nw), h: Math.round(crop.h * nh) };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-3 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-[2rem] bg-card p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight">Loqonu kəs</h2>
          <button onClick={onClose} aria-label="Bağla" className="text-2xl leading-none text-neutral-400 hover:text-foreground">
            ×
          </button>
        </div>
        <p className="mt-1 text-sm text-neutral-500">Çərçivəni sürüşdürün və ya künclərdən dartın. Çərçivənin kənarındakı hissə kəsiləcək.</p>

        <div className="mt-4 grid place-items-center rounded-2xl bg-[repeating-conic-gradient(#e5e5ea_0%_25%,#f5f5f7_0%_50%)] bg-[length:16px_16px] p-3">
          <div ref={box} className="relative touch-none select-none" style={{ aspectRatio: `${nw} / ${nh}`, maxHeight: "52vh", maxWidth: "100%", height: "52vh" }}>
            <img src={src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
            <div
              onPointerDown={(e) => down("move", e)}
              onPointerMove={move}
              onPointerUp={() => (drag.current = null)}
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
              style={{ left: pct(crop.x), top: pct(crop.y), width: pct(crop.w), height: pct(crop.h) }}
            >
              {/* üçlü şəbəkə */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="border border-white/30" />
                ))}
              </div>
              {handles.map((h) => (
                <span
                  key={h.id}
                  onPointerDown={(e) => down(h.id, e)}
                  onPointerMove={move}
                  onPointerUp={() => (drag.current = null)}
                  className={`absolute h-4 w-4 rounded-full border-2 border-brand bg-card shadow ${h.cls}`}
                  style={{ cursor: h.cursor }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => setCrop(FULL_CROP)} className="rounded-full bg-surface px-4 py-2 text-sm font-semibold hover:bg-neutral-200">
            Hamısı
          </button>
          <button onClick={square} className="rounded-full bg-surface px-4 py-2 text-sm font-semibold hover:bg-neutral-200">
            Kvadrat
          </button>
          <span className="ml-auto text-xs font-semibold text-neutral-500">
            {px.w} × {px.h} px
          </span>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-surface">
            Ləğv et
          </button>
          <button onClick={() => onApply(crop)} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Tətbiq et
          </button>
        </div>
      </div>
    </div>
  );
}
