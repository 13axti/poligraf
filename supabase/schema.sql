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

-- ============ QİYMƏT BAZASI: təchizatçılardan alınan maya qiymətləri (yalnız admin görür) ============
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  phone text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.cost_products (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  category text not null default '',
  name text not null,
  unit text not null default 'ədəd',
  spec text not null default '',
  min_qty int,
  created_at timestamptz not null default now()
);
create table if not exists public.cost_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.cost_products(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  min_qty int not null default 1,          -- bu qiymət neçə ədəddən başlayır
  unit_price numeric not null check (unit_price >= 0),
  vat_included boolean not null default false,
  valid_until date,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists cost_prices_product_idx on public.cost_prices(product_id);
alter table public.suppliers enable row level security;
alter table public.cost_products enable row level security;
alter table public.cost_prices enable row level security;
drop policy if exists "suppliers admin" on public.suppliers;
create policy "suppliers admin" on public.suppliers for all to authenticated using (true) with check (true);
drop policy if exists "cost_products admin" on public.cost_products;
create policy "cost_products admin" on public.cost_products for all to authenticated using (true) with check (true);
drop policy if exists "cost_prices admin" on public.cost_prices;
create policy "cost_prices admin" on public.cost_prices for all to authenticated using (true) with check (true);

-- Standart məhsul kodları (Lemur-Group-Qiymet-Bazasi-v1.xlsx → "Məhsul kodları")
insert into public.cost_products (code, category, name, unit, spec, min_qty) values
  ('P-001', 'Poliqrafiya', 'Vizit kart', 'ədəd', '90×50 mm, 300 qr kuşe, 4+4, mat laminasiya', 100),
  ('P-002', 'Poliqrafiya', 'Flayer A5', 'ədəd', 'A5 (148×210), 130 qr kuşe, 4+4, laminasiyasız', 500),
  ('P-003', 'Poliqrafiya', 'Flayer A6', 'ədəd', 'A6 (105×148), 130 qr kuşe, 4+4', 1000),
  ('P-004', 'Poliqrafiya', 'Buklet (3 qat)', 'ədəd', 'A4 açıq / A5 qapalı, 150 qr kuşe, 4+4, bigovka', 500),
  ('P-005', 'Poliqrafiya', 'Kataloq / broşür', 'ədəd', 'A4, 16 səh, 150 qr daxili + 250 qr üz, skoba tikiş', 100),
  ('P-006', 'Poliqrafiya', 'Blank A4 (letterhead)', 'ədəd', 'A4, 80 qr ofset kağız, 4+0', 500),
  ('P-007', 'Poliqrafiya', 'Zərf (C5/DL)', 'ədəd', 'DL 110×220, 100 qr, 1+0 və ya 4+0 loqo çapı', 500),
  ('P-008', 'Poliqrafiya', 'Papka (folder)', 'ədəd', 'A4 cib papka, 300 qr kuşe, mat laminasiya, ştans', 100),
  ('P-009', 'Poliqrafiya', 'Divar təqvimi', 'ədəd', 'A3, 12+1 vərəq, 150 qr kuşe, yaylı tikiş', 50),
  ('P-010', 'Poliqrafiya', 'Stolüstü təqvim', 'ədəd', 'Standart ev tipli, 300 qr, yaylı', 50),
  ('P-011', 'Poliqrafiya', 'Etiket / stiker', 'ədəd', 'Rulon və ya vərəq, kağız/PP, ştanslı, 4+0', 500),
  ('P-012', 'Poliqrafiya', 'Kağız çanta', 'ədəd', 'Orta ölçü, 170 qr kraft və ya kuşe, kəndir qulp', 100),
  ('P-013', 'Poliqrafiya', 'Qutu / ambalaj', 'ədəd', 'Fərdi ştans, 350 qr karton, 4+0 + laminasiya', 100),
  ('P-014', 'Poliqrafiya', 'Menyu', 'ədəd', 'A4, 350 qr, mat laminasiya, 2 üz', 50),
  ('P-015', 'Poliqrafiya', 'Bilet / kupon (nömrələnmiş)', 'ədəd', 'Perforasiyalı, nömrələmə ilə', 500),
  ('PR-001', 'Promo məhsullar', 'Çaşka (kupa)', 'ədəd', 'Ağ keramika 330 ml, sublimasiya, 1 üz və ya dairəvi', 50),
  ('PR-002', 'Promo məhsullar', 'Qələm (plastik)', 'ədəd', 'Plastik, 1 rəng tampon çap, loqo', 100),
  ('PR-003', 'Promo məhsullar', 'Qələm (metal)', 'ədəd', 'Metal korpus, lazer qravüra, qutulu', 50),
  ('PR-004', 'Promo məhsullar', 'Bloknot A5', 'ədəd', 'A5, 80 vərəq, sərt üz, loqo çapı', 50),
  ('PR-005', 'Promo məhsullar', 'Eko-çanta (parça)', 'ədəd', 'Kətan / qeyri-toxunma, 1 rəng şelkoqrafiya', 100),
  ('PR-006', 'Promo məhsullar', 'Futbolka', 'ədəd', '100% pambıq, DTF və ya şelkoqrafiya, 1 üz', 50),
  ('PR-007', 'Promo məhsullar', 'Kepka', 'ədəd', 'Klassik 6 panel, tikmə loqo', 50),
  ('PR-008', 'Promo məhsullar', 'Açarlıq', 'ədəd', 'Metal / akril, loqo', 100),
  ('PR-009', 'Promo məhsullar', 'USB flaş', 'ədəd', '16 GB, loqo qravüra, qutulu', 50),
  ('PR-010', 'Promo məhsullar', 'Powerbank', 'ədəd', '10000 mAh, loqo çapı, qutulu', 25),
  ('PR-011', 'Promo məhsullar', 'Termos / termo-stəkan', 'ədəd', '350-500 ml, paslanmayan polad, qravüra', 25),
  ('PR-012', 'Promo məhsullar', 'Lanyard (boyunbağı)', 'ədəd', '20 mm, sublimasiya çap, karabin', 100),
  ('PR-013', 'Promo məhsullar', 'Çətir', 'ədəd', 'Avtomat, 1-2 rəng loqo', 50),
  ('PR-014', 'Promo məhsullar', 'Masaüstü bayraq', 'ədəd', 'Altlıqlı, 2 üz çap', 10),
  ('PR-015', 'Promo məhsullar', 'Hədiyyə dəsti (set)', 'dəst', 'Qələm + bloknot + çanta, fərdi qutuda', 25),
  ('R-001', 'Reklam və böyük format', 'Banner / vinil çapı', 'm²', '440 qr frontlit vinil, 1440 dpi, lyuversli', 1),
  ('R-002', 'Reklam və böyük format', 'Mesh banner', 'm²', 'Mesh material, fasad üçün, lyuversli', 1),
  ('R-003', 'Reklam və böyük format', 'Roll-up', 'ədəd', '85×200 sm, alüminium konstruksiya + çap + çanta', 1),
  ('R-004', 'Reklam və böyük format', 'X-banner', 'ədəd', '60×160 sm, çap + konstruksiya', 1),
  ('R-005', 'Reklam və böyük format', 'Press-wall', 'ədəd', '3×2,3 m karkas + banner çap, montajsız', 1),
  ('R-006', 'Reklam və böyük format', 'One-way vision (pəncərə)', 'm²', 'Perforasiyalı plyonka, çap + yapışdırma', 1),
  ('R-007', 'Reklam və böyük format', 'Oracal kəsim yazı', 'm²', 'Rəngli plyonka, plotter kəsimi', 1),
  ('R-008', 'Reklam və böyük format', 'Qabarıq hərf (işıqsız)', 'ədəd/hərf', 'Akril/PVC, 50 sm hündürlük, montajsız', 1),
  ('R-009', 'Reklam və böyük format', 'Qabarıq hərf (işıqlı)', 'ədəd/hərf', 'Akril üz + LED, 50 sm hündürlük', 1),
  ('R-010', 'Reklam və böyük format', 'Lightbox', 'm²', 'Alüminium profil + LED + transparent çap', 1),
  ('R-011', 'Reklam və böyük format', 'Neon (LED neon)', 'metr', 'Fleksibl LED neon, şəffaf altlıq', 1),
  ('R-012', 'Reklam və böyük format', 'Avtomobil brendinqi', 'ədəd', 'Yan + arxa, plyonka çap + yapışdırma', 1),
  ('R-013', 'Reklam və böyük format', 'Stend / sərgi konstruksiyası', 'm²', 'Modul stend, montaj daxil', 1),
  ('R-014', 'Reklam və böyük format', 'Tablo / lövhə (kompozit)', 'm²', 'Alükobond + plyonka və ya UV çap', 1),
  ('R-015', 'Reklam və böyük format', 'UV çap (sərt səth)', 'm²', 'Forex/akril/kompozit üzərinə birbaşa UV çap', 1)
on conflict (code) do nothing;

notify pgrst, 'reload schema';

-- ============ QİYMƏT BAZASI v2: sabit say pillələri, təchizatçı məlumatları, dəyişməz kod, sayta göndərmə ============
alter table public.suppliers
  add column if not exists contact_person text not null default '',
  add column if not exists email text not null default '',
  add column if not exists address text not null default '',
  add column if not exists voen text not null default '',
  add column if not exists website text not null default '',
  add column if not exists payment_terms text not null default '',
  add column if not exists delivery text not null default '',
  add column if not exists lead_days int;            -- standart hazırlanma müddəti (gün)

alter table public.cost_products
  add column if not exists description text not null default '',
  add column if not exists material text not null default '',
  add column if not exists size text not null default '',
  add column if not exists color text not null default '',
  add column if not exists site_product_id uuid references public.products(id) on delete set null;

-- Bir təchizatçının bir məhsul üçün təklifi: hər say pilləsinə qiymət (açar: 10, 50, 100, 200, 500, 1000, 2000, 2001 = "2000+")
create table if not exists public.cost_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.cost_products(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  tiers jsonb not null default '{}',
  lead_days int,                                      -- bu təchizatçının bu məhsulu hazırlama müddəti (gün)
  vat_included boolean not null default false,
  valid_until date,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, supplier_id)
);
alter table public.cost_offers enable row level security;
drop policy if exists "cost_offers admin" on public.cost_offers;
create policy "cost_offers admin" on public.cost_offers for all to authenticated using (true) with check (true);

-- Köhnə qiymətləri (cost_prices) yeni pillələrə köçür: hər qiymət öz sayına uyğun pilləyə düşür, eyni pillədə ən yenisi qalır
insert into public.cost_offers (product_id, supplier_id, tiers, vat_included, valid_until, note, created_at)
select product_id, supplier_id, jsonb_object_agg(tier, unit_price), bool_or(vat_included), max(valid_until), max(note), min(created_at)
from (
  select distinct on (product_id, supplier_id, tier) product_id, supplier_id, tier, unit_price, vat_included, valid_until, note, created_at
  from (
    select *, case
      when min_qty > 2000 then '2001' when min_qty >= 2000 then '2000' when min_qty >= 1000 then '1000'
      when min_qty >= 500 then '500' when min_qty >= 200 then '200' when min_qty >= 100 then '100'
      when min_qty >= 50 then '50' else '10' end as tier
    from public.cost_prices
  ) p
  order by product_id, supplier_id, tier, created_at desc
) x
group by product_id, supplier_id
on conflict (product_id, supplier_id) do nothing;

-- Məhsul kodu PIN kimidir: bir dəfə verilir, sonra heç vaxt dəyişmir
create or replace function public.cost_code_lock() returns trigger language plpgsql as $$
begin
  if old.code is not null and new.code is distinct from old.code then
    raise exception 'Məhsul kodu dəyişdirilə bilməz';
  end if;
  return new;
end $$;
drop trigger if exists cost_code_lock on public.cost_products;
create trigger cost_code_lock before update on public.cost_products for each row execute function public.cost_code_lock();

notify pgrst, 'reload schema';
