-- Canlı çat (v4). Supabase → SQL Editor-da bir dəfə işə salın.
create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,               -- ziyarətçinin brauzerində saxlanan gizli açar
  name text not null default '',
  phone text not null default '',
  page text,                                -- söhbətin başladığı səhifə
  unread_admin int not null default 0,      -- admin oxumamış mesaj sayı
  last_message text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender text not null check (sender in ('visitor','admin')),
  body text not null check (char_length(body) between 1 and 2000),
  via text not null default 'site',         -- 'site' | 'telegram'
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_thread_idx on public.chat_messages(thread_id, created_at);
create index if not exists chat_threads_last_idx on public.chat_threads(last_message_at desc);

-- Ziyarətçi bazaya birbaşa çıxmır (server açarı ilə işləyir); admin (daxil olmuş istifadəçi) hər şeyi görür
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
drop policy if exists "authenticated all" on public.chat_threads;
create policy "authenticated all" on public.chat_threads for all to authenticated using (true) with check (true);
drop policy if exists "authenticated all" on public.chat_messages;
create policy "authenticated all" on public.chat_messages for all to authenticated using (true) with check (true);

-- Admin paneli yeni mesajları canlı alsın
do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.chat_threads;
exception when duplicate_object then null; end $$;
