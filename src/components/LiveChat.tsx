"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { chatFetch, chatSend, chatStart } from "@/app/chat-actions";
import type { ChatMessage } from "@/lib/chat-server";

const KEY = "lemur_chat";
const SEEN = "lemur_chat_seen";

/** Saytın istənilən yerindən çatı açmaq üçün: window.dispatchEvent(new Event("open-chat")) */
export function openChat() {
  window.dispatchEvent(new Event("open-chat"));
}

const time = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function LiveChat({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Əvvəlki söhbəti bərpa et
  useEffect(() => {
    setToken(localStorage.getItem(KEY));
    const onOpen = () => setOpen(true);
    window.addEventListener("open-chat", onOpen);
    return () => window.removeEventListener("open-chat", onOpen);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    const r = await chatFetch(token);
    if (!r.ok) {
      if (r.error === "Söhbət tapılmadı") {
        localStorage.removeItem(KEY);
        setToken(null);
        setMessages([]);
      }
      return;
    }
    setMessages(r.messages);
  }, [token]);

  // Açıq olanda tez-tez, bağlı olanda nadir yoxlayırıq (admin cavabı gəlibsə nişan çıxsın)
  useEffect(() => {
    if (!token) return;
    refresh();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, open ? 4000 : 20000);
    return () => clearInterval(id);
  }, [token, open, refresh]);

  // Oxunmamış admin cavabları
  useEffect(() => {
    const admin = messages.filter((m) => m.sender === "admin");
    if (open) {
      if (admin.length) localStorage.setItem(SEEN, admin[admin.length - 1].id);
      setUnread(0);
      return;
    }
    const seen = localStorage.getItem(SEEN);
    const idx = seen ? admin.findIndex((m) => m.id === seen) : -1;
    setUnread(admin.length - (idx + 1));
  }, [messages, open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setError("");
    const r = token
      ? await chatSend(token, text)
      : await chatStart({ name, phone: tel, body: text, page: location.pathname });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    if (!token) {
      localStorage.setItem(KEY, r.token);
      setToken(r.token);
    }
    setMessages(r.messages);
    setText("");
  }

  const waiting = messages.length > 0 && messages.every((m) => m.sender === "visitor");

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-label="Canlı çat"
            className="fixed inset-0 z-[60] flex flex-col bg-[var(--card)] text-[var(--ink)] sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[34rem] sm:w-[23rem] sm:overflow-hidden sm:rounded-3xl sm:shadow-2xl sm:ring-1 sm:ring-[var(--hair)]"
          >
            <div className="flex items-center gap-3 bg-brand px-5 py-4 text-white">
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white/15 font-extrabold">
                L
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-brand" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="font-bold">Lemur Group</p>
                <p className="text-xs text-white/80">Adətən bir neçə dəqiqəyə cavab veririk</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Bağla" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15">
                <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-[var(--surface)] px-4 py-2.5 text-sm">
                Salam! 👋 Sualınızı yazın: qiymət, müddət, dizayn. Burada cavab verəcəyik.
              </div>
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "visitor" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${
                      m.sender === "visitor" ? "rounded-tr-md bg-brand text-white" : "rounded-tl-md bg-[var(--surface)]"
                    }`}
                  >
                    {m.body}
                    <span className={`mt-1 block text-right text-[10px] ${m.sender === "visitor" ? "text-white/70" : "text-[var(--ink-soft)]"}`}>{time(m.created_at)}</span>
                  </div>
                </div>
              ))}
              {waiting && (
                <p className="px-1 pt-1 text-xs text-[var(--ink-soft)]">
                  Mesajınızı aldıq, tezliklə cavab verəcəyik. Təcili isə zəng edin:{" "}
                  <a href={phoneHref} className="font-semibold text-brand">{phone}</a>
                </p>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-[var(--hair)] p-3">
              {!token && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız" autoComplete="name"
                    className="rounded-xl bg-[var(--surface)] px-3 py-2.5 text-base outline-none ring-brand focus:ring-2 sm:text-sm" />
                  <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Telefon" inputMode="tel" autoComplete="tel"
                    className="rounded-xl bg-[var(--surface)] px-3 py-2.5 text-base outline-none ring-brand focus:ring-2 sm:text-sm" />
                </div>
              )}
              {error && <p className="mb-2 text-xs font-semibold text-red-500">{error}</p>}
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Mesajınızı yazın…"
                  className="max-h-32 min-h-11 flex-1 resize-none rounded-xl bg-[var(--surface)] px-3 py-2.5 text-base outline-none ring-brand focus:ring-2 sm:text-sm"
                />
                <button disabled={busy || !text.trim()} aria-label="Göndər"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white transition disabled:opacity-40">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M3 20l18-8L3 4v6l12 2-12 2z" /></svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Çatı bağla" : "Canlı çat"}
        className={`fixed bottom-5 right-5 z-[61] h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-xl shadow-brand/30 transition hover:scale-105 ${open ? "hidden sm:grid" : "grid"}`}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth={2.2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.3 1.1 4.4 2.9 6L4 21l4.2-1.7c1.2.4 2.5.7 3.8.7 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" /></svg>
        )}
        {unread > 0 && !open && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold">{unread}</span>
        )}
      </button>
    </>
  );
}
