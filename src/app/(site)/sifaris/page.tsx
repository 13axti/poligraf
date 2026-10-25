import Link from "next/link";
import { RequestForm } from "@/components/RequestForm";

export const metadata = {
  title: "Sifariş ver",
  description: "Kataloqdan seçin və ya xüsusi istəyinizi yazın. Sorğunuza 1 saat ərzində cavab veririk.",
};

export default function SifarisPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Sifariş ver</h1>
      <p className="mt-3 max-w-xl text-lg text-neutral-600">
        Hazır məhsuldan seçə, ya da nə istədiyinizi bizə yazaya bilərsiniz.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col justify-between rounded-[2rem] bg-surface p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-bold">Kataloqdan seçin</h2>
            <p className="mt-2 text-neutral-600">
              Məhsulu açın, loqonuzu və ya yazınızı üzərinə qoyub nəticəni görün, qiyməti dərhal öyrənin və sifariş verin.
            </p>
          </div>
          <Link
            href="/kataloq"
            className="mt-8 w-fit rounded-full bg-foreground px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Kataloqa keç
          </Link>
        </section>

        <section id="xususi" className="scroll-mt-24">
          <h2 className="mb-1 text-2xl font-bold">Xüsusi istək</h2>
          <p className="mb-4 text-neutral-600">
            Loqo və ya hazır dizaynınız yoxdur? Kataloqda tapmadığınız bir şey lazımdır? Sadəcə bizə yazın.
          </p>
          <RequestForm />
        </section>
      </div>
    </div>
  );
}
