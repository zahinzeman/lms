-- Migration 0001: Core Auth, Roles, Profiles, Onboarding, Creator Applications, and Audit Logs
-- Idempotent, RLS default deny on all tables

-- Extensions
create extension if not exists "citext" with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Custom types (enums)
do $$ begin
  create type public.app_role as enum ('student', 'creator', 'moderator', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.creator_status as enum ('none', 'pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.application_status as enum ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_changes');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.learning_intent as enum ('learn', 'teach', 'both');
exception when duplicate_object then null;
end $$;

-- Shared timestamp trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle extensions.citext unique not null,
  full_name text,
  avatar_url text,
  headline text,
  bio text,
  country text default 'BD',
  timezone text default 'Asia/Dhaka',
  locale text default 'en',
  preferred_currency text default 'BDT' check (preferred_currency in ('BDT', 'USD')),
  website text,
  socials jsonb default '{}'::jsonb,
  intent public.learning_intent default 'learn',
  creator_status public.creator_status not null default 'none',
  onboarding_completed_at timestamptz,
  is_suspended boolean default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint handle_format_check check (handle ~ '^[a-z0-9_\.]{3,30}$')
);

comment on table public.profiles is 'User profile 1:1 with auth.users containing public identity and preferences.';

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 2. User Roles Table
create table if not exists public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is 'Multi-role mapping for users (student, creator, moderator, admin).';

-- 3. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug extensions.citext unique not null,
  icon text not null default 'BookOpen',
  tint text not null default 'blue',
  description text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is 'Catalog categories and subcategories for courses, products, and communities.';

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- 4. User Interests Table
create table if not exists public.user_interests (
  user_id uuid references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

comment on table public.user_interests is 'User selected categories during onboarding or in settings.';

-- 5. Creator Profiles Table
create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  slug extensions.citext unique not null,
  tagline text,
  about jsonb,
  banner_url text,
  accent_tint text default 'rose',
  expertise text[] default '{}',
  years_experience int default 0,
  website text,
  socials jsonb default '{}'::jsonb,
  platform_plan text not null default 'free' check (platform_plan in ('free', 'pro', 'business')),
  platform_fee_bps int not null default 1500,
  payout_method jsonb default '{}'::jsonb,
  is_featured boolean default false,
  verified boolean default false,
  students_count int default 0,
  courses_count int default 0,
  rating_avg numeric(3,2),
  rating_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.creator_profiles is 'Public storefront and creator metadata for approved creators.';

drop trigger if exists set_creator_profiles_updated_at on public.creator_profiles;
create trigger set_creator_profiles_updated_at
  before update on public.creator_profiles
  for each row execute function public.set_updated_at();

-- 6. Creator Applications Table
create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.application_status not null default 'draft',
  niche text,
  category_id uuid references public.categories(id) on delete set null,
  experience_summary text,
  teaching_experience text,
  portfolio_links text[] default '{}',
  sample_content_url text,
  planned_offerings text[] default '{}',
  audience_size text,
  audience_channels text[] default '{}',
  why_teach text,
  agrees_to_terms boolean not null default false,
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.creator_applications is 'Applications to become approved creators with review workflow.';

create unique index if not exists idx_active_creator_application_per_user 
  on public.creator_applications (user_id) 
  where status in ('draft', 'submitted', 'under_review', 'needs_changes');

drop trigger if exists set_creator_applications_updated_at on public.creator_applications;
create trigger set_creator_applications_updated_at
  before update on public.creator_applications
  for each row execute function public.set_updated_at();

-- 7. Audit Logs Table
create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  meta jsonb default '{}'::jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is 'Immutable audit logs for administrative and sensitive platform actions.';

-- Public Views
create or replace view public.public_profiles as
select
  p.id,
  p.handle,
  p.full_name,
  p.avatar_url,
  p.headline,
  p.bio,
  p.country,
  p.socials,
  p.creator_status
from public.profiles p
where p.is_suspended = false;

create or replace view public.public_creator_profiles as
select
  cp.user_id,
  cp.display_name,
  cp.slug,
  cp.tagline,
  cp.about,
  cp.banner_url,
  cp.accent_tint,
  cp.expertise,
  cp.years_experience,
  cp.website,
  cp.socials,
  cp.platform_plan,
  cp.is_featured,
  cp.verified,
  cp.students_count,
  cp.courses_count,
  cp.rating_avg,
  cp.rating_count,
  cp.created_at
from public.creator_profiles cp
join public.profiles p on p.id = cp.user_id
where p.is_suspended = false and p.creator_status = 'approved';

-- Security Functions
create or replace function public.has_role(_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin'::public.app_role);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin'::public.app_role, 'moderator'::public.app_role)
  );
$$;

create or replace function public.is_creator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    where p.id = auth.uid()
      and ur.role = 'creator'::public.app_role
      and p.creator_status = 'approved'::public.creator_status
  );
$$;

create or replace function public.log_action(
  _action text,
  _entity_type text,
  _entity_id text,
  _meta jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, meta)
  values (auth.uid(), _action, _entity_type, _entity_id, _meta);
end;
$$;

-- Protect Profile Columns Trigger
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    if new.creator_status is distinct from old.creator_status then
      raise exception 'Unauthorized modification of creator_status';
    end if;
    if new.is_suspended is distinct from old.is_suspended then
      raise exception 'Unauthorized modification of is_suspended';
    end if;
    if new.id is distinct from old.id then
      raise exception 'Cannot change user id';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_columns on public.profiles;
create trigger trg_protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Auto Create Profile Trigger on auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_handle text;
  base_handle text;
  candidate_handle text;
  suffix int := 0;
  assigned_intent public.learning_intent := 'learn';
begin
  base_handle := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if length(base_handle) < 3 then
    base_handle := 'user_' || substr(md5(random()::text), 1, 6);
  end if;

  candidate_handle := substr(base_handle, 1, 26);
  while exists (select 1 from public.profiles where handle = candidate_handle) loop
    suffix := suffix + 1;
    candidate_handle := substr(base_handle, 1, 22) || '_' || suffix;
  end loop;

  if (new.raw_user_meta_data->>'intent') in ('learn', 'teach', 'both') then
    assigned_intent := (new.raw_user_meta_data->>'intent')::public.learning_intent;
  end if;

  insert into public.profiles (
    id,
    handle,
    full_name,
    intent,
    created_at,
    updated_at
  ) values (
    new.id,
    candidate_handle,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    assigned_intent,
    now(),
    now()
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'student'::public.app_role)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Creator Application Workflow RPCs
create or replace function public.submit_creator_application(_application_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  app_row public.creator_applications%rowtype;
begin
  select * into app_row from public.creator_applications
  where id = _application_id and user_id = auth.uid();

  if not found then
    raise exception 'Application not found or unauthorized';
  end if;

  if app_row.niche is null or app_row.category_id is null or app_row.why_teach is null or app_row.agrees_to_terms = false then
    raise exception 'All required fields must be completed before submission';
  end if;

  update public.creator_applications
  set status = 'submitted', submitted_at = now(), updated_at = now()
  where id = _application_id;

  update public.profiles
  set creator_status = 'pending', updated_at = now()
  where id = auth.uid();
end;
$$;

create or replace function public.approve_creator_application(_application_id uuid, _note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  app_row public.creator_applications%rowtype;
  user_profile public.profiles%rowtype;
begin
  if not public.is_staff() then
    raise exception 'Staff permissions required';
  end if;

  select * into app_row from public.creator_applications where id = _application_id;
  if not found then
    raise exception 'Application not found';
  end if;

  select * into user_profile from public.profiles where id = app_row.user_id;

  update public.creator_applications
  set status = 'approved',
      reviewer_id = auth.uid(),
      review_note = _note,
      reviewed_at = now(),
      updated_at = now()
  where id = _application_id;

  update public.profiles
  set creator_status = 'approved', updated_at = now()
  where id = app_row.user_id;

  insert into public.user_roles (user_id, role, granted_by)
  values (app_row.user_id, 'creator'::public.app_role, auth.uid())
  on conflict do nothing;

  insert into public.creator_profiles (
    user_id,
    display_name,
    slug,
    tagline,
    created_at,
    updated_at
  ) values (
    app_row.user_id,
    coalesce(user_profile.full_name, user_profile.handle),
    user_profile.handle,
    coalesce(app_row.experience_summary, 'Instructor & Creator'),
    now(),
    now()
  ) on conflict (user_id) do update set
    display_name = coalesce(excluded.display_name, creator_profiles.display_name);

  perform public.log_action('creator.approve', 'creator_application', _application_id::text, jsonb_build_object('user_id', app_row.user_id, 'note', _note));
end;
$$;

create or replace function public.reject_creator_application(_application_id uuid, _note text, _needs_changes boolean default false)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  app_row public.creator_applications%rowtype;
  new_status public.application_status;
begin
  if not public.is_staff() then
    raise exception 'Staff permissions required';
  end if;

  select * into app_row from public.creator_applications where id = _application_id;
  if not found then
    raise exception 'Application not found';
  end if;

  new_status := case when _needs_changes then 'needs_changes'::public.application_status else 'rejected'::public.application_status end;

  update public.creator_applications
  set status = new_status,
      reviewer_id = auth.uid(),
      review_note = _note,
      reviewed_at = now(),
      updated_at = now()
  where id = _application_id;

  update public.profiles
  set creator_status = case when _needs_changes then 'none'::public.creator_status else 'rejected'::public.creator_status end,
      updated_at = now()
  where id = app_row.user_id;

  perform public.log_action('creator.reject', 'creator_application', _application_id::text, jsonb_build_object('user_id', app_row.user_id, 'status', new_status, 'note', _note));
end;
$$;

-- Custom Claims JWT Hook (Supabase Auth Hook)
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb;
  user_roles_arr text[];
  user_creator_status text;
begin
  select coalesce(array_agg(role::text), '{}'::text[])
  into user_roles_arr
  from public.user_roles
  where user_id = (event->>'user_id')::uuid;

  select creator_status::text into user_creator_status
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_roles}', to_jsonb(coalesce(user_roles_arr, '{}'::text[])));
  claims := jsonb_set(claims, '{creator_status}', to_jsonb(coalesce(user_creator_status, 'none')));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from public;

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.user_interests enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.creator_applications enable row level security;
alter table public.audit_logs enable row level security;

-- Policies
-- Profiles
drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
  on public.profiles for select
  using (is_suspended = false or public.is_staff());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Staff can manage all profiles" on public.profiles;
create policy "Staff can manage all profiles"
  on public.profiles for all
  using (public.is_staff());

-- User Roles
drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id or public.is_staff());

drop policy if exists "Admins can manage roles" on public.user_roles;
create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.is_admin());

-- Categories
drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select
  using (is_active = true or public.is_staff());

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- User Interests
drop policy if exists "Users can manage their interests" on public.user_interests;
create policy "Users can manage their interests"
  on public.user_interests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Creator Profiles
drop policy if exists "Creator profiles are viewable by public" on public.creator_profiles;
create policy "Creator profiles are viewable by public"
  on public.creator_profiles for select
  using (true);

drop policy if exists "Creators can update own storefront" on public.creator_profiles;
create policy "Creators can update own storefront"
  on public.creator_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Staff can manage creator profiles" on public.creator_profiles;
create policy "Staff can manage creator profiles"
  on public.creator_profiles for all
  using (public.is_staff());

-- Creator Applications
drop policy if exists "Users can manage own draft applications" on public.creator_applications;
create policy "Users can manage own draft applications"
  on public.creator_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('draft', 'needs_changes'));

drop policy if exists "Staff can review applications" on public.creator_applications;
create policy "Staff can review applications"
  on public.creator_applications for all
  using (public.is_staff());

-- Audit Logs
drop policy if exists "Staff can read audit logs" on public.audit_logs;
create policy "Staff can read audit logs"
  on public.audit_logs for select
  using (public.is_staff());

-- Storage Buckets Creation (Idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('banners', 'banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('application-files', 'application-files', false, 20971520, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Storage Policies
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatars are public" on storage.objects;
create policy "Avatars are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own banner" on storage.objects;
create policy "Users can upload their own banner"
  on storage.objects for insert
  with check (
    bucket_id = 'banners' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Banners are public" on storage.objects;
create policy "Banners are public"
  on storage.objects for select
  using (bucket_id = 'banners');

drop policy if exists "Applicants and staff can access application files" on storage.objects;
create policy "Applicants and staff can access application files"
  on storage.objects for all
  using (
    bucket_id = 'application-files' and
    (auth.uid()::text = (storage.foldername(name))[1] or public.is_staff())
  );
