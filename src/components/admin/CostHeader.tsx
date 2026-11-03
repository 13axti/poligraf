import Link from "next/link";

/** Qiymət bazası, Təchizatçılar və Qiymət təklifləri səhifələrinin ümumi başlığı */
export function CostHeader({ title = "Qiymət bazası", sub, msg, links, action }: { title?: string; sub?: string; msg?: string; links?: { href: string; label: string }[]; action?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {sub && <p className="mt-1 max-w-3xl text-sm text-neutral-500">{sub}</p>}
        </div>
        {action}
      </div>
      {links && (
        <div className="flex flex-wrap gap-2 text-sm">
          {links.map((l) => <Link key={l.href} href={l.href} className="rounded-md bg-white px-3 py-1.5 font-semibold text-neutral-700 hover:bg-[var(--line)]">{l.label}</Link>)}
        </div>
      )}
      {msg && <p className="rounded-lg bg-white px-4 py-3 text-sm font-semibold ring-1 ring-[#ff5a1f]/30">{msg}</p>}
    </div>
  );
}

export function CostTablesMissing() {
  return (
    <p className="rounded-xl bg-white p-5 text-accent">
      Cədvəl tapılmadı. Supabase → SQL Editor-da <b>supabase/schema.sql</b> faylının yeni hissəsini işlədin.
    </p>
  );
}

export const COST_LINKS = [
  { href: "/admin/costs", label: "Bütün məhsullar" },
  { href: "/admin/costs/import", label: "Excel import" },
  { href: "/admin/costs/settings", label: "Forma ayarları, kateqoriyalar, məzənnə" },
];

/** "+ əlavə et" düyməsi: açılan menyu (Manual / Excel və s.) */
export function AddMenu({ label, items }: { label: string; items: { href: string; label: string; hint?: string }[] }) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md bg-[#ff5a1f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04810]">{label}</summary>
      <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-[var(--line)]">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="block px-4 py-3 hover:bg-[var(--surface)]">
            <span className="block text-sm font-semibold">{i.label}</span>
            {i.hint && <span className="block text-xs text-neutral-500">{i.hint}</span>}
          </Link>
        ))}
      </div>
    </details>
  );
}

export const costInput = "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[#ff5a1f]";
export const costLabel = "mb-1 block text-xs font-semibold text-neutral-500";
