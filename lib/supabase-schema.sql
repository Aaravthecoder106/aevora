-- Remorph Forge Community Database Schema (PostgreSQL / Supabase)
-- Covers: users, projects, collab_roles, ship_logs, forum_threads,
-- thread_comments, challenges, blueprints, monthly_leaderboard, saved_blueprints

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role_title TEXT DEFAULT 'Hardware Hacker',
  bio TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT,
  discord_handle TEXT,
  ship_count INT DEFAULT 0,
  streak_count INT DEFAULT 0,
  xp_points INT DEFAULT 0,
  last_shipped_at TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('Prototype', 'Beta', 'Shipped')) DEFAULT 'Prototype',
  tech_stack TEXT[] DEFAULT '{}',
  repo_url TEXT,
  demo_url TEXT,
  looking_for_collab BOOLEAN DEFAULT false,
  stars_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. COLLABORATION ROLES TABLE
CREATE TABLE IF NOT EXISTS public.collab_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  role_title TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  slots_available INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. COLLABORATION APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.collab_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_applied TEXT NOT NULL,
  pitch TEXT NOT NULL,
  portfolio_url TEXT,
  status TEXT CHECK (status IN ('Pending', 'Accepted', 'Declined')) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SHIP LOGS TABLE
CREATE TABLE IF NOT EXISTS public.ship_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  challenge_id UUID,
  content TEXT NOT NULL,
  snippet_type TEXT,
  snippet_title TEXT,
  snippet_body TEXT,
  media_urls TEXT[] DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  upvotes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FORUM THREADS TABLE
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT CHECK (category IN ('hardware-help', 'architecture', 'general', 'showcase')) DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  upvotes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. THREAD COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.thread_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  ship_log_id UUID REFERENCES public.ship_logs(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  upvotes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CHALLENGES & SPRINTS TABLE
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  prize_pool TEXT,
  rules TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  submissions_count INT DEFAULT 0,
  winner_profile_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. CHALLENGE SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ship_log_id UUID REFERENCES public.ship_logs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. BLUEPRINT LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.blueprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('Firmware', 'CAD/Chassis', 'Edge AI', 'Next.js/Full-Stack', 'PCB Schematic')) NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  stars_count INT DEFAULT 0,
  license TEXT DEFAULT 'MIT',
  download_url TEXT NOT NULL,
  repo_url TEXT,
  preview_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. SAVED BLUEPRINTS & SPECS TABLE
CREATE TABLE IF NOT EXISTS public.saved_blueprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE CASCADE,
  spec_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. MONTHLY LEADERBOARD TABLE
CREATE TABLE IF NOT EXISTS public.monthly_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year TEXT NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rank_position INT NOT NULL,
  monthly_xp INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  projects_shipped INT DEFAULT 0,
  upvotes_received INT DEFAULT 0,
  UNIQUE(month_year, profile_id)
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ship_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read collab_roles" ON public.collab_roles FOR SELECT USING (true);
CREATE POLICY "Public read ship_logs" ON public.ship_logs FOR SELECT USING (true);
CREATE POLICY "Public read forum_threads" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Public read thread_comments" ON public.thread_comments FOR SELECT USING (true);
CREATE POLICY "Public read challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Public read blueprints" ON public.blueprints FOR SELECT USING (true);
CREATE POLICY "Public read monthly_leaderboard" ON public.monthly_leaderboard FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Auth insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "Auth update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Auth create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Auth update own projects" ON public.projects FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = owner_id) WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Auth post ship logs" ON public.ship_logs FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = author_id);
CREATE POLICY "Auth post threads" ON public.forum_threads FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = author_id);
CREATE POLICY "Auth post comments" ON public.thread_comments FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = author_id);
