import { LoginForm } from "./LoginForm";
import { supabaseConfigured } from "@/lib/supabase/public";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-sm text-white">P</span>
          Poligraf Admin
        </div>
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
  );
}
