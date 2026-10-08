const map: Record<string, string> = {
  ə: "e", Ə: "e", ı: "i", İ: "i", ö: "o", Ö: "o", ü: "u", Ü: "u", ç: "c", Ç: "c", ş: "s", Ş: "s", ğ: "g", Ğ: "g",
};
export function slugify(s: string) {
  return s
    .replace(/[əƏıİöÖüÜçÇşŞğĞ]/g, (c) => map[c])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
