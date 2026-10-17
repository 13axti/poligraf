import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Domen alınanda .env.local / Vercel-də NEXT_PUBLIC_SITE_URL=https://lemurgroup.xx yazın
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${BRAND} — Promo və poliqrafiya məhsulları`, template: `%s — ${BRAND}` },
  description:
    "Qələm, fincan, vizitka, banner, vinil kəsim. Loqonu yüklə, nümunəni gör, sifariş ver.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
