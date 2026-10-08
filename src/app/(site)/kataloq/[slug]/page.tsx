import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CatalogHeader } from "@/components/CatalogHeader";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? `${category.name} — Poligraf` : "Kateqoriya" };
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
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <CatalogHeader>
      <nav className="text-sm text-neutral-500">
        <Link href="/kataloq" className="hover:text-brand">
          Kataloq
        </Link>{" "}
        / <span className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 text-neutral-600">{category.description}</p>
      )}

      <div className="mt-6">
        <CategoryTabs categories={categories} activeId={category.id} />
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
