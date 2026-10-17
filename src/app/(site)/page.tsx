import Image from "next/image";
import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { getSettings } from "@/lib/settings";
import { phoneHref } from "@/lib/site-config";
import { Reveal, SplitHeading } from "@/components/Reveal";
import { HomeHero } from "@/components/HomeHero";
import { StickySteps } from "@/components/StickySteps";
import { Perks } from "@/components/Perks";

export default async function HomePage() {
  const categories = await getCategories();
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
            {categories.slice(0, 4).map((c, i) => (
              <Reveal
                key={c.id}
                variant="scale"
                delay={i * 110}
                className={i === 0 ? "sm:col-span-2 sm:row-span-2" : i === 3 ? "sm:col-span-2" : ""}
              >
              <Link
                href={`/kataloq/${c.slug}`}
                className="group relative block h-full min-h-48 overflow-hidden rounded-[2rem] bg-surface"
              >
                {c.image && (
                  <Image src={c.image} alt={c.name} fill sizes="(max-width:640px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105" />
                )}
                <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-bold">
                  {c.name}
                </span>
              </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* NECƏ İŞLƏYİR — sticky */}
      <section id="nece" className="scroll-mt-16 pb-12">
        <StickySteps />
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
    </>
  );
}
