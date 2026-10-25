import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin-auth";
import { REQUEST_STATUS } from "@/lib/order-status";
import { waNumber } from "@/lib/phone";
import { deleteRequest, setRequestStatus, updateRequest } from "../../../actions";

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: r } = await supabase.from("requests").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();

  const st = REQUEST_STATUS[r.status] ?? REQUEST_STATUS.new;
  const hi = String(r.customer_name).split(" ")[0];
  const wa = `Salam, ${hi}! Lemur Group-dan yazırıq. İstəyinizlə bağlı cavab verirəm: `;

  return (
    <div className="space-y-6">
      <Link href="/admin/requests" className="text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">Sorğulara qayıt</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{r.customer_name}</h1>
        <span className="flex items-center gap-2 rounded-md bg-white px-2.5 py-1 text-sm font-semibold">
          <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: st.dot }} />
          {st.label}
        </span>
        <span className="text-sm text-neutral-500">{new Date(r.created_at).toLocaleString("az-AZ", { dateStyle: "long", timeStyle: "short" })}</span>
        {r.status === "new" && (
          <form action={setRequestStatus} className="ml-auto">
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value="answered" />
            <button className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e04810]">Cavab verildi</button>
          </form>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-bold">Müştərinin istəyi</h2>
          <p className="whitespace-pre-wrap rounded-xl bg-white p-5 text-lg leading-relaxed">{r.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`tel:${r.customer_phone}`} className="rounded-md bg-[#1b1d1f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">Zəng et: {r.customer_phone}</a>
            <a
              href={`https://wa.me/${waNumber(String(r.customer_phone))}?text=${encodeURIComponent(wa)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-inset ring-[var(--line)] hover:bg-[var(--surface)]"
            >
              WhatsApp-da cavab ver
            </a>
          </div>
        </section>

        <div className="space-y-6">
          <form action={updateRequest} className="space-y-3 rounded-xl bg-white p-5">
            <input type="hidden" name="id" value={r.id} />
            <h2 className="text-lg font-bold">Status və qeyd</h2>
            <select name="status" defaultValue={r.status} className="w-full px-3 py-2.5 font-medium outline-none">
              {Object.entries(REQUEST_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <textarea name="admin_note" defaultValue={r.admin_note ?? ""} rows={3} placeholder="Daxili qeyd (müştəri görmür)" className="w-full px-3 py-2.5 outline-none" />
            <button className="rounded-md bg-[#1b1d1f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">Dəyişiklikləri saxla</button>
          </form>
          <form action={deleteRequest}>
            <input type="hidden" name="id" value={r.id} />
            <ConfirmButton message="Bu sorğu silinsin?" className="text-sm font-semibold text-neutral-500 underline-offset-4 hover:text-[#c42b0d] hover:underline">Sorğunu sil</ConfirmButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export const instant = false;
