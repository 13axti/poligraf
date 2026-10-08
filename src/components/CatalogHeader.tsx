import { BackgroundVideo } from "./BackgroundVideo";

/** Kataloq başlığı: boz yumru kart + yumşaq arxa video */
export function CatalogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] bg-surface px-5 py-8 sm:rounded-[2.5rem] sm:px-10 sm:py-12">
      <BackgroundVideo src="/videos/kataloq.mp4" webm="/videos/kataloq.webm" />
      {/* Oxunaqlıq üçün solda daha açıq qradiyent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}
