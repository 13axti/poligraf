import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { getSettings } from "@/lib/settings";
import { phoneHref } from "@/lib/site-config";
import { Reveal, SplitHeading } from "@/components/Reveal";
import { HomeHero } from "@/components/HomeHero";
// T-shirt kampaniyası (dizayn göndər, gəliri böl) müvəqqəti söndürülüb. Sonra qaytarmaq üçün:
// import { Campaign } from "@/components/Campaign";
// import { Suspense } from "react";
import { Perks } from "@/components/Perks";

/** "Rəqəmsaldan çapa" blokunun plitələri: Lemur Group-un öz brend fotoları (public/promo/) */
const BENTO = [
  { name: "Bannerlər", href: "/kataloq/bannerler", image: "/promo/banner-stend.webp" },
  { name: "Bloknotlar", href: "/kataloq/bloknotlar-deri-uzlu", image: "/promo/bloknotlar.webp" },
  { name: "Çantalar və paketlər", href: "/kataloq/cantalar", image: "/promo/paketler.webp" },
  { name: "Təqvimlər", href: "/kataloq/teqvimler", image: "/promo/teqvim.webp" },
];

/** "İşlərimiz" bloku: image (şəkil) və ya video (mp4) yazın, ikisi də boşdursa yer tutucu görünür. Fayllar public/works/ qovluğunda. */
const WORKS: { title: string; tag: string; image?: string; video?: string }[] = [
  { title: "Fasad banneri", tag: "Banner" },
  { title: "Korporativ hədiyyə dəsti", tag: "Promo" },
  { title: "Vitrin vinili", tag: "Vinil" },
  { title: "Sərgi stendi", tag: "Roll-up" },
  { title: "Brend paketləri", tag: "Qablaşdırma" },
  { title: "Vizit kart və blanklar", tag: "Mətbəə" },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const site = await getSettings();
  // Zolaq boş görünməsin: ən azı 8 element olana qədər təkrarla, sonra sonsuz dövr üçün 2 dəfə
  const base = site.clients.length
    ? Array.from({ length: Math.max(site.clients.length, 8) }, (_, i) => site.clients[i % site.clients.length])
    : [];
  const loop = [...base, ...base];

  return (
    <>
      {/* HERO */}
      <HomeHero
        items={featured.map((p) => ({ id: p.id, name: p.name, image: p.image }))}
        phone={site.phone}
        phoneHref={phoneHref(site.phone)}
      />
      <Perks />

      {/* İŞLƏRİMİZ */}
      <section id="islerimiz" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Portfolio</p>
            <SplitHeading text="İşlərimiz" className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl" />
          </div>
          <Link href="/sifaris" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand">
            Sizə də edək
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {WORKS.map((w, i) => (
            <Reveal key={w.title} variant="scale" delay={i * 90} className={i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
              <div className={`group relative h-full overflow-hidden rounded-[2rem] bg-surface ${i === 0 ? "min-h-72 lg:min-h-[34rem]" : "aspect-[4/3]"}`}>
                {w.video ? (
                  <video src={w.video} poster={w.image} autoPlay muted loop playsInline preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : w.image ? (
                  <Image src={w.image} alt={w.title} fill sizes="(max-width:1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-3 grid place-items-center rounded-[1.5rem] border-2 border-dashed border-neutral-300 text-sm text-neutral-400">Şəkil tezliklə</div>
                )}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{w.tag}</span>
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-bold">{w.title}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BENTO */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col justify-center rounded-[2rem] p-4 lg:p-8">
            <SplitHeading
              text="Rəqəmsaldan çapa asanlıqla"
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl"
            />
            <p className="mt-4 max-w-xs text-neutral-600">
              Promo məhsullardan banner və vinil kəsimə qədər hər şey bir yerdə.
            </p>
            <Link
              href="/kataloq"
              className="mt-6 w-fit rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white hover:bg-brand"
            >
              Kataloq
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:grid-rows-2">
            {BENTO.map((c, i) => (
              <Reveal
                key={c.href}
                variant="scale"
                delay={i * 110}
                className={i === 0 ? "sm:col-span-2 sm:row-span-2" : i === 3 ? "sm:col-span-2" : ""}
              >
              <Link
                href={c.href}
                className="group relative block h-full min-h-48 overflow-hidden rounded-[2rem] bg-surface"
              >
                <Image src={c.image} alt={c.name} fill sizes="(max-width:640px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute bottom-4 left-4 rounded-full bg-card px-4 py-2 text-sm font-bold">
                  {c.name}
                </span>
              </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* POPULYAR */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <SplitHeading text="Seçilmiş məhsullar" className="text-4xl font-extrabold tracking-tight" />
          <Link href="/kataloq" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand">
            Hamısı
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* MÜŞTƏRİLƏR */}
      {loop.length > 0 && (
      <section id="musteriler" className="scroll-mt-20 pb-20">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Bizə güvənən şirkətlər
        </p>
        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-4">
            {loop.map((c, i) => (
              <div
                key={i}
                className="grid h-20 min-w-48 place-items-center rounded-2xl bg-surface px-6 text-lg font-extrabold text-neutral-500"
              >
                {c.logo ? (
                  <Image src={c.logo} alt={c.name} width={120} height={40} className="h-10 w-auto object-contain" />
                ) : (
                  c.name
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* T-SHIRT KAMPANİYASI: müvəqqəti söndürülüb. Qaytarmaq üçün yuxarıdakı import-ları açın və bunu əlavə edin:
          <Suspense fallback={<div id="kampaniya" className="min-h-96" />}><Campaign /></Suspense> */}
    </>
  );
}
