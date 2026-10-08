// Sayt üzrə ümumi məlumat — nömrə, linklər, müştərilər buradan dəyişdirilir.
// DİQQƏT: aşağıdakı dəyərlər müvəqqəti nümunədir, real məlumatla əvəz edin.

export const site = {
  name: "Poligraf",
  phone: "+994 50 000 00 00",
  phoneHref: "tel:+994500000000",
  email: "info@poligraf.az",
  address: "Bakı, Azərbaycan",
  hours: "B.e – Şən: 09:00 – 18:00",
  socials: [
    { id: "facebook", label: "Facebook", href: "https://facebook.com/" },
    { id: "instagram", label: "Instagram", href: "https://instagram.com/" },
    { id: "tiktok", label: "TikTok", href: "https://tiktok.com/" },
    { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/" },
  ],
  // Çalışdığımız şirkətlər. Loqo faylı olanda `logo: "/clients/ad.svg"` əlavə edin.
  clients: [
    { name: "Azercell" },
    { name: "Kapital Bank" },
    { name: "Bravo" },
    { name: "Baku Electronics" },
    { name: "Pasha Holding" },
    { name: "Park Bulvar" },
    { name: "Azersun" },
    { name: "Rahat" },
  ] as { name: string; logo?: string }[],
};
