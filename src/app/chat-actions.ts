"use server";

import { randomBytes } from "node:crypto";
import { addMessage, chatDb, notifyChat, type ChatMessage } from "@/lib/chat-server";

type Result = { ok: true; token: string; messages: ChatMessage[] } | { ok: false; error: string };

const clean = (s: unknown, max: number) => String(s ?? "").trim().slice(0, max);

async function threadByToken(token: string) {
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const { data } = await chatDb().from("chat_threads").select("id, name, phone, page").eq("token", token).maybeSingle();
  return data;
}

async function messagesOf(threadId: string) {
  const { data } = await chatDb()
    .from("chat_messages")
    .select("id, sender, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at")
    .limit(300);
  return (data ?? []) as ChatMessage[];
}

/** Ziyarətçi ilk mesajı göndərir: söhbət yaradılır, gizli açar brauzerdə saxlanır */
export async function chatStart(input: { name: string; phone: string; body: string; page?: string }): Promise<Result> {
  const name = clean(input.name, 80);
  const phone = clean(input.phone, 40);
  const body = clean(input.body, 2000);
  if (!name) return { ok: false, error: "Adınızı yazın" };
  if (phone.replace(/\D/g, "").length < 7) return { ok: false, error: "Telefon nömrəsini yazın" };
  if (!body) return { ok: false, error: "Mesajı yazın" };
  try {
    const token = randomBytes(24).toString("hex");
    const { data: t, error } = await chatDb()
      .from("chat_threads")
      .insert({ token, name, phone, page: clean(input.page, 300) || null })
      .select("id, name, phone, page")
      .single();
    if (error || !t) return { ok: false, error: "Çat hələ qoşulmayıb, zəhmət olmasa zəng edin" };
    const m = await addMessage(t.id, "visitor", body);
    await notifyChat(t, body, true);
    return { ok: true, token, messages: [m] };
  } catch {
    return { ok: false, error: "Mesaj göndərilmədi, bir az sonra yenidən yoxlayın" };
  }
}

export async function chatSend(token: string, text: string): Promise<Result> {
  const body = clean(text, 2000);
  if (!body) return { ok: false, error: "Mesajı yazın" };
  const t = await threadByToken(token);
  if (!t) return { ok: false, error: "Söhbət tapılmadı" };
  // Sadə spam qoruması: son 1 dəqiqədə ən çox 15 mesaj
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await chatDb()
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("thread_id", t.id)
    .eq("sender", "visitor")
    .gte("created_at", since);
  if ((count ?? 0) >= 15) return { ok: false, error: "Çox tez-tez yazırsınız, bir az gözləyin" };
  await addMessage(t.id, "visitor", body);
  await notifyChat(t, body, false);
  return { ok: true, token, messages: await messagesOf(t.id) };
}

export async function chatFetch(token: string): Promise<Result> {
  const t = await threadByToken(token);
  if (!t) return { ok: false, error: "Söhbət tapılmadı" };
  return { ok: true, token, messages: await messagesOf(t.id) };
}
