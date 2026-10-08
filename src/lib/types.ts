// Əsas tiplər — Supabase cədvəlləri ilə eyni strukturda saxlanır.
// Baza hazır olanda mock-data əvəzinə birbaşa Supabase-dən bu tiplər gələcək.

/** Qiymət necə hesablanır */
export type PricingModel =
  | "per_unit" // sayla: qələm, fincan, vizitka (tier-lərlə)
  | "per_sqm"; // en × hündürlük (m²): banner, vinil, kəsim

export interface Category {
  id: string;
  slug: string; // URL üçün: "qelem", "banner"
  name: string; // "Qələmlər", "Bannerlər"
  description?: string;
  image?: string;
  sortOrder: number;
}

/** Sayla satılan məhsullar üçün miqdar pilləsi (çox alanda ucuz) */
export interface PriceTier {
  minQty: number; // bu saydan başlayaraq
  unitPrice: number; // ədəd başına AZN
}

/** Məhsulun rəng/material variantı */
export interface ProductVariant {
  id: string;
  name: string; // "Ağ", "Mat laminasiya"
  priceModifier?: number; // əlavə AZN (ədəd və ya m² başına), default 0
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  description?: string;
  image: string;
  images?: string[]; // qalereya
  pricingModel: PricingModel;

  // per_unit üçün:
  priceTiers?: PriceTier[];
  minOrderQty?: number; // minimal sifariş sayı

  // per_sqm üçün:
  pricePerSqm?: number; // m² başına AZN
  minWidthCm?: number;
  minHeightCm?: number;

  variants?: ProductVariant[];
  mockups?: ProductMockup[]; // loqo yoxlama editoru üçün

  // Mockup editoru üçün (2-ci mərhələdə istifadə olunacaq):
  printAreaPercent?: PrintArea; // məhsul şəklində loqo qoyulan sahə

  featured?: boolean;
  views?: number;
}

/**
 * Mockup şəkli + loqonun standart yeri.
 * cx, cy: mərkəz (şəklin en/hündürlüyünə nisbətən 0..1)
 * w, h: loqo qutusu — hər ikisi ŞƏKLİN ENİNƏ nisbətən (rotasiya düzgün qalsın deyə)
 */
export interface MockupPlacement {
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number; // dərəcə
}

export interface ProductMockup {
  id: string;
  name: string;
  image: string;
  width: number; // şəklin piksel ölçüsü
  height: number;
  placement: MockupPlacement;
  /** Eyni loqonun təkrarı (məs. şəkildə 2 qələm var): əsas yerdən fərq */
  clones?: { dx: number; dy: number }[];
  /** Tünd məhsulda loqonu ağ etmək təklif olunur */
  darkProduct?: boolean;
  /** Kölgə/parıltı qatı (şəffaf PNG) — loqonun ÜSTÜNDƏ çəkilir, realistik görünüş verir */
  overlay?: string;
}

/** Mockup şəklində çap sahəsi — faizlə (responsive olsun deyə) */
export interface PrintArea {
  x: number; // 0..1 (şəklin solundan faizlə)
  y: number; // 0..1 (yuxarıdan)
  width: number; // 0..1
  height: number; // 0..1
}

/** Kalkulyatorun verdiyi nəticə */
export interface PriceResult {
  total: number; // ümumi AZN
  unitPrice?: number; // ədəd başına (per_unit)
  quantity?: number;
  areaSqm?: number; // m² (per_sqm)
  appliedTier?: PriceTier;
  breakdown: string; // istifadəçiyə göstərmək üçün izah
}

/** Sifariş — Flutter app-ə düşəcək struktur */
export interface OrderInput {
  productId: string;
  productName: string;
  variantId?: string;
  pricingModel: PricingModel;
  quantity?: number;
  widthCm?: number;
  heightCm?: number;
  computedPrice: number;
  customerName: string;
  customerPhone: string;
  note?: string;
  logoUrl?: string; // yüklənmiş loqo
  mockupUrl?: string; // hazır nümunə şəkli
}
