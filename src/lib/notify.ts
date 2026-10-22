import { AZN } from "./pricing";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface NewOrderInfo {
  id: string;
  product: string;
  variant?: string | null;
  size: string; // "100 ədəd" və ya "300×100 sm"
  price: number;
  name: string;
  phone: string;
  note?: string;
  hasLogo: boolean;
}

/**
 * Yeni sifariş haqqında Telegram mesajı. TELEGRAM_BOT_TOKEN və TELEGRAM_CHAT_ID yazılmayıbsa heç nə etmir.
 * Heç vaxt xəta atmır: bildiriş alınmasa belə sifariş normal qəbul olunur.
 */
export async function notifyNewOrder(o: NewOrderInfo) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const lines = [
    "🧡 <b>Yeni sifariş</b>",
    `<b>${esc(o.product)}</b>${o.variant ? ` (${esc(o.variant)})` : ""}`,
    `${esc(o.size)} · <b>${esc(AZN(o.price))}</b>`,
    `👤 ${esc(o.name)} · ${esc(o.phone)}`,
    o.note ? `💬 ${esc(o.note.slice(0, 300))}` : "",
    o.hasLogo ? "🖼 Loqo yüklənib" : "Loqosuz sifariş",
    site ? `\n${site}/admin/orders/${o.id}` : "",
  ].filter(Boolean);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: lines.join("\n"), parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[telegram]", res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error("[telegram]", e);
  }
}
