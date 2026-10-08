import { Suspense } from "react";

export const metadata = { title: "Admin — Poligraf", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-neutral-500">Yüklənir…</div>}>
        {children}
      </Suspense>
    </div>
  );
}
