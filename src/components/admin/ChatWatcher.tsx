"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function beep() {
  try {
    const ctx = new AudioContext();
    [660, 990].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.15;
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch {
    // brauzer səsi bloklaya bilər
  }
}

/** Admin panelin hər yerində: müştəri çatda yazanda səs, bildiriş və tab başlığında say */
export function ChatWatcher() {
  const router = useRouter();
  const path = usePathname();
  const [toast, setToast] = useState<{ thread: string; body: string } | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sb = createClient();
    const ch = sb
      .channel("admin-chat-watch")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        const m = p.new as { thread_id: string; sender: string; body: string };
        if (m.sender !== "visitor") return;
        beep();
        router.refresh();
        if (document.hidden) setCount((c) => c + 1);
        if (!location.pathname.startsWith("/admin/chat")) setToast({ thread: m.thread_id, body: m.body });
      })
      .subscribe();
    const onVis = () => !document.hidden && setCount(0);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      sb.removeChannel(ch);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [router]);

  useEffect(() => {
    const base = document.title.replace(/^\(\d+\) /, "");
    document.title = count ? `(${count}) ${base}` : base;
  }, [count, path]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 10000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <button
      onClick={() => {
        router.push(`/admin/chat?t=${toast.thread}`);
        setToast(null);
      }}
      className="fixed bottom-24 right-5 z-50 max-w-xs rounded-2xl bg-[#0066ff] p-4 text-left text-white shadow-2xl"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-white/80">💬 Canlı çat</p>
      <p className="mt-1 line-clamp-3 text-sm">{toast.body}</p>
    </button>
  );
}
