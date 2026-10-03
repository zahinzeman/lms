# PROMPT 2 of 6: Supabase Auth, Roles, Profiles, Onboarding & Creator Applications

You are continuing a production LMS + creator marketplace (Udemy × Skool) built with Next.js App Router, TypeScript, Tailwind v4, and Supabase, deployed on Vercel. **Phase 1 is complete and deployed.** The GitHub repo, Supabase project, and Vercel project are connected, and the env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL` are set.

## 0. Before you write any code
1. Read `docs/PROJECT_CONTEXT.md`, `docs/DESIGN_SYSTEM.md`, `docs/ROADMAP.md`, and `src/config/nav.ts`.
2. Inspect the existing `lib/supabase/*`, `lib/auth/*`, `lib/data/*`, the `(auth)` pages, and the AppShell.
3. **Do not restructure Phase 1.** Extend it. Keep the data-access-layer rule: components call `lib/data/*` and never query Supabase inline.

**Design rules (unchanged, enforce them on every new screen):** flat only, **no shadows, no borders/strokes** (the only line allowed is the focus-visible outline), separation through the surface shade ladder (`canvas → surface-1 → surface-2 → surface-3`), no card-in-card stacking, Rausch `#ff385c` as the single accent, Figtree, and the AppShell with a **15% sidebar / 85% content** layout.

---

## 1. Goal of this phase
Replace the mock session with **real Supabase Auth**. Introduce a **multi-role** model (student / creator / moderator / admin). Build profiles, onboarding, account settings, the **creator application → admin approval** flow, and route protection. After this phase, real people can sign up, onboard, and apply to become creators, and an admin can approve them, which unlocks Creator Studio in the sidebar.

---

## 2. SQL migration: write `supabase/migrations/0001_core_auth.sql`

The owner will paste this file into the **Supabase SQL Editor** and run it. Requirements:
- **Idempotent:** `create extension if not exists`, `create table if not exists`, `do $$ begin create type ... exception when duplicate_object then null; end $$;`, `drop policy if exists ... ; create policy ...`, and `create or replace function`.
- **RLS enabled on every table.** Default deny. Write explicit policies.
- Every `security definer` function sets `set search_path = ''` and uses fully qualified names (`public.x`, `auth.uid()`).
- `created_at timestamptz not null default now()` and `updated_at` with a shared `public.set_updated_at()` trigger.
- Add comments (`comment on table ...`) on each table.

### 2.1 Types
- `app_role` enum: `student`, `creator`, `moderator`, `admin`
- `creator_status` enum: `none`, `pending`, `approved`, `rejected`, `suspended`
- `application_status` enum: `draft`, `submitted`, `under_review`, `approved`, `rejected`, `needs_changes`
- `learning_intent` enum: `learn`, `teach`, `both`

### 2.2 Tables
**`profiles`**: 1:1 with `auth.users`
- `id uuid pk references auth.users(id) on delete cascade`
- `handle citext unique not null` (3–30 chars, `^[a-z0-9_\.]+$`, check constraint; auto-generated from email on signup, editable)
- `full_name text`, `avatar_url text`, `headline text` (≤120), `bio text` (≤2000)
- `country text default 'BD'`, `timezone text default 'Asia/Dhaka'`, `locale text default 'en'`, `preferred_currency text default 'BDT' check in ('BDT','USD')`
- `website text`, `socials jsonb default '{}'` (keys: linkedin, youtube, facebook, x, instagram, github, tiktok)
- `intent learning_intent default 'learn'`
- `creator_status creator_status not null default 'none'`
- `onboarding_completed_at timestamptz`
- `is_suspended boolean default false`, `last_seen_at timestamptz`
- timestamps

**`user_roles`**: `user_id uuid references profiles on delete cascade`, `role app_role`, `granted_by uuid null`, `created_at`, **pk(user_id, role)**

**`categories`**: needed by onboarding interests now, and by courses in Phase 3
- `id uuid pk default gen_random_uuid()`, `parent_id uuid null references categories`, `name text`, `slug citext unique`, `icon text` (a lucide icon name), `tint text` (one of rose/blue/green/amber/violet/plum), `description text`, `position int`, `is_active bool default true`, timestamps

**`user_interests`**: `user_id`, `category_id`, pk(user_id, category_id)

**`creator_profiles`**: extra public data for approved creators
- `user_id uuid pk references profiles on delete cascade`
- `display_name text`, `slug citext unique` (storefront handle, defaults to the profile handle), `tagline text`, `about jsonb` (rich text), `banner_url text`, `accent_tint text`
- `expertise text[]`, `years_experience int`, `website text`, `socials jsonb`
- `platform_plan text not null default 'free' check in ('free','pro','business')`, `platform_fee_bps int not null default 1500` (15.00%)
- `payout_method jsonb` (filled in Phase 4. **Never** exposed publicly; see the column-level note below)
- `is_featured bool default false`, `verified bool default false`
- stats caches: `students_count int default 0`, `courses_count int default 0`, `rating_avg numeric(3,2)`, `rating_count int default 0`
- timestamps

**`creator_applications`**
- `id uuid pk`, `user_id uuid references profiles`, `status application_status default 'draft'`
- `niche text`, `category_id uuid references categories`, `experience_summary text`, `teaching_experience text`
- `portfolio_links text[]`, `sample_content_url text`, `planned_offerings text[]` (values: course, product, community, membership)
- `audience_size text` (ranges: `0-1k`, `1k-10k`, `10k-100k`, `100k+`), `audience_channels text[]`
- `why_teach text`, `agrees_to_terms bool`
- `reviewer_id uuid null`, `review_note text`, `submitted_at`, `reviewed_at`, timestamps
- Partial unique index: only one non-final (`draft|submitted|under_review|needs_changes`) application per user.

**`audit_logs`** (used everywhere later): `id bigserial`, `actor_id uuid`, `action text` (e.g. `creator.approve`), `entity_type text`, `entity_id text`, `meta jsonb`, `ip inet null`, `created_at`. Insert-only, through a security-definer function `public.log_action(...)`.

### 2.3 Helper functions (security definer, stable)
- `public.has_role(_role app_role) returns boolean`: checks `user_roles` for `auth.uid()`
- `public.is_admin()` is true for `admin`. `public.is_staff()` is true for `admin` or `moderator`
- `public.is_creator()` is true when the user has the `creator` role and `creator_status = 'approved'`
- `public.handle_new_user()` trigger on `auth.users` insert. It creates the profile (full_name and intent from `raw_user_meta_data`, plus a unique handle derived from the email local part with a numeric suffix on collision), inserts the `student` role, and inserts `user_interests` if they were passed in metadata.
- `public.approve_creator_application(_application_id uuid, _note text)`: staff only. It sets the application to approved, sets the profile `creator_status = 'approved'`, inserts the `creator` role, upserts `creator_profiles`, and writes the audit log. **Atomic.**
- `public.reject_creator_application(_application_id uuid, _note text, _needs_changes boolean)`
- `public.submit_creator_application(_application_id uuid)`: owner only, validates required fields, then sets `status='submitted'` and `submitted_at`.

### 2.4 RLS policies
- `profiles`: select is **public** for non-suspended profiles, but expose sensitive fields only through a **view** `public.public_profiles` (id, handle, full_name, avatar_url, headline, bio, country, socials, creator_status). Users update only their own row and **cannot** change `creator_status`, `is_suspended`, or `id`. Enforce this with a `before update` trigger that rejects changes to protected columns unless `is_staff()`. Staff can update anything.
- `user_roles`: users select their own rows. Only admins insert or delete. Moderators cannot grant `admin`.
- `categories`: public select where `is_active`. Admin all.
- `user_interests`: owner all.
- `creator_profiles`: public select through the view `public.public_creator_profiles` (excluding `payout_method` and `platform_fee_bps`). Owner select/update on their own row (cannot change `platform_plan`, `platform_fee_bps`, `verified`, or `is_featured`; enforce with a trigger). Staff all.
- `creator_applications`: owner select/insert/update while status is `draft|needs_changes`. Staff select and update.
- `audit_logs`: staff select only. No direct insert (only through the function).

### 2.5 Storage
Create the buckets with SQL (`insert into storage.buckets ... on conflict do nothing`):
- `avatars` (public). Path `{user_id}/avatar.{ext}`. Users write only under their own folder. Max 2MB, images only (enforce client-side and in the server action).
- `banners` (public). Path `{user_id}/...`. Same rule.
- `application-files` (private). Owner and staff read.

### 2.6 Seed: `supabase/seed/0001_seed.sql`
- The 12 top-level categories from Phase 1 (with icon and tint), plus 3–5 subcategories each (e.g. Development → Web Development, Mobile, Python, JavaScript, DevOps).
- Instructions in a comment for making yourself an admin: `insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'YOU@EXAMPLE.COM' on conflict do nothing;`

### 2.7 Types
Add an `npm run db:types` script: `supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.ts`. Also hand-write `src/types/database.ts` to match the migration now, so the build passes before the CLI is configured. Document the CLI login steps in the README.

---

## 3. Auth implementation

- **Providers:** email + password, magic link (OTP email), Google OAuth. The Google button hides itself if `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== 'true'`.
- **Route handler** `src/app/auth/callback/route.ts`: exchanges the code for a session, then redirects to `next` (validated to be a same-origin relative path) or to `/onboarding` if `onboarding_completed_at` is null, otherwise to `/dashboard`.
- **Server actions** in `lib/auth/actions.ts`: `signUp`, `signIn`, `signInWithMagicLink`, `signInWithGoogle`, `signOut`, `requestPasswordReset`, `updatePassword`, `resendVerification`. Each one validates with zod, returns a typed `{ ok, error, fieldErrors }`, and uses friendly error copy (map Supabase error codes such as `invalid_credentials`, `email_not_confirmed`, `user_already_exists`, and rate-limit errors).
- Signup passes `full_name`, `intent`, and an optional `interests[]` in `options.data`.
- **Session:** `getCurrentUser()` in `lib/auth/session.ts` returns `{ id, email, profile, roles: AppRole[], isCreator, isStaff, isAdmin } | null`. Cache it per request with React `cache()`. Remove the `NEXT_PUBLIC_DEMO_ROLE` mock (or keep it only when `NODE_ENV==='development'` and Supabase vars are missing).
- **Middleware** (`middleware.ts` + `lib/supabase/middleware.ts`):
  - Refresh the session on every request (exclude static assets with a matcher).
  - `(app)` routes require a session. Otherwise redirect to `/login?next=...`.
  - `/studio/**` requires an approved creator. Otherwise redirect to `/become-creator`.
  - `/admin/**` requires staff. Otherwise send a 404 (don't reveal that the route exists).
  - Logged-in users hitting `/login` or `/signup` go to `/dashboard`.
  - Users with no `onboarding_completed_at` are sent to `/onboarding` (except for `/onboarding`, `/auth/*`, `/settings/*`, and logout).
  - Suspended users get a `/suspended` page.
  - Middleware checks must be fast: read the roles from JWT custom claims if you implement the **Custom Access Token Hook** (preferred: write `public.custom_access_token_hook` that adds `user_roles` and `creator_status` to the claims, and document how to enable it in **Supabase → Auth → Hooks**). Fall back to a DB lookup if the claim is absent.
  - **Also enforce authorization in server components and actions**, not only in middleware (defense in depth): add `requireUser()`, `requireCreator()`, and `requireStaff()` helpers.

---

## 4. Screens to build (flat design, real copy)

### 4.1 Auth screens (wire up the Phase 1 UIs)
Loading states on buttons, inline field errors, a success screen for "check your email", and a resend timer (60s). Reset-password works from the email link.

### 4.2 Onboarding `/onboarding`: a 4-step wizard, full screen, no sidebar
A progress bar at the top (flat Rausch fill). Back and Skip links. Each step is one flat panel on canvas.
1. **"What brings you here?"**: large selectable tiles on `surface-2` (selected = `ink` bg + white text): Learn new skills / Teach & earn / Both.
2. **"Pick what you're into"**: category chips (min 3) loaded from `categories`, each with its tint icon.
3. **Profile basics**: avatar upload (crop to square client-side, upload to `avatars`), full name, handle with a live availability check (debounced server action), headline, country, and currency.
4. **"You're in"**: personalized next steps. Learners see 3 recommended mock courses from their interests plus "Explore courses". Teachers see "Start your creator application" (primary) and "Explore first" (secondary).
Saving sets `onboarding_completed_at`.

### 4.3 Settings `/settings/*` (inside the AppShell, with a secondary horizontal Tabs nav at the top of the content area, not a second sidebar)
- **Profile**: avatar, name, handle, headline, bio (textarea with counter), website, socials, and a preview of the public profile.
- **Account**: email change (with a confirmation email), language, timezone, currency.
- **Security**: change password, sign out of all sessions, and a connected-accounts list (Google link/unlink).
- **Notifications**: placeholder toggles (wired in Phase 6), stored later.
- **Billing**: placeholder (Phase 4).
- **Danger zone**: a delete-account request. It sets a flag and emails support later (soft delete only). Show it as an `error-tint` tile, **not** a red border.

### 4.4 Public profile `/u/[handle]` (discover layout)
Avatar, name, headline, bio, socials, joined date, and, if the user is a creator, a link to their storefront. Respect the `public_profiles` view.

### 4.5 Become a creator `/become-creator`
- If `creator_status='none'`: a short pitch (reuse the homepage creator band pieces in the app context), then the **multi-step application form** (autosaves a draft to `creator_applications` on every step):
  1. About you & niche (category, niche, experience summary)
  2. Teaching experience & samples (portfolio links, sample content URL or file upload to `application-files`)
  3. What you'll offer (course / digital products / community / membership as multi-select tiles) and your audience size and channels
  4. Why you want to teach, a terms checkbox, and a review & submit step
- If `pending`: a status timeline (Submitted → Under review → Decision) with the expected time ("usually within 48 hours").
- If `needs_changes`: show the reviewer note in a `warning-tint` tile and let them edit and resubmit.
- If `rejected`: show the note and a "reapply after 30 days" date.
- If `approved`: a celebration state plus a "Go to Creator Studio" CTA.

### 4.6 Admin: Creator Applications `/admin/creators`
- Tabs: Submitted · Under review · Needs changes · Approved · Rejected (with counts).
- A flat table (alternating rows): applicant (avatar, name, handle), niche, category, audience size, submitted date, and status badge.
- A detail **Sheet** (from the right, surface-1 bg): every answer, links, sample file (a signed URL), the applicant's profile, and actions **Approve** (primary), **Request changes** (secondary + note), **Reject** (ghost + note). Actions call the security-definer RPCs and write audit logs. Toast on success.
- `/admin/users`: searchable user list (name, email, roles, creator status, joined, last seen). Row actions: grant/revoke roles (admin only), suspend/unsuspend, view profile. Every action is audit-logged.

### 4.7 AppShell becomes role-aware
- The sidebar nav filters by real roles. The workspace switcher only shows the workspaces the user has. The cookie persists the last workspace, which falls back to Learning if the role was lost.
- The topbar avatar menu has: View profile, Settings, Switch workspace, Help, and Log out.
- The sidebar bottom CTA is now dynamic: `none` → "Become a creator", `pending` → "Application under review", `approved` on the free plan → "Upgrade to Pro".
- Sidebar badge counts: admin "Creator Applications" shows the number of submitted applications.

### 4.8 Dashboard `/dashboard` (student home, now personalized)
A greeting with the user's first name and the date, then "Continue learning" (mock until Phase 5), "Recommended for you" (mock courses filtered by `user_interests`), "Your communities" (mock), and a creator CTA tile if the intent is `teach|both` and they haven't applied.

---

## 5. Data-access layer additions (`lib/data/`)
`profiles.ts` (getProfileByHandle, updateProfile, isHandleAvailable, uploadAvatar), `categories.ts` (listCategories, getCategoryBySlug, now **from Supabase** instead of mock), `creatorApplications.ts`, `adminUsers.ts`. All mutations are **server actions** with zod schemas in `lib/validation/*`, and they call `revalidatePath`/`revalidateTag` appropriately.

---

## 6. Security checklist (verify each item)
- [ ] The service-role client is used only in server-only files, and only where RLS truly must be bypassed (e.g. never for normal user reads).
- [ ] The open-redirect check on `next` params works.
- [ ] A user cannot escalate privileges: test with the anon key that updating your own `creator_status` or inserting into `user_roles` fails.
- [ ] Avatar upload rejects non-images and files over 2MB, both client-side and server-side.
- [ ] The application file bucket is private, and signed URLs expire in 10 minutes.
- [ ] Rate-limit sensitive actions (signup, magic link, handle check). Use a simple in-memory/edge limiter now and leave a note for Upstash in Phase 6.

---

## 7. Definition of Done
- [ ] `0001_core_auth.sql` runs cleanly **twice in a row** in the SQL Editor (idempotent). The seed runs cleanly.
- [ ] Sign up → verify email → onboarding → dashboard works locally and on Vercel.
- [ ] Google OAuth works when enabled. Magic link works. Password reset works.
- [ ] Applying as a creator → admin approves → Creator Studio appears in the switcher **without a re-login** (refresh the session or claims after approval).
- [ ] `/admin` returns 404 for non-staff. `/studio` redirects non-creators.
- [ ] Every new screen follows the flat rules (no shadow, no border classes). Responsive down to 375px.
- [ ] `npm run build`, `lint`, and `typecheck` pass. `docs/PROJECT_CONTEXT.md` has been updated (phase 2 ✅, new tables, new env vars, decisions).

At the end, output: (1) the exact SQL files to run, in order, (2) the Supabase dashboard settings to change (Auth providers, redirect URLs, the Custom Access Token Hook, email templates), (3) how to make yourself admin, and (4) a manual test script.
