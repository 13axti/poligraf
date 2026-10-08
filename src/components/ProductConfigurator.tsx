"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { MockupEditor, type MockupExport } from "./MockupEditor";
import { PriceCalculator, type CalcSelection } from "./PriceCalculator";
import { OrderDialog } from "./OrderDialog";

/** Məhsul səhifəsinin interaktiv hissəsi: mockup + kalkulyator + sifariş */
export function ProductConfigurator({
  product,
  header,
}: {
  product: Product;
  header: React.ReactNode;
}) {
  const exportRef = useRef<(() => Promise<MockupExport | null>) | null>(null);
  const [selection, setSelection] = useState<CalcSelection | null>(null);
  const [mockup, setMockup] = useState<MockupExport | null>(null);

  async function openOrder(sel: CalcSelection) {
    setMockup((await exportRef.current?.()) ?? null);
    setSelection(sel);
  }

  return (
    <>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {product.mockups?.length ? (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <MockupEditor mockups={product.mockups} productName={product.name} exportRef={exportRef} />
          </div>
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-surface p-4 lg:sticky lg:top-24 lg:self-start">
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" priority />
            </div>
          </div>
        )}

        <div>
          {header}
          <div className="mt-8">
            <PriceCalculator product={product} onOrder={openOrder} />
          </div>
          <ul className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-semibold">
            {["Dərhal qiymət", "Canlı nümunə", "Sürətli hazırlıq"].map((t) => (
              <li key={t} className="rounded-2xl bg-surface px-2 py-3">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {selection && (
        <OrderDialog product={product} selection={selection} mockup={mockup} onClose={() => setSelection(null)} />
      )}
    </>
  );
}
