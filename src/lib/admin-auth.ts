import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createServerSupabase } from "./supabase/server";
import { supabaseConfigured } from "./supabase/public";

/** Hər admin səhifəsi və action bunu çağırmalıdır (proxy tək başına kifayət deyil) */
export async function requireAdmin() {
  // Giriş yoxlaması vaxta (Date.now) və cookie-yə bağlıdır: həmişə sorğu vaxtında işləməlidir
  await connection();
  if (!supabaseConfigured) redirect("/admin/login");
  const supabase = await createServerSupabase();
  // getClaims JWT imzasını yerində yoxlayır (Auth serverinə hər dəfə sorğu getmir), ona görə sürətlidir və təhlükəsizdir
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/admin/login");
  return { supabase, user: { id: claims.sub, email: (claims.email as string | undefined) ?? "" } };
}
