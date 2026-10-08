import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "./supabase/server";
import { supabaseConfigured } from "./supabase/public";

/** Hər admin səhifəsi və action bunu çağırmalıdır (proxy tək başına kifayət deyil) */
export async function requireAdmin() {
  if (!supabaseConfigured) redirect("/admin/login");
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return { supabase, user: data.user };
}
