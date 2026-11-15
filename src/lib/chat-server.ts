import "server-only";
import { createClient } from "@supabase/supabase-js";

export interface ChatMessage {
  id: string;
  sender: "visitor" | "admin";
  body: string;
  created_at: string;
}

/** Ziyarətçi tərəfi bazaya birbaşa çıxmır: bütün əməliyyatlar server açarı ilə buradan keçir */
export function chatDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Telegram-a yeni mesaj bildirişi. Mətndəki #c<id> işarəsi ilə Telegram-dan "Reply" edilən cavab həmin söhbətə düşür */
export async function notifyChat(t: { id: string; name: string; phone: string; page?: string | null }, body: string, first: boolean) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const text = [
    first ? "💬 <b>Yeni canlı çat</b>" : "💬 <b>Çatda yeni mesaj</b>",
    `👤 ${esc(t.name || "Adsız")}${t.phone ? ` · ${esc(t.phone)}` : ""}`,
    "",
    esc(body.slice(0, 1500)),
    "",
    first && t.page ? `📄 ${esc(t.page)}` : "",
    site ? `${site}/admin/chat?t=${t.id}` : "",
    `↩️ Cavab üçün bu mesaja Reply edin · #c${t.id}`,
  ]
    .filter((l, i, a) => l !== "" || (a[i - 1] ?? "") !== "")
    .join("\n");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[telegram chat]", res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error("[telegram chat]", e);
  }
}

/** Mesajı söhbətə yazır və söhbətin xülasəsini yeniləyir */
export async function addMessage(threadId: string, sender: "visitor" | "admin", body: string, via: "site" | "telegram" = "site") {
  const db = chatDb();
  const { data, error } = await db
    .from("chat_messages")
    .insert({ thread_id: threadId, sender, body, via })
    .select("id, sender, body, created_at")
    .single();
  if (error) throw new Error(error.message);
  const { data: t } = await db.from("chat_threads").select("unread_admin").eq("id", threadId).single();
  await db
    .from("chat_threads")
    .update({
      last_message: body.slice(0, 200),
      last_message_at: new Date().toISOString(),
      unread_admin: sender === "visitor" ? (t?.unread_admin ?? 0) + 1 : 0,
    })
    .eq("id", threadId);
  return data as ChatMessage;
}
