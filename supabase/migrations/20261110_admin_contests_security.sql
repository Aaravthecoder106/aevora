-- ==============================================================================
-- AEVORA // FORGE — HARDENED ADMIN RBAC, CONTESTS & MEMBER APPLICATIONS
-- Zero-trust security migration:
--   1. Isolated private schema for admin identity registry (non-exposed via REST)
--   2. Locks public.profiles privileged columns (closes is_admin self-escalation)
--   3. Resolves Security Advisor search_path & SECURITY DEFINER exposure warnings
--   4. Enhances public.challenges for draft/published contests, deadlines, slots
--   5. Adds public.contest_applications & private-notes contest_application_reviews
--   6. Adds immutable public.admin_audit_logs populated exclusively by triggers
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ISOLATED PRIVATE SCHEMA & ADMIN REGISTRY
-- ------------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to postgres, service_role, authenticated;

create table if not exists private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  granted_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

revoke all on table private.admin_users from public, anon, authenticated;
grant select, insert, update, delete on table private.admin_users to postgres, service_role;

-- ------------------------------------------------------------------------------
-- 2. ADMIN AUDIT LOG (Read-only for verified admins, trigger-written only)
-- ------------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.admin_audit_logs enable row level security;
revoke all on table public.admin_audit_logs from public, anon;
revoke insert, update, delete, truncate on table public.admin_audit_logs from authenticated;
grant select on table public.admin_audit_logs to authenticated;
grant all on table public.admin_audit_logs to postgres, service_role;

create index if not exists idx_admin_audit_logs_created_at
  on public.admin_audit_logs(created_at desc);

-- ------------------------------------------------------------------------------
-- 3. PRIVATE ADMIN & MFA VERIFICATION FUNCTIONS
-- ------------------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid;
  jwt_role text;
begin
  uid := auth.uid();
  if uid is null then
    return false;
  end if;

  jwt_role := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
  if jwt_role <> 'admin' then
    return false;
  end if;

  return exists (
    select 1
    from private.admin_users au
    where au.user_id = uid
  );
end;
$$;

create or replace function private.is_admin_mfa_satisfied()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (
      select 1
      from auth.mfa_factors mf
      where mf.user_id = (select auth.uid())
        and mf.status = 'verified'
    )
    then coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
    else true
  end;
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, postgres, service_role;

revoke all on function private.is_admin_mfa_satisfied() from public, anon;
grant execute on function private.is_admin_mfa_satisfied() to authenticated, postgres, service_role;

drop policy if exists "Admins can read audit logs" on public.admin_audit_logs;
create policy "Admins can read audit logs"
  on public.admin_audit_logs for select
  to authenticated
  using ((select private.is_admin()));

-- ------------------------------------------------------------------------------
-- 4. LOCK DOWN PROFILES PRIVILEGED COLUMNS & HARDEN SIGNUP TRIGGER
-- ------------------------------------------------------------------------------
create or replace function private.protect_profile_privileged_columns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Only privileged internal roles / SECURITY DEFINER triggers owned by postgres can mutate stats or admin status
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin
     or new.ship_count is distinct from old.ship_count
     or new.streak_count is distinct from old.streak_count
     or new.last_shipped_at is distinct from old.last_shipped_at then
    raise exception 'Permission denied: privileged profile fields cannot be updated by clients'
      using errcode = '42501';
  end if;

  -- Prevent regular users from renaming their handle to reserved admin names
  if lower(coalesce(new.username, '')) in ('admin', 'administrator', 'root', 'system', 'aevora_admin')
     and not (select private.is_admin()) then
    raise exception 'Permission denied: reserved username'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_profile_privileged_columns() from public, anon;
grant execute on function private.protect_profile_privileged_columns() to authenticated, postgres, service_role;

drop trigger if exists tr_protect_profile_privileged_columns on public.profiles;
create trigger tr_protect_profile_privileged_columns
  before update on public.profiles
  for each row execute function private.protect_profile_privileged_columns();

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    and coalesce(is_admin, false) = false
    and coalesce(ship_count, 0) = 0
    and coalesce(streak_count, 0) = 0
  );

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Harden handle_new_user with immutable search_path and reserved handle protection
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  desired_username text;
  final_username text;
  display_name text;
  user_role text;
  avatar text;
  is_server_admin boolean;
begin
  is_server_admin := coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin';

  desired_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username',
    split_part(coalesce(new.email, 'builder'), '@', 1)
  );

  desired_username := lower(regexp_replace(desired_username, '[^a-zA-Z0-9_]', '', 'g'));
  if length(desired_username) = 0 then
    desired_username := 'builder_' || substr(new.id::text, 1, 6);
  end if;

  if desired_username in ('admin', 'administrator', 'root', 'system', 'aevora_admin') and not is_server_admin then
    desired_username := 'builder_' || substr(new.id::text, 1, 6);
  end if;

  if exists (select 1 from public.profiles where username = desired_username and id != new.id) then
    final_username := desired_username || '_' || substr(new.id::text, 1, 4);
  else
    final_username := desired_username;
  end if;

  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    final_username
  );

  user_role := coalesce(
    new.raw_user_meta_data->>'role',
    'Hardware Hacker'
  );

  avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || final_username
  );

  insert into public.profiles (id, username, full_name, role, avatar_url, is_admin)
  values (
    new.id,
    final_username,
    display_name,
    user_role,
    avatar,
    is_server_admin
  )
  on conflict (id) do update set
    username = excluded.username,
    full_name = excluded.full_name,
    role = excluded.role,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;

-- Resolve Security Advisor warnings on existing trigger functions
create or replace function public.auto_confirm_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

create or replace function public.handle_ship_log_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    ship_count = coalesce(ship_count, 0) + 1,
    streak_count = case
      when last_shipped_at is null then 1
      when last_shipped_at > now() - interval '36 hours' then coalesce(streak_count, 0) + 1
      else 1
    end,
    last_shipped_at = now()
  where id = new.author_id;
  return new;
end;
$$;

create or replace function public.handle_upvote_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT') then
    update public.ship_logs
    set upvotes_count = coalesce(upvotes_count, 0) + 1
    where id = new.ship_log_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.ship_logs
    set upvotes_count = greatest(0, coalesce(upvotes_count, 0) - 1)
    where id = old.ship_log_id;
    return old;
  end if;
  return null;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.auto_confirm_new_user() from public, anon, authenticated;
revoke execute on function public.auto_confirm_user() from public, anon, authenticated;
revoke execute on function public.handle_ship_log_created() from public, anon, authenticated;
revoke execute on function public.handle_upvote_change() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- ------------------------------------------------------------------------------
-- 5. ENHANCE CHALLENGES FOR ADMIN-MANAGED CONTESTS
-- ------------------------------------------------------------------------------
alter table public.challenges
  add column if not exists tagline text,
  add column if not exists prize_pool text,
  add column if not exists application_deadline timestamp with time zone,
  add column if not exists max_slots integer,
  add column if not exists require_approval_to_submit boolean not null default true,
  add column if not exists is_published boolean not null default false,
  add column if not exists sponsored_by text,
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists applications_count integer not null default 0,
  add column if not exists approved_count integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'challenges_max_slots_check'
  ) then
    alter table public.challenges
      add constraint challenges_max_slots_check check (max_slots is null or max_slots > 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'challenges_ends_after_starts_check'
  ) then
    alter table public.challenges
      add constraint challenges_ends_after_starts_check check (ends_at > starts_at);
  end if;
end $$;

-- Unpublish legacy seeded challenges so public readers never receive fake entries
update public.challenges
set is_published = false
where id in (
  'f160932f-faac-4ba2-b05b-f64dc690273c',
  '24e8c6af-7659-4846-b024-52afd94066ce',
  'a72c8538-6f2f-4a41-95a5-4c316169c0b9'
);

-- Replace permissive policies with strict explicit policies + MFA enforcement
drop policy if exists "Challenges are viewable by everyone" on public.challenges;
drop policy if exists "Published challenges are viewable by everyone" on public.challenges;
drop policy if exists "Admins can manage challenges" on public.challenges;
drop policy if exists "Admins can insert challenges" on public.challenges;
drop policy if exists "Admins can update challenges" on public.challenges;
drop policy if exists "Admins can delete challenges" on public.challenges;
drop policy if exists "Admins require MFA for contest insert" on public.challenges;
drop policy if exists "Admins require MFA for contest update" on public.challenges;
drop policy if exists "Admins require MFA for contest delete" on public.challenges;

create policy "Published challenges are viewable by everyone"
  on public.challenges for select
  to anon, authenticated
  using (is_published = true or (select private.is_admin()));

create policy "Admins can insert challenges"
  on public.challenges for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update challenges"
  on public.challenges for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete challenges"
  on public.challenges for delete
  to authenticated
  using ((select private.is_admin()));

create policy "Admins require MFA for contest insert"
  on public.challenges as restrictive for insert
  to authenticated
  with check ((select private.is_admin_mfa_satisfied()));

create policy "Admins require MFA for contest update"
  on public.challenges as restrictive for update
  to authenticated
  using ((select private.is_admin_mfa_satisfied()))
  with check ((select private.is_admin_mfa_satisfied()));

create policy "Admins require MFA for contest delete"
  on public.challenges as restrictive for delete
  to authenticated
  using ((select private.is_admin_mfa_satisfied()));

create or replace function private.audit_challenge_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  act text;
  target uuid;
  actor uuid;
begin
  actor := coalesce(auth.uid(), case when tg_op = 'DELETE' then old.created_by else new.created_by end);

  if tg_op = 'INSERT' then
    act := 'contest.created';
    target := new.id;
    insert into public.admin_audit_logs (actor_id, action, target_type, target_id, metadata)
    values (actor, act, 'contest', target, jsonb_build_object('title', new.title, 'status', new.status, 'is_published', new.is_published));
    return new;
  elsif tg_op = 'UPDATE' then
    -- Ignore counter-only automated updates
    if new.title is not distinct from old.title
       and new.status is not distinct from old.status
       and new.is_published is not distinct from old.is_published
       and new.prize_pool is not distinct from old.prize_pool
       and new.ends_at is not distinct from old.ends_at
       and new.winner_profile_id is not distinct from old.winner_profile_id then
      return new;
    end if;

    act := case
      when new.is_published = true and old.is_published = false then 'contest.published'
      when new.is_published = false and old.is_published = true then 'contest.unpublished'
      when new.winner_profile_id is distinct from old.winner_profile_id and new.winner_profile_id is not null then 'contest.winner_selected'
      else 'contest.updated'
    end;
    target := new.id;
    insert into public.admin_audit_logs (actor_id, action, target_type, target_id, metadata)
    values (actor, act, 'contest', target, jsonb_build_object('title', new.title, 'status', new.status, 'is_published', new.is_published));
    return new;
  elsif tg_op = 'DELETE' then
    act := 'contest.deleted';
    target := old.id;
    insert into public.admin_audit_logs (actor_id, action, target_type, target_id, metadata)
    values (actor, act, 'contest', target, jsonb_build_object('title', old.title));
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists tr_audit_challenge_changes on public.challenges;
create trigger tr_audit_challenge_changes
  after insert or update or delete on public.challenges
  for each row execute function private.audit_challenge_changes();

-- ------------------------------------------------------------------------------
-- 6. CONTEST APPLICATIONS & ADMIN-ONLY REVIEW NOTES
-- ------------------------------------------------------------------------------
create table if not exists public.contest_applications (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.challenges(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  team_name text,
  project_title text not null check (char_length(trim(project_title)) between 3 and 140),
  track text,
  pitch text not null check (char_length(trim(pitch)) between 15 and 2000),
  repo_url text,
  portfolio_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'waitlisted', 'rejected', 'withdrawn')),
  accepted_rules boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  unique (contest_id, applicant_id)
);

create table if not exists public.contest_application_reviews (
  application_id uuid primary key references public.contest_applications(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  decision text not null check (decision in ('pending', 'approved', 'waitlisted', 'rejected')),
  admin_notes text,
  reviewed_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_contest_apps_contest on public.contest_applications(contest_id);
create index if not exists idx_contest_apps_applicant on public.contest_applications(applicant_id);
create index if not exists idx_contest_apps_status on public.contest_applications(status);

alter table public.contest_applications enable row level security;
alter table public.contest_application_reviews enable row level security;

-- Enforce application invariants, URL safety, deadlines & state machine
create or replace function private.enforce_contest_application_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_record record;
begin
  if new.accepted_rules is not true then
    raise exception 'You must confirm the contest rules before applying';
  end if;

  if new.repo_url is not null and trim(new.repo_url) <> '' and new.repo_url !~* '^https?://' then
    raise exception 'Invalid repository URL protocol (only http/https allowed)';
  end if;

  if new.portfolio_url is not null and trim(new.portfolio_url) <> '' and new.portfolio_url !~* '^https?://' then
    raise exception 'Invalid portfolio URL protocol (only http/https allowed)';
  end if;

  select id, status, is_published, starts_at, ends_at, application_deadline
  into c_record
  from public.challenges
  where id = new.contest_id;

  if not found then
    raise exception 'Contest not found';
  end if;

  if not c_record.is_published then
    raise exception 'This contest is not published';
  end if;

  if c_record.status not in ('upcoming', 'active') then
    raise exception 'Contest applications are closed';
  end if;

  if now() > coalesce(c_record.application_deadline, c_record.ends_at) then
    raise exception 'Application deadline has passed';
  end if;

  -- Force pending status on insert unless privileged admin creates it
  if not (select private.is_admin()) then
    new.status := 'pending';
  end if;

  return new;
end;
$$;

create or replace function private.enforce_contest_application_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_max_slots integer;
  c_approved_count integer;
begin
  new.updated_at := timezone('utc'::text, now());

  if new.repo_url is not null and trim(new.repo_url) <> '' and new.repo_url !~* '^https?://' then
    raise exception 'Invalid repository URL protocol (only http/https allowed)';
  end if;

  if new.portfolio_url is not null and trim(new.portfolio_url) <> '' and new.portfolio_url !~* '^https?://' then
    raise exception 'Invalid portfolio URL protocol (only http/https allowed)';
  end if;

  if not (select private.is_admin()) and current_user not in ('postgres', 'service_role') then
    if new.contest_id is distinct from old.contest_id or new.applicant_id is distinct from old.applicant_id then
      raise exception 'Permission denied: cannot reassign contest or applicant' using errcode = '42501';
    end if;

    if old.status <> 'pending' then
      raise exception 'Permission denied: reviewed applications cannot be edited by applicant' using errcode = '42501';
    end if;

    if new.status not in ('pending', 'withdrawn') then
      raise exception 'Permission denied: applicants may only withdraw pending applications' using errcode = '42501';
    end if;
  end if;

  -- Enforce max_slots limit when approving
  if new.status = 'approved' and old.status is distinct from 'approved' then
    select max_slots, approved_count
    into c_max_slots, c_approved_count
    from public.challenges
    where id = new.contest_id;

    if c_max_slots is not null and coalesce(c_approved_count, 0) >= c_max_slots then
      raise exception 'Contest has reached its maximum approved slots (%)', c_max_slots;
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.sync_contest_application_counters()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_contest_id uuid;
begin
  target_contest_id := case when tg_op = 'DELETE' then old.contest_id else new.contest_id end;

  update public.challenges c
  set
    applications_count = (
      select count(*)::integer
      from public.contest_applications ca
      where ca.contest_id = target_contest_id and ca.status <> 'withdrawn'
    ),
    approved_count = (
      select count(*)::integer
      from public.contest_applications ca
      where ca.contest_id = target_contest_id and ca.status = 'approved'
    )
  where c.id = target_contest_id;

  if tg_op = 'UPDATE' and new.status is distinct from old.status and (select private.is_admin()) then
    insert into public.admin_audit_logs (actor_id, action, target_type, target_id, metadata)
    values (
      auth.uid(),
      'application.' || new.status,
      'contest_application',
      new.id,
      jsonb_build_object('contest_id', new.contest_id, 'applicant_id', new.applicant_id, 'from', old.status, 'to', new.status)
    );
  end if;

  return null;
end;
$$;

drop trigger if exists tr_contest_app_before_insert on public.contest_applications;
create trigger tr_contest_app_before_insert
  before insert on public.contest_applications
  for each row execute function private.enforce_contest_application_insert();

drop trigger if exists tr_contest_app_before_update on public.contest_applications;
create trigger tr_contest_app_before_update
  before update on public.contest_applications
  for each row execute function private.enforce_contest_application_update();

drop trigger if exists tr_contest_app_sync_counters on public.contest_applications;
create trigger tr_contest_app_sync_counters
  after insert or update or delete on public.contest_applications
  for each row execute function private.sync_contest_application_counters();

-- RLS on contest_applications
drop policy if exists "Applicants and admins can view contest applications" on public.contest_applications;
create policy "Applicants and admins can view contest applications"
  on public.contest_applications for select
  to authenticated
  using (((select auth.uid()) = applicant_id) or (select private.is_admin()));

drop policy if exists "Authenticated users can submit contest applications" on public.contest_applications;
create policy "Authenticated users can submit contest applications"
  on public.contest_applications for insert
  to authenticated
  with check ((select auth.uid()) = applicant_id);

drop policy if exists "Applicants can withdraw or admins can review applications" on public.contest_applications;
create policy "Applicants can withdraw or admins can review applications"
  on public.contest_applications for update
  to authenticated
  using (((select auth.uid()) = applicant_id) or (select private.is_admin()))
  with check (((select auth.uid()) = applicant_id) or (select private.is_admin()));

drop policy if exists "Admin application review requires MFA" on public.contest_applications;
create policy "Admin application review requires MFA"
  on public.contest_applications as restrictive for update
  to authenticated
  using (((select auth.uid()) = applicant_id) or (select private.is_admin_mfa_satisfied()))
  with check (((select auth.uid()) = applicant_id) or (select private.is_admin_mfa_satisfied()));

drop policy if exists "Admins can delete contest applications" on public.contest_applications;
create policy "Admins can delete contest applications"
  on public.contest_applications for delete
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admin application delete requires MFA" on public.contest_applications;
create policy "Admin application delete requires MFA"
  on public.contest_applications as restrictive for delete
  to authenticated
  using ((select private.is_admin_mfa_satisfied()));

-- RLS on contest_application_reviews (strictly Admin-only, applicants cannot read internal notes)
drop policy if exists "Only admins can read application reviews" on public.contest_application_reviews;
create policy "Only admins can read application reviews"
  on public.contest_application_reviews for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Only admins can write application reviews" on public.contest_application_reviews;
create policy "Only admins can write application reviews"
  on public.contest_application_reviews for insert
  to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Only admins can update application reviews" on public.contest_application_reviews;
create policy "Only admins can update application reviews"
  on public.contest_application_reviews for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Only admins can delete application reviews" on public.contest_application_reviews;
create policy "Only admins can delete application reviews"
  on public.contest_application_reviews for delete
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Application reviews require MFA" on public.contest_application_reviews;
create policy "Application reviews require MFA"
  on public.contest_application_reviews as restrictive for all
  to authenticated
  using ((select private.is_admin_mfa_satisfied()))
  with check ((select private.is_admin_mfa_satisfied()));

-- ------------------------------------------------------------------------------
-- 7. ENFORCE APPROVED APPLICATION BEFORE CONTEST BUILD SUBMISSION (SHIP_LOGS)
-- ------------------------------------------------------------------------------
create or replace function private.enforce_contest_submission_eligibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_row record;
  is_approved boolean;
begin
  if new.challenge_id is null then
    return new;
  end if;

  select id, is_published, status, require_approval_to_submit
  into c_row
  from public.challenges
  where id = new.challenge_id;

  if not found or not c_row.is_published then
    raise exception 'Contest does not exist or is not published';
  end if;

  if c_row.status <> 'active' then
    raise exception 'Builds can only be submitted to active contests';
  end if;

  if c_row.require_approval_to_submit and not (select private.is_admin()) then
    select exists (
      select 1
      from public.contest_applications ca
      where ca.contest_id = new.challenge_id
        and ca.applicant_id = new.author_id
        and ca.status = 'approved'
    ) into is_approved;

    if not coalesce(is_approved, false) then
      raise exception 'Approved contest application required before submitting a contest build';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tr_ship_log_contest_eligibility on public.ship_logs;
create trigger tr_ship_log_contest_eligibility
  before insert on public.ship_logs
  for each row execute function private.enforce_contest_submission_eligibility();

-- ------------------------------------------------------------------------------
-- 8. CLEAN UP DEPRECATED auth.role() / OVER-BROAD POLICIES IN EXISTING TABLES
-- ------------------------------------------------------------------------------
drop policy if exists "Authenticated users can insert blueprints" on public.blueprints;
create policy "Authenticated users can insert blueprints"
  on public.blueprints for insert
  to authenticated
  with check ((select auth.uid()) is not null);

drop policy if exists "Users can manage their saved blueprints" on public.saved_blueprints;
create policy "Users can manage their saved blueprints"
  on public.saved_blueprints for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Authenticated users can create comments" on public.ship_comments;
create policy "Authenticated users can create comments"
  on public.ship_comments for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "Authors can delete own comments" on public.ship_comments;
create policy "Authors can delete own comments"
  on public.ship_comments for delete
  to authenticated
  using ((select auth.uid()) = author_id);
