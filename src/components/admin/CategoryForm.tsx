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

const field = "w-full px-3 py-2 text-sm font-medium outline-none";

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
      className={`grid items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[44px_1.1fr_1fr_1.4fr_64px_auto] ${category ? "" : "rounded-xl bg-white"}`}
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <input type="hidden" name="image_url" value={category?.image ?? ""} />
      <label className="relative grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-md bg-[var(--surface)] text-[11px] font-semibold text-neutral-500">
        {preview ? <Image src={preview} alt="" fill sizes="44px" className="object-cover" unoptimized={preview.startsWith("blob:")} /> : "Şəkil"}
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
      <input name="name" defaultValue={category?.name} placeholder="Ad" required className={field} />
      <input name="slug" defaultValue={category?.slug} placeholder={category ? "keçid" : "keçid (boşdursa avtomatik)"} className={field} />
      <input name="description" defaultValue={category?.description ?? ""} placeholder="Qısa təsvir (istəyə görə)" className={`${field} max-sm:hidden`} />
      <input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} aria-label="Sıra" className={field} />
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-md bg-[#1b1d1f] px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">
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
            className="text-sm font-semibold text-neutral-500 hover:text-[#c42b0d]"
          >
            Sil
          </button>
        )}
      </div>
      {error && <p className="text-sm font-semibold text-accent sm:col-span-6">{error}</p>}
    </form>
  );
}
