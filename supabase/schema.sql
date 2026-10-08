-- Poligraf — Supabase sxemi.
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
