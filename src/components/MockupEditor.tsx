"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProductMockup } from "@/lib/types";
import { CropDialog, FULL_CROP, type Crop } from "./CropDialog";

export interface MockupExport {
  mockup: string; // JPEG dataURL (sifarişdə göstərilən nəticə)
  logos: string[]; // orijinal loqo faylları (dataURL), mətn qatları daxil deyil
  texts: string[]; // mockup üzərindəki yazılar (ad, nömrə və s.)
}

const MAX_LAYERS = 40; // praktiki olaraq limitsiz; yalnız səhnə donmasın deyə təhlükəsizlik həddi
const MAX_FILE = 3 * 1024 * 1024;

/** Mockup üzərindəki bir qat: loqo şəkli və ya yazı (yazı da şəkil kimi çəkilir, ona görə eyni alətlər işləyir) */
interface Layer {
  id: string;
  kind: "image" | "text";
  text?: string;
  font?: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  name: string;
  src: string; // orijinal şəkil (dataURL)
  nw: number; // orijinal ölçü
  nh: number;
  crop: Crop; // kəsmə (şəklin ölçüsünə nisbətən)
  cx: number; // mərkəz: səhnənin eninə/hündürlüyünə nisbətən
  cy: number;
  w: number; // en: səhnənin eninə nisbətən
  rot: number; // dərəcə
  flip: boolean;
  opacity: number;
  white: boolean; // tünd məhsul üçün ağ rəng
  whiteTouched: boolean;
}

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
      <rect x="4" y="20" width="80" height="80" rx="20" fill="#ff7a1a"/>
      <text x="44" y="78" font-family="Arial" font-weight="900" font-size="52" fill="#fff" text-anchor="middle">L</text>
      <text x="100" y="80" font-family="Arial" font-weight="900" font-size="60" fill="#ff4a2b">LOGO</text>
    </svg>`;
// base64 formatında: server yalnız belə data URL-ləri qəbul edir
const SAMPLE_LOGO = "data:image/svg+xml;base64," + btoa(SAMPLE_SVG);

const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const aspectOf = (l: Layer) => (l.nw * l.crop.w) / (l.nh * l.crop.h);
/** Qatın standart yeri: loqolar öz aralarında, yazılar öz aralarında sayılır */
function spot(m: ProductMockup, ls: Layer[], l: Layer) {
  const same = ls.filter((x) => x.kind === l.kind);
  const i = Math.max(0, same.findIndex((x) => x.id === l.id));
  return l.kind === "text" ? placeText(m, i) : place(m, i, aspectOf(l));
}

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

const FONTS: { id: string; label: string; css: string }[] = [
  { id: "sans", label: "Sadə", css: "Arial, Helvetica, sans-serif" },
  { id: "serif", label: "Klassik", css: "Georgia, 'Times New Roman', serif" },
  { id: "display", label: "Qalın", css: "Impact, 'Arial Black', sans-serif" },
  { id: "mono", label: "Maşın", css: "'Courier New', monospace" },
];
const COLORS = ["#111111", "#ffffff", "#ff5a1f", "#e11d48", "#2563eb", "#16a34a", "#f5b301"];

/** Yazını şəffaf fonlu şəkil kimi çəkir */
function renderText(o: { text: string; font: string; bold: boolean; italic: boolean; color: string }) {
  const css = FONTS.find((f) => f.id === o.font)?.css ?? FONTS[0].css;
  const size = 140;
  const lines = (o.text || " ").split("\n").slice(0, 6);
  const font = `${o.italic ? "italic " : ""}${o.bold ? "bold " : ""}${size}px ${css}`;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = font;
  const wmax = Math.max(40, ...lines.map((t) => ctx.measureText(t || " ").width));
  const lh = size * 1.2;
  const pad = 16;
  c.width = Math.ceil(wmax + pad * 2);
  c.height = Math.ceil(lh * lines.length + pad * 2);
  ctx.font = font;
  ctx.fillStyle = o.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((t, i) => ctx.fillText(t, c.width / 2, pad + lh * i + lh / 2));
  return { src: c.toDataURL("image/png"), nw: c.width, nh: c.height };
}

/** Böyük loqo fayllarını göndərməzdən əvvəl kiçildir (sorğu ölçüsü limitə sığsın) */
async function shrink(src: string): Promise<string> {
  if (src.length < 700_000 || src.startsWith("data:image/svg")) return src;
  const img = await loadImage(src);
  const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/webp", 0.9);
}

/** Qat mockup-a "çap olunur" (multiply) yoxsa olduğu kimi qoyulur (ağ loqo və yazı) */
const blendOf = (l: Layer) => (l.kind === "text" || l.white ? "normal" : "multiply");

/** Yazı qatının başlanğıc yeri: standart yerin altında, hər yeni yazı bir az aşağıda */
function placeText(m: ProductMockup, n: number) {
  const p = m.placement;
  return { cx: p.cx, cy: clamp(p.cy + p.h * 0.45 + n * 0.06, 0.05, 0.95), w: clamp(p.w * 0.85, 0.12, 0.8), rot: p.rotation };
}

/** Mockup-ın standart yerinə görə qatın başlanğıc yeri */
function place(m: ProductMockup, index: number, aspect: number) {
  const p = m.placement;
  const w = Math.min(p.w, p.h * aspect);
  if (index === 1) {
    // 2-ci loqo: birincinin altında, bir az kiçik (istifadəçi sürüşdürüb dəyişəcək)
    return { cx: p.cx, cy: clamp(p.cy + p.h * 0.75, 0.05, 0.95), w: w * 0.85, rot: p.rotation };
  }
  return { cx: p.cx, cy: p.cy, w, rot: p.rotation };
}

type Gesture =
  | { type: "move"; id: string; px: number; py: number; cx: number; cy: number }
  | { type: "scale"; id: string; cx: number; cy: number; d0: number; w0: number }
  | { type: "rotate"; id: string; cx: number; cy: number };

/** Kəsmə tətbiq olunmuş şəkli qatın qutusuna yerləşdirir */
function LayerImage({ l, src }: { l: Layer; src: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ transform: l.flip ? "scaleX(-1)" : undefined }}>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          maxWidth: "none",
          width: `${100 / l.crop.w}%`,
          left: `${(-l.crop.x / l.crop.w) * 100}%`,
          top: `${(-l.crop.y / l.crop.h) * 100}%`,
        }}
      />
    </div>
  );
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

  const [layers, setLayers] = useState<Layer[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [whites, setWhites] = useState<Record<string, string>>({});
  const [cropId, setCropId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const whitesRef = useRef(whites);
  whitesRef.current = whites;
  const gesture = useRef<Gesture | null>(null);
  const history = useRef<Layer[][]>([]);
  const future = useRef<Layer[][]>([]);
  const lastNudge = useRef(0);
  const whiteJobs = useRef(new Set<string>());
  const [, bump] = useState(0);

  const selected = layers.find((l) => l.id === sel) ?? null;

  /* ---------- tarixçə (geri al / irəli) ---------- */
  function snapshot() {
    history.current.push(layersRef.current);
    if (history.current.length > 60) history.current.shift();
    future.current = [];
    bump((n) => n + 1);
  }
  function undo() {
    const prev = history.current.pop();
    if (!prev) return;
    future.current.push(layersRef.current);
    setLayers(prev);
    bump((n) => n + 1);
  }
  function redo() {
    const next = future.current.pop();
    if (!next) return;
    history.current.push(layersRef.current);
    setLayers(next);
    bump((n) => n + 1);
  }
  const patch = (id: string, p: Partial<Layer>) => setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const commit = (id: string, p: Partial<Layer>) => {
    snapshot();
    patch(id, p);
  };

  /* ---------- ağ variant hazırla ---------- */
  useEffect(() => {
    layers.forEach((l) => {
      if (l.kind === "image" && l.white && !whites[l.id] && !whiteJobs.current.has(l.id)) {
        whiteJobs.current.add(l.id);
        makeWhite(l.src).then((u) => setWhites((w) => ({ ...w, [l.id]: u })));
      }
    });
  }, [layers, whites]);

  /* ---------- qat əlavə et ---------- */
  async function addLayer(src: string, name: string) {
    if (layersRef.current.length >= MAX_LAYERS) return;
    const img = await loadImage(src);
    const nw = img.naturalWidth || 400;
    const nh = img.naturalHeight || 120;
    const idx = layersRef.current.filter((x) => x.kind === "image").length;
    const l: Layer = {
      id: uid(),
      kind: "image",
      name,
      src,
      nw,
      nh,
      crop: FULL_CROP,
      ...place(mockup, idx, nw / nh),
      flip: false,
      opacity: 1,
      white: !!mockup.darkProduct,
      whiteTouched: false,
    };
    snapshot();
    setLayers((ls) => [...ls, l]);
    setSel(l.id);
  }

  function addText(text: string) {
    if (layersRef.current.length >= MAX_LAYERS) return;
    const dark = !!mockup.darkProduct;
    const base = { text, font: "sans", bold: true, italic: false, color: dark ? "#ffffff" : "#111111" };
    const r = renderText(base);
    const n = layersRef.current.filter((x) => x.kind === "text").length;
    const l: Layer = {
      id: uid(),
      kind: "text",
      name: text.split("\n")[0].slice(0, 18) || "Mətn",
      ...base,
      src: r.src,
      nw: r.nw,
      nh: r.nh,
      crop: FULL_CROP,
      ...placeText(mockup, n),
      flip: false,
      opacity: 1,
      white: false,
      whiteTouched: true,
    };
    snapshot();
    setLayers((ls) => [...ls, l]);
    setSel(l.id);
  }

  /** Yazını və ya üslubunu dəyişir: şəkil yenidən çəkilir, hərf ölçüsü eyni qalır */
  function editText(l: Layer, p: Partial<Pick<Layer, "text" | "font" | "bold" | "italic" | "color">>) {
    const next = { text: l.text ?? "", font: l.font ?? "sans", bold: !!l.bold, italic: !!l.italic, color: l.color ?? "#111111", ...p };
    const r = renderText(next);
    const k = r.nw / r.nh / (l.nw / l.nh);
    patch(l.id, { ...p, src: r.src, nw: r.nw, nh: r.nh, w: clamp(l.w * k, 0.03, 1.6), name: next.text.split("\n")[0].slice(0, 18) || "Mətn" });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError("");
    if (!f.type.startsWith("image/")) return setError("Yalnız şəkil faylı seçin (PNG, JPG, SVG)");
    if (f.size > MAX_FILE) return setError("Fayl 3 MB-dan böyükdür. Daha kiçik loqo seçin.");
    const reader = new FileReader();
    reader.onload = () => addLayer(reader.result as string, f.name.replace(/\.[^.]+$/, "").slice(0, 24) || "Loqo");
    reader.readAsDataURL(f);
  }

  function removeLayer(id: string) {
    snapshot();
    setLayers((ls) => ls.filter((l) => l.id !== id));
    setSel((s) => (s === id ? null : s));
  }

  function resetAll() {
    if (!layers.length) return;
    snapshot();
    setLayers((ls) =>
      ls.map((l) => ({
        ...l,
        crop: FULL_CROP,
        flip: false,
        opacity: 1,
        white: l.kind === "text" ? false : !!mockup.darkProduct,
        whiteTouched: l.kind === "text",
        ...spot(mockup, ls, l),
      })),
    );
  }

  function selectMockup(i: number) {
    const m = mockups[i];
    setActive(i);
    // Yeni mockup-da qatlar onun standart yerinə qoyulur; kəsmə, güzgü və şəffaflıq qalır
    setLayers((ls) => ls.map((l) => ({ ...l, ...spot(m, ls, l), white: l.kind === "text" || l.whiteTouched ? l.white : !!m.darkProduct })));
  }

  /* ---------- sürüşdürmə, ölçü, dönmə ---------- */
  const rect = () => stageRef.current!.getBoundingClientRect();

  function startMove(e: React.PointerEvent, l: Layer) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSel(l.id);
    snapshot();
    gesture.current = { type: "move", id: l.id, px: e.clientX, py: e.clientY, cx: l.cx, cy: l.cy };
  }
  function startScale(e: React.PointerEvent, l: Layer) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    snapshot();
    const r = rect();
    const cx = r.left + l.cx * r.width;
    const cy = r.top + l.cy * r.height;
    gesture.current = { type: "scale", id: l.id, cx, cy, d0: Math.max(8, Math.hypot(e.clientX - cx, e.clientY - cy)), w0: l.w };
  }
  function startRotate(e: React.PointerEvent, l: Layer) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    snapshot();
    const r = rect();
    gesture.current = { type: "rotate", id: l.id, cx: r.left + l.cx * r.width, cy: r.top + l.cy * r.height };
  }
  function onMove(e: React.PointerEvent) {
    const g = gesture.current;
    if (!g) return;
    if (g.type === "move") {
      const r = rect();
      patch(g.id, {
        cx: clamp(g.cx + (e.clientX - g.px) / r.width, 0, 1),
        cy: clamp(g.cy + (e.clientY - g.py) / r.height, 0, 1),
      });
    } else if (g.type === "scale") {
      const d = Math.hypot(e.clientX - g.cx, e.clientY - g.cy);
      patch(g.id, { w: clamp((g.w0 * d) / g.d0, 0.03, 1.6) });
    } else {
      let a = (Math.atan2(e.clientY - g.cy, e.clientX - g.cx) * 180) / Math.PI + 90;
      if (a > 180) a -= 360;
      for (const s of [0, 90, -90, 180, -180, 45, -45, 135, -135]) if (Math.abs(a - s) < 3) a = s;
      patch(g.id, { rot: Math.round(a * 10) / 10 });
    }
  }
  const onUp = () => {
    gesture.current = null;
  };

  /* ---------- klaviatura ---------- */
  function onKeyDown(e: React.KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      return e.shiftKey ? redo() : undo();
    }
    if (!selected) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      return removeLayer(selected.id);
    }
    const step = e.shiftKey ? 0.02 : 0.004;
    const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (d[e.key]) {
      e.preventDefault();
      if (Date.now() - lastNudge.current > 600) snapshot();
      lastNudge.current = Date.now();
      patch(selected.id, { cx: clamp(selected.cx + d[e.key][0], 0, 1), cy: clamp(selected.cy + d[e.key][1], 0, 1) });
    }
  }

  /* ---------- nəticəni çək ---------- */
  async function render(maxW?: number): Promise<HTMLCanvasElement | null> {
    const ls = layersRef.current;
    if (!ls.length) return null;
    const [base, overlay] = await Promise.all([loadImage(mockup.image), mockup.overlay ? loadImage(mockup.overlay) : Promise.resolve(null)]);
    const k = maxW ? Math.min(1, maxW / base.naturalWidth) : 1;
    const W = Math.round(base.naturalWidth * k);
    const H = Math.round(base.naturalHeight * k);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(base, 0, 0, W, H);

    const spots = [{ dx: 0, dy: 0 }, ...(mockup.clones ?? [])];
    for (const l of ls) {
      const img = await loadImage(l.white && whitesRef.current[l.id] ? whitesRef.current[l.id] : l.src);
      const iw = img.naturalWidth || l.nw;
      const ih = img.naturalHeight || l.nh;
      const dw = l.w * W;
      const dh = dw / aspectOf(l);
      for (const s of spots) {
        ctx.save();
        ctx.globalCompositeOperation = blendOf(l) === "normal" ? "source-over" : "multiply";
        ctx.globalAlpha = l.opacity;
        ctx.translate((l.cx + s.dx) * W, (l.cy + s.dy) * H);
        ctx.rotate((l.rot * Math.PI) / 180);
        ctx.scale(l.flip ? -1 : 1, 1);
        ctx.drawImage(img, l.crop.x * iw, l.crop.y * ih, l.crop.w * iw, l.crop.h * ih, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }
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

  const renderRef = useRef(render);
  renderRef.current = render;
  useEffect(() => {
    if (!exportRef) return;
    exportRef.current = async () => {
      const ls = layersRef.current;
      const c = await renderRef.current(1000);
      if (!c || !ls.length) return null;
      const logos = await Promise.all(ls.filter((l) => l.kind === "image").map((l) => shrink(l.src)));
      const texts = ls.filter((l) => l.kind === "text").map((l) => (l.text ?? "").trim()).filter(Boolean);
      return { mockup: c.toDataURL("image/jpeg", 0.88), logos, texts };
    };
    return () => {
      exportRef.current = null;
    };
  }, [exportRef]);

  const spots = [{ dx: 0, dy: 0 }, ...(mockup.clones ?? [])];
  const cropLayer = layers.find((l) => l.id === cropId) ?? null;
  const btn = "rounded-full bg-card px-4 py-2 text-sm font-semibold transition hover:bg-foreground hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-foreground";

  return (
    <div>
      {/* ---------- Səhnə ---------- */}
      <div className="rounded-[2.5rem] bg-surface p-4">
        <div
          ref={stageRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={() => setSel(null)}
          className="relative mx-auto w-full max-w-xl touch-none select-none overflow-hidden rounded-[2rem] bg-card outline-none focus-visible:ring-2 focus-visible:ring-brand"
          style={{ aspectRatio: `${mockup.width} / ${mockup.height}`, maxHeight: "70vh" }}
        >
          <Image src={mockup.image} alt={mockup.name} fill sizes="(max-width: 1024px) 100vw, 55vw" className="pointer-events-none object-cover" priority />

          {layers.map((l) => {
            const geo = (dx: number, dy: number): React.CSSProperties => ({
              left: `${(l.cx + dx) * 100}%`,
              top: `${(l.cy + dy) * 100}%`,
              width: `${l.w * 100}%`,
              aspectRatio: `${aspectOf(l)}`,
              transform: `translate(-50%, -50%) rotate(${l.rot}deg)`,
            });
            const src = l.white && whites[l.id] ? whites[l.id] : l.src;
            return spots.map((s, si) => (
              <div key={`${l.id}-${si}`}>
                {/* görünən loqo (blend rejimi ilə mockup-a "çap olunur") */}
                <div
                  className="pointer-events-none absolute"
                  style={{ ...geo(s.dx, s.dy), opacity: l.opacity, mixBlendMode: blendOf(l) }}
                >
                  <LayerImage l={l} src={src} />
                </div>
                {/* idarə qatı: sürüşdürmə + tutacaqlar (yalnız əsas nüsxədə) */}
                {si === 0 && (
                  <div
                    onPointerDown={(e) => startMove(e, l)}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    className={`absolute cursor-move ${sel === l.id ? "outline outline-2 outline-brand" : "hover:outline hover:outline-1 hover:outline-brand/50"}`}
                    style={geo(0, 0)}
                  >
                    {sel === l.id && (
                      <>
                        {(["-left-2 -top-2", "-right-2 -top-2", "-left-2 -bottom-2", "-right-2 -bottom-2"] as const).map((pos) => (
                          <span
                            key={pos}
                            onPointerDown={(e) => startScale(e, l)}
                            onPointerMove={onMove}
                            onPointerUp={onUp}
                            className={`absolute h-4 w-4 cursor-nwse-resize rounded-full border-2 border-brand bg-card shadow ${pos}`}
                          />
                        ))}
                        <span className="pointer-events-none absolute -top-7 left-1/2 h-7 w-px -translate-x-1/2 bg-brand" />
                        <span
                          onPointerDown={(e) => startRotate(e, l)}
                          onPointerMove={onMove}
                          onPointerUp={onUp}
                          title="Döndər"
                          className="absolute -top-11 left-1/2 grid h-6 w-6 -translate-x-1/2 cursor-grab place-items-center rounded-full border-2 border-brand bg-card text-[11px] font-black text-brand shadow active:cursor-grabbing"
                        >
                          ↻
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ));
          })}

          {mockup.overlay && <Image src={mockup.overlay} alt="" fill sizes="55vw" className="pointer-events-none object-cover" />}

          {!layers.length && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => fileRef.current?.click()}
              className="absolute inset-x-4 bottom-4 rounded-full bg-black/75 px-4 py-3 text-center text-sm font-semibold text-brand ring-1 ring-brand/40 backdrop-blur transition hover:bg-brand hover:text-black"
            >
              + Loqonu yüklə və məhsul üzərində gör
            </button>
          )}
        </div>

        {/* Mockup seçimi */}
        {mockups.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {mockups.map((m, i) => (
              <button
                key={m.id}
                onClick={() => selectMockup(i)}
                aria-label={m.name}
                className={`relative h-16 w-16 overflow-hidden rounded-2xl bg-card transition ${i === active ? "ring-2 ring-brand" : "opacity-70 hover:opacity-100"}`}
              >
                <Image src={m.image} alt={m.name} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Redaktor paneli ---------- */}
      <div className="mt-4 space-y-4 rounded-[2rem] bg-surface p-5">
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

        {/* Qatlar */}
        <div className="flex flex-wrap items-center gap-2">
          {layers.map((l) => (
            <div key={l.id} className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold transition ${sel === l.id ? "bg-foreground text-white" : "bg-card"}`}>
              <button onClick={() => setSel(l.id)} className="flex items-center gap-2">
                <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-surface ring-1 ring-black/10">
                  <img src={l.src} alt="" className="h-full w-full object-contain p-0.5" />
                </span>
                {l.kind === "text" ? `Yazı: ${l.name}` : `Loqo ${layers.filter((x) => x.kind === "image").indexOf(l) + 1}`}
              </button>
              <button onClick={() => removeLayer(l.id)} aria-label="Sil" className={`text-base leading-none ${sel === l.id ? "text-white/60 hover:text-white" : "text-neutral-400 hover:text-accent"}`}>
                ×
              </button>
            </div>
          ))}
          {layers.length < MAX_LAYERS && (
            <>
              <button onClick={() => fileRef.current?.click()} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark">
                {layers.some((l) => l.kind === "image") ? "+ Loqo əlavə et" : "Loqonu yüklə"}
              </button>
              <button onClick={() => addText("Ad Soyad")} className={btn}>+ Ad soyad</button>
              <button onClick={() => addText("+994 50 000 00 00")} className={btn}>+ Nömrə</button>
              <button onClick={() => addText("Mətniniz")} className={btn}>+ Mətn</button>
              {!layers.length && (
                <button onClick={() => addLayer(SAMPLE_LOGO, "Nümunə")} className={btn}>
                  Nümunə loqo
                </button>
              )}
            </>
          )}
        </div>
        {error && <p className="text-sm font-semibold text-accent">{error}</p>}

        {/* Seçilmiş qat üçün alətlər */}
        {selected ? (
          <div className="space-y-4 rounded-3xl bg-card p-4">
            <div className="flex flex-wrap gap-2">
              {selected.kind === "image" && <button onClick={() => setCropId(selected.id)} className={btn}>✂ Kəs</button>}
              <button onClick={() => commit(selected.id, { flip: !selected.flip })} className={btn}>⇋ Güzgü</button>
              {selected.kind === "image" && (
                <button
                  onClick={() => commit(selected.id, { white: !selected.white, whiteTouched: true })}
                  className={`${btn} ${selected.white ? "!bg-foreground !text-white" : ""}`}
                >
                  ◐ Ağ rəng
                </button>
              )}
              <button
                onClick={() => commit(selected.id, { ...spot(mockup, layers, selected) })}
                className={btn}
              >
                ⌖ Yerinə qoy
              </button>
              <button onClick={() => removeLayer(selected.id)} className={`${btn} hover:!bg-accent`}>🗑 Sil</button>
            </div>
            {selected.kind === "text" && (
              <div className="space-y-3">
                <textarea
                  value={selected.text}
                  rows={2}
                  maxLength={120}
                  onFocus={snapshot}
                  onChange={(e) => editText(selected, { text: e.target.value })}
                  placeholder="Yazını bura yazın (yeni sətir üçün Enter)"
                  className="w-full resize-none rounded-2xl border-2 border-transparent bg-surface px-4 py-3 font-semibold outline-none focus:border-brand"
                />
                <div className="flex flex-wrap items-center gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { snapshot(); editText(selected, { font: f.id }); }}
                      style={{ fontFamily: f.css }}
                      className={`${btn} ${selected.font === f.id ? "!bg-foreground !text-white" : ""}`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button onClick={() => { snapshot(); editText(selected, { bold: !selected.bold }); }} className={`${btn} font-black ${selected.bold ? "!bg-foreground !text-white" : ""}`}>B</button>
                  <button onClick={() => { snapshot(); editText(selected, { italic: !selected.italic }); }} className={`${btn} italic ${selected.italic ? "!bg-foreground !text-white" : ""}`}>I</button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      aria-label={`Rəng ${c}`}
                      onClick={() => { snapshot(); editText(selected, { color: c }); }}
                      className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-card ${selected.color === c ? "ring-2 ring-brand" : "ring-1 ring-black/15"}`}
                      style={{ background: c }}
                    />
                  ))}
                  <label className="ml-1 flex items-center gap-2 text-xs font-semibold text-neutral-500">
                    Başqa rəng
                    <input type="color" value={selected.color ?? "#111111"} onChange={(e) => editText(selected, { color: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                  </label>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Ölçü
                <input type="range" min={0.03} max={1.2} step={0.005} value={selected.w} onPointerDown={snapshot} onChange={(e) => patch(selected.id, { w: Number(e.target.value) })} className="mt-2 w-full accent-brand" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Dönmə ({Math.round(selected.rot)}°)
                <input type="range" min={-180} max={180} step={1} value={selected.rot} onPointerDown={snapshot} onChange={(e) => patch(selected.id, { rot: Number(e.target.value) })} className="mt-2 w-full accent-brand" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Şəffaflıq ({Math.round(selected.opacity * 100)}%)
                <input type="range" min={0.2} max={1} step={0.01} value={selected.opacity} onPointerDown={snapshot} onChange={(e) => patch(selected.id, { opacity: Number(e.target.value) })} className="mt-2 w-full accent-brand" />
              </label>
            </div>
          </div>
        ) : (
          layers.length > 0 && <p className="text-sm text-neutral-500">Redaktə etmək üçün loqonun və ya yazının üzərinə klikləyin.</p>
        )}

        {/* Ümumi */}
        {layers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
            <button onClick={undo} disabled={!history.current.length} className={btn}>↶ Geri al</button>
            <button onClick={redo} disabled={!future.current.length} className={btn}>↷ İrəli</button>
            <button onClick={resetAll} className={btn}>Sıfırla</button>
            <button onClick={download} className="ml-auto rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand">
              Şəkli yüklə
            </button>
          </div>
        )}

        <p className="text-xs leading-relaxed text-neutral-500">
          Loqo və yazıları istədiyiniz qədər əlavə edib sürüşdürmək üçün dartın, künc dairələri ölçünü, yuxarıdakı ↻ dönməni dəyişir. Ox düymələri dəqiq yerləşdirmə, Cmd/Ctrl+Z geri alma üçündür. Bu, təxmini göstəricidir, yekun çap dizayner təsdiqindən sonra hazırlanır.
        </p>
      </div>

      {cropLayer && (
        <CropDialog
          src={cropLayer.src}
          nw={cropLayer.nw}
          nh={cropLayer.nh}
          initial={cropLayer.crop}
          onClose={() => setCropId(null)}
          onApply={(c) => {
            // Görünən miqyas dəyişməsin: yeni en = köhnə en × (yeni kəsmə eni / köhnə kəsmə eni)
            commit(cropLayer.id, { crop: c, w: clamp((cropLayer.w * c.w) / cropLayer.crop.w, 0.03, 1.6) });
            setCropId(null);
          }}
        />
      )}
    </div>
  );
}
