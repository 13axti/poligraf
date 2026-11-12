import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { COST_LINKS, CostHeader, CostTablesMissing, costInput, costLabel } from "@/components/admin/CostHeader";
import { requireAdmin } from "@/lib/admin-auth";
import { CURRENCIES } from "@/lib/costs";
import { loadCosts, type CostField } from "@/lib/costs-server";
import { deleteCategory, deleteField, saveCategory, saveField, saveRates } from "../../../cost-actions";

const TYPES: Record<CostField["type"], string> = { text: "Mətn", number: "Rəqəm", textarea: "Uzun mətn", select: "Siyahıdan seçim" };

function FieldForm({ f }: { f?: CostField }) {
  return (
    <form action={saveField} className="grid gap-2 sm:grid-cols-[2fr_1fr_2fr_5rem_auto_auto] sm:items-end">
      {f && <input type="hidden" name="id" value={f.id} />}
      <label><span className={costLabel}>Xananın adı *</span><input name="label" required defaultValue={f?.label} className={costInput} placeholder="Məs. Çap üsulu" /></label>
      <label><span className={costLabel}>Növü</span>
        <select name="type" defaultValue={f?.type ?? "text"} className={costInput}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </label>
      <label><span className={costLabel}>Seçimlər (siyahı üçün, vergüllə)</span><input name="options" defaultValue={f?.options.join(", ")} className={costInput} placeholder="İpək çap, Rəqəmsal, Tikmə" /></label>
      <label><span className={costLabel}>Sıra</span><input name="sort" type="number" defaultValue={f?.sort ?? 0} className={costInput} /></label>
      <label className="flex items-center gap-1.5 pb-2 text-sm"><input type="checkbox" name="required" defaultChecked={f?.required} /> Məcburi</label>
      <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">{f ? "Saxla" : "Əlavə et"}</button>
    </form>
  );
}

export default async function CostSettings({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { error, fields, categories, products, rates } = await loadCosts(supabase);
  const head = <CostHeader title="Forma ayarları" sub="Məhsul formasına öz xanalarınızı əlavə edin, kateqoriyaları və valyuta məzənnələrini idarə edin." msg={sp.msg} links={COST_LINKS} />;
  if (error) return <div className="space-y-4">{head}<CostTablesMissing /></div>;
  const mains = categories.filter((c) => !c.parentId);
  const count = (id: string) => products.filter((p) => p.categoryId === id || p.subcategoryId === id).length;

  return (
    <div className="space-y-6">
      {head}

      <section className="space-y-4 rounded-xl bg-white p-5">
        <div>
          <h2 className="text-lg font-bold">Əlavə xanalar</h2>
          <p className="text-sm text-neutral-500">Standart 18 xanadan əlavə. Yeni xana məhsul formasında, Excel şablonunda və importda avtomatik görünür.</p>
        </div>
        {fields.map((f) => (
          <div key={f.id} className="rounded-lg border border-[var(--line)] p-3">
            <FieldForm f={f} />
            <form action={deleteField} className="mt-2">
              <input type="hidden" name="id" value={f.id} />
              <ConfirmButton message={`"${f.label}" xanası silinsin? Məhsullardakı dəyəri də görünməyəcək.`} className="text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Xananı sil</ConfirmButton>
            </form>
          </div>
        ))}
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="mb-2 text-sm font-semibold">Yeni xana</p>
          <FieldForm />
        </div>
      </section>

      <section className="space-y-4 rounded-xl bg-white p-5">
        <div>
          <h2 className="text-lg font-bold">Kateqoriyalar və alt kateqoriyalar</h2>
          <p className="text-sm text-neutral-500">Məhsul formasında yeni ad yazanda da avtomatik yaranır. Silinəndə məhsullar silinmir, sadəcə kateqoriyasız qalır.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mains.map((c) => (
            <div key={c.id} className="rounded-lg border border-[var(--line)] p-3">
              <div className="flex items-end gap-2">
                <form action={saveCategory} className="flex flex-1 items-end gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name" defaultValue={c.name} className={`${costInput} font-semibold`} />
                  <button className="rounded bg-[var(--surface)] px-2 py-2 text-xs font-semibold">Saxla</button>
                </form>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`"${c.name}" və alt kateqoriyaları silinsin?`} className="px-2 py-2 text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</ConfirmButton>
                </form>
              </div>
              <p className="mt-1 text-xs text-neutral-500">{count(c.id)} məhsul</p>
              <div className="mt-2 space-y-1 border-l-2 border-[var(--line)] pl-3">
                {categories.filter((x) => x.parentId === c.id).map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <form action={saveCategory} className="flex flex-1 items-center gap-2">
                      <input type="hidden" name="id" value={s.id} />
                      <input name="name" defaultValue={s.name} className={`${costInput} py-1.5`} />
                      <button className="rounded bg-[var(--surface)] px-2 py-1.5 text-xs font-semibold">Saxla</button>
                    </form>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmButton message={`"${s.name}" silinsin?`} className="px-1 text-xs font-semibold text-neutral-500 hover:text-[#c42b0d]">Sil</ConfirmButton>
                    </form>
                  </div>
                ))}
                <form action={saveCategory} className="flex items-center gap-2">
                  <input type="hidden" name="parent_id" value={c.id} />
                  <input name="name" placeholder="+ alt kateqoriya" className={`${costInput} py-1.5`} />
                  <button className="rounded bg-[#1b1d1f] px-2 py-1.5 text-xs font-semibold text-white">Əlavə et</button>
                </form>
              </div>
            </div>
          ))}
        </div>
        <form action={saveCategory} className="flex max-w-md items-end gap-2">
          <label className="flex-1"><span className={costLabel}>Yeni kateqoriya</span><input name="name" className={costInput} /></label>
          <button className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white">Əlavə et</button>
        </form>
      </section>

      <section className="space-y-3 rounded-xl bg-white p-5">
        <div>
          <h2 className="text-lg font-bold">Valyuta məzənnələri</h2>
          <p className="text-sm text-neutral-500">1 vahid valyuta neçə manatdır. Xarici valyutada yazılan qiymətlər müqayisə və təklif üçün bununla manata çevrilir. Məzənnəni özünüz yeniləyin.</p>
        </div>
        <form action={saveRates} className="flex flex-wrap items-end gap-3">
          {CURRENCIES.filter((c) => c !== "AZN").map((c) => (
            <label key={c}><span className={costLabel}>1 {c} =</span><input name={`rate_${c}`} inputMode="decimal" defaultValue={String(rates[c]).replace(".", ",")} className={`${costInput} w-28`} /></label>
          ))}
          <button className="rounded-md bg-[#0066ff] px-4 py-2 text-sm font-bold text-white">Saxla</button>
        </form>
      </section>
    </div>
  );
}

export const instant = false;
