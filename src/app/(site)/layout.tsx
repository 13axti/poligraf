import Link from "next/link";
import { Suspense } from "react";
import { getSettings } from "@/lib/settings";
import { LogoVideo } from "@/components/LogoVideo";
import { phoneHref } from "@/lib/site-config";
import { ScrollProgress } from "@/components/ScrollProgress";
import { DevPreviewLink } from "@/components/DevPreviewLink";
import { MotionProvider } from "@/components/MotionProvider";
import { CatalogMenu } from "@/components/CatalogMenu";
import { getCategories } from "@/lib/data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { SocialIcons } from "@/components/SocialIcons";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <div className="site-dark relative isolate flex min-h-screen flex-1 flex-col">
      {/* Bütün səhifənin arxa fonunda sağa-sola süzən ellipslər */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob-a absolute left-0 top-[28%] h-[26rem] w-[36rem] rounded-full bg-brand/50 blur-[110px]" />
        <div className="blob-b absolute right-0 top-[28%] h-[26rem] w-[32rem] rounded-full bg-[#e4e4ea]/30 blur-[110px]" />
        <div className="blob-c absolute bottom-[-6%] left-[25%] h-[20rem] w-[30rem] rounded-full bg-[#ff8a4a]/30 blur-[110px]" />
      </div>
      <ScrollProgress />
      <Suspense fallback={<HeaderShell />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <DevPreviewLink href="/coming-soon" className="bottom-5 right-5">
        Tezliklə səhifəsinə bax →
      </DevPreviewLink>
      </div>
    </MotionProvider>
  );
}

function HeaderShell() {
  return <header className="sticky top-0 z-40 h-[65px] bg-[var(--header-bg)] backdrop-blur-lg" />;
}

async function Header() {
  const [site, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" aria-label={site.name} className="flex items-center">
          <LogoVideo label={site.name} className="h-9 md:h-10" />
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-brand/30 bg-[var(--tint)] p-1 text-sm font-medium md:flex">
          <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-brand hover:text-white">Ana səhifə</Link>
          <CatalogMenu categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
          <Link href="/qiymetler" className="rounded-full px-4 py-2 transition hover:bg-brand hover:text-white">Qiymətlər</Link>
          {/* Kampaniya linki müvəqqəti söndürülüb */}
          <Link href="/#musteriler" className="rounded-full px-4 py-2 transition hover:bg-brand hover:text-white">Müştərilər</Link>
          <Link href="/#elaqe" className="rounded-full px-4 py-2 transition hover:bg-brand hover:text-white">Əlaqə</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a href={phoneHref(site.phone)} className="hidden text-sm font-semibold lg:block">
            {site.phone}
          </a>
          <ThemeToggle />
          <Link
            href="/sifaris"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
          >
            Sifariş ver
          </Link>
          <MobileMenu phone={site.phone} phoneHref={phoneHref(site.phone)} />
        </div>
      </div>
    </header>
  );
}

async function Footer() {
  const site = await getSettings();
  return (
    <footer id="elaqe" className="scroll-mt-20 px-4 pt-4">
      <div className="mx-auto max-w-7xl rounded-t-[2.5rem] bg-black px-6 py-14 text-white sm:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Layihəni birlikdə
              <br />
              həyata keçirək.
            </p>
            <a
              href={phoneHref(site.phone)}
              className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-black transition hover:bg-white"
            >
              {site.phone}
            </a>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">Əlaqə</p>
            {site.email && <p>{site.email}</p>}
            {site.address && <p>{site.address}</p>}
            {site.hours && <p>{site.hours}</p>}
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest">Sosial şəbəkələr</p>
            <SocialIcons socials={site.socials} />
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
