import { getCategories, getAllProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CatalogHeader } from "@/components/CatalogHeader";

export const metadata = {
  title: "Kataloq",
};

export default async function KataloqPage() {
  const categories = await getCategories();
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <CatalogHeader>
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">Kataloq</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Bütün məhsullar
      </h1>
      <p className="mt-2 text-neutral-600">{products.length} məhsul · qiymət dərhal hesablanır</p>

      <div className="mt-6">
        <CategoryTabs categories={categories} />
      </div>
      </CatalogHeader>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
