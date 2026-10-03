# Bootcamp BD — Modern LMS & Creator Marketplace

> **"Learn skills that pay. Teach what you know."**
> A modern learning platform combining **Udemy** (catalog, video player, digital toolkits) with **Skool** (creator-led communities, 9-level gamification, live office hours).

---

## 🎨 Design System
- **Airbnb-Style Flat UI**: Zero decorative borders, zero box-shadows.
- **Tonal Ladder**: `canvas` (`#FFFFFF`), `surface-1` (`#F7F7F7`), `surface-2` (`#EBEBEB`), `surface-3` (`#DDDDDD`).
- **Accent**: Rausch `#FF385C`.
- **App Shell**: Clamped 15% sidebar (`clamp(232px, 15%, 300px)`) / 85% content.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` or use your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://isgctjbqksgghxpkddbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_EcYnRqW7JQ0iSZtCZoeNHQ_z24R9aUH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Setup (Supabase)

To initialize all tables, RLS security policies, functions, and seed data:
1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/isgctjbqksgghxpkddbq](https://supabase.com/dashboard/project/isgctjbqksgghxpkddbq)
2. Go to **SQL Editor** in the left sidebar.
3. Open or copy the contents of [`supabase/FULL_SCHEMA_AND_SEED.sql`](./supabase/FULL_SCHEMA_AND_SEED.sql).
4. Click **Run**. All tables (`profiles`, `courses`, `products`, `communities`, `orders`, `enrollments`, etc.) and mock records will be instantly created!

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/zahinzeman/lms.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import the `zahinzeman/lms` repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://isgctjbqksgghxpkddbq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_EcYnRqW7JQ0iSZtCZoeNHQ_z24R9aUH`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `NEXT_PUBLIC_SITE_URL`: `https://your-deployment-domain.vercel.app`
5. Click **Deploy**!
