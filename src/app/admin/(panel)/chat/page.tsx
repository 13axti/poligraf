import { requireAdmin } from "@/lib/admin-auth";
import { ChatInbox, type Thread } from "@/components/admin/ChatInbox";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, name, phone, page, unread_admin, last_message, last_message_at")
    .order("last_message_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Canlı çat</h1>
      <p className="mt-1 text-sm text-neutral-500">Saytdan yazan müştərilər. Yeni mesaj gələndə səs çıxır və Telegram-a bildiriş gedir.</p>
      {error ? (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Çat cədvəlləri tapılmadı. Supabase → SQL Editor-da <code>supabase/chat.sql</code> faylını işə salın.
        </p>
      ) : (
        <ChatInbox initial={(data ?? []) as Thread[]} selected={sp.t} />
      )}
    </div>
  );
}
