// Sayt ayarlarının ilkin (default) dəyərləri.
// Real dəyərlər admin paneldən (Ayarlar bölməsi) yazılır və bazada saxlanır;
// baza boşdursa və ya qoşulmayıbsa bu dəyərlər göstərilir.

/** Saytın adı: başlıqlar, loqo və admin burdan oxuyur */
export const BRAND = "Lemur Group";

/** Saytın əsas ünvanı (Google, sayt xəritəsi, paylaşım linkləri üçün). Vercel-də NEXT_PUBLIC_SITE_URL ilə dəyişmək olar. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://lemurgroup.org").replace(/\/$/, "");

/** Axtarış sistemləri üçün əsas təsvir: reklam işləri, çap, promo, Bakı */
export const SEO_DESCRIPTION =
  "Lemur Group: Bakıda reklam işləri, banner və vinil çapı, roll-up, lövhələr, vizit kart, flayer, buklet və promo məhsullar. Qiyməti saytda dərhal hesablayın, loqonuzu məhsul üzərində görün və onlayn sifariş verin.";

export interface SiteSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  socials: { id: string; label: string; href: string }[];
  clients: { name: string; logo?: string }[];
}

export const defaultSettings: SiteSettings = {
  name: BRAND,
  phone: "+994 50 000 00 00",
  email: "",
  address: "Bakı, Azərbaycan",
  hours: "B.e – Şən: 09:00 – 18:00",
  socials: [
    { id: "facebook", label: "Facebook", href: "" },
    { id: "instagram", label: "Instagram", href: "" },
    { id: "tiktok", label: "TikTok", href: "" },
    { id: "linkedin", label: "LinkedIn", href: "" },
  ],
  clients: [],
};

/** "+994 50 000 00 00" → "tel:+994500000000" */
export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
