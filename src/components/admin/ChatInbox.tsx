"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { adminChatDelete, adminChatRead, adminChatSend } from "@/app/admin/chat-actions";
import { ago } from "@/lib/ago";

export interface Thread {
  id: string;
  name: string;
  phone: string;
  page: string | null;
  unread_admin: number;
  last_message: string | null;
  last_message_at: string;
}
interface Msg {
  id: string;
  thread_id?: string;
  sender: "visitor" | "admin";
  body: string;
  via?: string;
  created_at: string;
}

const hm = (iso: string) => new Date(iso).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });

export function ChatInbox({ initial, selected }: { initial: Thread[]; selected?: string }) {
  const router = useRouter();
  const [threads, setThreads] = useState(initial);
  const [active, setActive] = useState<string | undefined>(selected ?? initial[0]?.id);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  const thread = threads.find((t) => t.id === active);

  // Seçilmiş söhbətin mesajları
  useEffect(() => {
    if (!active) return;
    const sb = createClient();
    sb.from("chat_messages").select("*").eq("thread_id", active).order("created_at").then(({ data }) => setMsgs((data ?? []) as Msg[]));
    adminChatRead(active).then(() => router.refresh());
    setThreads((ts) => ts.map((t) => (t.id === active ? { ...t, unread_admin: 0 } : t)));
  }, [active, router]);

  // Canlı yeniləmə: yeni mesajlar və söhbətlər
  useEffect(() => {
    const sb = createClient();
    const ch = sb
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        const m = p.new as Msg;
        if (m.thread_id === activeRef.current) {
          setMsgs((xs) => (xs.some((x) => x.id === m.id) ? xs : [...xs, m]));
          if (m.sender === "visitor") adminChatRead(m.thread_id!);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, (p) => {
        if (p.eventType === "DELETE") return setThreads((ts) => ts.filter((t) => t.id !== (p.old as Thread).id));
        const t = p.new as Thread;
        if (t.id === activeRef.current) t.unread_admin = 0;
        setThreads((ts) => [t, ...ts.filter((x) => x.id !== t.id)].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)));
      })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !text.trim() || busy) return;
    setBusy(true);
    const r = await adminChatSend(active, text);
    setBusy(false);
    if (r.ok) {
      setMsgs((xs) => (xs.some((x) => x.id === r.message.id) ? xs : [...xs, r.message]));
      setText("");
    }
  }

  if (!threads.length) {
    return <p className="mt-6 rounded-xl border border-dashed border-[var(--line)] p-10 text-center text-sm text-neutral-500">Hələ söhbət yoxdur. Saytdakı çat düyməsindən yazılan mesajlar burada görünəcək.</p>;
  }

  return (
    <div className="mt-6 grid h-[calc(100vh-11rem)] min-h-[28rem] overflow-hidden rounded-xl border border-[var(--line)] bg-white md:grid-cols-[18rem_1fr]">
      <ul className={`overflow-y-auto border-r border-[var(--line)] ${active ? "hidden md:block" : ""}`}>
        {threads.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => setActive(t.id)}
              className={`flex w-full flex-col gap-0.5 border-b border-[var(--line)] px-4 py-3 text-left hover:bg-[var(--surface)] ${t.id === active ? "bg-[var(--surface)]" : ""}`}
            >
              <span className="flex items-center gap-2">
                <span className="truncate font-semibold">{t.name || "Adsız"}</span>
                {t.unread_admin > 0 && <span className="num rounded bg-[#0066ff] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{t.unread_admin}</span>}
                <span className="ml-auto shrink-0 text-xs text-neutral-400">{ago(t.last_message_at)}</span>
              </span>
              <span className={`truncate text-sm ${t.unread_admin ? "font-semibold text-foreground" : "text-neutral-500"}`}>{t.last_message}</span>
            </button>
          </li>
        ))}
      </ul>

      {thread ? (
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
            <button onClick={() => setActive(undefined)} className="md:hidden" aria-label="Geri">←</button>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{thread.name || "Adsız"}</p>
              <p className="truncate text-xs text-neutral-500">
                <a href={`tel:${thread.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{thread.phone}</a>
                {thread.page ? ` · ${thread.page}` : ""}
              </p>
            </div>
            <a href={`https://wa.me/${thread.phone.replace(/\D/g, "")}`} target="_blank" className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">WhatsApp</a>
            <button
              onClick={async () => {
                if (!confirm("Bu söhbət silinsin?")) return;
                await adminChatDelete(thread.id);
                setThreads((ts) => ts.filter((t) => t.id !== thread.id));
                setActive(undefined);
              }}
              className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Sil
            </button>
          </div>
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-[var(--surface)]/40 px-4 py-4">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${m.sender === "admin" ? "bg-[#0066ff] text-white" : "bg-white ring-1 ring-[var(--line)]"}`}>
                  {m.body}
                  <span className={`mt-0.5 block text-right text-[10px] ${m.sender === "admin" ? "text-white/70" : "text-neutral-400"}`}>
                    {m.via === "telegram" ? "Telegram · " : ""}{hm(m.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-[var(--line)] p-3">
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
              placeholder="Cavab yazın… (Enter: göndər, Shift+Enter: yeni sətir)"
              className="max-h-32 min-h-10 flex-1 resize-none rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[#0066ff]"
            />
            <button disabled={busy || !text.trim()} className="rounded-md bg-[#0066ff] px-4 text-sm font-semibold text-white disabled:opacity-40">Göndər</button>
          </form>
        </div>
      ) : (
        <div className="hidden place-items-center text-sm text-neutral-400 md:grid">Söhbət seçin</div>
      )}
    </div>
  );
}
