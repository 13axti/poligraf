import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/data";
import { GROUP_ORDER, groupOf } from "@/lib/catalog-groups";
import { CategoryNav, type NavGroup } from "./CategoryNav";

/** Kataloq çərçivəsi: solda kateqoriya indeksi, sağda cari bölmənin məzmunu */
export async function CatalogShell({ active, children }: { active?: string; children: React.ReactNode }) {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);
  const count = new Map<string, number>();
  for (const p of products) if (p.categoryId) count.set(p.categoryId, (count.get(p.categoryId) ?? 0) + 1);

  const groups: NavGroup[] = GROUP_ORDER.map((title) => ({
    title,
    items: categories
      .filter((c) => groupOf(c.slug) === title)
      .map((c) => ({ slug: c.slug, name: c.name, count: count.get(c.id) ?? 0 })),
  })).filter((g) => g.items.length);

  const activeName = categories.find((c) => c.slug === active)?.name;
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[17rem_1fr] lg:gap-10 lg:py-12">
      <CategoryNav groups={groups} active={active} activeName={activeName} total={products.length} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EmptyCategory({ name }: { name?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--hair)] px-6 py-14 text-center">
      <p className="text-xl font-bold">{name ? `${name} üçün məhsullar tezliklə əlavə olunur` : "Hələ məhsul əlavə olunmayıb"}</p>
      <p className="mx-auto mt-2 max-w-md text-neutral-600">
        İndi nə lazım olduğunu yazın, qiymət və nümunə ilə 1 saat ərzində cavab verək.
      </p>
      <Link href="/sifaris#xususi" className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">
        Xüsusi istək göndər
      </Link>
    </div>
  );
}
