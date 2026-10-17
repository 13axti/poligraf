import Link from "next/link";
import { Suspense } from "react";
import { getSettings } from "@/lib/settings";
import { phoneHref } from "@/lib/site-config";
import { ScrollProgress } from "@/components/ScrollProgress";
import { DevPreviewLink } from "@/components/DevPreviewLink";
import { MotionProvider } from "@/components/MotionProvider";
import { SocialIcons } from "@/components/SocialIcons";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
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
    </MotionProvider>
  );
}

function HeaderShell() {
  return <header className="sticky top-0 z-40 h-[65px] bg-white/85 backdrop-blur-lg" />;
}

async function Header() {
  const site = await getSettings();
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-white">
            {site.name.charAt(0)}
          </span>
          {site.name}
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-brand">Ana səhifə</Link>
          <Link href="/kataloq" className="hover:text-brand">Kataloq</Link>
          <Link href="/#nece" className="hover:text-brand">Necə işləyir</Link>
          <Link href="/#musteriler" className="hover:text-brand">Müştərilər</Link>
          <Link href="/#elaqe" className="hover:text-brand">Əlaqə</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a href={phoneHref(site.phone)} className="hidden text-sm font-semibold lg:block">
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

async function Footer() {
  const site = await getSettings();
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
              href={phoneHref(site.phone)}
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-foreground transition hover:bg-accent hover:text-white"
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
