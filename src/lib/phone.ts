/** wa.me üçün nömrə: yalnız rəqəmlər, Azərbaycan nömrəsi üçün 994 kodu ilə */
export function waNumber(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("994")) return d;
  if (d.startsWith("0")) return "994" + d.slice(1);
  if (d.length === 9) return "994" + d;
  return d;
}

/** Müştəriyə sifariş statusuna uyğun hazır WhatsApp mətni */
export function statusMessage(status: string, name: string, product: string): { label: string; text: string } {
  const hi = `Salam, ${name.split(" ")[0]}! Lemur Group-dan yazırıq.`;
  switch (status) {
    case "in_progress":
      return { label: "WhatsApp: icradadır", text: `${hi} «${product}» sifarişiniz icraya götürüldü. Hazır olanda sizə xəbər verəcəyik.` };
    case "ready":
      return { label: "WhatsApp: hazırdır", text: `${hi} «${product}» sifarişiniz hazırdır, götürə bilərsiniz. Təşəkkür edirik!` };
    case "done":
      return { label: "WhatsApp: təşəkkür", text: `${hi} «${product}» sifarişinizi təhvil verdik. Bizi seçdiyiniz üçün təşəkkür edirik. Rəyinizi bizimlə bölüşsəniz, çox sevinərik.` };
    default:
      return { label: "WhatsApp: sifariş qəbul edildi", text: `${hi} «${product}» sifarişinizi aldıq. Təfərrüatları dəqiqləşdirmək üçün sizinlə əlaqə saxlayırıq.` };
  }
}
