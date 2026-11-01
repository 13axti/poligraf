import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { requireAdmin } from "@/lib/admin-auth";
import { loadCosts, type Supplier } from "@/lib/costs-server";
import { deleteSupplier, saveSupplier } from "../../../cost-actions";

function Fields({ x }: { x?: Supplier }) {
  const f = (name: string, label: string, v?: string | number | null, ph?: string, type = "text") => (
    <label><span className={costLabel}>{label}</span><input name={name} type={type} defaultValue={v ?? ""} placeholder={ph} className={costInput} /></label>
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="sm:col-span-2"><span className={costLabel}>Şirkətin adı *</span><input name="name" required defaultValue={x?.name} className={costInput} placeholder="Print az MMC" /></label>
      {f("voen", "VÖEN", x?.voen)}
      {f("lead_days", "Standart hazırlanma (gün)", x?.leadDays, "3", "number")}
      {f("contact_person", "Əlaqə şəxsi", x?.contactPerson)}
      {f("phone", "Telefon / WhatsApp", x?.phone, "+994 50 000 00 00")}
      {f("email", "E-poçt", x?.email, "", "email")}
      {f("website", "Sayt / Instagram", x?.website)}
      <label className="sm:col-span-2"><span className={costLabel}>Ünvan</span><input name="address" defaultValue={x?.address} className={costInput} /></label>
      {f("payment_terms", "Ödəniş şərti", x?.paymentTerms, "50% avans, 50% təhvildə")}
      {f("delivery", "Çatdırılma", x?.delivery, "Bakı daxili pulsuz")}
      <label className="sm:col-span-2 lg:col-span-4"><span className={costLabel}>Qeyd</span><input name="note" defaultValue={x?.note} className={costInput} placeholder="Keyfiyyət, güclü tərəfləri, xəbərdarlıqlar" /></label>
    </div>
  );
}

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, suppliers, offers } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;
  const count = new Map<string, number>();
  for (const o of offers) count.set(o.supplierId, (count.get(o.supplierId) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <CostHeader msg={sp.msg} />
      <form action={saveSupplier} className="space-y-3 rounded-xl bg-white p-5">
        <h2 className="font-bold">Yeni təchizatçı</h2>
        <Fields />
        <button className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">Əlavə et</button>
      </form>

      <div className="space-y-2">
        {suppliers.map((x) => (
          <details key={x.id} className="rounded-xl bg-white px-5 py-3">
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-semibold">{x.name}</span>
              <span className="text-sm text-neutral-500">{[x.contactPerson, x.phone].filter(Boolean).join(" · ")}</span>
              {x.leadDays != null && <span className="text-sm text-neutral-500">{x.leadDays} gün</span>}
              <span className="ml-auto text-sm text-neutral-500">{count.get(x.id) ?? 0} məhsul</span>
            </summary>
            <form action={saveSupplier} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={x.id} />
              <Fields x={x} />
              <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Saxla</button>
            </form>
            <form action={deleteSupplier} className="mt-2">
              <input type="hidden" name="id" value={x.id} />
              <ConfirmButton message="Təchizatçı və onun bütün qiymətləri silinsin?" className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Təchizatçını sil</ConfirmButton>
            </form>
          </details>
        ))}
        {!suppliers.length && <p className="rounded-xl bg-white px-5 py-8 text-center text-neutral-500">Hələ təchizatçı yoxdur.</p>}
      </div>
    </div>
  );
}

export const instant = false;
