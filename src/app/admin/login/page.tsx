import { LoginForm } from "./LoginForm";
import { BRAND } from "@/lib/site-config";
import { supabaseConfigured } from "@/lib/supabase/public";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#ff5a1f] font-display text-xl font-bold text-white">L</span>
          <div className="leading-tight">
            <p className="font-display text-xl font-bold">{BRAND}</p>
            <p className="text-sm text-neutral-500">Sifariş masası</p>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6">
        {supabaseConfigured ? (
          <LoginForm />
        ) : (
          <div className="space-y-3 text-sm text-neutral-700">
            <p className="font-bold text-accent">Supabase qoşulmayıb</p>
            <p>
              Layihənin kökündə <code className="rounded bg-surface px-1.5 py-0.5">.env.local</code> faylı yaradın və
              Supabase → Project Settings → API səhifəsindəki dəyərləri yazın:
            </p>
            <pre className="overflow-x-auto rounded-2xl bg-foreground p-4 text-xs text-white">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}</pre>
            <p>Sonra <code className="rounded bg-surface px-1.5 py-0.5">npm run dev</code>-i dayandırıb yenidən başladın.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// Admin səhifələri giriş tələb edir: ani keçid yoxlaması lazım deyil (Next.js "instant" doğrulaması)
export const instant = false;
