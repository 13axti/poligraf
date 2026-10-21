export const DESIGN_PRICE = 25; // AZN
export const DESIGNER_SHARE = 10; // % (baxış və satış sayına görə dizayner ilə bölüşülür)
export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export interface Design {
  id: string;
  title: string;
  designerName: string;
  kind: "shirt" | "artwork";
  image: string;
  views: number;
  sales: number;
}

export function designImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/designs/${path}`;
}


/** Hələ real dizayn olmayanda göstərilən nümunələr (sifariş olunmur) */
export interface SampleDesign {
  id: string;
  title: string;
  image: string;
  tee: "white" | "green";
}
export const SAMPLE_DESIGNS: SampleDesign[] = [
  { id: "sample-1", title: "Lemur Vibes", image: "/campaign/sample-1.svg", tee: "white" },
  { id: "sample-2", title: "Print City", image: "/campaign/sample-2.svg", tee: "green" },
  { id: "sample-3", title: "Baki Nights", image: "/campaign/sample-3.svg", tee: "white" },
  { id: "sample-4", title: "Orange Wave", image: "/campaign/sample-4.svg", tee: "green" },
];
