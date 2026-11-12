/* eslint-disable @next/next/no-img-element */
import { money, quoteSums, type QuoteLine } from "@/lib/costs";

export interface PdfQuote { number: string; quote_date: string; client: string; contact: string; phone: string; email: string; note: string; vat: boolean; lines: QuoteLine[] }
export interface PdfSite { name: string; phone: string; email: string; address: string }

const azDate = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; };

/** Müştəriyə gedən təklif (A4). Daxili məlumatlar (alış qiyməti, təchizatçı, mənfəət) burada YOXDUR. */
export function QuotePdfView({ q, site, toolbar }: { q: PdfQuote; site: PdfSite; toolbar?: React.ReactNode }) {
  const lines = (q.lines ?? []).filter((l) => l.name);
  const sums = quoteSums(lines, q.vat);
  return (
    <div className="quote-pdf min-h-screen bg-neutral-200 py-6 print:bg-white print:py-0">
      <style>{`
        @page { size: A4; margin: 14mm 12mm; }
        @media print { .no-print { display: none !important; } .sheet { box-shadow: none !important; margin: 0 !important; width: auto !important; min-height: 0 !important; padding: 0 !important; } }
        .quote-pdf { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1b1d1f; }
        .quote-pdf tr { break-inside: avoid; }
      `}</style>
      {toolbar}
      <div className="sheet mx-auto w-[210mm] min-h-[297mm] bg-white px-[14mm] py-[14mm] shadow-xl">
        {/* Başlıq */}
        <div className="flex items-start justify-between border-b-4 border-[#0066ff] pb-5">
          <div>
            <img src="/brand/logo-light.png" alt="Lemur Group" className="h-14 w-auto" />
            <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-neutral-500">Promo · Poliqrafiya · Reklam</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#0066ff]">Qiymət təklifi</p>
            <p className="font-mono text-2xl font-bold">{q.number}</p>
            <p className="text-sm text-neutral-600">Tarix: {azDate(q.quote_date)}</p>
          </div>
        </div>

        {/* Müştəri */}
        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Müştəri</p>
            <p className="mt-1 text-base font-bold">{q.client || "—"}</p>
            {q.contact && <p>{q.contact}</p>}
            {q.phone && <p>{q.phone}</p>}
            {q.email && <p>{q.email}</p>}
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Təklif verən</p>
            <p className="mt-1 text-base font-bold">{site.name}</p>
            {site.phone && <p>{site.phone}</p>}
            {site.email && <p>{site.email}</p>}
            {site.address && <p>{site.address}</p>}
          </div>
        </div>

        {/* Məhsullar */}
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#1b1d1f] text-left text-xs uppercase tracking-wider text-white">
              <th className="w-10 px-3 py-2.5">№</th>
              <th className="px-3 py-2.5">Məhsul və texniki xüsusiyyətlər</th>
              <th className="w-24 px-3 py-2.5 text-right">Miqdar</th>
              <th className="w-28 px-3 py-2.5 text-right">Vahid qiymət</th>
              <th className="w-32 px-3 py-2.5 text-right">Məbləğ</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.key} className={i % 2 ? "bg-[#eef4ff]" : ""}>
                <td className="px-3 py-3 align-top text-neutral-500">{i + 1}</td>
                <td className="px-3 py-3 align-top">
                  <p className="font-semibold">{l.name}</p>
                  {l.specs && <p className="mt-0.5 whitespace-pre-line text-xs text-neutral-600">{l.specs}</p>}
                </td>
                <td className="px-3 py-3 text-right align-top">{l.qty} {l.unit}</td>
                <td className="px-3 py-3 text-right align-top">{money(l.sale)} ₼</td>
                <td className="px-3 py-3 text-right align-top font-semibold">{money(l.sale * l.qty)} ₼</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cəmi */}
        <div className="mt-4 flex justify-end">
          <div className="w-72 text-sm">
            <div className="flex justify-between border-b border-neutral-200 py-1.5"><span className="text-neutral-600">Cəmi (ƏDV-siz)</span><span>{money(sums.subtotal)} ₼</span></div>
            {q.vat && <div className="flex justify-between border-b border-neutral-200 py-1.5"><span className="text-neutral-600">ƏDV 18%</span><span>{money(sums.vat)} ₼</span></div>}
            <div className="mt-2 flex justify-between rounded bg-[#0066ff] px-3 py-2.5 text-base font-bold text-white"><span>Ümumi məbləğ</span><span>{money(sums.total)} ₼</span></div>
            {!q.vat && <p className="mt-1 text-right text-[11px] text-neutral-500">Qiymətlərə ƏDV daxil deyil</p>}
          </div>
        </div>

        {q.note && (
          <div className="mt-8 rounded-lg border-l-4 border-[#0066ff] bg-neutral-50 px-4 py-3 text-sm">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Qeyd</p>
            <p className="whitespace-pre-line">{q.note}</p>
          </div>
        )}

        <div className="mt-12 flex items-end justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
          <p>Təklif üçün təşəkkür edirik. Suallarınız üçün bizimlə əlaqə saxlayın.</p>
          <p className="font-semibold text-[#0066ff]">lemur group</p>
        </div>
      </div>
    </div>
  );
}

