import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin-auth";
import { STATUS } from "@/lib/order-status";
import { statusMessage, waNumber } from "@/lib/phone";
import { PrintButton } from "@/components/admin/PrintButton";
import { deleteOrder, setOrderStatus, updateOrder } from "../../../actions";

const NEXT: Record<string, { to: string; label: string } | undefined> = {
  new: { to: "in_progress", label: "İcraya götür" },
  in_progress: { to: "ready", label: "Hazırdır" },
  ready: { to: "done", label: "Təhvil verildi" },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();

  const sign = async (path: string | null) =>
    path ? (await supabase.storage.from("orders").createSignedUrl(path, 3600)).data?.signedUrl ?? null : null;
  // Sifariş qovluğundakı bütün loqolar (logo.*, logo-1.*, logo-2.*); köhnə sifarişlərdə yalnız logo_path
  const { data: files } = await supabase.storage.from("orders").list(o.id);
  const logoPaths = (files ?? []).filter((f) => /^logo/i.test(f.name)).map((f) => `${o.id}/${f.name}`).sort();
  if (!logoPaths.length && o.logo_path) logoPaths.push(o.logo_path);
  const aiFile = (files ?? []).find((f) => /^ai\./i.test(f.name));
  const [mockupUrl, logoUrls, aiUrl] = await Promise.all([sign(o.mockup_path), Promise.all(logoPaths.map(sign)), aiFile ? sign(`${o.id}/${aiFile.name}`) : Promise.resolve(null)]);

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

  const st = STATUS[o.status] ?? STATUS.new;
  const wa = statusMessage(o.status, String(o.customer_name), String(o.product_name));
  const proof = (url: string, alt: string) => (
    <div className="crop">
      <i />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="w-full bg-[var(--surface)]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="print:hidden text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">Sifarişlərə qayıt</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{o.product_name}</h1>
        <span className="flex items-center gap-2 rounded-md bg-white px-2.5 py-1 text-sm font-semibold">
          <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: st.dot }} />
          {st.label}
        </span>
        <span className="num text-sm text-neutral-500">#{o.id.slice(0, 8)}</span>
        <div className="ml-auto flex gap-2 print:hidden">
          {NEXT[o.status] && (
            <form action={setOrderStatus}>
              <input type="hidden" name="id" value={o.id} />
              <input type="hidden" name="status" value={NEXT[o.status]!.to} />
              <button className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e04810]">{NEXT[o.status]!.label}</button>
            </form>
          )}
          <PrintButton className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--surface)]" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Sol: çap üçün nə lazımdır */}
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-bold">Müştərinin göndərdiyi nümunə</h2>
            {mockupUrl ? (
              <>
                {proof(mockupUrl, "Mockup")}
                <a href={mockupUrl} download className="mt-2 inline-block text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">Şəkli yüklə</a>
              </>
            ) : (
              <p className="rounded-xl bg-white p-5 text-sm text-neutral-500">Müştəri loqo yükləməyib, sifariş loqosuz gəlib.</p>
            )}
          </section>

          {logoUrls.filter(Boolean).length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Orijinal loqolar (çap faylı)</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {logoUrls.filter(Boolean).map((u, i, all) => (
                  <div key={i} className="rounded-xl bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u!} alt={`Loqo ${i + 1}`} className="h-36 w-full rounded-md bg-[var(--surface)] object-contain p-3" />
                    <a href={u!} download className="mt-2 inline-block text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">
                      Loqo{all.length > 1 ? ` ${i + 1}` : ""} yüklə
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {aiUrl && (
            <section>
              <h2 className="mb-3 text-lg font-bold">AI təqdimat şəkli</h2>
              {proof(aiUrl, "AI təqdimat")}
              <a href={aiUrl} download className="mt-2 inline-block text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-foreground hover:underline">Şəkli yüklə</a>
            </section>
          )}
        </div>

        {/* Sağ: sifariş və müştəri */}
        <div className="space-y-6">
          <section className="rounded-xl bg-white p-5">
            <dl className="divide-y divide-[var(--line)]">
              {rows.slice(1).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <a href={`tel:${o.customer_phone}`} className="rounded-md bg-[#1b1d1f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">Zəng et</a>
              <a
                href={`https://wa.me/${waNumber(String(o.customer_phone))}?text=${encodeURIComponent(wa.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Mətn hazır yazılır, göndərməzdən əvvəl dəyişə bilərsiniz"
                className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-inset ring-[var(--line)] hover:bg-[var(--surface)]"
              >
                {wa.label}
              </a>
            </div>
          </section>

          <form action={updateOrder} className="space-y-3 rounded-xl bg-white p-5 print:hidden">
            <input type="hidden" name="id" value={o.id} />
            <h2 className="text-lg font-bold">Status və qeyd</h2>
            <select name="status" defaultValue={o.status} className="w-full px-3 py-2.5 font-medium outline-none">
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <textarea name="admin_note" defaultValue={o.admin_note ?? ""} rows={3} placeholder="Daxili qeyd (müştəri görmür)" className="w-full px-3 py-2.5 outline-none" />
            <button className="rounded-md bg-[#1b1d1f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">Dəyişiklikləri saxla</button>
          </form>

          <form action={deleteOrder} className="print:hidden">
            <input type="hidden" name="id" value={o.id} />
            <ConfirmButton message="Sifariş və şəkilləri silinsin?" className="text-sm font-semibold text-neutral-500 underline-offset-4 hover:text-[#c42b0d] hover:underline">Sifarişi sil</ConfirmButton>
          </form>
        </div>
      </div>
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
