import Link from "next/link";

/**
 * Yalnız development-də (npm run dev) görünən qısa yol düyməsi.
 * Canlı saytda (production) heç nə göstərmir.
 */
export function DevPreviewLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <Link
      href={href}
      className={`fixed z-50 rounded-full bg-[#ff7a1a] px-5 py-3 text-sm font-bold text-black shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-[#ff9a4a] ${className}`}
    >
      {children}
    </Link>
  );
}
