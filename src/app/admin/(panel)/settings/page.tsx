import { requireAdmin } from "@/lib/admin-auth";
import { defaultSettings, type SiteSettings } from "@/lib/site-config";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("value").eq("key", "site").maybeSingle();
  const v = (data?.value ?? {}) as Partial<SiteSettings>;
  const settings: SiteSettings = {
    ...defaultSettings,
    ...v,
    socials: defaultSettings.socials.map((d) => ({ ...d, href: v.socials?.find((s) => s.id === d.id)?.href ?? "" })),
    clients: v.clients ?? [],
  };
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Sayt ayarları</h1>
      <p className="text-sm text-neutral-500">Burada yazdığınız məlumat saytın başlığında, altlığında və ana səhifədəki müştəri zolağında görünür.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
