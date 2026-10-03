# LMS Marketplace: Build Prompts (Run Order)

Six prompts that build a Udemy × Skool style LMS and creator marketplace on
**Next.js (App Router) + Supabase + Vercel**, using a **flat** version of the Airbnb design system.

| # | File | What it builds | SQL to run after? |
|---|------|----------------|-------------------|
| 1 | `01_foundation_design_system_shell_homepage.md` | Scaffold, design tokens, UI kit, 15/85 sidebar shell, full public homepage, auth screens (UI), every route stubbed, mock data | No (runs without a DB) |
| — | **Deploy checkpoint** (below) | GitHub push → Supabase project → Vercel deploy | — |
| 2 | `02_auth_roles_profiles_onboarding.md` | Supabase Auth, roles (student/creator/admin/moderator), profiles, onboarding, creator application, route guards, role-aware sidebar | `0001_core_auth.sql` |
| 3 | `03_courses_catalog_course_builder.md` | Course builder (sections, lessons, quizzes, resources), explore/search, Udemy-style course page, wishlist, storefronts | `0002_courses.sql` |
| 4 | `04_commerce_products_enrollment_subscriptions.md` | Digital products, cart, checkout (Stripe + SSLCommerz), orders, enrollment, subscriptions, coupons, creator earnings, payouts | `0003_commerce.sql` |
| 5 | `05_learning_player_community_gamification.md` | Course player, progress, quizzes, certificates, Q&A, reviews, Skool-style communities, points/levels, leaderboard, events, notifications | `0004_learning_community.sql` |
| 6 | `06_admin_analytics_email_seo_launch.md` | Admin console, creator/student analytics, emails, global search, SEO, cron jobs, security audit, tests, launch checklist | `0005_admin_analytics.sql` |

## How to use each prompt
1. Open a **fresh agent session** in the project folder. Each prompt restates the context it needs, and the agent also reads `docs/PROJECT_CONTEXT.md`, which Prompt 1 creates.
2. Paste the **entire** prompt file.
3. When the agent finishes, check its "Definition of Done" list yourself.
4. For prompts 2–6: open **Supabase → SQL Editor**, paste the new `supabase/migrations/000X_*.sql` file, and run it. Then run the matching `supabase/seed/000X_*.sql` if one exists.
5. Regenerate types (Prompt 2 sets this up): `npm run db:types`
6. Commit and push. Vercel redeploys automatically.

---

## Deploy checkpoint (after Prompt 1)

### A. GitHub
```bash
git init
git add .
git commit -m "feat: foundation, design system, app shell, homepage"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### B. Supabase
1. Create a project at supabase.com. Pick the region closest to your users (Singapore `ap-southeast-1` for Bangladesh/South Asia).
2. **Project Settings → API**: copy the `Project URL`, the `anon` public key, and the `service_role` key (keep this one secret).
3. **Authentication → URL Configuration**:
   - Site URL: `https://<your-vercel-domain>`
   - Redirect URLs: `http://localhost:3000/**` and `https://<your-vercel-domain>/**`
4. (Before Prompt 2) **Authentication → Providers**: enable Email, and enable Google if you want it (needs a Google Cloud OAuth client).

### C. Local env
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### D. Vercel
1. vercel.com → **Add New Project** → import the GitHub repo. The framework is auto-detected as Next.js.
2. Add the same env vars. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
3. Deploy. Every later push to `main` redeploys.
4. Optional: in Vercel, open **Integrations → Supabase** to sync env vars automatically.

### Env vars added by later prompts
| Prompt | Vars |
|---|---|
| 4 | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_IS_LIVE` |
| 6 | `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET` |

Use **test mode** keys until launch.
