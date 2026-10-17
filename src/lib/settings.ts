import { cacheLife, cacheTag } from "next/cache";
import { defaultSettings, type SiteSettings } from "./site-config";
import { createPublicClient, supabaseConfigured } from "./supabase/public";

/** Bazadakı ayarları default-larla birləşdirir. Admin yadda saxlayanda `settings` tag-i yenilənir. */
export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");

  if (!supabaseConfigured) return defaultSettings;
  const { data, error } = await createPublicClient()
    .from("settings")
    .select("value")
    .eq("key", "site")
    .maybeSingle();

  if (error) {
    // Ayarlar kritik deyil: cədvəl yoxdursa sayt default dəyərlərlə işləyir
    console.warn(`[settings] ${error.message} — default ayarlar göstərilir`);
    return defaultSettings;
  }
  const v = (data?.value ?? {}) as Partial<SiteSettings>;
  return {
    ...defaultSettings,
    ...v,
    // sosial şəbəkələrin sırası və adları sabit qalsın, yalnız linklər dəyişsin
    socials: defaultSettings.socials.map((d) => ({
      ...d,
      href: v.socials?.find((s) => s.id === d.id)?.href ?? d.href,
    })),
    clients: v.clients ?? defaultSettings.clients,
  };
}
