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
-- Migration 0002: Courses, Sections, Lessons, Quizzes, Assignments, and Curriculum Management
-- Idempotent, RLS default deny on all tables

-- Custom Enums
do $$ begin
  create type public.course_level as enum ('beginner', 'intermediate', 'advanced', 'all_levels');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.course_status as enum ('draft', 'in_review', 'changes_requested', 'published', 'unlisted', 'archived', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pricing_type as enum ('free', 'paid', 'subscription_only');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.lesson_type as enum ('video', 'article', 'quiz', 'assignment', 'live', 'download', 'embed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.video_provider as enum ('upload', 'youtube', 'vimeo', 'bunny', 'mux');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.question_type as enum ('single_choice', 'multiple_choice', 'true_false', 'short_answer');
exception when duplicate_object then null;
end $$;

-- 1. Courses Table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 5 and char_length(title) <= 120),
  slug extensions.citext unique not null,
  subtitle text check (subtitle is null or char_length(subtitle) <= 160),
  description jsonb,
  description_text text,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.categories(id) on delete set null,
  level public.course_level not null default 'all_levels',
  language text not null default 'en',
  has_captions boolean not null default false,
  thumbnail_url text,
  promo_video_provider public.video_provider,
  promo_video_ref text,
  pricing_type public.pricing_type not null default 'paid',
  price_minor int not null default 0 check (price_minor >= 0),
  compare_at_price_minor int check (compare_at_price_minor is null or compare_at_price_minor > 0),
  currency text not null default 'BDT' check (currency in ('BDT', 'USD')),
  outcomes text[] not null default '{}',
  requirements text[] not null default '{}',
  target_audience text[] not null default '{}',
  status public.course_status not null default 'draft',
  review_note text,
  submitted_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  sections_count int not null default 0,
  lessons_count int not null default 0,
  total_duration_seconds int not null default 0,
  preview_lessons_count int not null default 0,
  enrolled_count int not null default 0,
  rating_avg numeric(3,2) default 0,
  rating_count int not null default 0,
  drip_enabled boolean not null default false,
  certificate_enabled boolean not null default true,
  qa_enabled boolean not null default true,
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description_text, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_pricing_rules check (
    (pricing_type = 'free' and price_minor = 0) or
    (pricing_type = 'paid' and price_minor > 0) or
    (pricing_type = 'subscription_only')
  )
);

comment on table public.courses is 'Core courses entity created by approved creators.';

create index if not exists idx_courses_published_at on public.courses (status, published_at desc);
create index if not exists idx_courses_category_status on public.courses (category_id, status);
create index if not exists idx_courses_creator on public.courses (creator_id);
create index if not exists idx_courses_rating on public.courses (rating_avg desc);
create index if not exists idx_courses_search on public.courses using gin (search);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- 2. Course Sections
create table if not exists public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_course_sections_position unique (course_id, position) deferrable initially deferred
);

drop trigger if exists set_course_sections_updated_at on public.course_sections;
create trigger set_course_sections_updated_at
  before update on public.course_sections
  for each row execute function public.set_updated_at();

-- 3. Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  section_id uuid not null references public.course_sections(id) on delete cascade,
  title text not null,
  type public.lesson_type not null,
  position int not null,
  summary text,
  content jsonb,
  video_provider public.video_provider,
  video_ref text,
  duration_seconds int not null default 0,
  is_preview boolean not null default false,
  is_published boolean not null default true,
  drip_days int,
  unlock_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_lessons_position unique (section_id, position) deferrable initially deferred
);

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

-- 4. Lesson Resources
create table if not exists public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('file', 'link')),
  file_path text,
  url text,
  size_bytes bigint,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 5. Quizzes
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  pass_percent int not null default 70,
  shuffle boolean not null default true,
  max_attempts int,
  time_limit_seconds int,
  show_answers text not null default 'after_submit' check (show_answers in ('never', 'after_submit', 'after_pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Quiz Questions
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  type public.question_type not null,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct jsonb not null,
  explanation text,
  points int not null default 1,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 7. Assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  instructions jsonb,
  submission_type text not null default 'text' check (submission_type in ('text', 'file', 'link', 'any')),
  max_score int not null default 100,
  rubric jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Tags & Course Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug extensions.citext unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.course_tags (
  course_id uuid references public.courses(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (course_id, tag_id)
);

-- 9. Course Instructors
create table if not exists public.course_instructors (
  course_id uuid references public.courses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'co_instructor', 'assistant')),
  revenue_share_bps int not null default 0 check (revenue_share_bps >= 0 and revenue_share_bps <= 10000),
  primary key (course_id, user_id)
);

-- 10. Wishlists (Polymorphic: course, product, community)
create table if not exists public.wishlists (
  user_id uuid references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('course', 'product', 'community')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

-- 11. Course Review Events
create table if not exists public.course_review_events (
  id bigserial primary key,
  course_id uuid not null references public.courses(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  from_status public.course_status,
  to_status public.course_status,
  note text,
  created_at timestamptz not null default now()
);

-- Helper & Auth Functions
create or replace function public.is_course_instructor(_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.course_instructors
    where course_id = _course_id and user_id = auth.uid()
  );
$$;

-- can_view_lesson: Phase 3 foundation, replaced in Phase 4 to include enrollments
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
  select l.is_preview, l.course_id, c.status into lesson_rec
  from public.lessons l
  join public.courses c on c.id = l.course_id
  where l.id = _lesson_id;

  if not found then
    return false;
  end if;

  if public.is_staff() then
    return true;
  end if;

  if public.is_course_instructor(lesson_rec.course_id) then
    return true;
  end if;

  if lesson_rec.status in ('published', 'unlisted') and lesson_rec.is_preview then
    return true;
  end if;

  return false;
end;
$$;

-- Auto-insert owner as instructor on course creation
create or replace function public.handle_course_creator_as_instructor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.course_instructors (course_id, user_id, role, revenue_share_bps)
  values (new.id, new.creator_id, 'owner', 10000)
  on conflict (course_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_course_created_instructor on public.courses;
create trigger on_course_created_instructor
  after insert on public.courses
  for each row execute function public.handle_course_creator_as_instructor();

-- Sync Curriculum Counts and Duration on Courses
create or replace function public.sync_course_curriculum_cache()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_course_id uuid;
begin
  target_course_id := coalesce(new.course_id, old.course_id);

  update public.courses set
    sections_count = (select count(*) from public.course_sections where course_id = target_course_id),
    lessons_count = (select count(*) from public.lessons where course_id = target_course_id),
    preview_lessons_count = (select count(*) from public.lessons where course_id = target_course_id and is_preview = true),
    total_duration_seconds = coalesce((select sum(duration_seconds) from public.lessons where course_id = target_course_id), 0)
  where id = target_course_id;

  return null;
end;
$$;

drop trigger if exists trg_sync_course_sections on public.course_sections;
create trigger trg_sync_course_sections
  after insert or update or delete on public.course_sections
  for each row execute function public.sync_course_curriculum_cache();

drop trigger if exists trg_sync_course_lessons on public.lessons;
create trigger trg_sync_course_lessons
  after insert or update or delete on public.lessons
  for each row execute function public.sync_course_curriculum_cache();

-- RPC: Submit Course For Review
create or replace function public.submit_course_for_review(_course_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  course_row public.courses%rowtype;
begin
  select * into course_row from public.courses where id = _course_id and creator_id = auth.uid();
  if not found then
    raise exception 'Course not found or unauthorized';
  end if;

  if course_row.sections_count < 1 or course_row.lessons_count < 1 then
    raise exception 'Course must have at least one section and lesson before submission';
  end if;

  update public.courses
  set status = 'in_review', submitted_at = now(), updated_at = now()
  where id = _course_id;

  insert into public.course_review_events (course_id, actor_id, from_status, to_status, note)
  values (_course_id, auth.uid(), course_row.status, 'in_review', 'Submitted for review');
end;
$$;

-- RPC: Moderate Course
create or replace function public.moderate_course(
  _course_id uuid,
  _action text,
  _note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_status public.course_status;
  new_status public.course_status;
begin
  if not public.is_staff() then
    raise exception 'Staff permissions required';
  end if;

  select status into old_status from public.courses where id = _course_id;
  if not found then
    raise exception 'Course not found';
  end if;

  if _action = 'approve' then
    new_status := 'published';
    update public.courses set status = 'published', published_at = now(), updated_at = now() where id = _course_id;
  elsif _action = 'request_changes' then
    new_status := 'changes_requested';
    update public.courses set status = 'changes_requested', review_note = _note, updated_at = now() where id = _course_id;
  elsif _action = 'reject' then
    new_status := 'rejected';
    update public.courses set status = 'rejected', review_note = _note, updated_at = now() where id = _course_id;
  elsif _action = 'unpublish' then
    new_status := 'draft';
    update public.courses set status = 'draft', updated_at = now() where id = _course_id;
  elsif _action = 'feature' then
    update public.courses set is_featured = true, updated_at = now() where id = _course_id;
    return;
  elsif _action = 'unfeature' then
    update public.courses set is_featured = false, updated_at = now() where id = _course_id;
    return;
  else
    raise exception 'Invalid moderation action';
  end if;

  insert into public.course_review_events (course_id, actor_id, from_status, to_status, note)
  values (_course_id, auth.uid(), old_status, new_status, _note);

  perform public.log_action('course.moderate', 'course', _course_id::text, jsonb_build_object('action', _action, 'note', _note));
end;
$$;

-- RPC: Strip correct answers for learners
create or replace function public.get_quiz_for_learner(_lesson_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  quiz_rec record;
  questions_json jsonb;
begin
  select q.id, q.pass_percent, q.time_limit_seconds, q.max_attempts, q.shuffle
  into quiz_rec
  from public.quizzes q
  where q.lesson_id = _lesson_id;

  if not found then
    return null;
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'id', qq.id,
      'type', qq.type,
      'prompt', qq.prompt,
      'options', qq.options,
      'points', qq.points,
      'position', qq.position
    ) order by qq.position
  ) into questions_json
  from public.quiz_questions qq
  where qq.quiz_id = quiz_rec.id;

  return jsonb_build_object(
    'quiz_id', quiz_rec.id,
    'pass_percent', quiz_rec.pass_percent,
    'time_limit_seconds', quiz_rec.time_limit_seconds,
    'questions', coalesce(questions_json, '[]'::jsonb)
  );
end;
$$;

-- Safe Curriculum View (Publicly readable safe metadata)
create or replace view public.course_curriculum as
select
  s.id as section_id,
  s.course_id,
  s.title as section_title,
  s.position as section_position,
  l.id as lesson_id,
  l.title as lesson_title,
  l.type as lesson_type,
  l.position as lesson_position,
  l.duration_seconds,
  l.is_preview
from public.course_sections s
join public.lessons l on l.section_id = s.id
join public.courses c on c.id = s.course_id
where (c.status in ('published', 'unlisted') or public.is_course_instructor(c.id) or public.is_staff())
  and l.is_published = true;

-- Enable RLS
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.assignments enable row level security;
alter table public.tags enable row level security;
alter table public.course_tags enable row level security;
alter table public.course_instructors enable row level security;
alter table public.wishlists enable row level security;
alter table public.course_review_events enable row level security;

-- Policies
-- Courses
drop policy if exists "Published courses are publicly viewable" on public.courses;
create policy "Published courses are publicly viewable"
  on public.courses for select
  using (status in ('published', 'unlisted') or public.is_course_instructor(id) or public.is_staff());

drop policy if exists "Creators can insert own courses" on public.courses;
create policy "Creators can insert own courses"
  on public.courses for insert
  with check (public.is_creator() and creator_id = auth.uid());

drop policy if exists "Instructors can update own draft courses" on public.courses;
create policy "Instructors can update own draft courses"
  on public.courses for update
  using (public.is_course_instructor(id) or public.is_staff());

drop policy if exists "Instructors can delete draft courses" on public.courses;
create policy "Instructors can delete draft courses"
  on public.courses for delete
  using (creator_id = auth.uid() and status = 'draft');

-- Course Sections
drop policy if exists "Sections are viewable by parent course visibility" on public.course_sections;
create policy "Sections are viewable by parent course visibility"
  on public.course_sections for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.status in ('published', 'unlisted') or public.is_course_instructor(c.id) or public.is_staff())));

drop policy if exists "Instructors can manage sections" on public.course_sections;
create policy "Instructors can manage sections"
  on public.course_sections for all
  using (public.is_course_instructor(course_id) or public.is_staff());

-- Lessons
drop policy if exists "Lessons content accessible only if permitted" on public.lessons;
create policy "Lessons content accessible only if permitted"
  on public.lessons for select
  using (public.can_view_lesson(id));

drop policy if exists "Instructors can manage lessons" on public.lessons;
create policy "Instructors can manage lessons"
  on public.lessons for all
  using (public.is_course_instructor(course_id) or public.is_staff());

-- Lesson Resources & Quizzes & Assignments
drop policy if exists "Resources viewable if lesson viewable" on public.lesson_resources;
create policy "Resources viewable if lesson viewable"
  on public.lesson_resources for select
  using (public.can_view_lesson(lesson_id));

drop policy if exists "Instructors manage resources" on public.lesson_resources;
create policy "Instructors manage resources"
  on public.lesson_resources for all
  using (exists (select 1 from public.lessons l where l.id = lesson_id and (public.is_course_instructor(l.course_id) or public.is_staff())));

drop policy if exists "Quizzes viewable if lesson viewable" on public.quizzes;
create policy "Quizzes viewable if lesson viewable"
  on public.quizzes for select
  using (public.can_view_lesson(lesson_id));

drop policy if exists "Instructors manage quizzes" on public.quizzes;
create policy "Instructors manage quizzes"
  on public.quizzes for all
  using (exists (select 1 from public.lessons l where l.id = lesson_id and (public.is_course_instructor(l.course_id) or public.is_staff())));

-- Quiz Questions (Correct answer strictly protected from learners)
drop policy if exists "Quiz questions visible only to instructors and staff" on public.quiz_questions;
create policy "Quiz questions visible only to instructors and staff"
  on public.quiz_questions for all
  using (exists (
    select 1 from public.quizzes q
    join public.lessons l on l.id = q.lesson_id
    where q.id = quiz_id and (public.is_course_instructor(l.course_id) or public.is_staff())
  ));

-- Wishlists
drop policy if exists "Users manage their wishlist" on public.wishlists;
create policy "Users manage their wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tags
drop policy if exists "Tags are publicly readable" on public.tags;
create policy "Tags are publicly readable"
  on public.tags for select
  using (true);

drop policy if exists "Creators and staff can create tags" on public.tags;
create policy "Creators and staff can create tags"
  on public.tags for insert
  with check (public.is_creator() or public.is_staff());

-- Storage Buckets for Courses
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-thumbnails', 'course-thumbnails', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('course-videos', 'course-videos', false, 1073741824, array['video/mp4', 'video/webm', 'video/quicktime']),
  ('course-resources', 'course-resources', false, 52428800, null)
on conflict (id) do update set
  public = excluded.public;

drop policy if exists "Course thumbnails are public" on storage.objects;
create policy "Course thumbnails are public"
  on storage.objects for select
  using (bucket_id = 'course-thumbnails');

drop policy if exists "Instructors upload thumbnails" on storage.objects;
create policy "Instructors upload thumbnails"
  on storage.objects for insert
  with check (
    bucket_id = 'course-thumbnails' and
    (public.is_course_instructor(((storage.foldername(name))[1])::uuid) or public.is_staff())
  );
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
-- ==============================================================================
-- 0004: Learning Experience, Progress, Quizzes, Certificates & Communities
-- ==============================================================================

-- 1. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'purchase' CHECK (source IN ('purchase', 'free', 'subscription', 'coupon_full', 'admin_grant', 'bundle')),
    access_status TEXT NOT NULL DEFAULT 'active' CHECK (access_status IN ('active', 'revoked', 'expired')),
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    completed_lessons_count INTEGER NOT NULL DEFAULT 0,
    last_accessed_lesson_id UUID,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- 2. Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    last_position_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, lesson_id)
);

-- 3. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    pdf_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 4. Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description JSONB,
    cover_url TEXT,
    icon_url TEXT,
    tint TEXT NOT NULL DEFAULT '#ff385c',
    category_id UUID,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    is_listed BOOLEAN NOT NULL DEFAULT true,
    access_type TEXT NOT NULL DEFAULT 'free' CHECK (access_type IN ('free', 'paid', 'plan', 'invite')),
    price_monthly_minor BIGINT DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BDT' CHECK (currency IN ('BDT', 'USD')),
    member_count INTEGER NOT NULL DEFAULT 1,
    online_count INTEGER NOT NULL DEFAULT 0,
    posts_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Community Members Table
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    level INTEGER NOT NULL DEFAULT 1,
    points INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(community_id, user_id)
);

-- 6. Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL DEFAULT 'General',
    title TEXT NOT NULL,
    body_text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public certificates view" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Public communities view" ON public.communities FOR SELECT USING (is_listed = true);
CREATE POLICY "Community members can view posts" ON public.community_posts FOR SELECT USING (true);
