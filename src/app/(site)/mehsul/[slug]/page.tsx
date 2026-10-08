import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductBySlug,
  getCategories,
} from "@/lib/data";
import { ProductConfigurator } from "@/components/ProductConfigurator";

export async function generateStaticParams() {
  return (await getAllProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} — Poligraf` : "Məhsul",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = (await getCategories()).find((c) => c.id === product.categoryId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-neutral-500">
        <Link href="/kataloq" className="hover:text-brand">
          Kataloq
        </Link>
        {category && (
          <>
            {" / "}
            <Link href={`/kataloq/${category.slug}`} className="hover:text-brand">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductConfigurator
        product={product}
        header={
          <>
            {category && (
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">
                {category.name}
              </span>
            )}
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-3 text-neutral-600">{product.description}</p>
            )}
          </>
        }
      />
    </div>
  );
}
