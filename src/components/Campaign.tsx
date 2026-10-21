import { getApprovedDesigns } from "@/lib/designs";
import { DESIGN_PRICE, DESIGNER_SHARE } from "@/lib/designs-shared";
import { DesignGallery } from "./DesignGallery";
import { DesignUploadForm } from "./DesignUploadForm";
import { Reveal } from "./Reveal";

const steps = [
  { t: "Dizaynını yüklə", d: "Öz t-shirt dizaynını və ya hazır t-shirt şəklini göndər." },
  { t: "Biz baxırıq", d: "Komandamız yoxlayır, hər şey qaydasındadırsa saytda yayımlayır." },
  { t: "İnsanlar baxır, alır", d: `Hər t-shirt ${DESIGN_PRICE} ₼. Dizaynın nə qədər çox baxılıb satılırsa, o qədər qazanırsan.` },
  { t: `Gəlirin ${DESIGNER_SHARE}%-i sənindir`, d: "Baxış və satış sayına görə gəlirin 10%-ni sənə təqdim edirik." },
];

export async function Campaign() {
  const designs = await getApprovedDesigns();
  return (
    <section id="kampaniya" className="scroll-mt-20 px-4 pb-24 pt-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">T-shirt kampaniyası</p>
          <h2 className="mt-2 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Dizaynını sən çək, <span className="text-brand">qazancı</span> bölüşək.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">
            T-shirt dizaynını göndər. Təsdiqlənəndən sonra saytda satılır. Baxış və satış sayına görə gəlirin {DESIGNER_SHARE}%-ni dizayner kimi sənə veririk.
          </p>
        </Reveal>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 80}>
              <li className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 text-sm font-extrabold text-brand">{i + 1}</span>
                <h3 className="mt-3 font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-neutral-600">{s.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <h3 className="mb-4 mt-14 text-2xl font-extrabold">Dizaynlar</h3>
        <DesignGallery designs={designs} />

        <div id="dizayn-gonder" className="mx-auto mt-14 max-w-2xl scroll-mt-24">
          <DesignUploadForm />
        </div>
      </div>
    </section>
  );
}
