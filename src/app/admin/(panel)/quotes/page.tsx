import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AddMenu, CostHeader, CostTablesMissing, costInput } from "@/components/admin/CostHeader";
import { requireAdmin } from "@/lib/admin-auth";
import { money, normName, quoteSums, type QuoteLine } from "@/lib/costs";
import { deleteQuote } from "../../quote-actions";

type SP = { q?: string; from?: string; to?: string; msg?: string };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  let query = supabase.from("quotes").select("id, number, client, contact, phone, quote_date, vat, lines, source, updated_at").order("quote_date", { ascending: false }).order("number", { ascending: false }).limit(1000);
  if (sp.from) query = query.gte("quote_date", sp.from);
  if (sp.to) query = query.lte("quote_date", sp.to);
  const { data, error } = await query;
  const head = (
    <CostHeader
      title="Qiymət təklifləri"
      sub="Müştəriyə gedən təkliflər. Alış qiyməti bazadakı ən ucuz təchizatçıdan avtomatik götürülür, PDF-də daxili qiymətlər görünmür."
      msg={sp.msg}
      action={<AddMenu label="+ Yeni təklif" items={[{ href: "/admin/quotes/new", label: "Manual təklif", hint: "Məhsulları bazadan seçin" }, { href: "/admin/quotes/new?mode=file", label: "Fayldan avtomatik təklif", hint: "PDF, Excel, Word və ya şəkil" }]} />}
    />
  );
  if (error) return <div className="space-y-4">{head}<CostTablesMissing /></div>;
  const term = normName(sp.q ?? "");
  const list = (data ?? []).filter((x) => !term || normName(`${x.number} ${x.client} ${x.contact} ${x.phone}`).includes(term));

  return (
    <div className="space-y-5">
      {head}
      <form className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-3">
        <input name="q" defaultValue={sp.q} placeholder="Axtar: nömrə, müştəri, telefon" className={`${costInput} max-w-xs`} />
        <label className="text-xs text-neutral-500">Tarixdən<input type="date" name="from" defaultValue={sp.from} className={costInput} /></label>
        <label className="text-xs text-neutral-500">Tarixədək<input type="date" name="to" defaultValue={sp.to} className={costInput} /></label>
        <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Göstər</button>
        {(sp.q || sp.from || sp.to) && <Link href="/admin/quotes" className="px-2 py-2 text-sm font-semibold text-neutral-500 underline">Təmizlə</Link>}
      </form>

      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[52rem] text-sm">
          <thead className="border-b border-[var(--line)] text-left text-xs text-neutral-500">
            <tr><th className="px-4 py-3">Nömrə</th><th>Tarix</th><th>Müştəri</th><th className="text-center">Sətir</th><th className="text-right">Məbləğ</th><th className="text-right">Mənfəət</th><th className="px-4 text-right">Əməliyyat</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {list.map((x) => {
              const sums = quoteSums((x.lines ?? []) as QuoteLine[], x.vat);
              return (
                <tr key={x.id} className="hover:bg-[var(--surface)]/40">
                  <td className="px-4 py-3"><Link href={`/admin/quotes/${x.id}`} className="font-mono font-semibold hover:underline">{x.number}</Link>{x.source === "file" && <span className="ml-2 rounded bg-[var(--surface)] px-1.5 text-[10px] font-semibold text-neutral-600">fayldan</span>}</td>
                  <td>{x.quote_date}</td>
                  <td>{x.client || "—"}<span className="block text-xs text-neutral-500">{[x.contact, x.phone].filter(Boolean).join(" · ")}</span></td>
                  <td className="text-center">{(x.lines ?? []).length}</td>
                  <td className="text-right font-semibold">{money(sums.total)} ₼</td>
                  <td className="text-right text-[#1f7a3a]">{money(sums.profit)} ₼</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <a href={`/admin/quote-pdf/${x.id}`} target="_blank" rel="noopener noreferrer" className="rounded bg-[#1b1d1f] px-2 py-1 text-xs font-semibold text-white">PDF</a>
                      <Link href={`/admin/quotes/${x.id}`} className="rounded bg-[var(--surface)] px-2 py-1 text-xs font-semibold">Redaktə</Link>
                      <form action={deleteQuote}>
                        <input type="hidden" name="id" value={x.id} />
                        <ConfirmButton message={`${x.number} silinsin?`} className="rounded px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!list.length && <p className="px-5 py-10 text-center text-neutral-500">Təklif tapılmadı.</p>}
      </div>
    </div>
  );
}

export const instant = false;
