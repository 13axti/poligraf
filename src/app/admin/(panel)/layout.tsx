import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logout } from "../actions";

const nav = [
  { href: "/admin", label: "Ümumi" },
  { href: "/admin/orders", label: "Sifarişlər" },
  { href: "/admin/products", label: "Məhsullar" },
  { href: "/admin/categories", label: "Kateqoriyalar" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-3 md:flex-row md:p-6">
      <aside className="flex shrink-0 flex-col rounded-3xl bg-foreground p-4 text-white md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-60">
        <Link href="/admin" className="mb-4 flex items-center gap-2 px-2 text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm">P</span>
          Admin
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/50 hover:text-white md:mt-4">
            Sayta bax ↗
          </Link>
        </nav>
        <div className="mt-3 border-t border-white/10 pt-3 md:mt-auto">
          <p className="truncate px-2 text-xs text-white/50">{user.email}</p>
          <form action={logout}>
            <button className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20">
              Çıxış
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
