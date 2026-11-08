-- ==============================================================================
-- AEVORA // FORGE — PRODUCTION SUPABASE DATABASE SCHEMA
-- Proof-of-Work Community Engine for Hardware & AI Builders
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Clean/Drop Existing Tables (Optional - only if starting fresh)
-- drop table if exists public.saved_blueprints cascade;
-- drop table if exists public.collab_requests cascade;
-- drop table if exists public.blueprints cascade;
-- drop table if exists public.ship_upvotes cascade;
-- drop table if exists public.ship_logs cascade;
-- drop table if exists public.projects cascade;
-- drop table if exists public.challenges cascade;
-- drop table if exists public.profiles cascade;

-- ==============================================================================
-- TABLE: PROFILES (Extends Supabase auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  role text default 'Hardware Hacker',
  bio text,
  tech_stack text[] default '{}'::text[],
  github_url text,
  discord_handle text,
  ship_count integer default 0,
  streak_count integer default 0,
  last_shipped_at timestamp with time zone,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to automatically create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_user text;
  display_name text;
  avatar text;
  user_role text;
begin
  raw_user := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username',
    split_part(coalesce(new.email, 'builder'), '@', 1)
  );
  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    raw_user
  );
  avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || raw_user
  );
  user_role := coalesce(
    new.raw_user_meta_data->>'role',
    'Hardware Hacker'
  );

  insert into public.profiles (id, username, full_name, avatar_url, role)
  values (
    new.id,
    lower(regexp_replace(raw_user, '[^a-zA-Z0-9_]', '_', 'g')) || '_' || substr(new.id::text, 1, 4),
    display_name,
    avatar,
    user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- TABLE: CHALLENGES (Sprints & Bounties)
-- ==============================================================================
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  tagline text,
  description text not null,
  prize_pool text default '$500 Grant',
  rules text,
  status text not null default 'active', -- 'upcoming', 'active', 'completed'
  starts_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ends_at timestamp with time zone not null,
  winner_profile_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.challenges enable row level security;

create policy "Challenges are viewable by everyone"
  on public.challenges for select
  using (true);

create policy "Admins can manage challenges"
  on public.challenges for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- ==============================================================================
-- TABLE: PROJECTS (Project Showcase & Open Collaborator Positions)
-- ==============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  tagline text not null,
  description text,
  status text default 'Prototype', -- 'Prototype', 'Beta', 'Shipped'
  tech_stack text[] default '{}'::text[],
  repo_url text,
  demo_url text,
  looking_for_collaborators boolean default false,
  open_roles jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;

create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Users can create projects"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = owner_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- ==============================================================================
-- TABLE: SHIP_LOGS (Proof-of-work Feed & Discussions)
-- ==============================================================================
create table if not exists public.ship_logs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  challenge_id uuid references public.challenges(id) on delete set null,
  type text default 'ship', -- 'ship' or 'discussion'
  content text not null,
  snippet_title text,
  snippet_body text,
  media_urls text[] default '{}'::text[],
  github_url text,
  demo_url text,
  tags text[] default '{}'::text[],
  upvotes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ship_logs enable row level security;

create policy "Ship logs are viewable by everyone"
  on public.ship_logs for select
  using (true);

create policy "Authenticated users can create ship logs"
  on public.ship_logs for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own ship logs"
  on public.ship_logs for update
  using (auth.uid() = author_id);

create policy "Authors can delete own ship logs"
  on public.ship_logs for delete
  using (auth.uid() = author_id);

-- Trigger to increment profile ship count and streak count
create or replace function public.handle_ship_log_created()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.profiles
  set
    ship_count = ship_count + 1,
    streak_count = case
      when last_shipped_at is null then 1
      when last_shipped_at > now() - interval '36 hours' then streak_count + 1
      else 1
    end,
    last_shipped_at = now()
  where id = new.author_id;
  return new;
end;
$$;

drop trigger if exists on_ship_log_created on public.ship_logs;
create trigger on_ship_log_created
  after insert on public.ship_logs
  for each row execute function public.handle_ship_log_created();

-- ==============================================================================
-- TABLE: SHIP_UPVOTES (Upvotes tracking)
-- ==============================================================================
create table if not exists public.ship_upvotes (
  id uuid primary key default gen_random_uuid(),
  ship_log_id uuid references public.ship_logs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (ship_log_id, user_id)
);

alter table public.ship_upvotes enable row level security;

create policy "Upvotes are viewable by everyone"
  on public.ship_upvotes for select
  using (true);

create policy "Authenticated users can upvote"
  on public.ship_upvotes for insert
  with check (auth.uid() = user_id);

create policy "Authenticated users can remove their upvote"
  on public.ship_upvotes for delete
  using (auth.uid() = user_id);

-- Trigger to automatically update ship_logs.upvotes_count
create or replace function public.handle_upvote_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if (tg_op = 'INSERT') then
    update public.ship_logs
    set upvotes_count = upvotes_count + 1
    where id = new.ship_log_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.ship_logs
    set upvotes_count = greatest(0, upvotes_count - 1)
    where id = old.ship_log_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_upvote_change on public.ship_upvotes;
create trigger on_upvote_change
  after insert or delete on public.ship_upvotes
  for each row execute function public.handle_upvote_change();

-- ==============================================================================
-- TABLE: COLLAB_REQUESTS (Requests to join projects)
-- ==============================================================================
create table if not exists public.collab_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  role_applied text not null,
  pitch text not null,
  portfolio_url text,
  status text not null default 'Pending', -- 'Pending', 'Accepted', 'Declined'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.collab_requests enable row level security;

create policy "Collab requests viewable by project owner and applicant"
  on public.collab_requests for select
  using (
    auth.uid() = applicant_id or
    exists (
      select 1 from public.projects
      where projects.id = collab_requests.project_id
        and projects.owner_id = auth.uid()
    )
  );

create policy "Authenticated users can create collab requests"
  on public.collab_requests for insert
  with check (auth.uid() = applicant_id);

create policy "Project owners and applicants can update collab requests"
  on public.collab_requests for update
  using (
    auth.uid() = applicant_id or
    exists (
      select 1 from public.projects
      where projects.id = collab_requests.project_id
        and projects.owner_id = auth.uid()
    )
  );

-- ==============================================================================
-- TABLE: BLUEPRINTS (Starter Templates & Verified Schematics)
-- ==============================================================================
create table if not exists public.blueprints (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  tech_stack text[] default '{}'::text[],
  author text not null,
  stars integer default 0,
  license text default 'MIT',
  download_url text not null,
  repo_url text,
  preview_snippet text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.blueprints enable row level security;

create policy "Blueprints are viewable by everyone"
  on public.blueprints for select
  using (true);

create policy "Authenticated users can insert blueprints"
  on public.blueprints for insert
  with check (auth.role() = 'authenticated');

-- ==============================================================================
-- TABLE: SAVED_BLUEPRINTS (AI Generated Specs Saved by Builders)
-- ==============================================================================
create table if not exists public.saved_blueprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  domain text not null,
  difficulty text not null,
  problem_statement text not null,
  bom jsonb default '[]'::jsonb,
  tech_stack text[] default '{}'::text[],
  architecture_steps text[] default '{}'::text[],
  roadmap_days jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.saved_blueprints enable row level security;

create policy "Users can manage their saved blueprints"
  on public.saved_blueprints for all
  using (auth.uid() = user_id);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_streak on public.profiles(streak_count desc);
create index if not exists idx_ship_logs_author on public.ship_logs(author_id);
create index if not exists idx_ship_logs_created on public.ship_logs(created_at desc);
create index if not exists idx_projects_owner on public.projects(owner_id);
create index if not exists idx_collab_requests_project on public.collab_requests(project_id);
create index if not exists idx_collab_requests_applicant on public.collab_requests(applicant_id);
create index if not exists idx_saved_blueprints_user on public.saved_blueprints(user_id);
create index if not exists idx_ship_upvotes_log_user on public.ship_upvotes(ship_log_id, user_id);
