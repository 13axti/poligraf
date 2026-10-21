import { requireAdmin } from "@/lib/admin-auth";
import { designImageUrl, DESIGN_PRICE, DESIGNER_SHARE } from "@/lib/designs-shared";
import { DesignPreview } from "@/components/DesignPreview";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteDesign, saveDesignStats, setDesignApproved } from "../../actions";

const field = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand";

export default async function DesignsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("designs").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <h1 className="text-2xl font-bold">T-shirt kampaniyası</h1>
        <p className="mt-3 text-accent">
          Cədvəl tapılmadı. Supabase → SQL Editor-da <b>supabase/schema.sql</b> faylını yenidən işlədin.
        </p>
      </div>
    );
  }

  const designs = data ?? [];
  const pending = designs.filter((d) => !d.approved);
  const live = designs.filter((d) => d.approved);

  const card = (d: (typeof designs)[number]) => (
    <div key={d.id} className="grid gap-4 rounded-3xl bg-white p-4 sm:grid-cols-[10rem_1fr]">
      <div className="w-40">
        <DesignPreview image={designImageUrl(d.image_path)} kind={d.kind} alt={d.title} />
        <a href={designImageUrl(d.image_path)} target="_blank" className="mt-2 block text-center text-xs font-semibold text-brand">
          Orijinal şəkil ↗
        </a>
      </div>
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold">{d.title}</h3>
          <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${d.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {d.approved ? "approved: true" : "approved: false"}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
            {d.kind === "shirt" ? "hazır t-shirt şəkli" : "yalnız dizayn"}
          </span>
        </div>
        <p className="text-sm text-neutral-600">
          {d.designer_name} ·{" "}
          <a href={`tel:${d.designer_phone}`} className="font-semibold text-foreground">{d.designer_phone}</a> ·{" "}
          {new Date(d.created_at).toLocaleString("az-AZ")}
        </p>

        <form action={saveDesignStats} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={d.id} />
          <label className="text-xs text-neutral-500">
            Baxış
            <input name="views" type="number" min={0} defaultValue={d.views} className={`${field} mt-1 w-24`} />
          </label>
          <label className="text-xs text-neutral-500">
            Satış
            <input name="sales" type="number" min={0} defaultValue={d.sales} className={`${field} mt-1 w-24`} />
          </label>
          <label className="min-w-40 flex-1 text-xs text-neutral-500">
            Qeyd
            <input name="admin_note" defaultValue={d.admin_note ?? ""} className={`${field} mt-1`} />
          </label>
          <button className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold hover:bg-neutral-200">Saxla</button>
        </form>

        <div className="flex flex-wrap gap-2">
          <form action={setDesignApproved}>
            <input type="hidden" name="id" value={d.id} />
            <input type="hidden" name="approved" value={String(!d.approved)} />
            <button className={`rounded-md px-5 py-2 text-sm font-bold ${d.approved ? "bg-neutral-100 hover:bg-neutral-200" : "bg-brand text-white"}`}>
              {d.approved ? "Saytdan gizlət (false)" : "Təsdiqlə və saytda göstər (true)"}
            </button>
          </form>
          <form action={deleteDesign}>
            <input type="hidden" name="id" value={d.id} />
            <ConfirmButton message="Bu dizayn və şəkli silinsin?" className="rounded-md px-4 py-2 text-sm font-semibold text-accent hover:bg-red-50">
              Sil
            </ConfirmButton>
          </form>
        </div>

        {d.approved && (
          <p className="text-xs text-neutral-500">
            Satış gəliri: {(d.sales * DESIGN_PRICE).toFixed(2)} ₼ · Dizayner payı ({DESIGNER_SHARE}%):{" "}
            <b>{((d.sales * DESIGN_PRICE * DESIGNER_SHARE) / 100).toFixed(2)} ₼</b>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">T-shirt kampaniyası</h1>
        <p className="mt-1 text-sm text-neutral-500">
          İstifadəçilərin göndərdiyi dizaynlar əvvəl <b>false</b> düşür. Baxıb təsdiqləyəndə (<b>true</b>) saytın ən aşağısında görünür. Qiymət {DESIGN_PRICE} ₼,
          dizayner payı satışın {DESIGNER_SHARE}%-i.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-400">Təsdiq gözləyənlər ({pending.length})</h2>
        {pending.length ? pending.map(card) : <p className="text-neutral-500">Gözləyən dizayn yoxdur.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-400">Saytda görünənlər ({live.length})</h2>
        {live.length ? live.map(card) : <p className="text-neutral-500">Hələ təsdiqlənmiş dizayn yoxdur.</p>}
      </section>
    </div>
  );
}

export const instant = false;
