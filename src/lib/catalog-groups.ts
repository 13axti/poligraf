import { slugify } from "./slug";

/** Kateqoriyaların ailələri (bazada ayrıca qrup sahəsi yoxdur, ona görə ad üzrə təyin olunur) */
const PRINT = [
  "Vizitkartlar", "Flayerlər", "Bukletlər", "Zərflər", "Açıqcalar", "Firma blankı və sertifikatlar", "Qovluqlar", "Çantalar",
  "Qeyd kağızları", "Bloknotlar Dəri üzlü", "Bloknotlar Karton üzlü", "Avtoqoxular", "Dəvətnamələr", "Posterlər", "Etiketlər",
  "Təqvimlər", "Kataloqlar", "Qaimələr və göndərişlər", "Qutular", "Şelftokerlər", "Voblerlər", "Digər mətbəə",
];
const PROMO = [
  "Qələmlər metal", "Qələmlər plastik", "Qələm qutuları", "Hədiyyə dəstləri", "Yaddaş kartları", "Powerbanklar",
  "Termoslar və fincanlar", "Kart qabları", "Köynəklər", "Kepkalar", "Tekstil məhsulları", "Açarlıqlar", "Maqnitlər",
  "Bayraqlar", "Plaketlər", "Yaxa kartı və lentlər", "Rozetlər", "Saatlar", "Plastik kartlar", "Maus və fincan altlıqları",
  "Digər promo",
];
const ADS = ["Reklam lövhələri", "Bannerlər", "Məlumat lövhələri", "Vinillər", "Roll up'lar"];

const OF = new Map<string, string>();
[["Mətbəə", PRINT], ["Promo", PROMO], ["Reklam", ADS]].forEach(([g, list]) => (list as string[]).forEach((n) => OF.set(slugify(n), g as string)));

export const GROUP_ORDER = ["Mətbəə", "Promo", "Reklam", "Digər"];
export const groupOf = (slug: string) => OF.get(slug) ?? "Digər";
