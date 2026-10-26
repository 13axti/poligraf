import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { CatalogShell, EmptyCategory } from "@/components/CatalogShell";

export async function generateStaticParams() {
  const slugs = (await getCategories()).map((c) => ({ slug: c.slug }));
  return slugs.length ? slugs : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? category.name : "Kateqoriya" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <CatalogShell active={category.slug}>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
      <p className="mt-2 text-neutral-600">
        {category.description || (products.length ? `${products.length} məhsul. Qiymət sayı yazan kimi hesablanır.` : "")}
      </p>

      {products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyCategory name={category.name} />
        </div>
      )}
    </CatalogShell>
  );
}
