import { Reveal } from "./Reveal";

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
  { icon: "eye", t: "Canlı nümunə", d: "Loqonu məhsulda çapdan əvvəl gör." },
  { icon: "shield", t: "Şəffaf qiymət", d: "Gizli ödəniş yoxdur, hər şey aydındır." },
  { icon: "truck", t: "Sürətli çatdırılma", d: "Bakı üzrə və regionlara." },
] as const;

export function Perks() {
  return (
    <section className="px-4 pb-14 pt-4 text-white">
      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {perks.map((p, i) => (
          <Reveal key={p.t} delay={i * 90} className="h-full">
            <div className="group flex h-full items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-white/10">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand transition duration-300 group-hover:bg-brand group-hover:text-black">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-none stroke-current"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {icons[p.icon]}
                </svg>
              </span>
              <div>
                <h3 className="font-bold leading-tight">{p.t}</h3>
                <p className="mt-1 text-sm text-white/75 transition duration-300 group-hover:text-white/90">
                  {p.d}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
