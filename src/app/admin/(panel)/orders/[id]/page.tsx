import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";
import { deleteOrder, updateOrder } from "../../../actions";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();

  const sign = async (path: string | null) =>
    path ? (await supabase.storage.from("orders").createSignedUrl(path, 3600)).data?.signedUrl ?? null : null;
  const [mockupUrl, logoUrl] = await Promise.all([sign(o.mockup_path), sign(o.logo_path)]);

  const phoneDigits = String(o.customer_phone).replace(/[^\d]/g, "");
  const size =
    o.pricing_model === "per_sqm" ? `${o.width_cm} × ${o.height_cm} sm` : `${o.quantity} ədəd`;

  const rows: [string, React.ReactNode][] = [
    ["Məhsul", o.product_name],
    ["Variant", o.variant_name ?? "—"],
    ["Say / ölçü", size],
    ["Qiymət", <b key="p">{Number(o.computed_price).toFixed(2)} ₼</b>],
    ["Müştəri", o.customer_name],
    ["Telefon", <a key="t" href={`tel:${o.customer_phone}`} className="font-semibold text-brand">{o.customer_phone}</a>],
    ["Müştəri qeydi", o.note || "—"],
    ["Tarix", new Date(o.created_at).toLocaleString("az-AZ", { dateStyle: "long", timeStyle: "short" })],
  ];

  return (
    <div className="space-y-4">
      <Link href="/admin/orders" className="text-sm font-semibold text-neutral-500 hover:text-foreground">← Sifarişlər</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Sifariş #{o.id.slice(0, 8)}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6">
            <dl className="divide-y divide-neutral-100">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${o.customer_phone}`} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white">Zəng et</a>
              <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white">WhatsApp</a>
            </div>
          </div>

          <form action={updateOrder} className="space-y-3 rounded-3xl bg-white p-6">
            <input type="hidden" name="id" value={o.id} />
            <h2 className="font-extrabold">Status</h2>
            <select name="status" defaultValue={o.status} className="w-full rounded-2xl bg-surface px-4 py-3 font-semibold outline-none">
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <textarea name="admin_note" defaultValue={o.admin_note ?? ""} rows={3} placeholder="Daxili qeyd (müştəri görmür)" className="w-full rounded-2xl bg-surface px-4 py-3 outline-none" />
            <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">Yadda saxla</button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6">
            <h2 className="mb-3 font-extrabold">Nümunə (mockup)</h2>
            {mockupUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mockupUrl} alt="Mockup" className="w-full rounded-2xl bg-surface" />
                <a href={mockupUrl} download className="mt-3 inline-block text-sm font-semibold text-brand">Yüklə</a>
              </>
            ) : (
              <p className="text-sm text-neutral-500">Müştəri loqo yükləməyib.</p>
            )}
          </div>
          {logoUrl && (
            <div className="rounded-3xl bg-white p-6">
              <h2 className="mb-3 font-extrabold">Orijinal loqo</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Loqo" className="max-h-56 rounded-2xl bg-surface object-contain p-4" />
              <a href={logoUrl} download className="mt-3 inline-block text-sm font-semibold text-brand">Yüklə</a>
            </div>
          )}
        </div>
      </div>

      <form action={deleteOrder}>
        <input type="hidden" name="id" value={o.id} />
        <ConfirmButton message="Sifariş və şəkilləri silinsin?" className="text-sm font-semibold text-neutral-400 hover:text-accent">Sifarişi sil</ConfirmButton>
      </form>
    </div>
  );
}
