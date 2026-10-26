import Link from "next/link";
import { getAllProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { CatalogShell, EmptyCategory } from "@/components/CatalogShell";

export const metadata = {
  title: "Kataloq",
};

export default async function KataloqPage() {
  const products = await getAllProducts();

  return (
    <CatalogShell>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kataloq</h1>
      <p className="mt-2 text-neutral-600">
        {products.length ? `${products.length} məhsul. Qiymət sayı yazan kimi hesablanır.` : "Məhsullar tezliklə əlavə olunur."}
      </p>

      {products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyCategory />
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-surface p-6 sm:p-8">
          <div>
            <p className="text-xl font-bold">Axtardığınızı tapmadınız?</p>
            <p className="mt-1 text-neutral-600">Nə lazım olduğunu yazın, 1 saat ərzində cavab verək.</p>
          </div>
          <Link href="/sifaris#xususi" className="rounded-full bg-foreground px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">
            Xüsusi istək göndər
          </Link>
        </div>
      )}
    </CatalogShell>
  );
}
