"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { addMessage } from "@/lib/chat-server";

export async function adminChatSend(threadId: string, text: string) {
  await requireAdmin();
  const body = String(text ?? "").trim().slice(0, 2000);
  if (!body) return { ok: false as const };
  const m = await addMessage(threadId, "admin", body);
  return { ok: true as const, message: m };
}

export async function adminChatRead(threadId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("chat_threads").update({ unread_admin: 0 }).eq("id", threadId);
}

export async function adminChatDelete(threadId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("chat_threads").delete().eq("id", threadId);
}
