import type { Category, Product } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapCategory(r: any): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? undefined,
    image: r.image ?? undefined,
    sortOrder: r.sort_order ?? 0,
  };
}

export function mapProduct(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    categoryId: r.category_id,
    name: r.name,
    description: r.description ?? undefined,
    image: r.image,
    pricingModel: r.pricing_model,
    minOrderQty: r.min_order_qty ?? undefined,
    priceTiers: r.price_tiers?.length ? r.price_tiers : undefined,
    pricePerSqm: r.price_per_sqm != null ? Number(r.price_per_sqm) : undefined,
    minWidthCm: r.min_width_cm != null ? Number(r.min_width_cm) : undefined,
    minHeightCm: r.min_height_cm != null ? Number(r.min_height_cm) : undefined,
    variants: r.variants?.length ? r.variants : undefined,
    mockups: r.mockups?.length ? r.mockups : undefined,
    printAreaPercent: r.print_area ?? undefined,
    featured: r.featured,
    views: r.views,
  };
}

/** Product → DB sətri (admin formu yazanda) */
export function productToRow(p: Partial<Product> & { active?: boolean; sortOrder?: number }) {
  return {
    slug: p.slug,
    category_id: p.categoryId || null,
    name: p.name,
    description: p.description ?? null,
    image: p.image ?? "",
    pricing_model: p.pricingModel,
    min_order_qty: p.minOrderQty ?? null,
    price_tiers: p.priceTiers ?? [],
    price_per_sqm: p.pricePerSqm ?? null,
    min_width_cm: p.minWidthCm ?? null,
    min_height_cm: p.minHeightCm ?? null,
    variants: p.variants ?? [],
    mockups: p.mockups ?? [],
    featured: p.featured ?? false,
    active: p.active ?? true,
    sort_order: p.sortOrder ?? 0,
  };
}
