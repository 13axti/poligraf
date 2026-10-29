-- Lemur Group — Supabase sxemi.
-- İstifadə: Supabase → SQL Editor → bu faylı yapışdırıb "Run" edin (təkrar işlətmək təhlükəsizdir).

-- ============ CƏDVƏLLƏR ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  image text not null default '',
  pricing_model text not null check (pricing_model in ('per_unit', 'per_sqm')),
  min_order_qty int,
  price_tiers jsonb not null default '[]',   -- [{minQty, unitPrice}]
  price_per_sqm numeric,
  min_width_cm numeric,
  min_height_cm numeric,
  variants jsonb not null default '[]',      -- [{id, name, priceModifier}]
  mockups jsonb not null default '[]',       -- ProductMockup[] (şəkil + loqo yeri)
  print_area jsonb,
  featured boolean not null default false,
  active boolean not null default true,
  views int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'in_progress', 'ready', 'done', 'cancelled')),
  product_id uuid references public.products(id) on delete set null,
  product_slug text,
  product_name text not null,
  variant_name text,
  pricing_model text,
  quantity int,
  width_cm numeric,
  height_cm numeric,
  computed_price numeric not null,
  customer_name text not null,
  customer_phone text not null,
  note text,
  mockup_path text,   -- orders bucket-də yol
  logo_path text,
  admin_note text
);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- ============ TƏHLÜKƏSİZLİK (RLS) ============
-- Qayda: ziyarətçi (anon) yalnız aktiv məhsulları OXUYA və sifariş YAZA bilər.
-- Daxil olmuş istifadəçi (authenticated = admin) hər şeyi edə bilər.
-- VACİB: Authentication → Sign In / Providers → "Allow new users to sign up" söndürün!

alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.orders     enable row level security;

drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select to anon, authenticated using (true);
drop policy if exists "categories admin" on public.categories;
create policy "categories admin" on public.categories for all to authenticated using (true) with check (true);

drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select to anon using (active);
drop policy if exists "products admin" on public.products;
create policy "products admin" on public.products for all to authenticated using (true) with check (true);

drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders for insert to anon, authenticated
  with check (status = 'new' and char_length(customer_name) between 1 and 100 and computed_price > 0);
drop policy if exists "orders admin" on public.orders;
create policy "orders admin" on public.orders for all to authenticated using (true) with check (true);

-- ============ ŞƏKİL SAXLANCI (Storage) ============
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('orders', 'orders', false)
  on conflict (id) do nothing;

drop policy if exists "products files read" on storage.objects;
create policy "products files read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'products');
drop policy if exists "products files admin" on storage.objects;
create policy "products files admin" on storage.objects for all to authenticated
  using (bucket_id = 'products') with check (bucket_id = 'products');

drop policy if exists "orders files upload" on storage.objects;
create policy "orders files upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'orders');
drop policy if exists "orders files admin" on storage.objects;
create policy "orders files admin" on storage.objects for all to authenticated
  using (bucket_id = 'orders') with check (bucket_id = 'orders');

-- ============ SAYT AYARLARI (telefon, sosial şəbəkələr, müştərilər) ============
create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;

drop policy if exists "settings read" on public.settings;
create policy "settings read" on public.settings for select to anon, authenticated using (true);
drop policy if exists "settings admin" on public.settings;
create policy "settings admin" on public.settings for all to authenticated using (true) with check (true);

-- ============ CANLI BİLDİRİŞ: yeni sifariş gələndə admin panel dərhal xəbər tutsun ============
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- ============ T-SHIRT KAMPANİYASI: istifadəçi dizaynları ============
-- Dizayn əvvəl approved=false düşür; admin təsdiqləyəndə (approved=true) saytda görünür.
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  designer_name text not null,
  designer_phone text not null,
  kind text not null default 'artwork' check (kind in ('shirt', 'artwork')), -- shirt: hazır t-shirt şəkli, artwork: yalnız dizayn
  image_path text not null,  -- designs bucket-də yol
  approved boolean not null default false,
  views int not null default 0,
  sales int not null default 0,
  admin_note text
);
create index if not exists designs_approved_idx on public.designs(approved, created_at desc);
alter table public.designs enable row level security;

drop policy if exists "designs read approved" on public.designs;
create policy "designs read approved" on public.designs for select to anon using (approved);
drop policy if exists "designs insert" on public.designs;
create policy "designs insert" on public.designs for insert to anon
  with check (approved = false and views = 0 and sales = 0 and char_length(designer_name) between 1 and 100 and char_length(title) between 1 and 80);
drop policy if exists "designs admin" on public.designs;
create policy "designs admin" on public.designs for all to authenticated using (true) with check (true);

-- Sifarişi dizaynla əlaqələndirmək üçün
alter table public.orders add column if not exists design_id uuid references public.designs(id) on delete set null;

-- Baxış və satış sayğacları: anon birbaşa yaza bilmir, yalnız bu funksiyalarla +1 edə bilir
create or replace function public.design_view(d uuid) returns void
  language sql security definer set search_path = public as
  $$ update public.designs set views = views + 1 where id = d and approved; $$;
create or replace function public.design_sale(d uuid) returns void
  language sql security definer set search_path = public as
  $$ update public.designs set sales = sales + 1 where id = d and approved; $$;
grant execute on function public.design_view(uuid) to anon, authenticated;
grant execute on function public.design_sale(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public) values ('designs', 'designs', true)
  on conflict (id) do nothing;
drop policy if exists "designs files read" on storage.objects;
create policy "designs files read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'designs');
drop policy if exists "designs files upload" on storage.objects;
create policy "designs files upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'designs');
drop policy if exists "designs files admin" on storage.objects;
create policy "designs files admin" on storage.objects for all to authenticated
  using (bucket_id = 'designs') with check (bucket_id = 'designs');

-- ============ XÜSUSİ İSTƏKLƏR: müştəri kataloqda olmayan və ya ümumi sorğu yazır ============
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'answered', 'closed')),
  admin_note text
);
create index if not exists requests_created_idx on public.requests(created_at desc);
alter table public.requests enable row level security;

drop policy if exists "requests insert" on public.requests;
create policy "requests insert" on public.requests for insert to anon, authenticated
  with check (status = 'new' and char_length(customer_name) between 1 and 100 and char_length(message) between 3 and 2000);
drop policy if exists "requests admin" on public.requests;
create policy "requests admin" on public.requests for all to authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.requests;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- ============ TƏQDİMATLAR: admin kataloqdan hədiyyə/təklif təqdimatı yığır, müştəriyə link göndərilir ============
create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,           -- müştəriyə gedən linkdəki gizli kod
  title text not null,
  client text not null default '',
  people int not null default 0,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.presentations enable row level security;

drop policy if exists "presentations admin" on public.presentations;
create policy "presentations admin" on public.presentations for all to authenticated using (true) with check (true);

-- Müştəri yalnız tokeni bilirsə oxuya bilir (cədvəl anon üçün açıq deyil)
create or replace function public.get_presentation(p_token text)
returns table (title text, client text, people int, data jsonb, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.title, p.client, p.people, p.data, p.created_at from public.presentations p where p.token = p_token limit 1;
$$;
revoke all on function public.get_presentation(text) from public;
grant execute on function public.get_presentation(text) to anon, authenticated;

notify pgrst, 'reload schema';
