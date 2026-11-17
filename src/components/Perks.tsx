const icons = {
  price: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
};

const perks = [
  { icon: "price", t: "Dərhal qiymət", d: "Sayı yaz, qiymət saniyələr içində çıxsın." },
  { icon: "eye", t: "Dizayn təsdiqi", d: "Çapdan əvvəl eskizi təsdiqinizə göndəririk." },
  { icon: "shield", t: "Şəffaf qiymət", d: "Gizli ödəniş yoxdur, hər şey aydındır." },
  { icon: "truck", t: "Sürətli çatdırılma", d: "Bakı üzrə və regionlara." },
] as const;

/** Sürüşdürdükcə kartlar bir-birinin üstünə qalaqlanır (sticky); hər biri azca əyri, sanki stola atılıb */
const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export function Perks() {
  return (
    <section className="px-4 pb-14 pt-4 text-[var(--ink)]">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Niyə Lemur?</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Çapı rahat, qiyməti aydın, nəticəsi <span className="text-brand">gözəl</span>.
          </h2>
          <p className="mt-4 max-w-sm text-[var(--ink-soft)]">Sifarişdən çatdırılmaya qədər hər addımda sizinləyik.</p>
        </div>
        <div className="relative">
          {perks.map((p, i) => (
            <div key={p.t} className="sticky pb-6" style={{ top: `${6 + i * 1.25}rem` }}>
              <div className={`${TILT[i]} overflow-hidden rounded-3xl border border-[var(--hair)] bg-[var(--card)] shadow-2xl shadow-black/30 transition duration-500 hover:rotate-0`}>
                <div className="flex items-center justify-between bg-brand px-5 py-3 text-white">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <h3 className="text-lg font-extrabold uppercase tracking-wide">{p.t}</h3>
                  <span className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div className="flex flex-col items-center gap-4 px-6 py-8 text-center sm:py-10">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--hair)] text-brand">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {icons[p.icon]}
                    </svg>
                  </span>
                  <p className="max-w-xs text-[var(--ink-soft)]">{p.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
