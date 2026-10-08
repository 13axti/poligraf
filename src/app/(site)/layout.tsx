import Link from "next/link";
import { site } from "@/lib/site-config";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SocialIcons } from "@/components/SocialIcons";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-white">P</span>
          Poligraf
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-brand">Ana səhifə</Link>
          <Link href="/kataloq" className="hover:text-brand">Kataloq</Link>
          <Link href="/#nece" className="hover:text-brand">Necə işləyir</Link>
          <Link href="/#musteriler" className="hover:text-brand">Müştərilər</Link>
          <Link href="/#elaqe" className="hover:text-brand">Əlaqə</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a href={site.phoneHref} className="hidden text-sm font-semibold lg:block">
            {site.phone}
          </a>
          <Link
            href="/kataloq"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
          >
            Sifariş ver
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer id="elaqe" className="scroll-mt-20 bg-accent px-4 pt-4">
      <div className="mx-auto max-w-7xl rounded-t-[2.5rem] bg-foreground px-6 py-14 text-white sm:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Layihəni birlikdə
              <br />
              həyata keçirək.
            </p>
            <a
              href={site.phoneHref}
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-foreground transition hover:bg-accent hover:text-white"
            >
              {site.phone}
            </a>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">Əlaqə</p>
            <p>{site.email}</p>
            <p>{site.address}</p>
            <p>{site.hours}</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest">Sosial şəbəkələr</p>
            <SocialIcons />
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© 2026 {site.name}. Bütün hüquqlar qorunur.</p>
          <p>Loqonu yüklə · nümunəni gör · qiyməti öyrən · sifariş ver</p>
        </div>
      </div>
    </footer>
  );
}
