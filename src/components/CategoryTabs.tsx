import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryTabs({
  categories,
  activeId,
}: {
  categories: Category[];
  activeId?: string;
}) {
  const base = "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition";
  const on = "bg-foreground text-white";
  const off = "bg-surface text-neutral-700 hover:bg-foreground hover:text-white";
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link href="/kataloq" className={`${base} ${!activeId ? on : off}`}>
        Hamısı
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/kataloq/${c.slug}`}
          className={`${base} ${c.id === activeId ? on : off}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
