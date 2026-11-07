# Product Requirements Document (PRD): Remorph Web Platform (MVP)

## 1. Project Overview
**Product Name:** Remorph  
**Core Concept:** A "Proof-of-Work Hub" for hardware and software builders (Product Hunt meets GitHub activity feed).  
**Primary Goal:** Prevent builder progress, prototypes, and ship-logs from getting lost in Discord chat history by providing a public, persistent feed, builder profiles, and community building challenges.

---

## 2. Tech Stack & Environment
* **Framework:** Next.js 14/15 (App Router, Server Actions, React Server Components)
* **Language:** TypeScript (Strict mode)
* **Styling & UI:** Tailwind CSS + shadcn/ui + Lucide Icons (Dark-mode-first, sleek, developer/industrial aesthetic)
* **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage for prototype images/videos)
* **Auth Provider:** Discord OAuth + GitHub OAuth (via Supabase Auth)

---

## 3. MVP Feature Scope (Phase 1)
*Note: Feature #1 (Full Project & Collaborator Directory) is deferred to Phase 2 on the UI level, but the database schema must include a lightweight `projects` tag/reference so ship-logs can be grouped cleanly without future migrations.*

### Feature A: Live Ship-Log Feed (Home Page `/`)
* **Public Activity Stream:** A chronological and "Top Upvoted" feed where builders post daily/weekly build updates, hardware/software prototype photos, demo links, and GitHub commits.
* **Quick-Ship Composer:** Authenticated users can post a ship-log directly from the top of the feed:
  * Markdown content (max 500 chars for punchy updates).
  * Media upload (1–3 images/GIFs via Supabase Storage) or external video/Loom embed URL.
  * Optional links: GitHub Repo URL, Live Demo URL.
  * Optional tags: Project Tag (e.g., `#vision-model`, `#hardware-mod`) and Challenge Tag (if submitting to an active challenge).
* **Micro-Interactions:** Upvote ("Fire/Ship" reaction) button with optimistic UI updates.

### Feature B: Builder Profiles (`/u/[username]`)
* **Proof-of-Work Header:** Avatar, username, bio, GitHub/Discord handles, and Tech Stack badges (e.g., `Next.js`, `PyTorch`, `Arduino`, `Rust`).
* **Shipping Metrics:**
  * Total Ship-Logs posted.
  * Current Shipping Streak (consecutive weeks/days with a post).
  * Challenges participated in / won.
* **User Timeline:** Filtered feed showing all ship-logs and media posted by that specific builder.

### Feature C: Challenges & Bounty Board (`/challenges`)
* **Active Challenge Banner:** Highlighted card at the top showing the current community challenge, rules, prize/recognition, and live countdown timer.
* **Challenge Detail View (`/challenges/[slug]`):**
  * Problem statement, guidelines, and deadline.
  * "Submit Ship-Log to Challenge" CTA (pre-fills the challenge tag in the composer).
  * Submissions Feed: All ship-logs tagged with this challenge, sortable by "Most Upvoted" and "Newest".
* **Past Challenges Archive:** List of completed challenges and their winning builders.

---

## 4. Supabase Database Schema (SQL Blueprint)

```sql
-- 1. PROFILES TABLE (Synced with Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  tech_stack text[] default '{}',
  github_url text,
  discord_handle text,
  ship_count int default 0,
  streak_count int default 0,
  last_shipped_at timestamptz,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 2. CHALLENGES TABLE
create table public.challenges (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  rules text,
  status text check (status in ('upcoming', 'active', 'completed')) default 'active',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  winner_profile_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 3. LIGHTWEIGHT PROJECTS TABLE (Future-proofing for Phase 2 Directory)
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  tagline text,
  repo_url text,
  demo_url text,
  looking_for_collaborators boolean default false,
  created_at timestamptz default now()
);

-- 4. SHIP LOGS TABLE (Core Feed Engine)
create table public.ship_logs (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  challenge_id uuid references public.challenges(id) on delete set null,
  content text not null,
  media_urls text[] default '{}',
  github_url text,
  demo_url text,
  tags text[] default '{}',
  upvotes_count int default 0,
  created_at timestamptz default now()
);

-- 5. UPVOTES TABLE
create table public.ship_upvotes (
  id uuid default gen_random_uuid() primary key,
  ship_log_id uuid references public.ship_logs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(ship_log_id, user_id)
);
```

---

## 5. App Router Structure & Pages
```text
src/
├── app/
│   ├── layout.tsx              # Dark industrial theme, top navbar, auth state
│   ├── page.tsx                # Home: Active Challenge banner + Quick Composer + Live Ship-Log Feed
│   ├── challenges/
│   │   ├── page.tsx            # List of active & past challenges
│   │   └── [slug]/page.tsx     # Specific challenge brief + filtered submissions feed
│   ├── u/
│   │   └── [username]/page.tsx # Builder Proof-of-Work profile & streak stats
│   ├── settings/
│   │   └── page.tsx            # Edit profile, tech stack tags, social links
│   └── auth/
│       └── callback/route.ts   # Supabase OAuth callback handler
├── components/
│   ├── feed/
│   │   ├── ShipComposer.tsx    # Form to post update + upload media
│   │   ├── ShipCard.tsx        # Individual ship-log item with upvote button
│   │   └── FeedFilter.tsx      # Toggle between "Latest" and "Top Shipped"
│   ├── challenges/
│   │   └── ChallengeCard.tsx   # Challenge summary component
│   └── profile/
│       └── BuilderStats.tsx    # Streak counter, tech stack pills, ship count
└── lib/
    ├── supabase/               # Client & Server Supabase helpers
    └── actions/                # Server Actions for createShipLog, toggleUpvote, updateProfile
```

---

## 6. UI/UX & Aesthetic Guidelines
* **Theme:** High-contrast Dark Mode (`#09090b` background, `#18181b` cards, `#27272a` borders, electric emerald `#10b981` or cyber orange `#f97316` accents for "Shipped" badges).
* **Typography:** Clean monospace accents (`JetBrains Mono` or `Geist Mono`) for timestamps, streak counters, tags, and ship metrics; `Inter` or `Geist Sans` for body text.
* **Zero Bloat:** No unnecessary landing page fluff—visiting `/` drops the user straight into the live builder feed (like X or Product Hunt).

---

## 7. Implementation Execution Order (For AI Agent)
1. **Step 1:** Initialize Next.js project with Tailwind + `shadcn/ui` and configure Supabase client/server utilities.
2. **Step 2:** Set up the database tables/RLS policies (or mock seed data fallback if `.env` keys are pending so UI works out of the box).
3. **Step 3:** Build the Layout, Navbar, and Home Feed (`/`) with `ShipComposer` and `ShipCard` components.
4. **Step 4:** Build the `/challenges` and `/challenges/[slug]` pages.
5. **Step 5:** Build the `/u/[username]` Builder Profile page with streak and tech-stack badges.