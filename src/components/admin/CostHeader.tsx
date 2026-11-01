import { CostTabs } from "./CostTabs";

export function CostHeader({ msg }: { msg?: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Qiymət bazası</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Təchizatçılardan aldığınız maya qiymətləri, sabit say pillələri ilə: 10, 50, 100, 200, 500, 1000, 2000, 2000+. Təklifdə hər məhsul üçün ən ucuz təchizatçı avtomatik seçilir. Yalnız admin görür.
        </p>
      </div>
      <CostTabs />
      {msg && <p className="rounded-lg bg-white px-4 py-3 text-sm font-semibold">{msg}</p>}
    </div>
  );
}

export function CostTablesMissing() {
  return (
    <p className="rounded-xl bg-white p-5 text-accent">
      Cədvəl tapılmadı. Supabase → SQL Editor-da <b>supabase/schema.sql</b> faylının mətnini yenidən işlədin.
    </p>
  );
}

export const costInput = "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[#ff5a1f]";
export const costLabel = "mb-1 block text-xs font-semibold text-neutral-500";
