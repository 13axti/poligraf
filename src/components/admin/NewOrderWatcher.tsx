"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Incoming {
  id: string;
  product_name: string;
  customer_name: string;
  computed_price: number;
}

/** Yeni sifariş gələndə canlı bildiriş göstərir və səhifəni yeniləyir (Supabase Realtime) */
export function NewOrderWatcher() {
  const router = useRouter();
  const [toast, setToast] = useState<Incoming | null>(null);

  useEffect(() => {
    const sb = createClient();
    const channel = sb
      .channel("orders-insert")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setToast(payload.new as Incoming);
        router.refresh();
        try {
          const ctx = new AudioContext();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.15, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          o.start();
          o.stop(ctx.currentTime + 0.4);
        } catch {
          // brauzer səsi bloklaya bilər; vacib deyil
        }
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 9000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <button
      onClick={() => {
        router.push(`/admin/orders/${toast.id}`);
        setToast(null);
      }}
      className="fixed bottom-5 right-5 z-50 max-w-xs rounded-3xl bg-accent p-5 text-left text-white shadow-2xl"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-white/80">Yeni sifariş</p>
      <p className="mt-1 font-extrabold">{toast.product_name}</p>
      <p className="text-sm text-white/90">
        {toast.customer_name} · {Number(toast.computed_price).toFixed(2)} ₼
      </p>
    </button>
  );
}
