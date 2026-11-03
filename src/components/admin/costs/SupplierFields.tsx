import { costInput, costLabel } from "../CostHeader";
import type { Supplier } from "@/lib/costs-server";

/** Təchizatçı forması: ad*, ünvan, sayt, əlaqədar şəxs, telefon*, WhatsApp, e-poçt, qeyd */
export function SupplierFields({ x }: { x?: Supplier }) {
  const f = (name: string, label: string, v?: string, ph?: string, req = false, type = "text") => (
    <label><span className={costLabel}>{label}{req ? " *" : ""}</span><input name={name} type={type} required={req} defaultValue={v ?? ""} placeholder={ph} className={costInput} /></label>
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">{f("name", "Şirkətin adı", x?.name, "Print az MMC", true)}</div>
      {f("contact_person", "Əlaqədar şəxs", x?.contactPerson)}
      {f("phone", "Telefon nömrəsi", x?.phone, "+994 50 000 00 00", true, "tel")}
      {f("whatsapp", "WhatsApp nömrəsi", x?.whatsapp, "+994 50 000 00 00", false, "tel")}
      {f("email", "E-poçt", x?.email, "", false, "email")}
      {f("website", "Veb-sayt", x?.website, "https://")}
      {f("address", "Ünvan", x?.address)}
      <div className="sm:col-span-2 lg:col-span-4">{f("note", "Qeyd", x?.note, "Ödəniş şərti, keyfiyyət, xüsusi qeydlər")}</div>
    </div>
  );
}
