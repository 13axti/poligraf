"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";

interface Cat {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
}

const field = "w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand";

export function CategoryForm({ category }: { category?: Cat }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<string | null>(category?.image ?? null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          const res = await saveCategory(fd);
          if (res?.error) setError(res.error);
        })
      }
      className={`grid items-start gap-3 rounded-3xl p-4 sm:grid-cols-[88px_1fr_1fr_90px_auto] ${category ? "bg-white" : "border-2 border-dashed border-neutral-300"}`}
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <input type="hidden" name="image_url" value={category?.image ?? ""} />
      <label className="relative grid h-[88px] w-[88px] cursor-pointer place-items-center overflow-hidden rounded-2xl bg-surface text-xs font-semibold text-neutral-500">
        {preview ? <Image src={preview} alt="" fill sizes="88px" className="object-cover" unoptimized={preview.startsWith("blob:")} /> : "Şəkil"}
        <input
          type="file"
          name="image"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
      </label>
      <div className="space-y-2">
        <input name="name" defaultValue={category?.name} placeholder="Ad" required className={field} />
        <input name="slug" defaultValue={category?.slug} placeholder="keçid (boş = avtomatik)" className={field} />
      </div>
      <textarea name="description" defaultValue={category?.description ?? ""} placeholder="Təsvir" rows={3} className={field} />
      <input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} aria-label="Sıra" className={field} />
      <div className="flex flex-col gap-2">
        <button disabled={pending} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand disabled:opacity-60">
          {category ? "Saxla" : "Əlavə et"}
        </button>
        {category && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("Kateqoriya silinsin? Məhsullar kateqoriyasız qalacaq.")) return;
              const fd = new FormData();
              fd.set("id", category.id);
              start(() => deleteCategory(fd));
            }}
            className="text-xs font-semibold text-neutral-400 hover:text-accent"
          >
            Sil
          </button>
        )}
      </div>
      {error && <p className="text-sm font-semibold text-accent sm:col-span-5">{error}</p>}
    </form>
  );
}
