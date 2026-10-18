import Image from "next/image";
import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { DevPreviewLink } from "@/components/DevPreviewLink";
import { MotionProvider } from "@/components/MotionProvider";
import { Reveal } from "@/components/Reveal";
import { SocialIcons } from "@/components/SocialIcons";
import { getSettings } from "@/lib/settings";
import { BRAND } from "@/lib/site-config";

export const metadata = {
  title: "Tezliklə",
  description: `${BRAND}: poliqrafiya, promo məhsullar, reklam və vinil kəsim. Yeni saytımız tezliklə açılır.`,
};

const ORANGE = "#ff7a1a";
const chips = ["Poliqrafiya", "Promo hədiyyələr", "Reklam & Banner", "Vinil kəsim"];

async function Contact() {
  const s = await getSettings();
  return (
    <div className="space-y-5">
      <p className="max-w-md text-lg font-semibold leading-snug text-white sm:text-xl">
        Öz sifarişini yarat, <span style={{ color: ORANGE }}>biz hazırlayaq</span>{" "}
        <span aria-hidden>🧡</span>
      </p>
      <p className="max-w-md text-sm leading-relaxed text-white/60">
        Fikrini göndər, qalan hər şeyi, dizayndan çapa və çatdırılmaya qədər, bizə burax. Hər detala sevgi ilə yanaşırıq.
      </p>
      <SocialIcons socials={s.socials} />
    </div>
  );
}

export default function ComingSoonPage() {
  // Açılış tarixi məlumdursa: NEXT_PUBLIC_LAUNCH_DATE=2026-12-01T10:00:00+04:00
  const launch = process.env.NEXT_PUBLIC_LAUNCH_DATE;

  return (
    <MotionProvider>
      <main className="relative isolate flex min-h-screen overflow-hidden bg-black text-white">
        {/* Şəkil: böyük ekranda sağda "üzür" (şəklin fonu da qaradır, ona görə kənar görünmür) */}
        <div className="absolute inset-0 -z-20 lg:left-auto lg:w-[88%]">
          <Image
            src="/coming-soon/lemur-v2.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 88vw, 100vw"
            className="object-cover object-[78%_center] opacity-70 lg:object-contain lg:object-right-bottom lg:opacity-100"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/70 to-black/10 lg:via-black/30 lg:to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-transparent to-black/40" />
        {/* narıncı işıq */}
        <div className="pointer-events-none absolute -left-40 top-1/4 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#ff7a1a]/20 blur-[120px]" />

        <div className="mx-auto flex w-full max-w-[90rem] flex-col justify-between px-6 py-8 sm:px-12 sm:py-10 lg:px-20">
          <div />

          {/* mərkəz: mətn */}
          <div className="max-w-xl py-14">
            <Reveal delay={100}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ff7a1a]/40 bg-[#ff7a1a]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#ff9a4a]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff7a1a] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff7a1a]" />
                </span>
                Yeni sayt hazırlanır
              </span>
            </Reveal>

            <Reveal delay={200}>
              <h1 className="mt-6 text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-8xl">
                Tezliklə
                <span style={{ color: ORANGE }}>.</span>
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-5 text-xl font-semibold text-[#ff9a4a] sm:text-2xl">
                Loqonu yüklə, nəticəni gör, sifariş ver.
              </p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                {BRAND}: poliqrafiya, promo məhsullar, reklam və vinil kəsim. Məhsul üzərində loqonu canlı yoxla, qiyməti dərhal öyrən. Çox yaxında sizinləyik.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <ul className="mt-7 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur transition hover:border-[#ff7a1a] hover:text-[#ff9a4a]"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>

            {launch && (
              <Reveal delay={450} className="mt-8">
                <Countdown to={launch} />
              </Reveal>
            )}

            <Reveal delay={500} className="mt-9">
              <Suspense fallback={<div className="h-12" />}>
                <Contact />
              </Suspense>
            </Reveal>
          </div>

          {/* aşağı */}
          <p className="text-xs text-white/40">© 2026 {BRAND}. Bütün hüquqlar qorunur.</p>
        </div>
        <DevPreviewLink href="/" className="right-5 top-5">
          ← Saytın özünə qayıt
        </DevPreviewLink>
      </main>
    </MotionProvider>
  );
}
