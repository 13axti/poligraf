import { createBrowserClient } from "@supabase/ssr";

// Supabase hazır olanda .env.local-a bu dəyərləri yaz:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
// Hələ data mock-data.ts-dən gəlir; bu client qoşmaq üçün hazır dayanır.

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env dəyişənləri yoxdur. .env.local faylını doldurun."
    );
  }
  return createBrowserClient(url, key);
}
