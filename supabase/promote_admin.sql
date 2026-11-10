-- ==============================================================================
-- ONE-TIME ADMIN PROMOTION SCRIPT (NO PASSWORDS STORED IN REPOSITORY)
-- ==============================================================================
-- Instructions:
-- 1. First run `supabase/migrations/20261110_admin_contests_security.sql` in
--    Supabase Dashboard -> SQL Editor.
-- 2. Go to Supabase Dashboard -> Authentication -> Users -> "Add user" ->
--    "Create new user":
--      - Email: admin@aevora.com
--      - Password: <enter your chosen admin password directly in Dashboard>
--      - Check "Auto Confirm User"
-- 3. Then paste and execute THIS script in Supabase Dashboard -> SQL Editor:
-- ==============================================================================

do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id
  from auth.users
  where email = 'admin@aevora.com'
  limit 1;

  if target_user_id is null then
    raise exception 'User admin@aevora.com not found in auth.users. Create the user in Supabase Authentication -> Users first.';
  end if;

  -- Register in non-exposed private admin table
  insert into private.admin_users (user_id, role, notes)
  values (target_user_id, 'super_admin', 'Primary Aevora Platform Admin')
  on conflict (user_id) do update
    set role = 'super_admin';

  -- Attach tamper-proof app_metadata claim in Supabase Auth
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  where id = target_user_id;

  -- Sync profile row
  update public.profiles
  set is_admin = true,
      role = 'Platform Admin',
      username = 'admin',
      full_name = coalesce(nullif(full_name, ''), 'Aevora Admin')
  where id = target_user_id;
end $$;
