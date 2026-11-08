import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BRAND, SEO_DESCRIPTION, SITE_URL } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND} — Reklam işləri, çap və promo məhsullar Bakıda`, template: `%s — ${BRAND}` },
  description: SEO_DESCRIPTION,
  keywords: ["reklam işləri", "reklam Bakı", "banner çapı", "vinil çapı", "roll-up", "reklam lövhələri", "vizit kart çapı", "flayer çapı", "poliqrafiya", "promo məhsullar", "çap xidməti Bakı"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "az_AZ", siteName: BRAND, url: SITE_URL, title: `${BRAND} — Reklam işləri, çap və promo məhsullar`, description: SEO_DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t==="light")document.documentElement.dataset.theme="light"}catch(e){}` }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
