"use client";

import { useState } from "react";
import { SIZE_UNITS } from "@/lib/costs";
import type { CostCategory, CostField, CostProduct } from "@/lib/costs-server";
import { OfferFields, inp, lbl } from "./OfferFields";

/** Məhsul forması. create=true olanda ilk təchizatçı qiyməti də doldurulur. Əlavə xanalar "Forma ayarları"ndan gəlir. */
export function CostProductForm({
  action, product, categories, fields, suppliers, create,
}: {
  action: (f: FormData) => Promise<void>;
  product?: CostProduct;
  categories: CostCategory[];
  fields: CostField[];
  suppliers: { id: string; name: string }[];
  create?: boolean;
}) {
  const mains = categories.filter((c) => !c.parentId);
  const [cat, setCat] = useState(product?.category ?? "");
  const parent = mains.find((c) => c.name.toLocaleLowerCase("az") === cat.trim().toLocaleLowerCase("az"));
  const subs = parent ? categories.filter((c) => c.parentId === parent.id) : [];

  return (
    <form action={action} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <section className="space-y-3 rounded-xl bg-white p-5">
        <h3 className="font-bold">Məhsul</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="sm:col-span-2"><span className={lbl}>Məhsul adı *</span><input name="name" required defaultValue={product?.name} className={inp} placeholder="T-shirt pambıq, dairəvi yaxa" /></label>
          <label><span className={lbl}>Məhsul kodu</span>
            <input value={product?.code ?? "avtomatik veriləcək"} readOnly className={`${inp} bg-[var(--surface)] font-mono text-neutral-500`} title="Kod avtomatik verilir və dəyişmir" />
          </label>
          <label><span className={lbl}>Kateqoriya * (siyahıdan seçin və ya yeni yazın)</span>
            <input name="category" required list="cat-main" value={cat} onChange={(e) => setCat(e.target.value)} className={inp} />
            <datalist id="cat-main">{mains.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          </label>
          <label><span className={lbl}>Alt kateqoriya (seçin və ya yeni yazın)</span>
            <input name="subcategory" list="cat-sub" defaultValue={product?.subcategory} className={inp} />
            <datalist id="cat-sub">{subs.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          </label>
          <label><span className={lbl}>Material</span><input name="material" defaultValue={product?.material} className={inp} placeholder="100% pambıq, 180 qr/m²" /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <label><span className={lbl}>En</span><input name="width" inputMode="decimal" defaultValue={product?.width ?? ""} className={inp} /></label>
          <label><span className={lbl}>Uzunluq</span><input name="length" inputMode="decimal" defaultValue={product?.length ?? ""} className={inp} /></label>
          <label><span className={lbl}>Qalınlıq</span><input name="thickness" inputMode="decimal" defaultValue={product?.thickness ?? ""} className={inp} /></label>
          <label><span className={lbl}>Ölçü vahidi</span>
            <select name="size_unit" defaultValue={product?.sizeUnit ?? "mm"} className={inp}>{SIZE_UNITS.map((u) => <option key={u}>{u}</option>)}</select>
          </label>
        </div>
        <label className="block"><span className={lbl}>Texniki xüsusiyyətlər</span><textarea name="specs" rows={3} defaultValue={product?.specs} className={inp} placeholder="Çap üsulu, rəng sayı, qablaşdırma..." /></label>
        <label className="block"><span className={lbl}>Saytda görünəcək açıqlama (istəyə görə)</span><textarea name="description" rows={2} defaultValue={product?.description} className={inp} /></label>

        {fields.length > 0 && (
          <div className="grid gap-3 border-t border-[var(--line)] pt-3 sm:grid-cols-2">
            {fields.map((f) => {
              const name = `extra_${f.id}`, v = product?.extra?.[f.id] ?? "";
              const label = <span className={lbl}>{f.label}{f.required ? " *" : ""}</span>;
              if (f.type === "textarea") return <label key={f.id} className="sm:col-span-2">{label}<textarea name={name} rows={2} required={f.required} defaultValue={v} className={inp} /></label>;
              if (f.type === "select") return (
                <label key={f.id}>{label}
                  <select name={name} required={f.required} defaultValue={v} className={inp}><option value="">Seçin</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
                </label>
              );
              return <label key={f.id}>{label}<input name={name} required={f.required} inputMode={f.type === "number" ? "decimal" : undefined} defaultValue={v} className={inp} /></label>;
            })}
          </div>
        )}
        <a href="/admin/costs/settings" className="inline-block text-xs font-semibold text-neutral-500 underline">Formaya xana əlavə et / redaktə et</a>
      </section>

      {create && (
        <section className="space-y-3 rounded-xl bg-white p-5">
          <h3 className="font-bold">Təchizatçı qiyməti</h3>
          <OfferFields suppliers={suppliers} />
        </section>
      )}

      <button className="rounded-md bg-[#0066ff] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0052cc]">{create ? "Məhsulu əlavə et" : "Saxla"}</button>
    </form>
  );
}
