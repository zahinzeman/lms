-- Migration 0003: Commerce, Digital Products, Cart, Checkout, Subscriptions, Coupons, Earnings & Payouts
-- Idempotent, RLS default deny on all tables

-- Custom Enums
do $$ begin
  create type public.product_type as enum ('ebook', 'template', 'preset', 'audio', 'video_pack', 'software', 'toolkit', 'bundle', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.item_type as enum ('course', 'product', 'plan');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'awaiting_payment', 'paid', 'failed', 'canceled', 'refunded', 'partially_refunded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_provider as enum ('stripe', 'sslcommerz', 'free', 'manual');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.enrollment_source as enum ('purchase', 'free', 'subscription', 'coupon_full', 'admin_grant', 'bundle');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.access_status as enum ('active', 'revoked', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.plan_scope as enum ('creator_all_access', 'creator_selected', 'community', 'platform_creator');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_interval as enum ('month', 'year', 'one_time');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired', 'incomplete');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.discount_type as enum ('percent', 'fixed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.earning_status as enum ('pending', 'available', 'paid_out', 'reversed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payout_status as enum ('requested', 'approved', 'processing', 'paid', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.refund_status as enum ('requested', 'approved', 'rejected', 'processed');
exception when duplicate_object then null;
end $$;

-- Sequence for human-readable order numbers
create sequence if not exists public.order_number_seq start 1001;

-- 1. Digital Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug extensions.citext unique not null,
  subtitle text,
  type public.product_type not null default 'toolkit',
  description jsonb,
  description_text text,
  category_id uuid references public.categories(id) on delete set null,
  cover_url text,
  gallery text[] default '{}',
  price_minor int not null default 0 check (price_minor >= 0),
  compare_at_price_minor int,
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  pay_what_you_want boolean not null default false,
  min_price_minor int default 0,
  status public.course_status not null default 'published',
  license_text text,
  version text default '1.0.0',
  file_count int not null default 0,
  sales_count int not null default 0,
  rating_avg numeric(3,2) default 0,
  rating_count int not null default 0,
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description_text, '')), 'C')
  ) stored,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_search on public.products using gin (search);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 2. Product Files Table
create table if not exists public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  file_path text not null,
  size_bytes bigint not null default 0,
  mime text,
  version text default '1.0.0',
  position int not null default 0,
  download_limit int,
  created_at timestamptz not null default now()
);

-- 3. Bundle Items Table
create table if not exists public.bundle_items (
  bundle_product_id uuid references public.products(id) on delete cascade,
  item_type public.item_type not null check (item_type in ('course', 'product')),
  item_id uuid not null,
  primary key (bundle_product_id, item_type, item_id)
);

-- 4. Plans Table
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  scope public.plan_scope not null,
  creator_id uuid references public.profiles(id) on delete cascade,
  community_id uuid, -- Foreign key added in migration 0004
  name text not null,
  slug text not null,
  description text,
  features text[] default '{}',
  price_minor int not null default 0,
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  interval public.billing_interval not null default 'month',
  trial_days int not null default 0,
  is_active boolean not null default true,
  position int not null default 0,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Plan Courses
create table if not exists public.plan_courses (
  plan_id uuid references public.plans(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  primary key (plan_id, course_id)
);

-- 6. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  status public.subscription_status not null default 'active',
  provider public.payment_provider not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text unique,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Coupons Table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code extensions.citext not null,
  creator_id uuid references public.profiles(id) on delete cascade,
  discount_type public.discount_type not null default 'percent',
  value int not null,
  currency text check (currency is null or currency in ('BDT', 'USD')),
  applies_to jsonb not null default '{"all": true}'::jsonb,
  min_subtotal_minor int,
  max_redemptions int,
  per_user_limit int not null default 1,
  redemptions_count int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_coupon_code_creator unique (code, creator_id)
);

-- 8. Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('BBD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.order_status not null default 'pending',
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  subtotal_minor int not null,
  discount_minor int not null default 0,
  tax_minor int not null default 0,
  total_minor int not null,
  coupon_id uuid references public.coupons(id) on delete set null,
  provider public.payment_provider not null default 'sslcommerz',
  provider_session_id text,
  provider_payment_id text,
  paid_at timestamptz,
  billing_name text,
  billing_email text,
  billing_country text default 'BD',
  meta jsonb default '{}'::jsonb,
  ip inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Order Items Table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type public.item_type not null,
  item_id uuid not null,
  title_snapshot text not null,
  creator_id uuid references public.profiles(id) on delete set null,
  unit_price_minor int not null,
  discount_minor int not null default 0,
  final_price_minor int not null,
  platform_fee_bps_snapshot int not null default 1500,
  platform_fee_minor int not null default 0,
  creator_earning_minor int not null default 0,
  refunded_minor int not null default 0,
  created_at timestamptz not null default now()
);

-- 10. Enrollments Table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  source public.enrollment_source not null default 'purchase',
  order_item_id uuid references public.order_items(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  status public.access_status not null default 'active',
  archived_by_user boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint uq_user_course_source unique (user_id, course_id, source)
);

create index if not exists idx_enrollments_user_status on public.enrollments (user_id, status);

-- 11. Product Access Table
create table if not exists public.product_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  status public.access_status not null default 'active',
  created_at timestamptz not null default now(),
  constraint uq_user_product_access unique (user_id, product_id)
);

-- 12. Cart Items Table
create table if not exists public.cart_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type public.item_type not null,
  item_id uuid not null,
  added_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

-- 13. Creator Earnings Ledger Table
create table if not exists public.creator_earnings (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  type text not null check (type in ('sale', 'subscription', 'refund_reversal', 'adjustment', 'payout')),
  amount_minor int not null,
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  status public.earning_status not null default 'pending',
  available_at timestamptz not null default (now() + interval '14 days'),
  payout_id uuid,
  note text,
  created_at timestamptz not null default now()
);

-- 14. Payout Accounts Table
create table if not exists public.payout_accounts (
  creator_id uuid primary key references public.profiles(id) on delete cascade,
  method text not null check (method in ('bkash', 'nagad', 'bank', 'stripe_connect', 'payoneer')),
  details text not null, -- Encrypted AES-GCM string
  last4 text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 15. Payouts Table
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  amount_minor int not null,
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  status public.payout_status not null default 'requested',
  method text not null,
  reference text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references public.profiles(id) on delete set null,
  note text
);

-- 16. Refund Requests Table
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status public.refund_status not null default 'requested',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  provider_refund_id text,
  amount_minor int not null,
  created_at timestamptz not null default now()
);

-- 17. Payment Events Table (Webhook Idempotency)
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider public.payment_provider not null,
  event_id text unique not null,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz default now(),
  error text,
  created_at timestamptz not null default now()
);

-- 18. Download Events Table
create table if not exists public.download_events (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  product_file_id uuid references public.product_files(id) on delete cascade,
  created_at timestamptz not null default now(),
  ip inet
);

-- Functions
-- has_course_access: Replaces Phase 3 stub
create or replace function public.has_course_access(_user uuid, _course uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.is_staff() then
    return true;
  end if;

  if public.is_course_instructor(_course) then
    return true;
  end if;

  if exists (
    select 1 from public.enrollments
    where user_id = _user
      and course_id = _course
      and status = 'active'
      and (expires_at is null or expires_at > now())
  ) then
    return true;
  end if;

  if exists (
    select 1 from public.subscriptions s
    join public.plans p on p.id = s.plan_id
    left join public.plan_courses pc on pc.plan_id = p.id
    join public.courses c on c.id = _course
    where s.user_id = _user
      and s.status in ('active', 'trialing')
      and s.current_period_end > now()
      and (
        (p.scope = 'creator_all_access' and p.creator_id = c.creator_id) or
        (p.scope = 'creator_selected' and pc.course_id = _course)
      )
  ) then
    return true;
  end if;

  return false;
end;
$$;

-- has_product_access
create or replace function public.has_product_access(_user uuid, _product uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.is_staff() then
    return true;
  end if;

  if exists (select 1 from public.products where id = _product and creator_id = _user) then
    return true;
  end if;

  return exists (
    select 1 from public.product_access
    where user_id = _user and product_id = _product and status = 'active'
  );
end;
$$;

-- Replace can_view_lesson with access integration
create or replace function public.can_view_lesson(_lesson_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  lesson_rec record;
begin
  select l.is_preview, l.course_id, l.drip_days, l.unlock_at, c.status into lesson_rec
  from public.lessons l
  join public.courses c on c.id = l.course_id
  where l.id = _lesson_id;

  if not found then
    return false;
  end if;

  if public.is_staff() or public.is_course_instructor(lesson_rec.course_id) then
    return true;
  end if;

  if lesson_rec.status in ('published', 'unlisted') and lesson_rec.is_preview then
    return true;
  end if;

  if public.has_course_access(auth.uid(), lesson_rec.course_id) then
    if lesson_rec.unlock_at is not null and lesson_rec.unlock_at > now() then
      return false;
    end if;
    return true;
  end if;

  return false;
end;
$$;

-- Compute Cart Function (Source of truth for pricing)
create or replace function public.compute_cart(
  _user uuid,
  _coupon_code text default null,
  _currency text default 'BDT'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  items_arr jsonb := '[]'::jsonb;
  item_rec record;
  subtotal int := 0;
  discount int := 0;
  total int := 0;
  coupon_rec record;
begin
  for item_rec in
    select ci.item_type, ci.item_id,
      case
        when ci.item_type = 'course' then (select c.title from public.courses c where c.id = ci.item_id)
        when ci.item_type = 'product' then (select p.title from public.products p where p.id = ci.item_id)
        else 'Plan'
      end as title,
      case
        when ci.item_type = 'course' then (select c.price_minor from public.courses c where c.id = ci.item_id)
        when ci.item_type = 'product' then (select p.price_minor from public.products p where p.id = ci.item_id)
        else 0
      end as price,
      case
        when ci.item_type = 'course' then (select c.creator_id from public.courses c where c.id = ci.item_id)
        when ci.item_type = 'product' then (select p.creator_id from public.products p where p.id = ci.item_id)
        else null
      end as creator_id
    from public.cart_items ci
    where ci.user_id = _user
  loop
    subtotal := subtotal + coalesce(item_rec.price, 0);
    items_arr := items_arr || jsonb_build_object(
      'item_type', item_rec.item_type,
      'item_id', item_rec.item_id,
      'title', item_rec.title,
      'price_minor', item_rec.price,
      'creator_id', item_rec.creator_id
    );
  end loop;

  if _coupon_code is not null and _coupon_code <> '' then
    select * into coupon_rec from public.coupons
    where code = _coupon_code and is_active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
      and (max_redemptions is null or redemptions_count < max_redemptions);

    if found then
      if coupon_rec.discount_type = 'percent' then
        discount := (subtotal * coupon_rec.value) / 10000;
      else
        discount := least(subtotal, coupon_rec.value);
      end if;
    end if;
  end if;

  total := greatest(0, subtotal - discount);

  return jsonb_build_object(
    'items', items_arr,
    'subtotal_minor', subtotal,
    'discount_minor', discount,
    'total_minor', total,
    'currency', _currency
  );
end;
$$;

-- Fulfill Order Function (Service Role Only)
create or replace function public.fulfill_order(_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ord public.orders%rowtype;
  item_rec public.order_items%rowtype;
begin
  select * into ord from public.orders where id = _order_id;
  if not found or ord.status = 'paid' then
    return;
  end if;

  update public.orders
  set status = 'paid', paid_at = now(), updated_at = now()
  where id = _order_id;

  for item_rec in select * from public.order_items where order_id = _order_id loop
    if item_rec.item_type = 'course' then
      insert into public.enrollments (user_id, course_id, source, order_item_id, status)
      values (ord.user_id, item_rec.item_id, 'purchase', item_rec.id, 'active')
      on conflict (user_id, course_id, source) do update set status = 'active';

      update public.courses set enrolled_count = enrolled_count + 1 where id = item_rec.item_id;
    elsif item_rec.item_type = 'product' then
      insert into public.product_access (user_id, product_id, order_item_id, status)
      values (ord.user_id, item_rec.item_id, item_rec.id, 'active')
      on conflict (user_id, product_id) do update set status = 'active';

      update public.products set sales_count = sales_count + 1 where id = item_rec.item_id;
    end if;

    if item_rec.creator_id is not null and item_rec.creator_earning_minor > 0 then
      insert into public.creator_earnings (
        creator_id, order_item_id, type, amount_minor, currency, status, available_at
      ) values (
        item_rec.creator_id,
        item_rec.id,
        'sale',
        item_rec.creator_earning_minor,
        ord.currency,
        'pending',
        now() + interval '14 days'
      );
    end if;
  end loop;

  delete from public.cart_items where user_id = ord.user_id;
end;
$$;

revoke execute on function public.fulfill_order from public, anon, authenticated;
grant execute on function public.fulfill_order to service_role;

-- Request Payout RPC
create or replace function public.request_payout(_amount_minor int, _currency text default 'BDT')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  available_balance int;
  payout_acc record;
  new_payout_id uuid;
begin
  select sum(amount_minor) into available_balance
  from public.creator_earnings
  where creator_id = auth.uid() and status = 'available' and currency = _currency;

  if coalesce(available_balance, 0) < _amount_minor then
    raise exception 'Insufficient available balance';
  end if;

  select * into payout_acc from public.payout_accounts where creator_id = auth.uid();
  if not found then
    raise exception 'No payout account configured';
  end if;

  insert into public.payouts (creator_id, amount_minor, currency, method, status)
  values (auth.uid(), _amount_minor, _currency, payout_acc.method, 'requested')
  returning id into new_payout_id;

  insert into public.creator_earnings (
    creator_id, type, amount_minor, currency, status, payout_id, note
  ) values (
    auth.uid(), 'payout', -_amount_minor, _currency, 'paid_out', new_payout_id, 'Payout request submitted'
  );

  return new_payout_id;
end;
$$;

-- Enable RLS
alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.bundle_items enable row level security;
alter table public.plans enable row level security;
alter table public.plan_courses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.enrollments enable row level security;
alter table public.product_access enable row level security;
alter table public.cart_items enable row level security;
alter table public.creator_earnings enable row level security;
alter table public.payout_accounts enable row level security;
alter table public.payouts enable row level security;
alter table public.refund_requests enable row level security;
alter table public.payment_events enable row level security;
alter table public.download_events enable row level security;

-- Policies
-- Products
drop policy if exists "Published products are public" on public.products;
create policy "Published products are public"
  on public.products for select
  using (status = 'published' or creator_id = auth.uid() or public.is_staff());

drop policy if exists "Creators can manage their products" on public.products;
create policy "Creators can manage their products"
  on public.products for all
  using (creator_id = auth.uid() or public.is_staff());

-- Product Files (Only owner or staff can select directly)
drop policy if exists "Product files select restricted" on public.product_files;
create policy "Product files select restricted"
  on public.product_files for all
  using (exists (select 1 from public.products p where p.id = product_id and (p.creator_id = auth.uid() or public.is_staff())));

-- Orders & Order Items
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders"
  on public.orders for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "Users view own order items" on public.order_items;
create policy "Users view own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

-- Cart Items
drop policy if exists "Users manage their cart" on public.cart_items;
create policy "Users manage their cart"
  on public.cart_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Enrollments & Product Access
drop policy if exists "Users see own enrollments" on public.enrollments;
create policy "Users see own enrollments"
  on public.enrollments for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "Users see own product access" on public.product_access;
create policy "Users see own product access"
  on public.product_access for select
  using (user_id = auth.uid() or public.is_staff());

-- Creator Earnings & Payouts
drop policy if exists "Creators view own earnings" on public.creator_earnings;
create policy "Creators view own earnings"
  on public.creator_earnings for select
  using (creator_id = auth.uid() or public.is_staff());

drop policy if exists "Creators view own payouts" on public.payouts;
create policy "Creators view own payouts"
  on public.payouts for select
  using (creator_id = auth.uid() or public.is_staff());

drop policy if exists "Creators manage own payout account" on public.payout_accounts;
create policy "Creators manage own payout account"
  on public.payout_accounts for all
  using (creator_id = auth.uid() or public.is_staff());

-- Storage Bucket for Products
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('product-files', 'product-files', false, 1073741824)
on conflict (id) do nothing;
