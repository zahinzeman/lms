# PROMPT 1 of 6: Foundation, Flat Design System, App Shell & Public Homepage

You are a senior full-stack engineer and product designer. You are building **the first phase** of a production-grade LMS and creator marketplace. It combines **Udemy** (course catalog, course landing pages, a learner dashboard) with **Skool** (creator-run communities, gamification, a clean left-rail navigation). Work carefully, write real production code (no pseudo-code, no TODO stubs for the features in scope), and finish with a working build that deploys to Vercel **without a database connected yet**.

---

## 0. Product context (read fully before coding)

**Working brand name:** `Bootcamp BD`. Keep it in `src/config/site.ts` so it can be renamed in one place. Tagline: "Learn skills that pay. Teach what you know."

**What the platform is:** a digital marketplace where:
- **Students** discover, buy, or subscribe to **courses**, **digital products** (ebooks, templates, presets, toolkits), and **communities**, then learn inside the platform.
- **Creators** (approved instructors, coaches, makers) publish courses, sell digital products, run paid or free communities, and offer memberships/subscriptions. The platform takes a fee.
- **Admins/Moderators** run the marketplace: approve creators, moderate content, handle refunds and payouts.
- **Visitors** (logged out) explore the platform. The homepage must (a) **hype students** to start learning new skills and (b) **convince visitors to become creators**.

**Roles:** `visitor` (no session), `student` (default for every account), `creator` (approved), `moderator`, `admin`. One account can be both student and creator (Udemy-style "Switch to Creator Studio").

**Phases (this prompt is #1):**
1. Foundation, design system, app shell, homepage, all routes stubbed with mock data ← **YOU ARE HERE**
2. Supabase Auth, roles, profiles, onboarding, creator applications
3. Courses: builder, catalog, explore, course landing page
4. Commerce: digital products, cart, checkout, enrollment, subscriptions, coupons, payouts
5. Learning player, progress, certificates, reviews, Skool-style communities and gamification
6. Admin console, analytics, email, search, SEO, hardening, launch

Build Phase 1 so phases 2–6 slot in without restructuring.

### 0.1 Owner-supplied LMS structure (merge this in)
> **[PASTE YOUR PREPARED LMS STRUCTURE HERE, OR DELETE THIS BLOCK]**
>
> If anything is pasted above: compare it with the route map and sidebar nav in sections 5–6 below. Keep everything in it that fits the product, merge names and features into the route map and nav, and note any conflicts in `docs/PROJECT_CONTEXT.md` under "Decisions". Where it conflicts with the design rules in section 2, the design rules win.

---

## 1. Tech stack (use exactly this)

- **Next.js** (latest stable, App Router, React Server Components, Server Actions), **TypeScript strict**
- **Tailwind CSS v4** with design tokens declared in `@theme` in `src/app/globals.css`
- **Radix UI primitives** (via shadcn/ui CLI is fine) **restyled to the flat system**: strip every `border`, `ring-offset`, and `shadow` class the generator adds
- **lucide-react** icons, stroke width 1.75, sizes 16/20/24
- **react-hook-form + zod** for every form
- **@supabase/ssr + @supabase/supabase-js**: install and create clients now, but the app must **build and run with no env vars** (see 7.3)
- **next/font** with **Figtree** (closest open alternative to Airbnb Cereal/Circular), weights 400/500/600/700/800
- **date-fns**, **clsx + tailwind-merge** (`cn()` helper), **sonner** for toasts
- **embla-carousel-react** for horizontal shelves
- Package manager: **npm**. Node 20+.

Scripts in `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `format` (prettier).

---

## 2. Design system: "Flat Airbnb"

Base: the Airbnb DESIGN.md (VoltAgent/awesome-design-md), **modified to be completely flat**.

### 2.1 Non-negotiable flat rules
1. **No box-shadows anywhere.** Not on cards, dropdowns, modals, the search bar, or hover states. Set `--shadow-*: none` and never use `shadow-*` utilities.
2. **No strokes or borders for separation or decoration.** Separate elements with **background shade differences** (canvas → surface-1 → surface-2 → surface-3) and spacing. The **only** allowed lines:
   - the keyboard **focus indicator** (`outline: 2px solid var(--ink); outline-offset: 2px` on `:focus-visible`), which accessibility requires
   - the 2px **active tab underline** (it's a filled bar, not a border box)
3. **No container stacking.** A section is one flat band. At most **one level** of tiles inside it. Never put a card inside a card inside a panel. If you need grouping inside a card, use spacing and type weight, not another box.
4. **Hierarchy through shade, size, weight, and photos**, not decoration. Photos carry the color. UI stays ~90% white/grey and ink, with one accent.
5. **One accent (Rausch).** Use it for primary CTAs, active nav, price highlights, the wishlist heart, progress bars, and brand links. Spend it sparingly.
6. **Soft shapes:** everything interactive is rounded (8px → full pill). Images use 14px radius.
7. No gradients, glassmorphism, blur, or neon. Flat fills only.

### 2.2 Color tokens (define in `@theme` and as CSS variables)

```
/* Brand */
--color-primary:          #ff385c;  /* Rausch: CTAs, active, accent */
--color-primary-active:   #e00b41;  /* pressed / hover darken */
--color-primary-soft:     #ffd1da;  /* disabled CTA, soft fills */
--color-primary-tint:     #fff1f4;  /* active nav bg, tinted bands */
--color-on-primary:       #ffffff;

/* Ink (text) */
--color-ink:              #222222;  /* headings, primary text, dark bands */
--color-body:             #3f3f3f;  /* long-form copy */
--color-muted:            #6a6a6a;  /* labels, meta */
--color-muted-soft:       #929292;  /* disabled text, placeholders */

/* Surfaces: the flat separation ladder */
--color-canvas:           #ffffff;  /* page / content area */
--color-surface-1:        #f7f7f7;  /* sidebar, alt bands, footer */
--color-surface-2:        #f2f2f2;  /* inputs, icon buttons, tiles on canvas */
--color-surface-3:        #ebebeb;  /* hover on surface-2, tiles on surface-1 */
--color-surface-4:        #dddddd;  /* pressed, skeletons, progress track */
--color-ink-surface:      #222222;  /* dark full-bleed band (creator section) */
--color-ink-surface-2:    #2e2e2e;  /* tiles inside the dark band */
--color-ink-surface-3:    #3a3a3a;  /* hover inside the dark band */

/* Status (text color + flat tint for backgrounds) */
--color-success: #008a05;  --color-success-tint: #e8f5e9;
--color-warning: #b4690e;  --color-warning-tint: #fff4e5;
--color-error:   #c13515;  --color-error-tint:   #fdecea;
--color-info:    #2f6fde;  --color-info-tint:    #eaf2ff;

/* Category tints: flat colored tiles (from Airbnb sub-brand hues) */
--color-cat-rose:   #fff1f4;  --color-cat-rose-ink:   #c2183f;
--color-cat-blue:   #eef4ff;  --color-cat-blue-ink:   #1f4fb8;
--color-cat-green:  #edf8f1;  --color-cat-green-ink:  #146c2e;
--color-cat-amber:  #fff6e6;  --color-cat-amber-ink:  #8a5300;
--color-cat-violet: #f3eefe;  --color-cat-violet-ink: #460479;
--color-cat-plum:   #fdeef4;  --color-cat-plum-ink:   #92174d;
```

**Shade-pairing rules** (put these in `docs/DESIGN_SYSTEM.md`):
- Tile on `canvas` → `surface-2`; hover → `surface-3`.
- Tile on `surface-1` → `canvas` (white tile) or `surface-3`; hover → `surface-2` / `surface-4`.
- Tile on `ink-surface` → `ink-surface-2`; hover → `ink-surface-3`.
- Text on a tint (e.g. `cat-blue`) uses its matching `-ink` color.
- Never put two adjacent surfaces of the same shade in a parent/child relationship.

### 2.3 Typography (Figtree, Airbnb scale, plus marketing display sizes)

| Token | Size / Weight / Line height / Tracking | Use |
|---|---|---|
| `display-hero` | 56/800/1.05/-1.5px (mobile 38) | Homepage hero H1 only |
| `display-2xl` | 40/700/1.1/-1px (mobile 30) | Marketing section titles |
| `display-xl` | 28/700/1.25/-0.5px | Page H1 inside app |
| `display-lg` | 22/600/1.25/-0.44px | Course title on cards (large) |
| `display-md` | 21/700/1.43/0 | Section heads in app |
| `display-sm` | 20/600/1.2/-0.18px | Sub-section titles |
| `title-md` | 16/600/1.25 | Card titles, nav labels |
| `title-sm` | 16/500/1.25 | Footer column heads |
| `body-md` | 16/400/1.5 | Default body |
| `body-sm` | 14/400/1.43 | Meta, prices, dates |
| `caption` | 14/500/1.29 | Field labels |
| `caption-sm` | 13/400/1.23 | Legal, fine print |
| `micro` | 12/700/1.33 | Badges, uppercase eyebrows (tracking 0.4px) |
| `badge` | 11/600/1.18 | Pills on cards |
| `rating-display` | 64/700/1.1/-1px | Big rating number on course page |

Make them Tailwind utilities (`text-display-hero`, etc.) via `@theme` font-size tokens with line-height/weight pairs, or `@utility` blocks.

### 2.4 Spacing, radius, layout
- Spacing: `xxs 2, xs 4, sm 8, md 12, base 16, lg 24, xl 32, xxl 48, section 64, section-lg 96` (px).
- Radius: `xs 4, sm 8 (buttons, inputs), md 14 (cards, images), lg 20 (feature tiles, modals), xl 32 (hero media), full 9999 (pills, avatars, chips, search)`.
- Marketing container max 1280px, 24px gutters (16px mobile). Card grid gap 16px desktop, 12px mobile.
- Breakpoints: `sm 640`, `md 744`, `lg 1024`, `xl 1128`, `2xl 1280`, `3xl 1440`.
- Touch targets ≥ 44px. Primary CTA height 48px.

### 2.5 Components to build in `src/components/ui/` (all flat)
- **Button**: variants `primary` (Rausch bg, white), `dark` (ink bg, white), `secondary` (surface-2 bg, ink text, hover surface-3; **no outline**), `ghost` (transparent, hover surface-2), `link` (ink, underline on hover), `on-dark` (white bg, ink text, for dark bands). Sizes `sm 36`, `md 44`, `lg 48`, `icon`. Shapes `rounded-sm` or `pill`. `loading` state with spinner. Pressed state = darker shade.
- **IconButton**: 40px circle, surface-2, hover surface-3.
- **Input / Textarea / Select / Combobox**: filled `surface-2`, **no border**, 8px radius, height 48; hover `surface-3`; focus = `canvas` bg + focus outline; error = `error-tint` bg + error helper text below. Floating or top label (caption).
- **Checkbox / Radio / Switch**: flat fills. Unchecked track surface-4, checked ink or primary.
- **SearchPill**: Airbnb-style 64px pill on surface-2 (homepage) with segments separated by **spacing and shade**, not rules. Segments: "What do you want to learn?", "Type" (Courses / Products / Communities), and a 48px Rausch search orb.
- **Chip / FilterChip**: pill, surface-2; selected = ink bg + white text.
- **Badge**: pill, variants `neutral` (surface-3), `primary` (primary-tint + primary-active text), `success`, `warning`, `info`, `bestseller` (cat-amber), `new` (cat-green).
- **Tabs**: text tabs, muted → ink when active, with a 2px ink bar under the active one. Also a **SegmentedControl**: surface-2 track, canvas thumb.
- **Card primitives**: `CourseCard`, `ProductCard`, `CommunityCard`, `CreatorCard`, `StatTile`, `FeatureTile`. Photo-first, image radius 14, meta sits **directly on the page bg with no card box** (Airbnb listing style). Hover = image scale 1.02 + title underline. No shadow lift.
- **Avatar** (sizes 24/32/40/56/96, initials fallback on cat tint), **AvatarStack**.
- **Rating** (★ in ink + number + count), **Price** (current bold ink, compare-at muted strikethrough, discount badge).
- **ProgressBar** (track surface-4, fill primary, 6px, rounded-full), **ProgressRing**.
- **Dialog / Sheet / Drawer / Popover / DropdownMenu / Tooltip**: canvas bg, radius 20/14, **no shadow**, scrim `rgba(0,0,0,.5)`. Popovers sit on canvas, so give them `surface-1` bg to separate them by shade.
- **Accordion** (FAQ): each item a surface-2 tile, 14px radius, 8px gap between items, plus/minus icon.
- **EmptyState**: icon in a 64px cat-tint circle, title, one line, one CTA.
- **Skeleton**: surface-3 pulse.
- **Toast** (sonner restyled: ink bg, white text, no shadow).
- **Table** (for dashboards later): rows alternate canvas/surface-1, header text muted micro uppercase, **no grid lines**.
- **Pagination**, **Breadcrumbs**, **Kbd**.

Build a hidden **`/design-system`** route that renders every token and component state, for QA.

---

## 3. Layout system

### 3.1 Public (logged-out) layout: `(marketing)` route group
- **TopNav** (80px, canvas bg, no bottom border; it gets a `surface-1` background only after scroll >8px, separated by shade): logo left · "Explore" mega-menu trigger (categories) · compact search pill (hidden on the homepage hero until the user scrolls past it) · right side: "Teach on Bootcamp BD", "Log in" (ghost), "Join free" (primary pill).
- Mobile: logo, search icon, and hamburger opening a full-height Sheet.
- **Footer** on surface-1: 4 columns (Learn / Teach & Sell / Company / Support), a language/currency selector (BDT ৳ / USD $) as chips, social icons, and a legal line in caption-sm muted.

### 3.2 App shell (all logged-in users: student, creator, moderator, admin): `(app)` route group
**This is required: left sidebar 15%, content 85%.**

```
┌──────────────┬────────────────────────────────────────────────────────┐
│  SIDEBAR 15% │  CONTENT 85%                                           │
│  surface-1   │  canvas                                                │
│              │  ┌ Topbar 64px (canvas): page title/breadcrumb · global │
│  Logo        │  │ search (surface-2 pill) · cart · bell · avatar menu  │
│  Workspace   │  └───────────────────────────────────────────────────── │
│  switcher    │  Page content (max-width 1280, padding 32/24/16)       │
│  Nav groups  │                                                        │
│  …           │                                                        │
│  Upgrade /   │                                                        │
│  Teach CTA   │                                                        │
│  User chip   │                                                        │
└──────────────┴────────────────────────────────────────────────────────┘
```

- CSS grid: `grid-template-columns: clamp(232px, 15%, 300px) 1fr`. The sidebar is **15% of the viewport, clamped**, so it never gets too narrow on a 1280 screen or too wide on ultrawide. The content column takes the remaining ~85%.
- Sidebar: `position: sticky; top: 0; height: 100dvh; overflow-y: auto`, bg `surface-1`. Separation from content comes **only from the shade difference**, with no divider line.
- Nav item: 40px tall, 8px radius, icon 20 + label (title-md 15px/500). States: default muted text; hover `surface-3` + ink; **active `primary-tint` bg + `primary-active` text + 600 weight**. Group labels in `micro` muted uppercase. Count badges on the right (e.g. unread).
- **Workspace switcher** at the top: a SegmentedControl or dropdown with `Learning` · `Creator Studio` (only if creator) · `Admin` (only if admin/moderator). It swaps the nav set. Persist the choice in a cookie.
- Bottom of the sidebar: a contextual CTA tile (`primary-tint`): for students, "Become a creator"; for creators on the free plan, "Upgrade to Pro". Then a user chip (avatar, name, role badge) that opens a menu.
- **Responsive:**
  - ≥1280: full 15/85.
  - 1024–1279: the sidebar collapses to a **72px icon rail** with tooltips. A toggle button expands it as an overlay. Persist the state in a cookie.
  - <1024: the sidebar becomes a left **Drawer** opened from a topbar hamburger, plus a **bottom tab bar** (5 items: Home, Explore, Learning, Communities, Menu) on canvas, separated by surface-1 bg.
- **Logged-in users on discovery pages** (`/explore`, `/courses/[slug]`, `/products/[slug]`, `/c/[slug]/about`, `/creators/[handle]`) also see the **app shell with sidebar**. Logged-out visitors see the TopNav layout on those same pages. Implement this with a shared page component rendered by a layout that checks the session (for now, a mock session; see 7.2).
- **Focus mode layout** for `/learn/[courseSlug]/[lessonId]` (built fully in Phase 5): the global sidebar collapses to the icon rail automatically, and the curriculum panel shows on the right. Stub it now.

### 3.3 Sidebar navigation sets (define as typed config in `src/config/nav.ts`)

**Learning (student):**
- *Main*: Home `/dashboard` · Explore `/explore` · My Learning `/learning` · Communities `/communities` · My Library (digital products) `/library`
- *Activity*: Wishlist `/wishlist` · Certificates `/certificates` · Notifications `/notifications`
- *Account*: Orders `/orders` · Subscriptions `/subscriptions` · Settings `/settings`

**Creator Studio:**
- *Overview*: Dashboard `/studio` · Analytics `/studio/analytics`
- *Content*: Courses `/studio/courses` · Digital Products `/studio/products` · Communities `/studio/communities` · Memberships & Plans `/studio/plans`
- *Audience*: Students `/studio/students` · Reviews & Q&A `/studio/reviews` · Coupons `/studio/coupons`
- *Money*: Sales `/studio/sales` · Payouts `/studio/payouts`
- *Brand*: Storefront `/studio/storefront` · Studio Settings `/studio/settings`

**Admin:**
- *Overview*: Dashboard `/admin` · Analytics `/admin/analytics`
- *People*: Users `/admin/users` · Creator Applications `/admin/creators`
- *Catalog*: Course Review Queue `/admin/courses` · Products `/admin/products` · Communities `/admin/communities` · Categories `/admin/categories`
- *Money*: Orders & Refunds `/admin/orders` · Payouts `/admin/payouts` · Platform Coupons `/admin/coupons` · Plans & Fees `/admin/plans`
- *Trust*: Reports `/admin/reports` · Audit Log `/admin/audit`
- *Site*: Homepage CMS `/admin/cms` · Settings `/admin/settings`

Each entry has: `label`, `href`, `icon`, `roles[]`, optional `badgeKey`, optional `featureFlag`. The sidebar component filters entries by the current user's roles.

---

## 4. Public homepage `/`: build it fully

Goal: get visitors excited to **learn** (primary) and make **becoming a creator** feel like an easy, lucrative next step (secondary). The page alternates flat bands: `canvas` / `surface-1` / `ink-surface` / `primary-tint`. Each band has 64–96px vertical padding and **one** level of tiles inside. Write **real, specific copy, never lorem ipsum**, with a confident, energetic, aspirational voice for South Asian and global learners. Use `https://images.unsplash.com/...` photos (allow them in `next.config` `images.remotePatterns`) or `https://placehold.co` where a photo doesn't fit.

1. **Hero (canvas)**
   - Eyebrow chip: "🔥 12,400+ learners started a new skill this month".
   - H1 (`display-hero`): "Learn the skills that **pay**. From people who've actually done it." Highlight "pay" in Rausch text, not a box.
   - Sub (body-md, muted, max 560px): one line on courses, communities, and toolkits from real creators.
   - **Audience toggle** (SegmentedControl): `I want to learn` | `I want to teach`. It swaps the H1, subcopy, CTA, and hero media with a 200ms crossfade. Teach version: "Turn what you know into a business." CTA "Start creating — free".
   - SearchPill (learn mode) or a primary CTA (teach mode).
   - Popular-search chips: "AI for Work", "Freelancing", "UI/UX", "Digital Marketing", "Python", "Video Editing", "IELTS", "Excel".
   - Right/below: a **flat photo mosaic** (3 rounded-20 images at different sizes, with one floating flat stat tile on `canvas` with no shadow, e.g. "4.8★ avg course rating"). The images must not overlap in a way that needs shadows.
   - Trust row: AvatarStack + "Join 85,000+ students" + rating.
2. **Category strip (canvas)**: Airbnb-style horizontally scrollable icon tabs (icon 24 + label, muted → ink with a 2px bar when active). Clicking one filters the "Trending" shelf below. Categories: Development, Design, Business, Marketing, AI & Data, Freelancing, Photography & Video, Personal Growth, Language & Test Prep, Finance, Music, Health.
3. **Trending courses (canvas)**: a header with a "See all" link and carousel arrows (IconButtons). 4-up desktop, 2-up tablet, 1.2-up mobile (swipe). The `CourseCard` shows a 16:9 image with a wishlist heart, an optional `Bestseller` badge, title (2 lines max), creator name, rating, students count, duration · level, and price.
4. **How learning works here (surface-1)**: 3 or 4 flat `canvas` tiles (radius 20): "Learn by doing" (projects), "Learn together" (communities), "Get certified" (shareable certificates), "Learn anywhere" (mobile and offline notes). Each tile has a cat-tint icon circle. No nested boxes.
5. **Communities spotlight (canvas)**: Skool-style community cards: cover image, icon, name, one-line promise, members count, a "● 128 online" dot in success green, and price ("Free" or "৳990/mo"). 3-up.
6. **Digital products shelf (canvas)**: "Toolkits, templates & ebooks". ProductCard: cover (4:5), type badge (Ebook / Template / Preset / Toolkit), title, creator, price.
7. **Outcomes band (primary-tint)**: big numbers in ink (`display-2xl`): "85K+ learners", "1,200+ courses", "340 creators earning", "৳4.2Cr paid to creators". Then 3 testimonial tiles on `canvas` (avatar, quote, name, role/outcome such as "Landed a remote UI job in 4 months").
8. **Become a creator (ink-surface, full-bleed dark band)**: the second hero.
   - H2 on dark: "Your knowledge is someone's next breakthrough. **Get paid for it.**"
   - 4 feature tiles on `ink-surface-2`: Courses · Communities · Digital products · Memberships, each with a one-line benefit.
   - **Earnings calculator** (client component): sliders for "Students per month" (10–2,000) and "Price" (৳500–৳15,000, or USD with the currency toggle), with a plan selector Free (15% fee) / Pro (5%) / Business (0%). Show the estimated monthly earnings in `display-2xl` white with Rausch highlight. Make the math correct and show a "after platform fee" caption.
   - A 3-step "Apply → Build → Launch & earn" row.
   - CTA: `on-dark` button "Become a creator" plus a link "See creator pricing".
9. **Top creators (canvas)**: a carousel of CreatorCard (avatar 96, name, niche, students count, courses count, "View storefront").
10. **Creator plans (surface-1)**: 3 plan tiles on `canvas`: **Free** (৳0, 15% transaction fee, 3 courses, 1 community), **Pro** (৳2,500/mo, 5% fee, unlimited, custom storefront, coupons), **Business** (৳7,500/mo, 0% fee, team seats, priority payouts, API). The recommended plan uses an `ink-surface` tile with white text instead of a border or shadow. Monthly/yearly SegmentedControl (yearly = 2 months free).
11. **FAQ (canvas)**: Accordion with 8 real Q&As covering both students (refunds, certificates, lifetime access, payment methods such as bKash/Nagad/cards) and creators (fees, payouts, approval time, ownership of content).
12. **Final CTA (primary)**: a full-bleed Rausch band, white H2 "Your next skill starts today.", and two buttons: `on-dark` "Join free" and a white-text ghost "Teach on Bootcamp BD".
13. Footer.

All homepage data comes from `src/lib/mock/*` through the data-access layer (section 7.1), so Phase 6 can swap it for CMS-driven data.

Accessibility: semantic landmarks, one H1, alt text, carousel buttons with aria-labels, `prefers-reduced-motion` respected, and all text contrast AA (check muted `#6a6a6a` on `surface-2`; it passes for body-sm).

---

## 5. Route map: create every route now

Every route below must exist and render inside the correct layout. Pages not built in this phase show a well-designed **stub**: page title, a one-line description of what's coming, and an EmptyState that uses mock data where it helps (e.g. the student dashboard shows mock "Continue learning" cards). That way the entire nav is clickable on the first deploy.

```
src/app/
  (marketing)/
    page.tsx                      → Homepage (FULL)
    teach/page.tsx                → Creator landing (reuse sections 8–11, add more detail) (FULL)
    pricing/page.tsx              → Creator plans + student subscription (FULL, reuse)
    about/, contact/, legal/terms/, legal/privacy/, legal/refund-policy/  (simple content pages)
  (auth)/
    login/  signup/  forgot-password/  reset-password/  verify-email/   (FULL UI, see section 6)
    onboarding/                   → stub (Phase 2)
  (discover)/                     → dual layout: TopNav if logged out, AppShell if logged in
    explore/page.tsx              → stub with mock grid + filter chips
    categories/[slug]/page.tsx
    courses/[slug]/page.tsx       → stub (Phase 3)
    products/[slug]/page.tsx      → stub (Phase 4)
    c/[slug]/about/page.tsx       → community about page stub (Phase 5)
    creators/[handle]/page.tsx    → storefront stub (Phase 3)
    search/page.tsx
    verify/[serial]/page.tsx      → certificate verification stub (Phase 5)
  (app)/                          → AppShell (sidebar 15% / content 85%)
    dashboard/  learning/  library/  communities/  wishlist/  certificates/
    notifications/  orders/  subscriptions/  cart/  checkout/
    settings/ (profile, account, security, notifications, billing) 
    become-creator/
    c/[slug]/ (feed, classroom, calendar, members, leaderboard)  → stubs
    studio/ … (all Creator Studio routes from 3.3)
    admin/  … (all Admin routes from 3.3)
  (focus)/
    learn/[courseSlug]/[lessonId]/page.tsx   → focus layout stub
  design-system/page.tsx
  not-found.tsx  error.tsx  loading.tsx (skeletons per group)
```

---

## 6. Auth screens (UI only in this phase, wired in Phase 2)

A split layout: left 45% is a flat `primary-tint` panel with a rotating testimonial and a mini stat. The right side is the form on canvas. On mobile the form goes full width.
- **Signup**: full name, email, password (strength meter as a flat bar), a "I want to: Learn / Teach / Both" chip selector (store the intent), terms checkbox, and buttons "Continue with Google" (secondary) and "Create account" (primary).
- **Login**: email/password, a "Send me a magic link instead" toggle, Google, and a "Forgot password?" link.
- **Forgot / Reset / Verify-email**: simple and friendly, with an illustration circle on a cat tint.
- zod validation with inline errors (error-tint input bg + error text). Submit handlers call `src/lib/auth/actions.ts` functions that currently show a toast "Auth will be connected in Phase 2" when Supabase env vars are missing.

---

## 7. Architecture and code conventions

### 7.1 Folder structure
```
src/
  app/                    (routes above)
  components/
    ui/                   (primitives, section 2.5)
    layout/               (TopNav, Footer, AppShell, Sidebar, Topbar, BottomTabBar, WorkspaceSwitcher)
    marketing/            (homepage sections, each a separate file)
    cards/                (CourseCard, ProductCard, CommunityCard, CreatorCard)
    shared/               (EmptyState, PageHeader, SectionHeader, Price, Rating)
  config/                 (site.ts, nav.ts, categories.ts, plans.ts, currency.ts)
  lib/
    supabase/             (client.ts, server.ts, middleware.ts, admin.ts [service role, server-only])
    data/                 (DATA ACCESS LAYER: courses.ts, products.ts, communities.ts, creators.ts, user.ts)
    mock/                 (typed mock fixtures: 24 courses, 12 products, 9 communities, 12 creators, testimonials, faqs)
    auth/                 (session.ts with getCurrentUser(), actions.ts)
    utils/                (cn, format-currency, format-duration, slugify)
  types/                  (domain types: Course, Product, Community, Creator, Profile, Role, …)
  hooks/
middleware.ts
docs/
  PROJECT_CONTEXT.md
  DESIGN_SYSTEM.md
  ROADMAP.md
supabase/
  migrations/  (empty for now + README explaining run order)
  seed/
```

- **Data access layer rule:** pages and components **never** import from `lib/mock` directly. They call `lib/data/*` functions (e.g. `getTrendingCourses({ category, limit })`). In Phase 1 these return mock data. In Phases 3–6 their internals switch to Supabase queries with the **same signatures and return types**.
- Domain types in `src/types` should already model the final shapes (prices stored as **integer minor units** with `currency: 'BDT' | 'USD'`, with ids as `string` uuids, etc.).
- `formatCurrency(amountMinor, currency)` gives `৳1,250` / `$12.50`. Use the Bangladeshi digit grouping option for BDT where sensible (`en-IN` style lakh grouping is acceptable).

### 7.2 Mock session
`getCurrentUser()` returns `null` by default. When `NEXT_PUBLIC_DEMO_ROLE=student|creator|admin` is set, it returns a mock user with that role, so the app shell and all three sidebar sets can be previewed on Vercel before Phase 2. Phase 2 replaces this with Supabase.

### 7.3 Supabase prep (must not break the build)
- Create `lib/supabase/{client,server,middleware,admin}.ts` using `@supabase/ssr` with cookie handling for the App Router.
- `middleware.ts` refreshes the session **only if** the env vars exist. Otherwise it no-ops.
- `admin.ts` imports `server-only`.
- `.env.example` lists every var from the README (Supabase now; Stripe, SSLCommerz, and Resend commented as "Phase 4/6").

### 7.4 Quality bar
- Server Components by default. `"use client"` only for interactive leaves.
- `next/image` for all images, with `sizes` set.
- Metadata API for titles and descriptions on every page. Add OG defaults in the root layout.
- No ESLint errors. `npm run build` and `npm run typecheck` must pass.
- Lighthouse on the homepage (mobile): Performance ≥ 90, Accessibility ≥ 95.

---

## 8. Docs the agent must write (future prompts depend on them)
- `docs/PROJECT_CONTEXT.md`: product summary, roles, phase list with status, route map, folder conventions, the data-access-layer rule, a "Decisions" log, and env vars.
- `docs/DESIGN_SYSTEM.md`: all tokens, the flat rules, shade-pairing rules, a component inventory with usage do/don't, and the layout spec (15/85 shell).
- `docs/ROADMAP.md`: Phases 2–6 as checklists.
- `AGENTS.md` / `CLAUDE.md` in the project root: a short pointer to the docs above, plus the commands.
- `README.md`: setup, scripts, and deploy steps.

---

## 9. Definition of Done (verify each item and report back)
- [ ] `npm run build`, `npm run lint`, and `npm run typecheck` pass with **no env vars set**.
- [ ] Homepage has all 13 sections, real copy, a working audience toggle, a working earnings calculator, a working category filter, and working carousels. It is responsive at 375 / 768 / 1024 / 1280 / 1440.
- [ ] `grep -r "shadow-" src/` finds nothing (except `shadow-none`). No `border` utilities are used for decoration (the focus outline is the only line).
- [ ] App shell: sidebar is `clamp(232px,15%,300px)` and content takes the rest. The icon rail works at 1024–1279, and the drawer plus bottom tabs work below 1024.
- [ ] With `NEXT_PUBLIC_DEMO_ROLE=creator`, the workspace switcher shows Learning and Creator Studio, and every nav link resolves to a page (no 404s).
- [ ] With `NEXT_PUBLIC_DEMO_ROLE=admin`, the Admin workspace appears.
- [ ] `/design-system` shows every token and component state.
- [ ] All docs in section 8 exist.
- [ ] Repo is ready for: `git init` → GitHub push → Supabase project → Vercel deploy. Print the exact next steps at the end of your response.

When done, output: (1) a summary of what was built, (2) the file tree, (3) any deviations and why, and (4) the deploy checklist.
