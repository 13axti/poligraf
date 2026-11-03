import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CostHeader, CostTablesMissing, costInput } from "@/components/admin/CostHeader";
import { SupplierFields } from "@/components/admin/costs/SupplierFields";
import { requireAdmin } from "@/lib/admin-auth";
import { normName } from "@/lib/costs";
import { loadCosts } from "@/lib/costs-server";
import { waNumber } from "@/lib/phone";
import { deleteSupplier, saveSupplier } from "../../cost-actions";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ q?: string; msg?: string; new?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, suppliers, offers } = await loadCosts(supabase);
  const head = (
    <CostHeader
      title="Təchizatçılar"
      sub="Bütün şirkətlər. Əlavə etdiyiniz şirkət məhsul formasındakı təchizatçı siyahısında avtomatik görünür."
      msg={sp.msg}
      action={<a href="#yeni" className="rounded-md bg-[#ff5a1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">+ Təchizatçı əlavə et</a>}
    />
  );
  if (error) return <div className="space-y-4">{head}<CostTablesMissing /></div>;
  const count = new Map<string, number>();
  for (const o of offers) count.set(o.supplierId, (count.get(o.supplierId) ?? 0) + 1);
  const term = normName(sp.q ?? "");
  const list = suppliers.filter((s) => !term || normName(`${s.name} ${s.contactPerson} ${s.phone} ${s.email} ${s.address}`).includes(term));

  return (
    <div className="space-y-5">
      {head}
      <form className="flex gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Axtar: ad, telefon, əlaqədar şəxs" className={`${costInput} max-w-sm`} />
        <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Axtar</button>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[52rem] text-sm">
          <thead className="border-b border-[var(--line)] text-left text-xs text-neutral-500">
            <tr><th className="px-4 py-3">Şirkət</th><th>Əlaqədar şəxs</th><th>Telefon</th><th>E-poçt</th><th className="text-center">Məhsul</th><th className="px-4 text-right">Əməliyyat</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {list.map((s) => (
              <tr key={s.id} className="hover:bg-[var(--surface)]/40">
                <td className="px-4 py-3"><Link href={`/admin/suppliers/${s.id}`} className="font-semibold hover:underline">{s.name}</Link>{s.address && <span className="block text-xs text-neutral-500">{s.address}</span>}</td>
                <td>{s.contactPerson || "—"}</td>
                <td>
                  {s.phone ? <a href={`tel:${s.phone}`} className="hover:underline">{s.phone}</a> : <span className="text-[#c42b0d]">yazılmayıb</span>}
                  {s.whatsapp && <a href={`https://wa.me/${waNumber(s.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#1f7a3a] hover:underline">WhatsApp</a>}
                </td>
                <td>{s.email ? <a href={`mailto:${s.email}`} className="hover:underline">{s.email}</a> : "—"}</td>
                <td className="text-center">{count.get(s.id) ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/suppliers/${s.id}`} className="rounded bg-[var(--surface)] px-2 py-1 text-xs font-semibold">Bax / redaktə</Link>
                    <form action={deleteSupplier}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmButton message={`"${s.name}" və onun bütün qiymətləri silinsin?`} className="rounded px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="px-5 py-10 text-center text-neutral-500">Təchizatçı tapılmadı.</p>}
      </div>

      <form id="yeni" action={saveSupplier} className={`scroll-mt-6 space-y-3 rounded-xl bg-white p-5 ${sp.new ? "ring-2 ring-[#ff5a1f]" : ""}`}>
        <h2 className="font-bold">Yeni təchizatçı</h2>
        <input type="hidden" name="back" value="/admin/suppliers" />
        <SupplierFields />
        <button className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">Əlavə et</button>
      </form>
    </div>
  );
}

export const instant = false;
