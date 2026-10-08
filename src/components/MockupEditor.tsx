"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProductMockup } from "@/lib/types";

const SAMPLE_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
      <rect x="4" y="20" width="80" height="80" rx="20" fill="#3d4dff"/>
      <text x="44" y="78" font-family="Arial" font-weight="900" font-size="52" fill="#fff" text-anchor="middle">L</text>
      <text x="100" y="80" font-family="Arial" font-weight="900" font-size="60" fill="#ff4a2b">LOGO</text>
    </svg>`
  );

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Loqonun bütün rəngli piksellərini ağa çevirir (qara məhsul üçün) */
async function makeWhite(src: string): Promise<string> {
  const img = await loadImage(src);
  const w = img.naturalWidth || 400;
  const h = img.naturalHeight || 120;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  return c.toDataURL("image/png");
}

export interface MockupExport {
  mockup: string; // JPEG dataURL (sifariş üçün)
  logo: string; // orijinal loqo dataURL
}

export function MockupEditor({
  mockups,
  productName,
  exportRef,
}: {
  mockups: ProductMockup[];
  productName: string;
  /** Sifariş formu cari nəticəni buradan alır */
  exportRef?: React.MutableRefObject<(() => Promise<MockupExport | null>) | null>;
}) {
  const [active, setActive] = useState(0);
  const mockup = mockups[active];

  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [white, setWhite] = useState(false);
  const [whiteSrc, setWhiteSrc] = useState<string | null>(null);

  // Hər mockup üçün ayrı yer/ölçü/dönmə
  const [pos, setPos] = useState({ cx: mockup.placement.cx, cy: mockup.placement.cy });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(mockup.placement.rotation);

  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function selectMockup(i: number) {
    const m = mockups[i];
    setActive(i);
    setPos({ cx: m.placement.cx, cy: m.placement.cy });
    setRotation(m.placement.rotation);
    setScale(1);
    setWhite(!!m.darkProduct);
  }

  // Ağ variantı hazırla
  useEffect(() => {
    let cancelled = false;
    if (logoSrc && white) {
      makeWhite(logoSrc).then((u) => !cancelled && setWhiteSrc(u));
    } else {
      setWhiteSrc(null);
    }
    return () => {
      cancelled = true;
    };
  }, [logoSrc, white]);

  const shownLogo = white && whiteSrc ? whiteSrc : logoSrc;
  // Açıq rəngli məhsulda "multiply" mürəkkəb effekti verir; ağ loqo üçün normal rejim
  const blendMode = white ? "normal" : "multiply";

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) {
      alert("Fayl 3 MB-dan böyükdür. Daha kiçik loqo seçin.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoSrc(reader.result as string);
      setWhite(!!mockup.darkProduct);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, cx: pos.cx, cy: pos.cy };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const dx = (e.clientX - drag.current.x) / r.width;
    const dy = (e.clientY - drag.current.y) / r.height;
    setPos({
      cx: Math.min(1, Math.max(0, drag.current.cx + dx)),
      cy: Math.min(1, Math.max(0, drag.current.cy + dy)),
    });
  }
  function onPointerUp() {
    drag.current = null;
  }

  async function render(maxW?: number): Promise<HTMLCanvasElement | null> {
    if (!shownLogo) return null;
    const [base, logo, overlay] = await Promise.all([
      loadImage(mockup.image),
      loadImage(shownLogo),
      mockup.overlay ? loadImage(mockup.overlay) : Promise.resolve(null),
    ]);
    const k = maxW ? Math.min(1, maxW / base.naturalWidth) : 1;
    const W = Math.round(base.naturalWidth * k);
    const H = Math.round(base.naturalHeight * k);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(base, 0, 0, W, H);

    const boxW = mockup.placement.w * scale * W;
    const boxH = mockup.placement.h * scale * W;
    const lw = logo.naturalWidth || 400;
    const lh = logo.naturalHeight || 120;
    const fit = Math.min(boxW / lw, boxH / lh);
    const dw = lw * fit;
    const dh = lh * fit;

    const spots = [{ dx: 0, dy: 0 }, ...(mockup.clones ?? [])];
    for (const s of spots) {
      ctx.save();
      ctx.globalCompositeOperation = blendMode === "multiply" ? "multiply" : "source-over";
      ctx.translate((pos.cx + s.dx) * W, (pos.cy + s.dy) * H);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(logo, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }
    if (overlay) ctx.drawImage(overlay, 0, 0, W, H);
    return c;
  }

  async function download() {
    const c = await render();
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `${productName.replace(/\s+/g, "-")}-numune.png`;
    a.click();
  }

  // Sifariş formu üçün cari nəticəni təqdim et
  const renderRef = useRef(render);
  renderRef.current = render;
  const logoRef = useRef(logoSrc);
  logoRef.current = logoSrc;
  useEffect(() => {
    if (!exportRef) return;
    exportRef.current = async () => {
      const c = await renderRef.current(1000);
      if (!c || !logoRef.current) return null;
      return { mockup: c.toDataURL("image/jpeg", 0.88), logo: logoRef.current };
    };
    return () => {
      exportRef.current = null;
    };
  }, [exportRef]);

  const spots = [{ dx: 0, dy: 0 }, ...(mockup.clones ?? [])];
  const ratio = mockup.placement.w / mockup.placement.h;

  return (
    <div>
      {/* Səhnə */}
      <div className="rounded-[2.5rem] bg-surface p-4">
        <div
          ref={stageRef}
          className="relative mx-auto w-full max-w-xl select-none overflow-hidden rounded-[2rem] bg-white"
          style={{ aspectRatio: `${mockup.width} / ${mockup.height}`, maxHeight: "70vh" }}
        >
          <Image
            src={mockup.image}
            alt={mockup.name}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="pointer-events-none object-cover"
            priority
          />
          {shownLogo &&
            spots.map((s, i) => (
              <div
                key={i}
                onPointerDown={i === 0 ? onPointerDown : undefined}
                onPointerMove={i === 0 ? onPointerMove : undefined}
                onPointerUp={i === 0 ? onPointerUp : undefined}
                className={`absolute touch-none ${i === 0 ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
                style={{
                  left: `${(pos.cx + s.dx) * 100}%`,
                  top: `${(pos.cy + s.dy) * 100}%`,
                  width: `${mockup.placement.w * scale * 100}%`,
                  aspectRatio: `${ratio}`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  mixBlendMode: blendMode,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shownLogo}
                  alt="Loqo"
                  draggable={false}
                  className="pointer-events-none h-full w-full object-contain"
                />
                {i === 0 && (
                  <span className="pointer-events-none absolute -inset-1 rounded border border-dashed border-brand/60" />
                )}
              </div>
            ))}
          {mockup.overlay && (
            <Image src={mockup.overlay} alt="" fill sizes="55vw" className="pointer-events-none object-cover" />
          )}
          {!shownLogo && (
            <div className="absolute inset-x-4 bottom-4 rounded-full bg-foreground/90 px-4 py-2 text-center text-xs font-semibold text-white">
              Loqonu yüklə və məhsul üzərində gör
            </div>
          )}
        </div>

        {/* Mockup seçimi */}
        <div className="mt-4 flex justify-center gap-2">
          {mockups.map((m, i) => (
            <button
              key={m.id}
              onClick={() => selectMockup(i)}
              aria-label={m.name}
              className={`relative h-16 w-16 overflow-hidden rounded-2xl bg-white transition ${
                i === active ? "ring-2 ring-brand" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={m.image} alt={m.name} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* İdarə paneli */}
      <div className="mt-4 rounded-[2rem] bg-surface p-5">
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            {logoSrc ? "Loqonu dəyiş" : "Loqonu yüklə"}
          </button>
          <button
            onClick={() => {
              setLogoSrc(SAMPLE_LOGO);
              setWhite(false);
            }}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-foreground hover:text-white"
          >
            Nümunə loqo
          </button>
          {logoSrc && (
            <button
              onClick={download}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
            >
              Şəkli yüklə
            </button>
          )}
        </div>

        {logoSrc && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Ölçü
              <input
                type="range"
                min={0.3}
                max={2.2}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="mt-2 w-full accent-brand"
              />
            </label>
            <label className="text-sm font-semibold">
              Dönmə ({Math.round(rotation)}°)
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="mt-2 w-full accent-brand"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={white}
                onChange={(e) => setWhite(e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Loqonu ağ rəngə çevir
            </label>
            <button
              onClick={() => selectMockup(active)}
              className="w-fit text-left text-sm font-semibold text-neutral-500 underline hover:text-foreground"
            >
              Yeri sıfırla
            </button>
          </div>
        )}
        <p className="mt-4 text-xs text-neutral-500">
          Loqonu şəkil üzərində sürüşdürərək yerini dəyiş. Bu, təxmini göstəricidir, yekun çap dizayner təsdiqindən sonra hazırlanır.
        </p>
      </div>
    </div>
  );
}
