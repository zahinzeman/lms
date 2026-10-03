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
