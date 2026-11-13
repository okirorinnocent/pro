-- Run SECOND in Supabase > SQL Editor, AFTER guestbook.sql. Safe to run more than once.
-- 1) In Supabase > Authentication > Users, create (or open) YOUR admin user and copy its UUID.
-- 2) Replace YOUR_ADMIN_USER_UUID below (keep the quotes) in the SQL Editor only.
--    Do NOT commit your real UUID to GitHub.
-- 3) In Authentication > Sign In / Providers, turn OFF "Allow new users to sign up"
--    so nobody else can ever create an account.
-- Re-run this file if you ever re-run guestbook.sql (it re-grants the admin privileges).

drop policy if exists "admin read contact"     on public.contact_messages;
drop policy if exists "admin delete contact"   on public.contact_messages;
drop policy if exists "admin read guestbook"   on public.guestbook;
drop policy if exists "admin update guestbook" on public.guestbook;
drop policy if exists "admin delete guestbook" on public.guestbook;

-- Only YOU (matched by user id, not by an email string) can read / change / delete
create policy "admin read contact"   on public.contact_messages
  for select to authenticated using (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);
create policy "admin delete contact" on public.contact_messages
  for delete to authenticated using (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);

create policy "admin read guestbook"   on public.guestbook
  for select to authenticated using (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);
create policy "admin update guestbook" on public.guestbook
  for update to authenticated using (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid)
  with check (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);
create policy "admin delete guestbook" on public.guestbook
  for delete to authenticated using (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);

grant select, delete on public.contact_messages to authenticated;
grant select, delete on public.guestbook to authenticated;
grant update (approved) on public.guestbook to authenticated;   -- admin can only change the approval flag

-- Optional, once you have enrolled an authenticator app (TOTP) for your admin user:
-- require a second factor by adding  and (auth.jwt() ->> 'aal') = 'aal2'  to each "using (...)" above.
