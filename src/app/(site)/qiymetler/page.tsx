import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/data";
import { startingPrice } from "@/components/ProductCard";

export const metadata = {
  title: "Qiymətlər",
  description: "Promo, poliqrafiya, reklam və kəsim məhsulları üçün başlanğıc qiymətlər.",
};

export default async function QiymetlerPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">Qiymətlər</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Başlanğıc qiymətlər</h1>
      <p className="mt-2 text-neutral-600">
        Sayı artdıqca ədəd qiyməti ucuzlaşır. Dəqiq məbləği məhsul səhifəsində sayı və ya ölçünü yazaraq dərhal görə bilərsiniz.
      </p>

      <div className="mt-8 space-y-8">
        {categories.map((c) => {
          const list = products.filter((p) => p.categoryId === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id}>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-neutral-500">{c.name}</h2>
              <ul className="divide-y divide-[var(--hair)] overflow-hidden rounded-3xl bg-surface">
                {list.map((p) => {
                  const price = startingPrice(p);
                  return (
                    <li key={p.id}>
                      <Link href={`/mehsul/${p.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[var(--tint)]">
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{p.name}</span>
                          {p.minOrderQty && <span className="text-xs text-neutral-500">min {p.minOrderQty} ədəd</span>}
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="text-[11px] text-neutral-500">başlanğıc </span>
                          <span className="font-extrabold text-foreground">{price.value}</span>{" "}
                          <span className="text-xs text-neutral-500">{price.unit}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
