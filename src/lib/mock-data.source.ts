import type { Category, Product } from "./types";

// MOCK DATA — Supabase hazır olana qədər müvəqqəti.
// Baza qoşulanda bu fayl silinəcək, data Supabase-dən gələcək (eyni tiplərlə).
// Şəkillər placeholder-dir; 2-ci mərhələdə free mockup PNG-lərlə əvəzlənəcək.

const img = (seed: string, w = 600, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const categories: Category[] = [
  {
    id: "c-promo",
    slug: "promo",
    name: "Promo məhsullar",
    description: "Qələm, fincan, çanta, bloknot — loqo ilə",
    image: "/categories/promo.jpg",
    sortOrder: 1,
  },
  {
    id: "c-print",
    slug: "poliqrafiya",
    name: "Poliqrafiya",
    description: "Vizitka, buklet, flayer, kataloq",
    image: img("print"),
    sortOrder: 2,
  },
  {
    id: "c-banner",
    slug: "reklam",
    name: "Reklam & Banner",
    description: "Banner, vinil, roll-up, lövhə",
    image: img("banner"),
    sortOrder: 3,
  },
  {
    id: "c-cut",
    slug: "kesim",
    name: "Kəsim & Oracal",
    description: "Vinil kəsim, stiker, yapışqan yazı",
    image: img("cut"),
    sortOrder: 4,
  },
];

export const products: Product[] = [
  // ---- PROMO (per_unit) ----
  {
    id: "p-pen",
    slug: "plastik-qelem",
    categoryId: "c-promo",
    name: "Plastik qələm (loqo ilə)",
    description: "Reklam qələmi, 1 rəngli loqo çapı. Müxtəlif rənglərdə.",
    image: "/products/plastik-qelem.jpg",
    mockups: [
      {
        id: "m-ag-2",
        name: "Ağ qələm",
        image: "/mockups/qelem-ag-2.jpg",
        width: 678,
        height: 452,
        placement: { cx: 0.63, cy: 0.41, w: 0.2, h: 0.045, rotation: 0 },
        clones: [{ dx: 0, dy: 0.177 }],
      },
      {
        id: "m-ag-1",
        name: "Ağ qələm (bucaq)",
        image: "/mockups/qelem-ag-1.jpg",
        width: 740,
        height: 524,
        placement: { cx: 0.55, cy: 0.43, w: 0.2, h: 0.05, rotation: -26 },
      },
      {
        id: "m-qara-1",
        name: "Qara qələm",
        image: "/mockups/qelem-qara-1.jpg",
        width: 409,
        height: 740,
        placement: { cx: 0.49, cy: 0.57, w: 0.24, h: 0.05, rotation: 90 },
        darkProduct: true,
      },
      {
        id: "m-qara-2",
        name: "Qara qələm (3 görünüş)",
        image: "/mockups/qelem-qara-2.jpg",
        width: 408,
        height: 612,
        placement: { cx: 0.5, cy: 0.66, w: 0.22, h: 0.04, rotation: 90 },
        darkProduct: true,
      },
    ],
    pricingModel: "per_unit",
    minOrderQty: 50,
    priceTiers: [
      { minQty: 50, unitPrice: 0.9 },
      { minQty: 200, unitPrice: 0.7 },
      { minQty: 500, unitPrice: 0.55 },
      { minQty: 1000, unitPrice: 0.45 },
    ],
    variants: [
      { id: "v-blue", name: "Mavi" },
      { id: "v-red", name: "Qırmızı" },
      { id: "v-black", name: "Qara" },
    ],
    printAreaPercent: { x: 0.35, y: 0.45, width: 0.3, height: 0.08 },
    featured: true,
    views: 1240,
  },
  {
    id: "p-mug",
    slug: "fincan",
    categoryId: "c-promo",
    name: "Keramik fincan (loqo ilə)",
    description: "330ml ağ keramik fincan, tam rəngli sublimasiya çapı.",
    image: "/products/fincan.jpg",
    pricingModel: "per_unit",
    minOrderQty: 10,
    priceTiers: [
      { minQty: 10, unitPrice: 6.5 },
      { minQty: 50, unitPrice: 5.5 },
      { minQty: 100, unitPrice: 4.8 },
    ],
    printAreaPercent: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
    featured: true,
    views: 980,
  },
  {
    id: "p-bag",
    slug: "parca-canta",
    categoryId: "c-promo",
    name: "Parça çanta (eko)",
    description: "Pambıq eko çanta, bir tərəfli loqo çapı.",
    image: img("bag"),
    pricingModel: "per_unit",
    minOrderQty: 25,
    priceTiers: [
      { minQty: 25, unitPrice: 3.2 },
      { minQty: 100, unitPrice: 2.6 },
      { minQty: 300, unitPrice: 2.1 },
    ],
    printAreaPercent: { x: 0.28, y: 0.35, width: 0.44, height: 0.4 },
    views: 610,
  },

  // ---- POLIQRAFIYA (per_unit) ----
  {
    id: "p-card",
    slug: "vizitka",
    categoryId: "c-print",
    name: "Vizit kart",
    description: "90×50mm, 350q karton, iki tərəfli rəngli çap.",
    image: "/products/vizitka.jpg",
    pricingModel: "per_unit",
    minOrderQty: 100,
    priceTiers: [
      { minQty: 100, unitPrice: 0.25 },
      { minQty: 500, unitPrice: 0.15 },
      { minQty: 1000, unitPrice: 0.1 },
    ],
    variants: [
      { id: "v-mat", name: "Mat laminasiya", priceModifier: 0.03 },
      { id: "v-glossy", name: "Parlaq laminasiya", priceModifier: 0.03 },
      { id: "v-none", name: "Laminasiyasız" },
    ],
    printAreaPercent: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
    featured: true,
    views: 2100,
  },
  {
    id: "p-flyer",
    slug: "flayer-a5",
    categoryId: "c-print",
    name: "Flayer A5",
    description: "A5 (148×210mm), 130q parlaq kağız, iki tərəfli rəngli.",
    image: img("flyer"),
    pricingModel: "per_unit",
    minOrderQty: 100,
    priceTiers: [
      { minQty: 100, unitPrice: 0.3 },
      { minQty: 500, unitPrice: 0.18 },
      { minQty: 1000, unitPrice: 0.12 },
    ],
    printAreaPercent: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
    views: 870,
  },

  // ---- REKLAM & BANNER (per_sqm) ----
  {
    id: "p-banner",
    slug: "banner",
    categoryId: "c-banner",
    name: "Açıq hava banner (tent)",
    description: "440q tent, tam rəngli solvent çap. İstənilən ölçü.",
    image: img("bannerproduct", 800, 500),
    pricingModel: "per_sqm",
    pricePerSqm: 12,
    minWidthCm: 50,
    minHeightCm: 50,
    printAreaPercent: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 },
    featured: true,
    views: 1560,
  },
  {
    id: "p-rollup",
    slug: "roll-up",
    categoryId: "c-banner",
    name: "Roll-up stend",
    description: "85×200sm standart roll-up, konstruksiya daxil.",
    image: img("rollup", 400, 700),
    pricingModel: "per_sqm",
    pricePerSqm: 25,
    minWidthCm: 60,
    minHeightCm: 150,
    printAreaPercent: { x: 0.1, y: 0.05, width: 0.8, height: 0.85 },
    views: 720,
  },

  // ---- KƏSIM & ORACAL (per_sqm) ----
  {
    id: "p-oracal",
    slug: "oracal-kesim",
    categoryId: "c-cut",
    name: "Oracal plotter kəsim",
    description: "Rəngli yapışqan vinil, kompüter kəsimi (plotter).",
    image: img("oracal", 700, 500),
    pricingModel: "per_sqm",
    pricePerSqm: 18,
    minWidthCm: 10,
    minHeightCm: 10,
    variants: [
      { id: "v-white", name: "Ağ" },
      { id: "v-black", name: "Qara" },
      { id: "v-gold", name: "Qızılı", priceModifier: 6 },
    ],
    printAreaPercent: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
    views: 540,
  },
  {
    id: "p-sticker",
    slug: "stiker",
    categoryId: "c-cut",
    name: "Rəngli stiker çap + kəsim",
    description: "Tam rəngli çap + kontur kəsim, mat və ya parlaq.",
    image: "/products/stiker.jpg",
    pricingModel: "per_sqm",
    pricePerSqm: 22,
    minWidthCm: 5,
    minHeightCm: 5,
    printAreaPercent: { x: 0.15, y: 0.15, width: 0.7, height: 0.7 },
    views: 1120,
  },
];

// --- köməkçi funksiyalar (mock; sonra Supabase sorğuları ilə əvəzlənəcək) ---

export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getAllProducts(): Product[] {
  return products;
}
