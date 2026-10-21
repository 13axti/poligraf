import { Suspense } from "react";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Yalnız admin üçün yüklənən şriftlər (ictimai sayt bunları yükləmir)
const ui = Instrument_Sans({ variable: "--font-admin-ui", subsets: ["latin", "latin-ext"] });
const display = Bricolage_Grotesque({ variable: "--font-admin-display", subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-ui ${ui.variable} ${display.variable} min-h-screen`}>
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-neutral-500">Yüklənir…</div>}>
        {children}
      </Suspense>
    </div>
  );
}
