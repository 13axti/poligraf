import Link from "next/link";

/** Header-də "Kataloq" üzərinə gələndə açılan kateqoriya menyusu (yalnız CSS, JS lazım deyil) */
export function CatalogMenu({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <div className="group relative">
      <Link
        href="/kataloq"
        className="flex items-center gap-1.5 transition hover:text-brand group-hover:text-brand group-focus-within:text-brand"
      >
        Kataloq
        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-current transition group-hover:rotate-180 group-focus-within:rotate-180" strokeWidth={2} aria-hidden>
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* pt-4 boşluğu siçan menyudan keçəndə panelin bağlanmasının qarşısını alır */}
      <div className="invisible absolute left-1/2 top-full z-50 w-[min(62rem,92vw)] -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="max-h-[75vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl shadow-black/15 ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-4">
            <p className="text-xs font-bold text-neutral-500">Kateqoriyalar</p>
            <Link href="/kataloq" className="text-sm font-semibold text-brand hover:underline">
              Bütün məhsullar →
            </Link>
          </div>
          <ul className="columns-2 gap-6 lg:columns-4">
            {categories.map((c) => (
              <li key={c.slug} className="break-inside-avoid">
                <Link
                  href={`/kataloq/${c.slug}`}
                  className="block rounded-xl px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-surface hover:text-brand"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
