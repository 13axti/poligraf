import type { PData, PItem, Tier } from "./presentations";

/** Yalnız lokal sınaq üçün: /t/demo. Kataloqdakı qiymət pillələri ilə nümunə hədiyyə təqdimatı. */
const img = (slug: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/moongroup/${slug}.jpg`;
const t = (...p: [number, number][]): Tier[] => p.map(([minQty, unitPrice]) => ({ minQty, unitPrice }));
const it = (id: string, group: string, name: string, slug: string, colors: string[], spec: string[], tiers: Tier[], qty = 230): PItem =>
  ({ id, group, name, image: img(slug), colors, spec, qty, unit: "ədəd", tiers, priceOverride: null });

const items: PItem[] = [
  it("bc02", "Bloknotlar", "Bloknot BC02", "bloknot-bc02", ["qara"], ["Dəri üzlü, 80 vərəq (160 səhifə)", "Düz xətli iç vərəq"], t([30, 5.3], [100, 4.75], [300, 4.5])),
  it("bc45", "Bloknotlar", "Bloknot BC45", "bloknot-bc45", ["qara", "narıncı"], ["Dəri üzlü, 112 vərəq", "Kənarı tikişli termo dəri"], t([30, 6.1], [100, 5.5], [300, 5.3])),
  it("b22", "Bloknotlar", "Bloknot B22", "bloknot-b22", ["qara", "narıncı"], ["Dəri üzlü, 80 vərəq"], t([30, 6.85], [100, 6.3], [300, 6.1])),
  it("bcl", "Bloknotlar", "Bloknot BC L", "bloknot-bc-l", ["qara"], ["Dəri üzlü bloknot"], t([30, 7], [100, 6.4], [300, 6.2])),
  it("k012", "Qələmlər", "Metal qələm kod 012", "qelem-metal-kod-012", ["qırmızı", "qara"], ["Metal gövdə"], t([50, 1.45], [100, 1.3], [300, 1.25])),
  it("m050", "Qələmlər", "Metal qələm 050", "qelem-metal-050", ["qara"], ["Metal gövdə"], t([50, 3.6], [100, 3.4], [300, 3.35])),
  it("m052", "Qələmlər", "Metal qələm 052", "qelem-metal-052", ["ağ"], ["Metal gövdə"], t([50, 3.6], [100, 3.4], [300, 3.35])),
  it("bag", "Kətan çanta", "Çanta kətan (birrəngli çap)", "canta-ketan-birrengli-cap", ["təbii kətan"], ["Qulp rəngi: qara"], t([50, 2.5], [100, 2.4], [300, 2.3])),
];

export const sampleTitle = "Hədiyyə dəsti";
export const sampleData: PData = {
  intro: "Bloknot, qələm və kətan çanta.",
  markup: 0,
  items,
  sets: [
    { id: "s1", title: "Ekonom", desc: "Qara bloknot, qırmızı/qara qələm", itemIds: ["bc02", "k012", "bag"] },
    { id: "s2", title: "Standart", desc: "Qara/narıncı bloknot, qara metal qələm", itemIds: ["bc45", "m050", "bag"] },
    { id: "s3", title: "Premium", desc: "BC L bloknot, ağ metal qələm", itemIds: ["bcl", "m052", "bag"] },
  ],
  notes: [
    "Qiymətlər ƏDV-siz göstərilib, ƏDV (18%) əlavə olunur.",
    "Şəkillər nümunədir. Loqonuz mockup ilə təsdiqinizə göndəriləcək.",
  ],
};
