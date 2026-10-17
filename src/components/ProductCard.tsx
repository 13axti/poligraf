import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { AZN } from "@/lib/pricing";

/** Kartda göstəriləcək "başlanğıc qiymət" */
function startingPrice(p: Product): { value: string; unit: string } {
  if (p.pricingModel === "per_unit" && p.priceTiers?.length) {
    const cheapest = Math.min(...p.priceTiers.map((t) => t.unitPrice));
    return { value: AZN(cheapest), unit: "/ ədəd" };
  }
  if (p.pricingModel === "per_sqm" && p.pricePerSqm) {
    return { value: AZN(p.pricePerSqm), unit: "/ m²" };
  }
  return { value: "Soruşun", unit: "" };
}

export function ProductCard({ product }: { product: Product }) {
  const price = startingPrice(product);
  const minQty = product.minOrderQty;

  return (
    <Link
      href={`/mehsul/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-surface p-2 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-white">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Populyar
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-white/95 px-3 py-2 text-center text-xs font-semibold text-brand opacity-0 shadow transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Loqonu yoxla →
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 font-semibold leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <p>
            <span className="text-[11px] text-neutral-500">başlanğıc</span>
            <span className="block text-lg font-extrabold text-foreground">
              {price.value}{" "}
              <span className="text-xs font-medium text-neutral-500">{price.unit}</span>
            </span>
          </p>
          {minQty && (
            <span className="rounded-full bg-white px-2 py-1 text-[11px] text-neutral-600">
              min {minQty} əd.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
