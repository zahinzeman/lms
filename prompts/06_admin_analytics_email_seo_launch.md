# PROMPT 6 of 6: Admin Console, Analytics, Email, Global Search, SEO, Automation, Hardening & Launch

You are finishing a production LMS + creator marketplace (Udemy × Skool) built with Next.js App Router, TypeScript, Tailwind v4, and Supabase on Vercel. **Phases 1–5 are complete**: the flat design system and 15/85 AppShell, auth and roles, the course builder and catalog, digital products, commerce (Stripe + SSLCommerz), subscriptions, coupons, earnings and payouts, the course player, certificates, reviews, Q&A, Skool-style communities with gamification, and realtime notifications.

## 0. Before you write any code
1. Read `docs/*`, `src/types/database.ts`, and migrations `0001`–`0004`. List every remaining stub or TODO in the codebase (`grep -rn "TODO\|coming soon\|Phase 6" src/`) and fix all of them in this phase.
2. Design rules: **flat, no shadows, no borders/strokes, shade-ladder separation, no card-in-card, a single Rausch accent, a 15% sidebar / 85% content shell.** Charts follow the same rules: no chart borders or gridline clutter, flat fills, and Rausch as the primary series with the neutral ladder for the rest.

---

## 1. Goal of this phase
Make the platform **operable, measurable, discoverable, and launch-ready**:
1. A complete **Admin console** (overview, users, catalog, money, trust and safety, CMS, settings, audit).
2. **Analytics** for creators and admins (revenue, enrollments, engagement, funnel).
3. **Transactional and lifecycle email** (Resend + React Email) and notification preferences.
4. **Global search** across courses, products, communities, creators, and posts.
5. **SEO**: sitemap, metadata, OG images, structured data.
6. **Automation** (Vercel Cron): releasing earnings, subscription renewals and expiry, reminders, digests, and stats rollups.
7. **Hardening**: a security audit of RLS, rate limiting, error monitoring, performance, accessibility, and tests.
8. **Homepage CMS** so the marketing homepage is editable without code.

---

## 2. SQL migration: write `supabase/migrations/0005_admin_analytics.sql`
Same conventions: idempotent, RLS everywhere, a security definer with `search_path=''`.

### 2.1 Site settings and CMS
**`site_settings`**: a single row (`id int pk default 1 check (id=1)`): `brand_name`, `support_email`, `default_currency`, `supported_currencies text[]`, `refund_window_days int default 30`, `refund_max_progress_pct int default 30`, `earnings_hold_days int default 14`, `min_payout_bdt_minor`, `min_payout_usd_minor`, `fee_bps_free`, `fee_bps_pro`, `fee_bps_business`, `maintenance_mode bool`, `signup_enabled bool`, `creator_applications_open bool`, `announcement_bar jsonb` (`{enabled, text, link, tint}`), `social_links jsonb`, `updated_by`, `updated_at`. Public select (non-sensitive columns through a view). Admin update. **Refactor** the hard-coded values from Phases 3–5 (refund window, hold days, fees, min payout) to read from here (DB functions read the table; the app reads through a cached `getSiteSettings()`).
**`homepage_blocks`**: `id`, `key text unique` (`hero`, `category_strip`, `trending`, `how_it_works`, `communities`, `products`, `outcomes`, `creator_band`, `top_creators`, `plans`, `faq`, `final_cta`), `is_enabled bool`, `position int`, `content jsonb` (copy, images, CTA labels and links, stats numbers, testimonials, FAQs), `updated_by`, `updated_at`
**`featured_items`**: `id`, `slot text` (`home_trending`, `home_communities`, `home_products`, `home_creators`, `explore_banner`), `item_type`, `item_id`, `position`, `starts_at`, `ends_at`
Seed `homepage_blocks` with the exact Phase 1 copy so nothing changes visually.

### 2.2 Analytics
**`page_events`** (lightweight first-party analytics; insert through a route handler using the service role, with no client insert policy): `id bigserial`, `occurred_at`, `session_id text`, `user_id null`, `event text` (`page_view`, `course_view`, `product_view`, `community_view`, `add_to_cart`, `checkout_started`, `purchase`, `signup`, `lesson_started`, `lesson_completed`, `search`), `entity_type`, `entity_id`, `creator_id null`, `path`, `referrer`, `utm jsonb`, `country text` (from the Vercel geo header), `device text`, `meta jsonb`. A BRIN index on `occurred_at`, plus indexes on `(creator_id, occurred_at)` and `(entity_id, occurred_at)`. Partitioning by month is optional. Add a retention note (purge after 13 months through cron).
**`daily_creator_stats`**: `creator_id`, `day date`, `currency`, `gross_minor`, `net_minor`, `orders`, `refunds_minor`, `new_enrollments`, `new_subscribers`, `churned_subscribers`, `mrr_minor`, `course_views`, `product_views`, `community_views`, `lessons_completed`, `new_members`, `posts`, pk(creator_id, day, currency)
**`daily_platform_stats`**: `day`, `currency`, `gmv_minor`, `platform_revenue_minor`, `orders`, `refunds_minor`, `signups`, `new_creators`, `active_learners`, `active_creators`, `lessons_completed`, `mrr_minor`, pk(day, currency)
**`daily_course_stats`**: `course_id`, `day`, `views`, `add_to_carts`, `purchases`, `enrollments`, `revenue_minor`, `lessons_completed`, `avg_progress`, pk
**Functions:** `public.rollup_daily_stats(_day date)` (idempotent upserts from orders, order_items, enrollments, subscriptions, page_events, lesson_progress, and community tables), `public.creator_dashboard(_creator uuid, _from date, _to date)` returns jsonb (KPIs + series + top items), `public.platform_dashboard(_from, _to)` (staff only), `public.course_funnel(_course, _from, _to)` (views → add-to-cart → checkout → purchase → started → 50% → completed), and `public.cohort_retention(_creator, _months int)`.
**`update bestseller flags`:** `public.refresh_bestsellers()` marks the top 10% of courses by 30-day enrollments per category (minimum 20) as `is_bestseller`.

### 2.3 Email and preferences
**`notification_preferences`**: `user_id pk`, `email_marketing bool default false` (**opt-in**), `email_product_updates bool default true`, `email_learning_reminders bool default true`, `email_community_digest text default 'weekly' check in ('off','daily','weekly')`, `email_mentions bool default true`, `email_replies bool default true`, `email_sales bool default true` (creators), `email_payouts bool default true`, `in_app_* ` similar toggles, `unsubscribe_token uuid unique default gen_random_uuid()`, `updated_at`
**`email_log`**: `id`, `user_id`, `to_email`, `template`, `subject`, `provider_message_id`, `status` (`queued/sent/failed/bounced/complained`), `error`, `meta`, `created_at`. Use it for dedupe (unique `(user_id, template, dedupe_key)`; add a `dedupe_key` column).
**`email_outbox`** (reliable sending): `id`, `user_id`, `template`, `payload jsonb`, `dedupe_key`, `send_after timestamptz default now()`, `attempts int`, `status`, `last_error`. DB triggers and RPCs insert here (for example, `notify()` from Phase 5 enqueues an email when the user's preferences allow it), and a cron route drains it.

### 2.4 Trust and safety
- Extend `moderation_reports` (from Phase 5) with `priority`, `assigned_to`, and auto-hide after N reports (a trigger: 5 open reports on a post hides it pending review).
- **`user_sanctions`**: `id`, `user_id`, `type text check in ('warning','mute','suspend','ban')`, `scope text` (`platform` or a `community:{id}`), `reason`, `expires_at`, `created_by`, `created_at`. The `is_suspended` check reads active sanctions.
- **`blocked_terms`**: `term`, `severity`. Posts, comments, reviews, and Q&A run a check trigger that flags (not blocks) content containing these terms into `moderation_reports` with `reporter_id = null` (system).

### 2.5 Search
**`public.search_all(_q text, _types text[], _limit int)`**: a unified ranked search over courses, products, communities (public), creators, and (for members only) community posts. It uses each table's tsvector plus `pg_trgm` similarity on names and titles, and returns `{type, id, title, subtitle, image, url, rank}`. Add `pg_trgm` GIN indexes where missing. Track a `search` event.

### 2.6 RLS
- `site_settings`: admin update, a public view select.
- `homepage_blocks` and `featured_items`: public select where enabled. Admin write.
- `page_events`: no client access. Staff select. Creators read only through `creator_dashboard()`.
- `daily_*_stats`: creators select their own rows. Staff all.
- `notification_preferences`: owner all. Plus unsubscribe by token through an RPC callable by anon: `public.unsubscribe(_token, _category)`.
- `email_log` and `email_outbox`: staff select only.
- `user_sanctions` and `blocked_terms`: staff only.

---

## 3. Admin console (AppShell, Admin workspace): build every route from the Phase 1 nav

- **`/admin` Overview:** KPI StatTiles on surface-2 (GMV, platform revenue, MRR, orders, signups, active learners, active creators, refund rate) with sparklines and a vs-previous-period delta (success/error text), a GMV & revenue area chart (Recharts, flat), "Needs attention" queue tiles (creator applications, courses in review, open reports, refund requests, payout requests) with counts linking to each queue, top courses, top creators, and recent orders.
- **`/admin/analytics`:** date range plus currency; tabs **Revenue** (GMV, take rate, by provider, by category), **Growth** (signups, activation = enrolled within 7 days, creator funnel: applied → approved → first publish → first sale), **Engagement** (DAU/WAU/MAU, lessons completed, community posts), **Retention** (monthly cohorts heatmap with flat cells in the Rausch tint ramp), and **Funnel** (platform-wide view → purchase). CSV export everywhere.
- **`/admin/users`:** (extend Phase 2) a user detail page with tabs Profile · Roles · Enrollments · Orders · Subscriptions · Communities · Reports · Sanctions · Audit. Actions: grant course access, issue a sanction, impersonation-lite ("View as user" read-only preview of their dashboard data; audit-logged, admin only), and reset the onboarding state.
- **`/admin/creators`:** (extend) an approved creators tab with plan, fee, revenue, rating, verified toggle, featured toggle, and change plan/fee override.
- **`/admin/courses`, `/admin/products`, `/admin/communities`:** complete moderation with search, filters, bulk actions (feature, unpublish), and the review history.
- **`/admin/orders`, `/admin/payouts`, `/admin/coupons`, `/admin/plans`:** complete from Phase 4. Add a **payout batch export** (CSV for bKash/bank bulk payment) and "mark batch paid".
- **`/admin/reports`:** the trust & safety queue with tabs Open · Reviewing · Actioned · Dismissed, priority sort, and a content preview inline. Actions: dismiss, hide content, warn, mute, suspend, ban (with duration), and escalate. Bulk handle. Plus `/admin/reports/terms` to manage blocked terms.
- **`/admin/audit`:** a filterable audit log (actor, action, entity, date range) with a JSON meta viewer.
- **`/admin/cms`:** a **homepage editor**: a list of `homepage_blocks` with drag reorder and enable toggles, and each block has a structured form generated from a zod schema per block key (hero copy for both audience modes, popular search chips, stats, testimonials CRUD, FAQ CRUD, plan tile copy, CTA labels and links, image uploads to a public `cms` bucket). A **live preview** pane shows the real homepage component with the draft content. Publishing revalidates `/`. Plus `featured_items` management (pick courses, products, communities, and creators for each slot, with scheduling). Also the announcement bar editor.
- **`/admin/settings`:** a `site_settings` form (grouped: General, Money, Policies, Access, Social), maintenance mode (middleware shows a flat maintenance page to non-staff), and email test send.
- Admin-wide: every mutating action goes through `log_action`. Destructive actions require a confirm Dialog that asks the admin to type the entity name.

## 4. Creator analytics `/studio` and `/studio/analytics`
- **`/studio` Dashboard (real data):** greeting, KPI StatTiles (revenue, net earnings, new students, MRR, average rating, course completion rate) for the last 30 days with deltas, a revenue chart, "Recent sales", "Unanswered questions", "Pending community requests", "Your top courses", and checklist tiles for new creators (complete your storefront, publish your first course, create a coupon, launch a community, set up payouts) that hide when done.
- **`/studio/analytics`:** date range plus currency. Tabs **Revenue** (gross/net/refunds, by item, by source: one-time vs subscription; MRR and churn), **Students** (new students, by country, by traffic source/UTM), **Engagement** (per-course completion rate, average progress, a lesson drop-off chart showing completion per lesson in order, which pinpoints where students quit; quiz pass rates), **Funnel** (per course: views → add to cart → purchase → started → completed), and **Community** (members, active members, posts, top contributors). CSV export.
- Client-side tracking: a tiny `track(event, props)` helper posts to `/api/events` (batched with `sendBeacon`, respects Do Not Track, and sets no third-party cookies). Instrument the events listed in 2.2. Also add **Vercel Analytics** and **Speed Insights**.

## 5. Email (Resend + React Email)
- `src/emails/*` templates styled in the flat system (white canvas, ink text, a Rausch button, surface-1 footer, no borders or shadows, Figtree with system fallbacks): Welcome (learner/creator variants), Verify email & Magic link (also paste these HTML versions into **Supabase Auth → Email Templates**, and give instructions), Password reset, Order receipt, Enrollment confirmation, Subscription started/renewing in 3 days/payment failed/expired, Refund processed, Certificate issued, New lesson in an enrolled course, Q&A reply, Review reply, Community digest (daily/weekly: top posts, upcoming events, your level progress), Mention, Event reminder (24h and 1h), Creator: new sale (instant or a daily summary setting), Payout paid, Application decision, Course review decision, and **Learning reminder** (inactive for 7 days on an in-progress course: "You're 42% through {course} — 12 minutes gets you to the next milestone").
- `lib/email/send.ts`: renders, checks preferences, dedupes, logs, and sends through Resend. Every email has an **unsubscribe link** (one-click, token based, with a `List-Unsubscribe` header) for non-transactional categories.
- `/settings/notifications`: the real preferences UI (grouped switches: Learning, Community, Purchases, Creator, Marketing), plus a public `/unsubscribe?token=` page.

## 6. Automation: Vercel Cron (`vercel.json` crons → `/api/cron/*`, protected by `Authorization: Bearer ${CRON_SECRET}`)
| Schedule | Route | Job |
|---|---|---|
| every 5 min | `/api/cron/email-outbox` | drain `email_outbox` (batch 100, exponential backoff, max 5 attempts) |
| hourly | `/api/cron/release-earnings` | `release_available_earnings()` |
| hourly | `/api/cron/event-reminders` | enqueue the 24h and 1h event reminders |
| daily 00:30 Asia/Dhaka | `/api/cron/rollup` | `rollup_daily_stats(yesterday)` plus `refresh_bestsellers()` |
| daily 09:00 | `/api/cron/subscriptions` | expire prepaid (SSLCommerz) subscriptions past `current_period_end`, revoke community/course access, send renewal reminders 3 days before |
| daily 10:00 | `/api/cron/learning-reminders` | learning reminders (max 1 per user per week) |
| daily 08:00 / Mon 08:00 | `/api/cron/digests` | community digests |
| weekly | `/api/cron/cleanup` | purge old `page_events`, expired invites, and stale carts (>90 days) |
Each job is idempotent, logs its run to a `cron_runs` table (add it to the migration: `job`, `started_at`, `finished_at`, `ok`, `stats jsonb`, `error`), and is visible at `/admin/settings/jobs` with a "Run now" button.

## 7. Global search
- The topbar command palette (from Phase 3) now calls `search_all` and shows grouped results (Courses, Products, Communities, Creators, Posts in your communities), recent searches (localStorage), and quick actions for staff ("Go to user…", "Go to order…").
- `/search` becomes a full results page with type tabs and the Phase 3 filters.

## 8. SEO and sharing
- `app/sitemap.ts` (dynamic: static pages, published courses, products, public communities, creator storefronts, categories; chunked if over 50k) and `app/robots.ts` (disallow `/admin`, `/studio`, `/learn`, `/checkout`, `/api`, `/settings`).
- `generateMetadata` everywhere with canonical URLs. Use `noindex` for unlisted courses and private communities.
- **Dynamic OG images** (`opengraph-image.tsx` with `next/og`) for courses (thumbnail, title, rating, creator, price), products, communities, creator storefronts, and certificates. Flat style, brand mark.
- JSON-LD: `Organization` + `WebSite` (with `SearchAction`) on the homepage, `Course` (with `aggregateRating`, `offers`, `hasCourseInstance`), `Product`, `BreadcrumbList`, and `FAQPage` on the homepage FAQ.
- Bangla support: `lang` attributes, the `bn` course language filter, and Bangla font fallback (**Hind Siliguri** through next/font for `lang="bn"` content).

## 9. Hardening

### 9.1 Security audit (write `docs/SECURITY_AUDIT.md` with results)
- Write an **RLS test suite** (`tests/rls/*.test.ts` with Vitest and supabase-js against a test project or local `supabase start`) that, for each role (anon, student, other student, creator, other creator, moderator, admin), asserts allowed and denied reads and writes on **every table**. Key cases: lesson content without access, `quiz_questions.correct`, other users' orders, payout details, `payment_events`, private community posts, notes of other users, admin tables.
- Run the **Supabase Security Advisor and Performance Advisor** (dashboard), fix every warning, and document them.
- Confirm every `security definer` function has `search_path = ''` and the correct `revoke execute … from public/anon` where needed.
- **Rate limiting** with **Upstash Redis** (`@upstash/ratelimit`) on auth actions, add to cart, checkout, coupon apply, reviews, posts and comments (anti-spam), search, `/api/events`, and report submission. Fall back to in-memory if the env vars are missing.
- Security headers in `next.config` (CSP with nonces allowing Stripe, SSLCommerz, YouTube, Vimeo, Supabase, and Vercel; HSTS; X-Frame-Options except for the embed pages; Referrer-Policy; Permissions-Policy).
- Input sanitization: Tiptap JSON is rendered through an allow-listed renderer, never `dangerouslySetInnerHTML` with raw HTML. Embed iframes are allow-listed and sandboxed.
- File uploads: MIME sniffing server-side, size limits per bucket, and image re-encoding for avatars and covers (sharp) to strip EXIF.
- Secrets: confirm that no secret is imported in a client bundle (add a build-time check with `server-only` everywhere).

### 9.2 Reliability and observability
- **Sentry** (`@sentry/nextjs`) for client, server, and edge, with source maps. Scrub PII. Wrap webhook handlers and crons with tracing.
- Error boundaries per route group with flat, friendly error pages (404, 500, maintenance, suspended) in the brand voice.
- Health check `/api/health` (DB ping, storage ping, provider config presence).

### 9.3 Performance
- Audit with Lighthouse and the Vercel Speed Insights targets: LCP < 2.5s, INP < 200ms, CLS < 0.1 on the homepage, explore, the course page, the player, and the community feed.
- `next/image` everywhere with correct `sizes`. Preload the hero image. Use `unstable_cache`/`revalidateTag` for catalog queries. Wrap slow sections in Suspense with flat skeletons. Paginate feeds (cursor). Lazy-load the player library and Tiptap.
- DB: add missing indexes found by the Performance Advisor and `explain analyze` on the top 10 queries (document them in `docs/PERFORMANCE.md`).

### 9.4 Accessibility
- An axe (`@axe-core/playwright`) scan on the key pages with zero serious violations. Full keyboard navigation for the sidebar, command palette, player controls, dialogs, the feed composer, and the quiz. A visible `:focus-visible` outline (our only allowed line). `aria-live` for toasts and realtime counters. Respect reduced motion.
- Color contrast check of every token pairing in `docs/DESIGN_SYSTEM.md` (add a table of the results).

### 9.5 Tests
- **Vitest** unit tests: fee math (`lib/payments/fees.ts`), currency formatting, slug generation, zod schemas, and level computation.
- **Playwright** E2E (run against a seeded test project): the visitor homepage → signup → onboarding; learner buys a course with a 100% coupon → plays a lesson → progress saved → passes a quiz → completes → certificate; creator applies → admin approves → creator builds and submits a course → admin publishes; a community join, post, like, and points; an admin refund flow. Add a GitHub Actions workflow `ci.yml` (install → lint → typecheck → unit tests → build; E2E on main with secrets).

### 9.6 Final design QA sweep
- Run a script that greps for `shadow-`, `border-` (other than `border-0`/`border-none`), `ring-` (other than the focus outline utility), and `drop-shadow` across `src/`, and fix every hit.
- Check every page at 375 / 768 / 1024 / 1280 / 1440, in the sidebar expanded, rail, and drawer states.
- Verify there's no nested card stacking (review each page against the "one level of tiles per band" rule).
- Check the empty states, loading skeletons, and error states for every list.

## 10. Launch checklist (write `docs/LAUNCH_CHECKLIST.md` and walk through it)
- Domain on Vercel, plus updating `NEXT_PUBLIC_SITE_URL`, the Supabase Site URL/redirects, Google OAuth origins, the Stripe and SSLCommerz webhook URLs, and `EMAIL_FROM` with domain DNS (SPF, DKIM, DMARC through Resend).
- Switch Stripe and SSLCommerz to **live** keys (`SSLCOMMERZ_IS_LIVE=true`). Run a small real purchase plus a refund.
- Supabase: upgrade to a paid tier for daily backups/PITR, enable leaked password protection, set the auth rate limits, configure custom SMTP (Resend), and turn on MFA for admin accounts (add a TOTP enforcement for `admin` role sessions in middleware).
- Legal pages finalized (terms, privacy, refund policy, creator agreement, cookie notice with only the essential cookies, so no consent banner needed unless marketing pixels are added).
- Seed real categories, remove the demo content (a `supabase/seed/cleanup_demo.sql` script that deletes everything tagged `is_demo`; ensure the seeds set that flag), and create the first admin.
- Monitoring: Sentry alerts, Vercel log drains (optional), and an uptime check on `/api/health`.

## 11. Definition of Done
- [ ] `0005_admin_analytics.sql` runs twice cleanly. Settings and CMS are seeded with the Phase 1 content (the homepage looks identical but is now CMS-driven).
- [ ] Every admin route works with real data. Every mutating action is audit-logged.
- [ ] Creator and admin dashboards show correct numbers (cross-check one day manually against the orders).
- [ ] Emails are delivered (test each template through `/admin/settings` → test send). Unsubscribe works. Preferences are respected.
- [ ] All crons run (trigger each through "Run now"), are idempotent, and log to `cron_runs`.
- [ ] The RLS test suite passes for all roles. The Supabase advisors are clean. Rate limits are active.
- [ ] Lighthouse: Performance ≥ 90 on mobile for the homepage, explore, and the course page. Accessibility ≥ 95. SEO ≥ 95. The axe scan is clean.
- [ ] CI is green (lint, typecheck, unit, build), and the E2E suite passes.
- [ ] The design QA grep finds zero shadow or decorative-border usages.
- [ ] `docs/` is complete: PROJECT_CONTEXT (all phases ✅), DESIGN_SYSTEM, SECURITY_AUDIT, PERFORMANCE, LAUNCH_CHECKLIST, and README.
- [ ] No remaining TODO, "coming soon", or Phase placeholders, except the deliberately deferred features listed in `docs/ROADMAP.md` under "Post-launch" (e.g. direct messages, a mobile app, affiliate program, live streaming, AI course assistant, multi-language UI).

At the end, output: (1) the SQL file to run, (2) **all new env vars** (`RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`) and where to get each, (3) the Supabase dashboard steps (email templates, advisors, MFA, SMTP), (4) the Vercel steps (crons, analytics, domain), and (5) the final go-live runbook.
