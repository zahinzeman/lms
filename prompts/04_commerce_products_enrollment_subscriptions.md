# PROMPT 4 of 6: Commerce: Digital Products, Cart, Checkout, Enrollment, Subscriptions, Coupons & Creator Payouts

You are continuing a production LMS + creator marketplace (Udemy × Skool) built with Next.js App Router, TypeScript, Tailwind v4, and Supabase on Vercel. **Phases 1–3 are complete**: the flat design system and 15/85 AppShell, auth and multi-role, onboarding, creator applications, the course builder, moderation, Explore/search, and the course landing page.

## 0. Before you write any code
1. Read `docs/PROJECT_CONTEXT.md`, `docs/DESIGN_SYSTEM.md`, `docs/ROADMAP.md`, `src/types/database.ts`, and migrations `0001` and `0002`.
2. Find the Phase 3 placeholders for "Add to cart", "Enroll free", "Buy now", "Move to cart", and coupons. You will replace them.
3. **Money rules:** all amounts are **integer minor units** (paisa / cents) with an explicit `currency`. Never use floats. Never trust a client-sent price. **Every price is recomputed on the server from the DB at checkout.** Fulfillment happens **only** from verified provider webhooks/IPN, never from the success redirect.
4. Design rules: **flat, no shadows, no borders/strokes, shade-ladder separation, no card-in-card, a single Rausch accent, a 15% sidebar / 85% content shell.**

---

## 1. Goal of this phase
A full marketplace commerce layer:
- Creators sell **digital products** (ebooks, templates, presets, audio, software, bundles) as well as courses.
- Students use a **cart → checkout → pay → instant access** flow (courses enroll, products land in their Library).
- **Subscriptions / memberships**: (a) creator **all-access memberships** (every course of a creator, or a chosen set), (b) **community memberships** (the table is ready; Phase 5 attaches communities), (c) a **platform Pro plan for creators** (Free 15% / Pro 5% / Business 0% fee tiers from the homepage).
- **Coupons** (creator-level and platform-level), **refunds**, **creator earnings ledger** with a refund-hold window, and **payout requests**.
- **Two payment providers behind one adapter**: **Stripe** (international cards, subscriptions) and **SSLCommerz** (Bangladesh: bKash, Nagad, Rocket, local cards; one-time payments). The provider is chosen by currency/country (BDT → SSLCommerz by default, USD → Stripe), and the user can switch providers at checkout.

---

## 2. SQL migration: write `supabase/migrations/0003_commerce.sql`
Same conventions: idempotent, RLS everywhere, a security definer with `search_path=''`, timestamps, comments.

### 2.1 Enums
`product_type` (`ebook, template, preset, audio, video_pack, software, toolkit, bundle, other`), `item_type` (`course, product, plan`), `order_status` (`pending, awaiting_payment, paid, failed, canceled, refunded, partially_refunded`), `payment_provider` (`stripe, sslcommerz, free, manual`), `enrollment_source` (`purchase, free, subscription, coupon_full, admin_grant, bundle`), `access_status` (`active, revoked, expired`), `plan_scope` (`creator_all_access, creator_selected, community, platform_creator`), `billing_interval` (`month, year, one_time`), `subscription_status` (`trialing, active, past_due, canceled, expired, incomplete`), `discount_type` (`percent, fixed`), `earning_status` (`pending, available, paid_out, reversed`), `payout_status` (`requested, approved, processing, paid, rejected`), `refund_status` (`requested, approved, rejected, processed`)

### 2.2 Digital products
**`products`**: `id`, `creator_id`, `title`, `slug unique`, `subtitle`, `type product_type`, `description jsonb`, `description_text`, `category_id`, `cover_url`, `gallery text[]`, `price_minor`, `compare_at_price_minor`, `currency`, `pay_what_you_want bool default false`, `min_price_minor`, `status` (reuse `course_status`), `license_text`, `version text`, `file_count`, `sales_count`, `rating_avg`, `rating_count`, a `search` tsvector + GIN, `published_at`, timestamps
**`product_files`**: `id`, `product_id`, `name`, `file_path` (private bucket `product-files`), `size_bytes`, `mime`, `version`, `position`, `download_limit int null`
**`bundle_items`**: `bundle_product_id`, `item_type` (course|product), `item_id`, pk. A bundle's price is its own `price_minor`.

### 2.3 Plans and subscriptions
**`plans`**: `id`, `scope plan_scope`, `creator_id null` (null for platform plans), `community_id uuid null` (FK added in Phase 5), `name`, `slug`, `description`, `features text[]`, `price_minor`, `currency`, `interval billing_interval`, `trial_days int default 0`, `is_active`, `position`, `stripe_product_id`, `stripe_price_id`, timestamps
**`plan_courses`**: `plan_id`, `course_id`, pk (for `creator_selected` scope)
**`subscriptions`**: `id`, `user_id`, `plan_id`, `status`, `provider`, `provider_customer_id`, `provider_subscription_id unique`, `current_period_start`, `current_period_end`, `cancel_at_period_end bool`, `canceled_at`, `trial_end`, timestamps
- SSLCommerz has no native recurring billing, so BDT memberships run as **prepaid periods**: each payment extends `current_period_end` by the interval, and a renewal reminder plus a "Renew" checkout are sent before expiry (Phase 6 cron). Document this.

### 2.4 Orders, payments, access
**`orders`**: `id`, `order_number text unique` (e.g. `BBD-2026-000123` from a sequence), `user_id`, `status`, `currency`, `subtotal_minor`, `discount_minor`, `tax_minor default 0`, `total_minor`, `coupon_id null`, `provider payment_provider`, `provider_session_id`, `provider_payment_id`, `paid_at`, `billing_name`, `billing_email`, `billing_country`, `meta jsonb`, `ip inet`, timestamps
**`order_items`**: `id`, `order_id`, `item_type`, `item_id`, `title_snapshot`, `creator_id`, `unit_price_minor`, `discount_minor`, `final_price_minor`, `platform_fee_bps_snapshot`, `platform_fee_minor`, `creator_earning_minor`, `refunded_minor default 0`
**`payment_events`**: webhook/IPN log for idempotency. `id`, `provider`, `event_id unique`, `type`, `payload jsonb`, `processed_at`, `error text`, `created_at`
**`enrollments`**: `id`, `user_id`, `course_id`, `source enrollment_source`, `order_item_id null`, `subscription_id null`, `status access_status default 'active'`, `expires_at null`, `created_at`, **unique(user_id, course_id, source)**, plus an index on `(user_id, status)`
**`product_access`**: `id`, `user_id`, `product_id`, `order_item_id`, `status`, `created_at`, unique(user_id, product_id)
**`download_events`**: `id`, `user_id`, `product_file_id`, `created_at`, `ip` (to enforce `download_limit` and for abuse checks)
**`cart_items`**: `user_id`, `item_type`, `item_id`, `added_at`, pk(user_id, item_type, item_id). Logged-out carts live in a cookie/localStorage and **merge on login**.

### 2.5 Coupons
**`coupons`**: `id`, `code citext`, `creator_id null` (null = platform coupon, funded by the platform), `discount_type`, `value int` (bps for percent, minor units for fixed), `currency null`, `applies_to jsonb` (`{ "all": true }` or `{ "courses": [...], "products": [...], "plans": [...] }`), `min_subtotal_minor`, `max_redemptions`, `per_user_limit default 1`, `redemptions_count`, `starts_at`, `ends_at`, `is_active`, timestamps, **unique(code, coalesce(creator_id, zero-uuid))**
**`coupon_redemptions`**: `id`, `coupon_id`, `user_id`, `order_id`, `discount_minor`, `created_at`
**Funding rule:** a creator coupon reduces the creator's revenue. A platform coupon is absorbed by the platform (the creator earns on the pre-discount price). Implement this in the fee math.

### 2.6 Earnings, payouts, refunds
**`creator_earnings`** (ledger, append-mostly): `id`, `creator_id`, `order_item_id null`, `subscription_id null`, `type text check in ('sale','subscription','refund_reversal','adjustment','payout')`, `amount_minor` (negative for reversals/payouts), `currency`, `status earning_status`, `available_at timestamptz` (= paid_at + **14 days** refund hold), `payout_id null`, `note`, `created_at`
**`payout_accounts`**: `creator_id pk`, `method text check in ('bkash','nagad','bank','stripe_connect','payoneer')`, `details jsonb` (**encrypted at the application layer** with `PAYOUT_ENCRYPTION_KEY` using AES-GCM; store only the ciphertext and the last 4 digits for display), `verified bool`, timestamps
**`payouts`**: `id`, `creator_id`, `amount_minor`, `currency`, `status payout_status`, `method`, `reference`, `requested_at`, `processed_at`, `processed_by`, `note`
**`refund_requests`**: `id`, `order_item_id`, `user_id`, `reason text`, `details`, `status refund_status`, `reviewed_by`, `reviewed_at`, `provider_refund_id`, `amount_minor`
**Refund policy:** within **30 days** of purchase and **< 30% of the course consumed** (Phase 5 tracks progress, so for now check only the time window), one refund per course per user. Products are refundable only if no file has been downloaded.

### 2.7 Functions (security definer unless noted)
- `public.has_course_access(_user uuid, _course uuid) returns bool`: true if the user is an instructor, OR has an active enrollment that hasn't expired, OR has an active subscription whose plan covers the course (`creator_all_access` where the course's creator = the plan's creator, or a `plan_courses` match, and `current_period_end > now()`), OR is staff.
- **`create or replace public.can_view_lesson`** to include `has_course_access(auth.uid(), course_id)` and drip rules (enrollment `created_at + drip_days`, `unlock_at`).
- `public.has_product_access(_user, _product)`
- `public.compute_cart(_user uuid, _coupon_code text, _currency text) returns jsonb`: the **single source of truth** for pricing. It loads live prices, excludes owned items, applies the coupon (validity, scope, limits, min subtotal), computes per-item discount allocation (pro-rata for fixed coupons), the platform fee from each creator's `platform_fee_bps` (snapshot), the creator earning, and the totals. Called by the cart UI and by checkout.
- `public.create_order_from_cart(_user, _coupon_code, _currency, _provider) returns uuid`: calls compute_cart and inserts the order and items as `awaiting_payment`. If the total is 0 (free, or a 100% coupon), it marks the order paid and fulfills immediately with provider `free`.
- `public.fulfill_order(_order_id uuid)`: **idempotent** (no-op if already paid). It sets paid, creates enrollments, product_access, and bundle expansion, writes `creator_earnings` rows (`pending`, `available_at = now()+14d`), coupon redemptions, increments counters (`enrolled_count`, `sales_count`, `creator_profiles.students_count`), clears the purchased cart items, and writes the audit log. It is **called only by the service role** (webhook handlers): `revoke execute ... from anon, authenticated`.
- `public.activate_subscription(...)` / `public.update_subscription_from_provider(...)` / `public.extend_prepaid_subscription(...)`: service role only.
- `public.process_refund(_refund_request_id)`: staff. It revokes access, sets `refunded_minor`, inserts a negative `creator_earnings` (`refund_reversal`), and updates the order status. The provider refund call happens in the server action before this.
- `public.release_available_earnings()`: moves `pending` to `available` where `available_at <= now()` (Phase 6 cron calls it).
- `public.request_payout(_amount_minor)`: creator. Checks that the available balance is ≥ the amount and ≥ the minimum (৳1,000 / $10) and that a payout account exists, then inserts a payout (`requested`) and a negative ledger row linked to it.
- `public.creator_balance(_creator uuid)` returns `{pending, available, paid_out, lifetime}` per currency.
- **Platform plan change:** when a creator's `platform_creator` subscription becomes active or canceled, update `creator_profiles.platform_plan` and `platform_fee_bps` (free 1500, pro 500, business 0).

### 2.8 RLS
- `products` / `product_files` / `bundle_items`: same pattern as courses (public published, owner write, staff all). `product_files` select **only** for the owner or staff. Buyers download through a server action that checks `has_product_access` and returns a signed URL (60s).
- `plans`: public select active. Owner write (creator plans). Staff write (platform plans).
- `orders` / `order_items`: buyer select own. The creator selects `order_items` where `creator_id = auth.uid()` (through a view `creator_sales` that **hides the buyer email**, showing only name and handle). No client insert/update (only RPCs and the service role). Staff select.
- `payment_events`: no access except the service role.
- `enrollments` / `product_access` / `subscriptions`: owner select. The instructor selects enrollments for their courses (through a view `course_students`). Staff all.
- `cart_items`: owner all.
- `coupons`: the creator manages their own. Staff manages platform coupons. **No public select** (validation happens only through `compute_cart`).
- `creator_earnings`, `payouts`, `payout_accounts`: the creator selects their own (`payout_accounts.details` is **never** selectable; expose only `last4` and the method through a view). Staff all.
- `refund_requests`: the buyer inserts and selects their own. Staff all.

### 2.9 Seed: `supabase/seed/0003_seed.sql`
12 digital products (mixed types, with placeholder files), 3 platform creator plans (Free/Pro/Business, monthly and yearly), 2 demo creator all-access plans, and 3 demo coupons (`WELCOME20` platform 20%, `LAUNCH500` creator ৳500 fixed, `FREECOURSE` 100% on one course).

---

## 3. Payment adapter (`src/lib/payments/`)
```
payments/
  types.ts          PaymentProvider interface
  index.ts          getProvider(name) + chooseProvider(currency, country)
  stripe.ts
  sslcommerz.ts
  fees.ts           pure TS mirror of the fee math (for UI previews; the DB is authoritative)
```
Interface:
```ts
interface PaymentProvider {
  name: 'stripe' | 'sslcommerz';
  supportsSubscriptions: boolean;
  createCheckout(input: { order: OrderDTO; user: UserDTO; successUrl: string; cancelUrl: string; }): Promise<{ redirectUrl: string; sessionId: string }>;
  createSubscriptionCheckout?(input: { plan: PlanDTO; user: UserDTO; ... }): Promise<{ redirectUrl: string; sessionId: string }>;
  verifyWebhook(req: Request): Promise<NormalizedEvent>;   // throws on bad signature
  refund(input: { providerPaymentId: string; amountMinor: number; currency: string }): Promise<{ refundId: string }>;
  cancelSubscription?(providerSubscriptionId: string, atPeriodEnd: boolean): Promise<void>;
  createBillingPortal?(customerId: string, returnUrl: string): Promise<string>;
}
```
**Stripe:** Checkout Sessions (`mode: payment` for orders, `mode: subscription` for plans), `metadata.order_id`, a customer per user (store `stripe_customer_id` on profiles; add the column in this migration), the Billing Portal for managing subscriptions, and Prices created lazily for plans (`stripe_price_id` cached).
Webhook `src/app/api/webhooks/stripe/route.ts`: raw body plus signature verification. Handle `checkout.session.completed`, `checkout.session.async_payment_succeeded/failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `charge.refunded`. Use `payment_events` for idempotency. Call the RPCs with the **service-role client**.
**SSLCommerz:** a session init (`/gwprocess/v4/api.php`; sandbox vs live through `SSLCOMMERZ_IS_LIVE`), `tran_id = order_number`, and `value_a = order_id`. Routes:
- `POST /api/payments/sslcommerz/ipn`: **validate through the Validation API** (`/validator/api/validationserverAPI.php`) using `val_id`, then verify that the amount, currency, and `tran_id` match the order. Only then fulfill. Idempotent.
- `POST /api/payments/sslcommerz/success|fail|cancel`: SSLCommerz POSTs to these. Redirect (303) to `/checkout/success?order=…`, `/checkout/failed`, or `/cart`. **Do not fulfill here.** The success page polls the order status.
- Refunds through the SSLCommerz refund API. If the API isn't available on the merchant account, staff can mark the refund as processed manually (`provider = manual`).

---

## 4. Screens (flat, real copy, responsive)

### 4.1 Digital products (public + student)
- `/products/[slug]` (discover layout): a gallery (main image 4:5 with thumbnails), type badge, title, creator, rating, a "What's inside" file list (names and sizes, no download), description, license, a sticky purchase rail (price or a pay-what-you-want input with the minimum, "Add to cart", "Buy now", wishlist), "More from {creator}", and JSON-LD `Product`.
- Explore → **Digital Products** tab is now live, with filters for type, price, rating, and category.
- Storefront `/creators/[handle]` → the **Products** tab is live, plus a **Memberships** section showing the creator's plans as plan tiles.
- `/library` (AppShell): a grid of owned products. Each opens a detail page `/library/[productId]` with a file list and **Download** buttons (signed URL, logged to `download_events`, enforcing `download_limit`), the version, the license, and "Leave a review" (Phase 5).

### 4.2 Creator Studio: products `/studio/products`
A list with status tabs, and an editor with steps: Details (title, type, Tiptap description, category, cover plus gallery uploads) → Files (multi-upload to `product-files` with progress, reorder, versioning: uploading a new version keeps the old one archived) → Pricing (fixed / pay-what-you-want, compare-at, earnings preview) → Bundle (only for type=bundle: pick courses and products) → Publish checklist → **Publish**. Products are **auto-published for verified creators**, while others go through the admin review queue reused from courses. Add `/admin/products` with the same moderation actions.

### 4.3 Cart `/cart` (AppShell; logged-out users get a guest cart page in the discover layout)
- Items list: each item is one row on canvas with the thumbnail, title, creator, type badge, price, "Remove", and "Move to wishlist". **No nested boxes.**
- Right column summary on `surface-1` (a single flat tile): subtotal, a coupon input (applies through `compute_cart`, shows the discount line or an error inline), total, a currency switcher (BDT/USD, which converts using the creator-set price in each currency when available, or **disallows mixing**: if an item has no price in the chosen currency, explain it and suggest switching), and a "Checkout" primary button.
- A topbar cart icon with a count badge. The add-to-cart action shows a toast with "View cart". Items the user already owns are blocked with "You already own this — Go to course".

### 4.4 Checkout `/checkout`
- Requires login (redirect with `next`).
- Step 1, **Billing**: name, email (prefilled), and country (which drives the default provider).
- Step 2, **Payment method**: large flat selectable tiles. "bKash · Nagad · Rocket · Local cards (SSLCommerz)" for BDT and "International card (Stripe)" for USD, with their logos.
- An order summary rail (same as the cart).
- "Pay ৳X" calls `create_order_from_cart`, then `provider.createCheckout`, then redirects.
- `/checkout/success?order=`: polls the order status every 2s (max 30s) with a friendly "Confirming your payment…" state, then shows a celebration with "Start learning" (deep link into the first course) or "Go to your library", plus a receipt link.
- `/checkout/failed`: the reason if known, "Try again", and "Choose another method".
- **Free enroll** button on free courses: one-click server action that creates a free enrollment (no order needed, `source='free'`), then a toast and a redirect to the course player stub.

### 4.5 Orders & billing (student)
- `/orders`: a list (order number, date, items, total, status badge, provider). The detail page has the line items, a **receipt/invoice** (printable route `/orders/[id]/receipt` styled for print, with a "Download PDF" through `window.print()` styles; flat, no borders), and **Request refund** per eligible item (a Dialog with a reason select and details).
- `/subscriptions`: active and past subscriptions as plan rows (plan, creator, status, renews/expires date). Actions: Cancel at period end, Resume, "Manage billing" (Stripe portal), "Renew now" (SSLCommerz prepaid).
- `/settings/billing`: saved Stripe customer portal link, billing details, and receipts.

### 4.6 Memberships: creator plans `/studio/plans`
CRUD for creator plans: name, description, features list, price, interval (month/year), trial days, scope (all my courses / selected courses with a course picker), and active toggle. A preview of the plan tile as students will see it. Show subscriber counts and MRR per plan.
The subscribe flow from the storefront or course page ("Included in {Plan}") goes to `/checkout/plan/[planId]`, then to the provider's subscription checkout (Stripe) or the prepaid period (SSLCommerz).

### 4.7 Platform plan for creators `/studio/settings/plan`
The current plan tile, a Free/Pro/Business comparison (reuse the homepage plan tiles), and upgrade/downgrade through Stripe or SSLCommerz prepaid. Show the fee change effect: "Your fee drops from 15% to 5% on future sales."

### 4.8 Coupons `/studio/coupons` (creator) and `/admin/coupons` (platform)
A list showing code, type and value, scope, uses/limit, validity, and status. The create/edit Sheet has: code (with an auto-generate button), percent or fixed, value, scope picker (all, or specific courses/products/plans), min subtotal, max redemptions, per-user limit, start/end dates, and active. Also a **shareable link** `/courses/[slug]?coupon=CODE`, which auto-applies on add-to-cart.

### 4.9 Sales & payouts (creator)
- `/studio/sales`: KPI StatTiles (flat, on surface-2) for gross sales, net earnings, orders, and refunds over a date range (7d/30d/90d/12m/custom). A table of sales from the `creator_sales` view (date, item, buyer name, price, coupon, fee, earning, status) with CSV export.
- `/studio/payouts`: balance tiles (Pending · Available · Paid out · Lifetime) per currency, "Request payout" (Dialog: amount, min ৳1,000, method), payout history, and **Payout account** setup (bKash/Nagad number, bank details, Payoneer email, or Stripe Connect Express onboarding link as an optional extra), with details encrypted server-side.
- `/studio/students`: enrolled students across courses (name, course, enrolled date, source, progress placeholder) with filters and CSV export.

### 4.10 Admin money screens
- `/admin/orders`: search by order number or email. Filter by status and provider. The order detail has the items, the payment events timeline, a manual "Mark paid" (requires a note; calls fulfill), and grant/revoke access.
- **Refunds** tab: the refund request queue. Approve (calls the provider refund, then `process_refund`) or Reject (with a note). Shows the eligibility check results (days since purchase, consumption %, downloads).
- `/admin/payouts`: the requested payouts queue with creator details (decrypted only on this screen for staff, audit-logged on view). Actions: Approve → Processing → Mark paid (reference required) / Reject (which returns the funds by deleting or reversing the negative ledger row).
- `/admin/plans`: manage platform creator plans and fee tiers.

### 4.11 Wire-up across the app
- The course page CTA now reflects the real state: owned → "Go to course"; in cart → "Go to cart"; covered by the user's subscription → "Start learning (included in {plan})"; otherwise Add to cart / Buy now / Enroll free.
- `CourseCard` and `ProductCard` show an "Owned" badge when applicable (a batched lookup, not N+1).
- The student dashboard "Continue learning" now uses real enrollments (progress comes in Phase 5).
- Logged-out cart merges into the DB cart on login.

---

## 5. Security and correctness checklist
- [ ] Prices are never accepted from the client. `compute_cart` is the only pricing path.
- [ ] Webhooks: signature/validation verified, raw body used for Stripe, idempotent through `payment_events.event_id`, a 2xx returned quickly, and errors logged to `payment_events.error`.
- [ ] Amount, currency, and `tran_id` are cross-checked for SSLCommerz before fulfillment.
- [ ] `fulfill_order` and the subscription functions are executable only by the service role.
- [ ] A double webhook delivery creates **no** duplicate enrollments or earnings (test it by replaying the same event).
- [ ] Signed download URLs are short-lived, and `download_limit` is enforced.
- [ ] Payout details are encrypted at rest, and views are audit-logged.
- [ ] Race condition: two concurrent payout requests cannot overdraw the balance (use `select … for update` on the creator row, or an advisory lock).

## 6. Definition of Done
- [ ] `0003_commerce.sql` runs twice cleanly. The seed works.
- [ ] Stripe test mode works end to end: a course purchase gives instant access, and a subscription gives access to all of a creator's courses. Canceling at period end keeps access until the period ends.
- [ ] SSLCommerz sandbox works end to end with a BDT order (bKash test flow), including the IPN.
- [ ] Coupons (percent, fixed, 100%) work. A 100% coupon checks out without a provider.
- [ ] A refund revokes access and reverses the earning. A payout request cannot exceed the available balance. Earnings move from pending to available after 14 days (simulate by updating `available_at`).
- [ ] Creator Sales, Payouts, and Students screens show correct numbers that match the DB.
- [ ] Flat design rules hold on every screen. Build, lint, and typecheck pass. Docs are updated.

At the end, output: (1) the SQL files to run, in order, (2) **all new env vars** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_IS_LIVE`, `PAYOUT_ENCRYPTION_KEY`) with where to get each, (3) the webhook URLs to register in Stripe and SSLCommerz, (4) Stripe CLI commands for local webhook testing, and (5) a manual test script with test card numbers.
