"use client";

export function PdfToolbar({ number }: { number: string }) {
  return (
    <div className="no-print mx-auto mb-4 flex w-[210mm] items-center justify-between">
      <button type="button" onClick={() => history.back()} className="text-sm font-semibold text-neutral-600 underline">Geri</button>
      <button
        type="button"
        onClick={() => { const t = document.title; document.title = `Lemur-teklif-${number}`; window.print(); document.title = t; }}
        className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]"
      >
        PDF kimi saxla
      </button>
    </div>
  );
}
