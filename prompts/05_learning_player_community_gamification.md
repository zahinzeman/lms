# PROMPT 5 of 6: Learning Experience (Player, Progress, Quizzes, Certificates, Reviews, Q&A) & Skool-style Communities

You are continuing a production LMS + creator marketplace (Udemy × Skool) built with Next.js App Router, TypeScript, Tailwind v4, and Supabase on Vercel. **Phases 1–4 are complete**: the flat design system and 15/85 AppShell, auth and roles, the course builder and catalog, digital products, cart/checkout (Stripe + SSLCommerz), enrollments, subscriptions/plans (with a `community` scope already in the enum), coupons, earnings, and payouts.

## 0. Before you write any code
1. Read `docs/*`, `src/types/database.ts`, and migrations `0001`–`0003`. Pay attention to `has_course_access`, `can_view_lesson`, `get_quiz_for_learner`, `plans.community_id` (no FK yet), and `wishlists.item_type='community'`.
2. Find the stubs for `/learn/[courseSlug]/[lessonId]`, `/learning`, `/certificates`, `/communities`, `/c/[slug]/*`, `/notifications`, `/verify/[serial]`, the course page "Reviews" placeholder, and `/studio/communities` + `/studio/reviews`.
3. Design rules: **flat, no shadows, no borders/strokes, shade-ladder separation, no card-in-card, a single Rausch accent, a 15% sidebar / 85% content shell.** The community UI should feel like **Skool** (a clean feed, a left-rail-first layout, gamified levels), but rendered in this flat system.

---

## 1. Goal of this phase
1. A **world-class course player** with progress tracking, resumable video, notes, quizzes (graded server-side), assignments, drip unlocking, and completion **certificates** with public verification.
2. **Reviews & ratings** and **Q&A** on courses (and reviews on products).
3. **Communities (Skool model)**: a feed with posts, comments, and likes; a classroom (courses unlocked by level); a calendar (events); members; and a leaderboard with **points and 9 levels**. Communities can be free, paid (a `community` plan), or bundled.
4. **In-app notifications** (realtime). Email delivery comes in Phase 6.

---

## 2. SQL migration: write `supabase/migrations/0004_learning_community.sql`
Same conventions: idempotent, RLS everywhere, a security definer with `search_path=''`, timestamps, comments.

### 2.1 Learning
**`lesson_progress`**: `user_id`, `lesson_id`, `course_id`, `status text check in ('not_started','in_progress','completed')`, `position_seconds int default 0`, `watched_seconds int default 0` (unique seconds watched, approximated), `completed_at`, `updated_at`, pk(user_id, lesson_id)
**`course_progress`**: `user_id`, `course_id`, `completed_lessons int`, `total_lessons int`, `percent numeric(5,2)`, `last_lesson_id`, `last_activity_at`, `completed_at`, pk(user_id, course_id). Maintained by a trigger on `lesson_progress`.
**`quiz_attempts`**: `id`, `user_id`, `quiz_id`, `lesson_id`, `answers jsonb`, `score int`, `max_score int`, `percent numeric`, `passed bool`, `started_at`, `submitted_at`, `attempt_number int`
**`assignment_submissions`**: `id`, `assignment_id`, `lesson_id`, `user_id`, `body jsonb`, `link_url`, `file_path` (private bucket `assignment-files`), `status text check in ('submitted','returned','graded')`, `score int`, `feedback jsonb`, `graded_by`, `graded_at`, timestamps
**`lesson_notes`**: `id`, `user_id`, `lesson_id`, `course_id`, `timestamp_seconds int null`, `body text`, timestamps
**`certificates`**: `id`, `serial text unique` (e.g. `BBD-7K3Q-92XD`, human-readable, generated), `user_id`, `course_id`, `recipient_name_snapshot`, `course_title_snapshot`, `creator_name_snapshot`, `issued_at`, `pdf_path null`, `revoked_at null`. Unique(user_id, course_id).
**`course_reviews`**: `id`, `course_id`, `user_id`, `rating int check 1..5`, `title`, `body`, `is_hidden bool default false`, `creator_reply text`, `creator_replied_at`, `helpful_count int default 0`, timestamps, unique(course_id, user_id)
**`product_reviews`**: the same shape, keyed on `product_id`
**`review_helpful_votes`**: `review_id`, `review_type`, `user_id`, pk
**`qa_threads`**: `id`, `course_id`, `lesson_id null`, `user_id`, `title`, `body jsonb`, `is_resolved bool`, `is_pinned bool`, `upvotes int`, `replies_count int`, timestamps, plus a search tsvector
**`qa_replies`**: `id`, `thread_id`, `user_id`, `body jsonb`, `is_instructor_answer bool` (computed from the role on insert), `is_accepted bool`, `upvotes`, timestamps
**`qa_votes`**: `target_type`, `target_id`, `user_id`, pk

**Functions:**
- `public.mark_lesson_progress(_lesson_id, _position_seconds, _watched_delta, _completed bool)`: requires `can_view_lesson`. It upserts the progress. **Auto-complete video lessons** when watched ≥ 90% of the duration.
- `public.submit_quiz_attempt(_lesson_id uuid, _answers jsonb) returns jsonb`: grades **server-side** against `quiz_questions.correct`, enforces `max_attempts` and the time limit (from `started_at`), and returns the score with per-question correctness. Explanations are returned according to `show_answers`. Passing marks the lesson complete.
- `public.start_quiz_attempt(_lesson_id)` records `started_at`.
- `public.issue_certificate_if_eligible(_user, _course)`: called by the course_progress trigger when percent reaches 100. It requires `certificate_enabled`, all required quizzes passed, and assignments submitted. It's idempotent.
- `public.verify_certificate(_serial text)`: **public**. It returns only the safe fields (name, course, creator, issue date, valid/revoked).
- **Reviews:** insert requires `has_course_access` **and** `course_progress.percent >= 20` (or ≥ 2 lessons completed). A trigger updates `courses.rating_avg/rating_count` and the creator's aggregate rating. Product reviews require `has_product_access`.
- **Update the refund eligibility check** from Phase 4 to also require `course_progress.percent < 30`.

### 2.2 Communities (Skool model)
**`communities`**: `id`, `creator_id`, `name`, `slug unique`, `tagline` (≤120), `description jsonb`, `cover_url`, `icon_url`, `tint`, `category_id`, `visibility text check in ('public','private')` (private = the about page is visible but content is members-only; **hidden** communities aren't listed), `is_listed bool default true`, `access_type text check in ('free','paid','plan','invite')`, `plan_id null references plans`, `join_questions jsonb` (up to 3 questions for approval), `requires_approval bool`, `rules jsonb` (list), `level_names text[]` (9 names, defaulted), `level_thresholds int[]` (default `{0,5,20,65,155,515,2015,8015,33015}`, Skool-like), `member_count`, `online_count` (cache), `posts_count`, `status` (`draft/published/archived`), timestamps, plus a search tsvector
- Add the FK `plans.community_id → communities.id` now (`alter table … add constraint if not exists` through a DO block).
**`community_members`**: `community_id`, `user_id`, `role text check in ('owner','admin','moderator','member')`, `status text check in ('pending','active','banned','left')`, `join_answers jsonb`, `points int default 0`, `level int default 1`, `joined_at`, `last_active_at`, `subscription_id null`, `invited_by null`, pk(community_id, user_id)
**`community_categories`** (post channels): `id`, `community_id`, `name`, `emoji`, `position`, `only_admins_can_post bool`
**`posts`**: `id`, `community_id`, `author_id`, `category_id`, `title` (≤140), `body jsonb`, `body_text`, `attachments jsonb` (images/files/links/video embeds), `poll jsonb null` (`{question, options:[{id,text}], multi:false, ends_at}`), `is_pinned bool`, `is_announcement bool` (owner/admin; triggers notifications to all), `likes_count`, `comments_count`, `last_activity_at`, `is_hidden bool`, timestamps, search tsvector, an index on `(community_id, is_pinned desc, last_activity_at desc)`
**`post_comments`**: `id`, `post_id`, `community_id`, `author_id`, `parent_id null` (**one level of nesting only**), `body jsonb`, `likes_count`, `is_hidden`, timestamps
**`reactions`**: `user_id`, `target_type text check in ('post','comment')`, `target_id`, `community_id`, `created_at`, pk(user_id, target_type, target_id)
**`poll_votes`**: `post_id`, `user_id`, `option_id`, pk(post_id, user_id, option_id)
**`points_ledger`**: `id`, `community_id`, `user_id` (receiver), `actor_id`, `points int`, `reason text check in ('like_received','admin_award','lesson_completed','event_attended')`, `source_type`, `source_id`, `created_at`, unique(source_type, source_id, actor_id, reason) to prevent farming
**`community_courses`**: `community_id`, `course_id`, `unlock_level int default 1`, `position`, `access text check in ('level','plan','free')`, pk. **Classroom:** members get access when their level is ≥ `unlock_level`. Extend `has_course_access` with this.
**`community_events`**: `id`, `community_id`, `title`, `description`, `starts_at`, `ends_at`, `timezone`, `location_type text check in ('online','in_person')`, `meeting_url` (revealed only to members), `address`, `cover_url`, `recurrence_rule text null` (RRULE), `created_by`, timestamps
**`event_rsvps`**: `event_id`, `user_id`, `status text check in ('going','maybe','not_going')`, pk
**`community_invites`**: `id`, `community_id`, `code unique`, `created_by`, `max_uses`, `uses`, `expires_at`
**`moderation_reports`**: `id`, `reporter_id`, `target_type` (post/comment/review/qa/user/community/course/product), `target_id`, `reason`, `details`, `status text check in ('open','reviewing','actioned','dismissed')`, `handled_by`, `handled_at`, `resolution_note`. This is shared with the Phase 6 admin.

**Gamification rules (implement as triggers):**
- A like on your post/comment gives **+1 point** to the author (not for self-likes). Unliking removes it (delete the ledger row).
- An admin award gives +N (owner/admin only, max 10 per action).
- The level is recomputed from `points` against `level_thresholds` on every ledger change. A **level up** creates a notification.
- `community_members.points` is the all-time total. The leaderboard (7-day / 30-day / all-time) comes from a function `public.community_leaderboard(_community, _window text, _limit)` that aggregates `points_ledger`.

**Functions:**
- `public.is_community_member(_community uuid)`: true for active members, true for staff, and true for the owner.
- `public.community_role(_community uuid)` returns the role.
- `public.join_community(_community uuid, _answers jsonb, _invite_code text)`: handles free/public (active immediately), approval-required (pending), and invite codes. Paid/plan communities get **no direct join**: membership is created by `fulfill`/subscription activation. Update the Phase 4 subscription functions so that a `community` plan activation upserts an active membership and expiry/cancel sets `status='left'` with access gone.
- `public.leave_community`, `public.approve_member`, `public.ban_member`, `public.set_member_role` (owner/admin only, moderators cannot promote).
- `public.vote_poll(_post_id, _option_ids uuid[])`.

### 2.3 Notifications
**`notifications`**: `id`, `user_id`, `type text` (e.g. `course.enrolled`, `course.new_lesson`, `qa.reply`, `qa.answer_accepted`, `review.reply`, `community.mention`, `community.comment`, `community.like`, `community.level_up`, `community.announcement`, `community.event_reminder`, `community.join_request`, `community.approved`, `certificate.issued`, `order.paid`, `payout.paid`, `creator.application_decision`, `course.review_decision`), `title`, `body`, `link`, `actor_id`, `data jsonb`, `group_key text` (for collapsing "Ayesha and 4 others liked your post"), `read_at`, `created_at`, an index on `(user_id, read_at, created_at desc)`
- `public.notify(_user, _type, _title, _body, _link, _actor, _data, _group_key)`: a security definer, called by triggers. Add triggers for: QA replies, review replies, comments on your post, replies to your comment, likes (grouped), **@mentions** (parse `@handle` in body_text), level up, announcements (fan out to all active members; use a function that batches the inserts), join request/approval, certificate issued, and order paid. Also update the Phase 2–4 RPCs (application decision, course moderation, payout paid) to call `notify`.
- RLS: the owner can select/update (`read_at`) only.
- Enable **Supabase Realtime** on `notifications`, `posts`, and `post_comments` (`alter publication supabase_realtime add table …`, idempotent through a DO block).

### 2.4 RLS (summary; write every policy)
- Learning tables: owner read/write their own (writes through RPCs where grading or integrity matters, e.g. `quiz_attempts` insert only through the RPC). Instructors read their courses' progress, attempts, submissions, and notes **excluding** private notes (notes are **private** to the learner). Instructors grade submissions.
- `certificates`: owner select. Public access only through `verify_certificate`.
- Reviews: public select where not hidden. Owner insert/update (with the eligibility check in the policy using the functions). The instructor can update only `creator_reply`. Staff can hide.
- Q&A: select for anyone with course access plus the instructors. Insert for anyone with course access. The instructor can mark accepted, pin, or resolve.
- Communities: public select for listed/public communities (safe columns). Private community content (posts, comments, events, members list, classroom) is **members only**. Members post in categories (respecting `only_admins_can_post`). Authors edit their own posts and comments. Moderators and up can hide, pin, or move. Owners manage settings.
- `moderation_reports`: anyone authenticated can insert. Community moderators see reports for their community's content. Staff see everything.

### 2.5 Seed: `supabase/seed/0004_seed.sql`
9 communities (matching the homepage spotlight: e.g. "Freelance Launchpad BD", "UI/UX Circle", "AI Builders", "IELTS 8+ Club", "Python Bangla", "Video Editors Guild", "Digital Marketing Lab", "Founders' Table", "Remote Job Hunters"), each with categories, 10–20 posts, comments, an event, and linked classroom courses. Also seed demo reviews (realistic text) on the seeded courses so ratings render.

---

## 3. Course player `/learn/[courseSlug]/[lessonId]` (focus layout)
- **Layout:** the global sidebar collapses to the 72px icon rail. Main area: the **player/content** (canvas). Right: the **curriculum panel**, ~320px on `surface-1`, collapsible. Below 1024px the panel becomes a bottom Sheet opened by a "Course content" button.
- **Top bar (ink-surface, 56px):** back to the course, the course title, a progress ring with "42% complete", a "Leave a rating" button (when eligible), and Share.
- **Video lesson:** a custom flat player wrapper (use **Plyr** or **Vidstack** for uploaded/HLS video, with the YouTube/Vimeo adapters; restyle the controls flat, with a Rausch progress bar). Features: **resume from `position_seconds`**, playback speed 0.5–2x, a quality selector (when HLS), captions (VTT from resources), keyboard shortcuts (space, ←/→ 5s, f, m, c), a "Next lesson in 5s" autoplay countdown overlay (togglable), picture-in-picture, and theater mode. Progress is saved **every 10 seconds** and on pause/visibilitychange/unload (through `navigator.sendBeacon` to a route handler that calls the RPC). Signed URL refresh before expiry.
- **Article lesson:** a typography-styled reader (max 720px), read progress, and "Mark as complete" at the end.
- **Quiz lesson:** a start screen (questions, pass %, attempts left, time limit), one question at a time or all-in-one (a setting), a timer bar, review-before-submit, and a **result screen** (score ring, passed/failed, per-question review according to `show_answers`, "Retry" if attempts remain). Grading goes through the RPC only.
- **Assignment lesson:** instructions, a submission form (text in Tiptap / link / file upload), status, and the grade with feedback once returned.
- **Download, Embed, and Live lessons:** a file list / a sandboxed iframe from the allow-list / event details with an "Add to calendar" (.ics) link, a join button active 15 minutes before the start, and the replay after.
- **Tabs under the content** (text Tabs with the 2px bar): **Overview** (lesson summary, resources with download buttons) · **Q&A** (threads for this lesson and course: search, sort by recent/top/unanswered, ask a question with Tiptap, instructor answers highlighted with a `primary-tint` tile and an "Instructor" badge, accepted answer) · **Notes** (timestamped notes; clicking a timestamp seeks the video; notes can be edited and deleted; "All notes in this course" filter) · **Announcements** (from the instructor, optional) · **Reviews**.
- **Curriculum panel:** sections as accordions, with the lesson rows showing a completion checkbox (manual toggle), type icon, title, duration, and a lock icon with a tooltip "Unlocks on Mar 12" for dripped lessons. The current lesson has `primary-tint` bg. The section header shows "3/7 · 42min".
- **Access control:** server-side `can_view_lesson`. A non-enrolled user hitting a non-preview lesson is redirected to the course landing page with a toast.
- **Completion moment:** reaching 100% shows a full-screen flat celebration (confetti respecting `prefers-reduced-motion`), the certificate preview, "Share on LinkedIn" (Add to Profile URL with the certificate data), "Leave a review", and "Recommended next" courses.

## 4. Learner screens
- `/learning`: tabs All · In progress · Completed · Archived (archive is a user-level hide flag; add the column `enrollments.archived_by_user bool`). Course rows/cards with the progress bar, "Resume" (deep link to `last_lesson_id`), and last activity. Sort and search. Includes subscription-access courses, labeled "via {Plan}".
- `/dashboard`: real "Continue learning" (the top 3 by last activity, with a big resume tile for the most recent), **a weekly streak and goal tile** (learning minutes this week vs a user-set goal; store it in `profiles.weekly_goal_minutes`), "Your communities" with unread post counts, upcoming events, and recommendations.
- `/certificates`: a grid of certificates. The detail page renders the **certificate design** (a flat landscape A4 design: brand mark, recipient name in display type, course title, creator signature name, issue date, serial, and a QR code to `/verify/[serial]`). Actions: download PDF (generate server-side with `@react-pdf/renderer` in a route handler, cached to storage `certificates` bucket), share link, and LinkedIn.
- `/verify/[serial]` (public): a valid/revoked state with the safe details, plus the OG image.

## 5. Reviews and Q&A across the app
- The course landing page Reviews section is now real: a big `rating-display` number, a 5→1 star breakdown as flat bars (click a bar to filter), a sort (most relevant/recent/highest/lowest), review cards (avatar, name, stars, date, body, "Helpful?" vote, creator reply in a `surface-1` tile indented by spacing, **not** a nested card), and "See all reviews" in a Dialog with pagination.
- The **review prompt** appears in the player after 20% progress (a dismissible flat banner) and on completion. The review Dialog has a star selector with labels ("Amazing, above expectations!"), title, and body.
- Products get reviews on `/products/[slug]` and `/library/[id]`.
- `/studio/reviews` (creator): tabs **Reviews** (filter by course and rating, reply inline, report abuse) and **Q&A** (an inbox of unanswered questions across courses, answer inline, mark accepted, pin). Badge count in the sidebar for unanswered questions.
- Creator assignment grading: `/studio/courses/[id]/submissions`, a queue with the submission viewer and a grade + feedback form.

## 6. Communities (Skool model)

### 6.1 Discovery
- Explore → the **Communities** tab is live: CommunityCard grid (cover, icon, name, tagline, members, online dot, price/Free, category), with filters (category, free/paid, language) and sort (most members, most active, newest).
- `/c/[slug]/about` (public, discover layout): cover, icon, name, tagline, stats (members, online, posts, admins' avatars), description, rules, "What's inside" (classroom course thumbnails, events count), creator card, pricing ("Free" / "৳990/month" / "Included in {Plan}"), and a **Join** CTA. The join flow handles: free (join instantly), approval (a Dialog with the join questions), paid (the plan checkout from Phase 4), and invite (`?invite=CODE`). Private communities show the about page only.
- `/communities` (AppShell): my communities as a list (icon, name, unread count, my level) plus discover suggestions.

### 6.2 Inside a community `/c/[slug]/*` (AppShell)
- **Community header** at the top of the content area (no second sidebar): the icon, the name, and a **horizontal tab nav**: **Community** (feed) · **Classroom** · **Calendar** · **Members** · **Leaderboards** · **About**. Admins also see **Settings**. Skool puts these tabs at the top, and we do the same.
- In the AppShell sidebar, the **"Communities" group** lists joined communities (icon + name + unread dot) for quick switching, like Skool's community switcher.
- **Feed** `/c/[slug]`:
  - A "Write something…" composer tile (surface-2, rounded 14) that expands into a Dialog: title, Tiptap body (@mentions with autocomplete from members, emoji, links, images and video embeds, file attachments), category select, and an optional poll builder. Admins get "Pin" and "Send as announcement (notifies all members)".
  - Category filter chips (All, plus each category with its emoji) and a sort (Default = pinned + last activity, New, Top).
  - Post rows on canvas, separated by **spacing and a surface-1 hover state** (**no cards with borders**). Each row shows: avatar with a **level badge** overlaid (a small ink circle with the level number), name, time, category, title (title-md), a 2–3 line body excerpt, an attachment thumbnail strip, a poll preview, likes (heart, Rausch when liked), the comment count, the last commenter avatars, and "New comment 5m ago".
  - The post detail is a Dialog/route `/c/[slug]/post/[id]` with the full body, a poll vote, likes, threaded comments (1 level), reply, like comment, edit/delete own, and a moderator menu (pin, hide, move category, ban author, report).
  - **Realtime:** a "3 new posts — Show" pill appears when new posts arrive, and comment counts update live.
  - A right rail on ≥1280 inside the content area: the community info tile (cover, name, members, online, admins, Invite button) and the top 5 leaderboard (30-day). This is one flat column on `surface-1` with no nested boxes.
- **Classroom** `/c/[slug]/classroom`: a grid of course tiles (cover, title, progress bar). Locked tiles show "Unlocks at Level 3" with a lock icon on a surface-3 overlay. Clicking an unlocked tile goes to the player.
- **Calendar** `/c/[slug]/calendar`: month view plus a list view toggle, event tiles in the community tint, an event Dialog (details, time in the viewer's timezone, RSVP buttons, attendees, "Add to calendar" .ics, a join link revealed to members 15 minutes before), and admin "Create event" (with recurrence: weekly or monthly).
- **Members** `/c/[slug]/members`: tabs Members · Admins · Online · Pending (admins). A search box. Member rows show avatar, name, level, bio snippet, joined date, and "Message" (disabled, "coming soon"). Admin actions: approve/decline pending (showing their answers), promote/demote, ban, remove.
- **Leaderboards** `/c/[slug]/leaderboard`: **your level card** (level number in `display-2xl`, level name, points, "X points to level up", and the level progress bar), a **levels table** (9 levels with names, the % of members at each, and the classroom unlocks per level), and 3 leaderboard columns (7-day / 30-day / all-time) with the top 10 each (rank, avatar, name, +points).
- **Settings** (owner/admin): general (name, slug, tagline, description, cover, icon, tint, category), access (free/paid/plan/invite, plan picker, linking to `/studio/plans`), membership questions, approval toggle, rules, categories (CRUD + reorder + admin-only toggle), level names, classroom (attach your courses with an unlock level), invite links, and danger zone (archive).

### 6.3 Creator Studio `/studio/communities`
A list of the creator's communities with members, MRR, posts in the last 7 days, pending requests, and "Create community" (wizard: name → slug → access → cover/icon → categories → publish).

## 7. Notifications
- A topbar bell with an unread count (realtime through Supabase channel subscription on `notifications` filtered by `user_id`), and a popover (surface-1, no shadow) with the latest 10, grouped ("Ayesha and 4 others liked your post"), "Mark all as read", and "View all".
- `/notifications`: tabs All · Unread · Mentions · Learning · Community · Orders. Infinite scroll. Click marks as read and navigates.
- Toast on new real-time notifications (except while on the notifications page).

## 8. Definition of Done
- [ ] `0004_learning_community.sql` runs twice cleanly. Realtime publication is set. The seed populates communities, posts, and reviews.
- [ ] Player: resume works across devices, progress saves reliably (verify the sendBeacon on tab close), auto-complete at 90%, drip locks are enforced server-side, and a quiz is graded server-side (the `correct` answers never reach the client before submission; verify in the network tab).
- [ ] 100% completion issues exactly one certificate, the PDF downloads, and `/verify/[serial]` works publicly.
- [ ] Review eligibility is enforced by RLS (test by inserting a review via the anon client without access → denied). The rating aggregates update.
- [ ] Communities: join free, join with approval, join a paid one (through a Phase 4 plan checkout, which creates the membership), and an expired subscription removes access.
- [ ] Likes give points, levels recompute, the level-up notification fires, classroom unlocks happen at the right level, and the leaderboards are correct for each window.
- [ ] Self-likes give no points, and repeated like/unlike can't farm points.
- [ ] Notifications arrive in realtime, with @mentions resolving to users.
- [ ] Flat design rules hold everywhere (feed rows, comments, and the player all have no borders or shadows). Build, lint, and typecheck pass. Docs are updated.

At the end, output: (1) the SQL files to run, in order, (2) the Supabase dashboard steps (Realtime enabled tables, new storage buckets `assignment-files` and `certificates`), (3) any new packages and env vars, and (4) a manual QA script covering a learner, a creator, and a community admin.
