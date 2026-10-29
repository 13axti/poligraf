import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin-auth";
import { ago } from "@/lib/ago";
import { createPresentation, deletePresentation } from "../../presentation-actions";

const input = "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[#ff5a1f]";

export default async function PresentationsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("presentations")
    .select("id, token, title, client, people, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Təqdimatlar</h1>
        <p className="rounded-xl bg-white p-5 text-accent">
          Cədvəl tapılmadı. Supabase → SQL Editor-da <b>supabase/schema.sql</b> faylının mətnini yenidən işlədin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Təqdimatlar</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Kataloqdan məhsulları seçin, saytın qiymətləri ilə təklif təqdimatı yığılır. Müştəriyə link göndərin və ya PDF kimi saxlayın.
        </p>
      </div>
      {sp.error && <p className="rounded-xl bg-white p-4 text-sm text-accent">Təqdimat yaradılmadı. Bir az sonra yenidən yoxlayın.</p>}

      <form action={createPresentation} className="grid gap-3 rounded-xl bg-white p-5 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-neutral-600">Başlıq
          <input name="title" required placeholder="Hədiyyə dəsti" className={`${input} mt-1`} />
        </label>
        <label className="text-sm font-semibold text-neutral-600">Müştəri
          <input name="client" placeholder="Şirkət adı" className={`${input} mt-1`} />
        </label>
        <label className="text-sm font-semibold text-neutral-600">Nəfər sayı
          <input name="people" type="number" min={0} placeholder="230" className={`${input} mt-1`} />
        </label>
        <button className="rounded-md bg-[#ff5a1f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e04810]">Yarat</button>
      </form>

      <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl bg-white">
        {(data ?? []).map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/presentations/${p.id}`} className="font-semibold hover:underline">{p.title}</Link>
              <p className="text-sm text-neutral-500">
                {[p.client, p.people ? `${p.people} nəfər` : ""].filter(Boolean).join(" · ") || "Müştəri yazılmayıb"} · {ago(p.updated_at)}
              </p>
            </div>
            <Link href={`/t/${p.token}`} target="_blank" className="rounded-md bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold hover:bg-[var(--line)]">Baxış</Link>
            <Link href={`/admin/presentations/${p.id}`} className="rounded-md bg-[#1b1d1f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-black">Redaktə</Link>
            <form action={deletePresentation}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="Bu təqdimat silinsin?" className="text-sm font-semibold text-neutral-500 underline-offset-4 hover:text-[#c42b0d] hover:underline">Sil</ConfirmButton>
            </form>
          </div>
        ))}
        {!data?.length && <p className="px-5 py-10 text-center text-neutral-500">Hələ təqdimat yoxdur. Yuxarıdan yenisini yaradın.</p>}
      </div>
    </div>
  );
}

export const instant = false;
