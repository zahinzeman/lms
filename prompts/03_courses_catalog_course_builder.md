# PROMPT 3 of 6: Courses: Creator Course Builder, Catalog, Explore & Course Landing Page

You are continuing a production LMS + creator marketplace (Udemy × Skool) built with Next.js App Router, TypeScript, Tailwind v4, and Supabase on Vercel. **Phases 1–2 are complete**: the flat design system, the 15/85 AppShell, the homepage, Supabase Auth, multi-role (`student/creator/moderator/admin`), profiles, onboarding, creator applications, `categories`, and `creator_profiles`.

## 0. Before you write any code
1. Read `docs/PROJECT_CONTEXT.md`, `docs/DESIGN_SYSTEM.md`, `docs/ROADMAP.md`, `src/types/database.ts`, and `supabase/migrations/0001_core_auth.sql`.
2. Reuse the existing helpers (`is_creator()`, `is_staff()`, `requireCreator()`, `log_action()`), the UI primitives, the cards, and the `lib/data/*` signatures. **Swap the mock internals** of `lib/data/courses.ts` and `lib/data/creators.ts` for Supabase queries **while keeping the function signatures**, so the homepage and dashboard keep working.
3. Design rules still apply everywhere: **flat, no shadows, no borders/strokes, shade-ladder separation, no card-in-card, a single Rausch accent, a 15% sidebar / 85% content shell**.

---

## 1. Goal of this phase
Creators can **build, preview, and submit courses for review**. Staff can **approve and publish** them. Everyone can **discover** courses through Explore, category pages, search, and creator storefronts, and see a **Udemy-quality course landing page**. Purchasing and enrollment come in Phase 4, and the learning player in Phase 5. In this phase the CTA on the course page is "Enroll free" for free courses and "Add to cart" for paid ones, wired to a placeholder that Phase 4 will implement. Structure the code so that's a one-line swap.

---

## 2. SQL migration: write `supabase/migrations/0002_courses.sql`
Same conventions as 0001: idempotent, RLS on everything, a security definer with `search_path = ''`, timestamps with the `set_updated_at` trigger, and comments.

### 2.1 Enums
- `course_level`: `beginner`, `intermediate`, `advanced`, `all_levels`
- `course_status`: `draft`, `in_review`, `changes_requested`, `published`, `unlisted`, `archived`, `rejected`
- `pricing_type`: `free`, `paid`, `subscription_only` (only accessible through a membership plan, Phase 4)
- `lesson_type`: `video`, `article`, `quiz`, `assignment`, `live`, `download`, `embed`
- `video_provider`: `upload`, `youtube`, `vimeo`, `bunny`, `mux`
- `question_type`: `single_choice`, `multiple_choice`, `true_false`, `short_answer`

### 2.2 Tables
**`courses`**
- `id uuid pk`, `creator_id uuid not null references profiles`, `title text` (5–120), `slug citext unique`, `subtitle text` (≤160)
- `description jsonb` (Tiptap JSON), `description_text text` (a plain-text copy for search)
- `category_id uuid references categories`, `subcategory_id uuid references categories null`
- `level course_level default 'all_levels'`, `language text default 'en'` (also `bn` = Bangla), `has_captions bool default false`
- `thumbnail_url text`, `promo_video_provider video_provider null`, `promo_video_ref text null`
- `pricing_type pricing_type default 'paid'`, `price_minor int default 0 check (>=0)`, `compare_at_price_minor int null`, `currency text default 'BDT' check in ('BDT','USD')`
- `outcomes text[]` ("What you'll learn", 4–12 items), `requirements text[]`, `target_audience text[]`
- `status course_status default 'draft'`, `review_note text`, `submitted_at`, `published_at`, `archived_at`
- `is_featured bool default false`, `is_bestseller bool default false` (set by staff or a nightly job in Phase 6)
- caches (updated by triggers): `sections_count`, `lessons_count`, `total_duration_seconds`, `preview_lessons_count`, `enrolled_count int default 0`, `rating_avg numeric(3,2)`, `rating_count int default 0`
- `drip_enabled bool default false`, `certificate_enabled bool default true`, `qa_enabled bool default true`
- `search tsvector generated always as (setweight(to_tsvector('simple', coalesce(title,'')),'A') || setweight(to_tsvector('simple', coalesce(subtitle,'')),'B') || setweight(to_tsvector('simple', coalesce(description_text,'')),'C')) stored`, plus a GIN index
- Indexes on `(status, published_at desc)`, `(category_id, status)`, `(creator_id)`, and `(rating_avg desc)`
- Check: `pricing_type='free'` implies `price_minor=0`. `pricing_type='paid'` implies `price_minor > 0`.

**`course_sections`**: `id`, `course_id` (cascade), `title`, `description`, `position int`, unique `(course_id, position)` deferrable

**`lessons`**
- `id`, `course_id` (cascade), `section_id` (cascade), `title`, `type lesson_type`, `position int`
- `summary text`, `content jsonb` (article body, Tiptap JSON, or type-specific config)
- `video_provider video_provider null`, `video_ref text null` (a storage path or external id), `duration_seconds int default 0`
- `is_preview bool default false` (free preview for anyone), `is_published bool default true`
- `drip_days int null` (unlocks N days after enrollment), `unlock_at timestamptz null`
- unique `(section_id, position)` deferrable

**`lesson_resources`**: `id`, `lesson_id` (cascade), `title`, `kind text check in ('file','link')`, `file_path text`, `url text`, `size_bytes bigint`, `position`

**`quizzes`**: `id`, `lesson_id unique` (cascade), `pass_percent int default 70`, `shuffle bool default true`, `max_attempts int null`, `time_limit_seconds int null`, `show_answers text default 'after_submit' check in ('never','after_submit','after_pass')`

**`quiz_questions`**: `id`, `quiz_id` (cascade), `type question_type`, `prompt text`, `options jsonb` (`[{id, text}]`), `correct jsonb` (option ids or accepted answers), `explanation text`, `points int default 1`, `position`
→ **The `correct` column must never be readable by students.** Expose questions to learners only through an RPC `public.get_quiz_for_learner(_lesson_id)` that strips `correct` and `explanation`. Phase 5 adds grading.

**`assignments`**: `id`, `lesson_id unique`, `instructions jsonb`, `submission_type text check in ('text','file','link','any')`, `max_score int default 100`, `rubric jsonb`

**`tags`** (`id`, `name`, `slug unique`) + **`course_tags`** (`course_id`, `tag_id`, pk)

**`course_instructors`**: co-instructors. `course_id`, `user_id`, `role text check in ('owner','co_instructor','assistant')`, `revenue_share_bps int default 0`, pk. A trigger auto-inserts the owner on course insert.

**`wishlists`**: `user_id`, `item_type text check in ('course','product','community')`, `item_id uuid`, `created_at`, pk(user_id, item_type, item_id). Products and communities arrive later, and the polymorphic table handles them.

**`course_review_events`**: moderation history. `id`, `course_id`, `actor_id`, `from_status`, `to_status`, `note`, `created_at`

### 2.3 Functions and triggers
- `public.is_course_instructor(_course_id uuid) returns bool`: true if the user appears in `course_instructors`
- `public.can_view_lesson(_lesson_id uuid) returns bool`: preview lessons on published courses, OR instructor, OR staff. **Phase 4 will `create or replace` this** to add `has_course_access()` (enrollment/subscription). Leave a clear comment explaining that.
- Cache triggers: keep `sections_count`, `lessons_count`, `total_duration_seconds`, and `preview_lessons_count` on `courses` in sync after insert/update/delete on sections and lessons.
- `public.submit_course_for_review(_course_id)`: owner only. Validates publish requirements (see 4.1 checklist), sets `in_review` and `submitted_at`, inserts a `course_review_events` row.
- `public.moderate_course(_course_id, _action text /* approve|request_changes|reject|unpublish|feature|unfeature */, _note text)`: staff only. Approve sets `published` and `published_at`. Writes the event and the audit log.
- `public.reorder_curriculum(_course_id uuid, _payload jsonb)`: takes `[{section_id, position, lessons:[{lesson_id, position}]}]` and reorders atomically (deferred constraints). Instructor only.
- `public.slugify(text)` and a unique slug generator for courses.

### 2.4 RLS
- `courses`: **public select** where `status in ('published','unlisted')` (unlisted is reachable by slug but excluded from listings in queries). Instructors select/update their own at any status but **cannot set `status` directly to `published`, or set `is_featured`/`is_bestseller`** (a trigger guard; only the RPCs and staff can). Insert requires `is_creator()` and `creator_id = auth.uid()`. Delete only while `draft`. Staff all.
- `course_sections`: select if the parent course is visible. Write if `is_course_instructor`.
- `lessons`: **metadata** (id, title, type, duration, is_preview, position) must be listable for the public curriculum, but `content` and `video_ref` must be protected. Implement a **view `public.course_curriculum`** (security invoker off / definer-style through a function) that returns the safe columns for published courses. Restrict the base `lessons` table select to `can_view_lesson(id)`.
- `lesson_resources`, `quizzes`, `assignments`: select if `can_view_lesson(lesson_id)`. Write if instructor.
- `quiz_questions`: **instructor and staff only** (learners go through the RPC).
- `wishlists`: owner all.
- `tags`: public read. Creators can insert. Staff all.

### 2.5 Storage buckets
- `course-thumbnails` (public): `{course_id}/thumb.{ext}`, instructor write (check through `is_course_instructor` with the folder name cast to uuid)
- `course-videos` (**private**): `{course_id}/{lesson_id}/{file}`. Instructor write. Read through **signed URLs only**, generated server-side after `can_view_lesson`
- `course-resources` (private): same pattern

### 2.6 Seed: `supabase/seed/0002_seed.sql`
Seed **24 realistic published courses** across categories, owned by a seeded demo creator. Document how to swap the creator id to your own user. Each course has 3–6 sections, 3–6 lessons per section, 1–2 preview lessons, YouTube preview refs for promo and preview lessons, outcomes, requirements, Unsplash thumbnails, and a mix of BDT prices (৳0, ৳990, ৳1,990, ৳4,500, ৳9,900).

---

## 3. Explore & discovery (discover layout: TopNav if logged out, AppShell if logged in)

### 3.1 `/explore`
- Header: H1 "Explore", the search input, and a type SegmentedControl **Courses | Digital Products | Communities**. Only Courses is live; the others show "coming soon" until Phases 4–5. Keep the URL param `type`.
- **Filter bar** (horizontal chips row, flat): Category (popover with a checkbox list), Level, Price (Free / Paid / Under ৳1,000 / ৳1,000–5,000 / ৳5,000+), Rating (4.5+ / 4.0+ / 3.5+), Duration (0–2h, 2–6h, 6–17h, 17h+), Language (English / বাংলা), and Features (Has captions, Has certificate, Has quizzes). Active filters show as ink chips with ×, plus a "Clear all" link.
- Sort: Most relevant, Most popular, Highest rated, Newest, Price low→high, Price high→low.
- **All filter state lives in URL search params.** Server-render the results. Navigation is shallow, with `useTransition` and a skeleton grid.
- Results: a 4-up grid of `CourseCard` (3-up when the sidebar shell is present at 1280; use container queries), the result count, and pagination (24 per page). Use cursor or offset pagination.
- Empty state with suggestions.
- Query implementation: `lib/data/courses.ts → searchCourses(params)`. Use Postgres FTS (`search @@ websearch_to_tsquery('simple', q)`, ranked by `ts_rank`) and fall back to `ilike` on the title for very short queries. Add `pg_trgm` for typo tolerance on the title (a GIN trigram index).

### 3.2 `/categories/[slug]`
A category hero (flat band in the category's tint color, with the icon, name, and description), subcategory chips, "Most popular in X" carousel, "New & noteworthy" carousel, "Top creators in X", and then the full filtered grid (reuse the Explore components).

### 3.3 `/courses/[slug]`: course landing page (Udemy-quality, flat)
Layout: **two columns at ≥1128**, a ~64% main column plus a ~32% **sticky purchase rail**. On mobile the rail becomes a sticky bottom bar with the price and CTA.
1. **Hero band (ink-surface, dark, full width of the content area)**: breadcrumb (Category › Subcategory), title (`display-xl`, white), subtitle, a badge row (Bestseller / New / Updated Mar 2026), rating (★ 4.7, 1,284 ratings, 9,812 students), "Created by {creator}" (link), last updated, language, and captions.
2. **Purchase rail (canvas tile on top of the hero edge, radius 20, NO shadow; separation comes from the dark hero behind it)**: promo video thumbnail with a play button (opens a Dialog with the promo plus a list of preview lessons), price (with compare-at and a discount badge), "X days left at this price" if `compare_at` is set, a primary CTA ("Add to cart" / "Enroll free" / "Go to course" if already enrolled in Phase 4, or "Included in {plan}" for subscription-only), a secondary "Buy now", a wishlist heart, "30-day money-back guarantee", "This course includes:" (hours of video, articles, resources, quizzes, certificate, lifetime access, mobile), coupon apply link (Phase 4), and share.
3. **What you'll learn**: a 2-column check list on a `surface-1` tile (a single tile, not nested).
4. **Course content (curriculum)**: a stats line ("8 sections • 52 lectures • 7h 42m total length") and an "Expand all" toggle. An accordion per section (surface-2 headers) with lessons as rows: type icon, title, "Preview" link if `is_preview`, and duration. Preview lessons open in the preview Dialog (YouTube/Vimeo embed or a signed URL).
5. **Requirements**, then **Description** (rendered Tiptap with typography styles, collapsed at 400px with "Show more"), then **Who this course is for**.
6. **Instructor(s)**: avatar 96, name, headline, rating, students, courses, bio (collapsible), and a link to the storefront.
7. **Reviews**: a placeholder section with the rating breakdown UI built using mock values. Phase 5 wires it to real data.
8. **More courses by {creator}** and **Students also bought** (same category, popular) carousels.
- SEO: `generateMetadata` (title, description, OG image = thumbnail), JSON-LD `Course` schema, and a canonical URL.
- `generateStaticParams` for the top 50 published courses, `revalidate = 300`, plus on-demand `revalidateTag('course:{id}')` when a course changes.
- Unpublished courses return 404 to non-instructors. Instructors see a "Preview mode" banner (warning-tint) on drafts.

### 3.4 `/creators/[handle]`: creator storefront (Skool/Udemy hybrid)
A banner (or a flat tint band if there's no banner), avatar 96, display name, tagline, the verified badge, stats (students, courses, rating), socials, and a "Follow" placeholder. Tabs: **Courses** | Products (Phase 4) | Communities (Phase 5) | About. Courses show as a grid.

### 3.5 `/search`
Unified search page. For now it searches courses and creators, with sections "Courses" and "Creators". Topbar search (in the AppShell and TopNav) opens a **Command palette** (Radix Dialog, surface-1 bg) with debounced instant results (top 5 courses and top 3 creators), keyboard navigation, and "See all results" linking to `/search?q=`.

### 3.6 `/wishlist` (AppShell)
A grid of wishlisted courses with "Move to cart" (Phase 4 placeholder) and remove. The heart toggle on every `CourseCard` uses an optimistic server action, and logged-out users get a login prompt Dialog.

---

## 4. Creator Studio: course management (AppShell, Creator Studio workspace)

### 4.1 `/studio/courses`: course list
Tabs by status (All, Drafts, In review, Published, Archived), each with a count. A table/list with thumbnail, title, status badge, price, students, rating, last updated, and a row menu (Edit, Preview, Duplicate, Archive, Delete draft). A "New course" primary button.

**Create flow** (`/studio/courses/new`): a 3-step Dialog/page asking for the title (with a slug preview), category and subcategory, and pricing type. Then it creates the draft and redirects to the editor.

### 4.2 `/studio/courses/[id]/edit`: course editor
The editor uses a **second-level vertical step nav inside the content area**: a narrow `surface-1` column of roughly 220px, with the editor panel on canvas to its right. The global 15% sidebar stays as it is. This is the only allowed secondary column, and it is not a nested card.

Steps, each with a completion check icon:
1. **Landing page**: title, subtitle, description (**Tiptap** editor with headings, bold/italic, lists, links, code, images, and a flat toolbar on surface-2), category/subcategory, level, language, captions toggle, and tags (combobox, create new). Thumbnail upload (16:9 crop, min 1280×720, max 5MB), with a live **CourseCard preview** next to the form.
2. **Intended learners**: outcomes (sortable list, 4–12 items, ≤160 chars each), requirements, and target audience. Use drag handles (`@dnd-kit`).
3. **Curriculum** (the core screen):
   - Sections and lessons as a **drag-and-drop tree** (`@dnd-kit/sortable`). Lessons can be dragged between sections. Saving calls `reorder_curriculum` (debounced, optimistic, with rollback on error).
   - Section rows sit on `surface-2` and lesson rows on `canvas`, nested by indentation only (no box inside a box).
   - "+ Section" and "+ Lesson" (pick the type through a tile menu: Video, Article, Quiz, Assignment, Download, Embed, Live).
   - The **lesson editor** opens in a right **Sheet** (60% width) by type:
     - **Video**: upload (resumable upload to the `course-videos` bucket using Supabase Storage TUS, with a progress bar and a cancel button) OR paste a YouTube/Vimeo/Bunny URL (parse the id). Auto-read the duration (from the uploaded file metadata in the browser, or by entering it for embeds). Toggle the preview flag. Summary.
     - **Article**: Tiptap body, with the read time auto-calculated as the duration.
     - **Quiz**: settings (pass %, attempts, time limit, shuffle, show answers) and a question builder. Each question has a type, prompt, options (add/remove/reorder), marked correct answer(s), explanation, and points. Validate that every question has a correct answer.
     - **Assignment**: instructions (Tiptap), submission type, max score, and rubric rows.
     - **Download**: files only (in the resources list).
     - **Embed**: an iframe URL allow-list (YouTube, Vimeo, Loom, Google Slides, Figma, CodePen, CodeSandbox).
     - **Live**: date/time, timezone, a meeting URL (Zoom/Meet), and a "replay URL" added later.
     - Every type gets **Resources** (files to the `course-resources` bucket, or links) and **Drip** (`drip_days` or `unlock_at`) when `drip_enabled`.
   - The section header shows the lesson count and total duration.
4. **Pricing**: a pricing type SegmentedControl (Free / Paid / Subscription only), currency, price with **price tier suggestions** (৳990 / ৳1,990 / ৳2,990 / ৳4,990 / ৳9,990, or the USD equivalents), compare-at price, and an earnings preview (`price × (1 - platform_fee_bps/10000)`) based on the creator's plan.
5. **Settings**: certificate on/off, Q&A on/off, drip on/off, co-instructors (invite by handle, with role and revenue share %, and a total share validation of ≤100%), and a danger zone (archive / delete draft).
6. **Review & submit**: a **publish checklist** that validates the following, with each item linking to the step that fixes it:
   - title, subtitle, description ≥ 200 words, category, level, language, thumbnail
   - ≥ 4 outcomes, ≥ 1 requirement, ≥ 1 target audience
   - ≥ 1 section, ≥ 5 lessons, ≥ 30 minutes of total video or content, every video lesson has a video, every quiz has ≥ 1 question with an answer
   - price is set for paid courses
   - "Submit for review" (primary) calls the RPC. The status becomes `in_review` and the editor becomes **read-only with a banner** until a decision arrives. The creator can withdraw the submission.
- **Autosave** every field change (debounced 800ms) with a "Saved · 2s ago" indicator in the editor header, which also has "Preview" (opens `/courses/[slug]?preview=1` for the instructor) and "Exit".
- Editing a **published** course: changes to landing-page fields apply immediately, while new lessons can be added freely. Major changes (price increase over 50%, removing over 30% of the content) trigger a soft warning. No re-review is needed for content additions. Document this rule.

### 4.3 Admin: course review queue `/admin/courses`
Tabs: In review (default), Published, Changes requested, Rejected, Archived. A table with thumbnail, title, creator, category, submitted date, lessons, duration, and price. The detail view is **full page** (`/admin/courses/[id]`): the course landing page preview, the full curriculum with playable lessons (staff can view everything), the publish checklist status, and history (`course_review_events`). Actions: Approve & publish, Request changes (note required), Reject (note required), Feature/unfeature, Mark bestseller, Unpublish. All actions are audit-logged.

`/admin/categories`: CRUD for categories and subcategories with drag reorder, icon picker (lucide names), tint picker, and an active toggle.

---

## 5. Data-access layer (`lib/data/`)
- `courses.ts`: `getTrendingCourses`, `getFeaturedCourses`, `searchCourses`, `getCourseBySlug` (landing page DTO: course, instructors, curriculum summary, stats), `getCoursesByCreator`, `getRelatedCourses`, `getCourseForEditor` (instructor only), `listCreatorCourses`
- `courseMutations.ts` (server actions): `createCourse`, `updateCourse`, `upsertSection`, `deleteSection`, `upsertLesson`, `deleteLesson`, `reorderCurriculum`, `upsertQuiz`, `upsertQuestion`, `deleteQuestion`, `uploadThumbnail`, `createVideoUploadUrl`, `addResource`, `submitForReview`, `withdrawSubmission`, `moderateCourse` (staff)
- `media.ts`: `getSignedLessonVideoUrl(lessonId)`, which checks `can_view_lesson` first and returns a 1-hour signed URL
- `wishlist.ts`: `toggleWishlist`, `listWishlist`
- All inputs are zod-validated. Re-check authorization in each action. Revalidate tags `course:{id}`, `courses:list`, and `creator:{id}`.

Update the **homepage** shelves (Trending, Top creators) and the **student dashboard** "Recommended for you" so they read real data. Keep the mock fallback only if the query returns zero rows (so a fresh project still looks alive), and log a dev warning when that happens.

---

## 6. Definition of Done
- [ ] `0002_courses.sql` runs twice cleanly. The seed creates 24 published courses with their curricula.
- [ ] A creator can create a course, fill every step, drag-reorder the curriculum, upload a video (resumable, with progress), build a quiz, and submit it. Autosave works and survives a refresh.
- [ ] An admin can review (play any lesson), request changes, approve, and feature. The course appears in Explore, its category, search, the storefront, and the homepage within the revalidation window.
- [ ] A non-enrolled user **cannot** fetch a non-preview lesson's `content` or `video_ref` through the API. Prove it with a test script using the anon key that calls `supabase.from('lessons').select('content, video_ref')` and gets an empty result.
- [ ] `quiz_questions.correct` is unreadable to non-instructors.
- [ ] Explore filters, sort, and pagination are fully URL-driven and shareable. Search tolerates typos ("pythn" finds Python courses).
- [ ] The course landing page scores Lighthouse SEO ≥ 95, has valid JSON-LD, and works at 375px with the sticky bottom purchase bar.
- [ ] Flat design rules are respected across all new screens. Build, lint, and typecheck pass. Docs are updated (phase 3 ✅, tables, decisions).

At the end, output: (1) the SQL files to run, in order, (2) the new storage buckets and how to verify their policies, (3) any new env vars (e.g. `BUNNY_*` if you added Bunny), and (4) a manual QA script.
