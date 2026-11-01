import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { requireAdmin } from "@/lib/admin-auth";
import { loadCosts } from "@/lib/costs-server";
import { deleteSupplier, saveSupplier } from "../../../cost-actions";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, suppliers, prices } = await loadCosts(supabase);
  if (error) return <div className="space-y-4"><CostHeader /><CostTablesMissing /></div>;
  const count = new Map<string, number>();
  for (const p of prices) count.set(p.supplierId, (count.get(p.supplierId) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <CostHeader msg={sp.msg} />
      <form action={saveSupplier} className="grid gap-3 rounded-xl bg-white p-5 sm:grid-cols-[1.5fr_1fr_2fr_auto] sm:items-end">
        <label><span className={costLabel}>Ad *</span><input name="name" required className={costInput} placeholder="Moongroup" /></label>
        <label><span className={costLabel}>Telefon / WhatsApp</span><input name="phone" className={costInput} /></label>
        <label><span className={costLabel}>Qeyd</span><input name="note" className={costInput} placeholder="Ödəniş şərti, çatdırılma, keyfiyyət" /></label>
        <button className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">Əlavə et</button>
      </form>

      <div className="space-y-2">
        {suppliers.map((x) => (
          <details key={x.id} className="rounded-xl bg-white px-5 py-3">
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-semibold">{x.name}</span>
              <span className="text-sm text-neutral-500">{x.phone}</span>
              <span className="ml-auto text-sm text-neutral-500">{count.get(x.id) ?? 0} qiymət</span>
            </summary>
            <form action={saveSupplier} className="mt-3 grid gap-3 sm:grid-cols-[1.5fr_1fr_2fr_auto] sm:items-end">
              <input type="hidden" name="id" value={x.id} />
              <label><span className={costLabel}>Ad</span><input name="name" defaultValue={x.name} className={costInput} /></label>
              <label><span className={costLabel}>Telefon</span><input name="phone" defaultValue={x.phone} className={costInput} /></label>
              <label><span className={costLabel}>Qeyd</span><input name="note" defaultValue={x.note} className={costInput} /></label>
              <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Saxla</button>
            </form>
            <form action={deleteSupplier} className="mt-2">
              <input type="hidden" name="id" value={x.id} />
              <ConfirmButton message="Təchizatçı və onun bütün qiymətləri silinsin?" className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Təchizatçını sil</ConfirmButton>
            </form>
          </details>
        ))}
        {!suppliers.length && <p className="rounded-xl bg-white px-5 py-8 text-center text-neutral-500">Hələ təchizatçı yoxdur. Qiymət əlavə edəndə də avtomatik yaranır.</p>}
      </div>
    </div>
  );
}

export const instant = false;
