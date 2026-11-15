import { addMessage, chatDb } from "@/lib/chat-server";

/**
 * Telegram webhook: bot bildirişinə "Reply" edilən mesaj saytdakı söhbətə admin cavabı kimi düşür.
 * Qoşmaq (bir dəfə): https://api.telegram.org/bot<TOKEN>/setWebhook?url=<SAYT>/api/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("forbidden", { status: 403 });
  }
  const update = await req.json().catch(() => null);
  const msg = update?.message;
  // Yalnız bildirişlərin getdiyi çatdan gələn cavablar qəbul olunur
  if (!msg?.text || String(msg.chat?.id) !== String(process.env.TELEGRAM_CHAT_ID)) return Response.json({ ok: true });
  const replied: string = msg.reply_to_message?.text ?? "";
  const id = replied.match(/#c([0-9a-f-]{36})/)?.[1];
  if (!id) return Response.json({ ok: true });

  const { data: t } = await chatDb().from("chat_threads").select("id").eq("id", id).maybeSingle();
  if (t) {
    await addMessage(t.id, "admin", String(msg.text).slice(0, 2000), "telegram");
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setMessageReaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: msg.chat.id, message_id: msg.message_id, reaction: [{ type: "emoji", emoji: "👍" }] }),
    }).catch(() => {});
  }
  return Response.json({ ok: true });
}
