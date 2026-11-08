import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { phoneHref, SITE_URL } from "@/lib/site-config";
import type { Product } from "@/lib/types";

export const metadata = {
  title: "Reklam işləri Bakıda: banner, vinil, roll-up, lövhə və çap",
  description:
    "Bakıda reklam işləri: banner və setka banner çapı, vinil, roll-up, brandwall, reklam lövhələri, vizit kart, flayer və buklet. Qiyməti saytda seçimlərə görə dərhal hesablayın və onlayn sifariş verin.",
  alternates: { canonical: "/reklam-isleri" },
};

/** Xidmət → saytdakı kalkulyatorlu məhsul (slug) və ya kateqoriya */
const SERVICES: { title: string; text: string; slug?: string; cat?: string }[] = [
  { title: "Banner çapı", text: "Fasad, tədbir və mağaza üçün istənilən ölçüdə banner. Qiymət kvadratmetrlə hesablanır.", slug: "banner-capi-kalkulyator" },
  { title: "Setka banner", text: "Külək keçirən torlu banner: bina fasadları və hasarlar üçün.", slug: "setka-banner-capi-kalkulyator" },
  { title: "Vinil çapı", text: "Vitrin, şüşə və divar üçün öz-özünə yapışan vinil.", slug: "vinil-capi-kalkulyator" },
  { title: "Roll-up", text: "Sərgi və təqdimatlar üçün qatlanan stend, müxtəlif ölçülərdə.", slug: "roll-up-kalkulyator" },
  { title: "Brandwall", text: "Tədbir və fotozonalar üçün karkaslı arxa fon, montaj ilə.", slug: "brandwall-kalkulyator" },
  { title: "Reklam lövhələri", text: "İşıqlı və işıqsız lövhələr, məlumat lövhələri.", cat: "reklam-lovheleri" },
  { title: "Vizit kart", text: "Ekonomdan premiuma qədər kart növləri, laminasiya və yuvarlaq künclər.", slug: "vizit-kartlar-kalkulyator" },
  { title: "Flayer və buklet", text: "Reklam paylama materialları: müxtəlif ölçü, kağız və qatlama növləri.", slug: "flayerler-kalkulyator" },
  { title: "Promo məhsullar", text: "Loqolu qələm, bloknot, fincan, çanta və digər korporativ hədiyyələr.", cat: "diger-promo" },
];

const FAQ = [
  { q: "Qiyməti necə öyrənə bilərəm?", a: "Hər məhsul səhifəsində kalkulyator var: ölçü, material, tiraj və digər seçimləri seçdikdə yekun məbləğ dərhal görünür. Kalkulyatorda olmayan işlər üçün xüsusi sorğu göndərə bilərsiniz." },
  { q: "Sifariş nə qədər müddətə hazırlanır?", a: "Müddət məhsula görə dəyişir və kalkulyatorda göstərilir. Əksər məhsullarda təcili hazırlanma (növbəti iş günü) seçimi də var." },
  { q: "Çatdırılma var?", a: "Ofisdən təhvil ala bilərsiniz, Bakı daxilində və rayonlara çatdırılma da var. Çatdırılmanın qiyməti kalkulyatorda ayrıca göstərilir." },
  { q: "Dizaynım yoxdursa nə edim?", a: "Kalkulyatorda dizayn xidmətini seçin, dizaynı biz hazırlayaq. Çap yalnız siz eskizi təsdiqlədikdən sonra başlayır." },
  { q: "Loqomun məhsulda necə görünəcəyini əvvəlcədən görə bilərəm?", a: "Bəli. Məhsul səhifəsində loqonuzu yükləyib məhsul üzərində nümunəni görə bilərsiniz." },
];

const fromPrice = (p: Product) => {
  if (p.pricingModel === "per_sqm") return p.pricePerSqm ? `${p.pricePerSqm.toFixed(2)} ₼/m²-dən` : "";
  const t = p.priceTiers?.length ? Math.min(...p.priceTiers.map((x) => x.unitPrice)) : 0;
  return t ? `${t.toFixed(t < 1 ? 3 : 2)} ₼/əd-dən` : "";
};

export default async function AdsPage() {
  const [products, cats, site] = await Promise.all([getAllProducts(), getCategories(), getSettings()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const serviceLd = {
    "@context": "https://schema.org", "@type": "Service", serviceType: "Reklam işləri və çap", areaServed: "Bakı, Azərbaycan",
    provider: { "@type": "LocalBusiness", name: site.name, url: SITE_URL, telephone: site.phone }, url: `${SITE_URL}/reklam-isleri`,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 text-[var(--ink)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <nav className="mb-6 text-sm text-[var(--ink-soft)]"><Link href="/" className="hover:text-brand">Ana səhifə</Link> / <span className="text-brand">Reklam işləri</span></nav>

      <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">Reklam işləri Bakıda</h1>
      <p className="mt-5 max-w-3xl text-lg text-[var(--ink-soft)]">
        Banner, vinil, roll-up və lövhələrdən vizit kart və promo məhsullara qədər bütün reklam və çap işləri bir yerdə.
        Qiyməti saytda seçimlərə görə dərhal hesablayın, loqonuzu məhsul üzərində görün və sifarişi onlayn verin.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href={phoneHref(site.phone)} className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">{site.phone}</a>
        <Link href="/sifaris" className="rounded-full bg-[var(--card)] px-6 py-3 font-semibold ring-1 ring-[var(--hair)] hover:ring-brand">Xüsusi sorğu göndər</Link>
      </div>

      <h2 className="mt-16 text-3xl font-extrabold tracking-tight">Xidmətlər</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const p = s.slug ? bySlug.get(s.slug) : undefined;
          const c = s.cat ? catBySlug.get(s.cat) : undefined;
          const href = p ? `/mehsul/${p.slug}` : c ? `/kataloq/${c.slug}` : "/kataloq";
          return (
            <Link key={s.title} href={href} className="group rounded-3xl bg-[var(--card)] p-6 ring-1 ring-[var(--hair)] transition hover:-translate-y-0.5 hover:ring-brand">
              <h3 className="text-xl font-bold group-hover:text-brand">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{s.text}</p>
              <p className="mt-4 text-sm font-semibold text-brand">{p ? fromPrice(p) || "Qiyməti hesabla" : "Məhsullara bax"} →</p>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-16 text-3xl font-extrabold tracking-tight">Sifariş necə verilir</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-4">
        {[["Məhsulu seçin", "Kataloqdan və ya yuxarıdakı xidmətlərdən."], ["Qiyməti hesablayın", "Ölçü, material və tirajı seçin, məbləğ dərhal görünür."], ["Loqonu yükləyin", "Nümunəni məhsul üzərində görün."], ["Sifariş verin", "Eskizi təsdiqləyirsiniz, sonra çapa başlayırıq."]].map(([t, d], i) => (
          <li key={t} className="rounded-3xl bg-[var(--surface)] p-5">
            <span className="text-sm font-bold text-brand">{i + 1}</span>
            <p className="mt-1 font-bold">{t}</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{d}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-16 text-3xl font-extrabold tracking-tight">Tez-tez verilən suallar</h2>
      <div className="mt-6 divide-y divide-[var(--hair)] rounded-3xl bg-[var(--card)] ring-1 ring-[var(--hair)]">
        {FAQ.map((f) => (
          <details key={f.q} className="group px-6 py-4">
            <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}<span className="float-right text-brand transition group-open:rotate-45">+</span></summary>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
