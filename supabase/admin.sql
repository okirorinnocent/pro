-- Run in Supabase > SQL Editor, AFTER guestbook.sql. Safe to run more than once.
-- 1) Replace YOUR_EMAIL_HERE below with the email of your admin login (keep the quotes).
--    Do NOT commit your real email to GitHub; edit it in the SQL Editor only.
-- 2) If you ever re-run guestbook.sql, run this file again (guestbook.sql removes all policies).

-- Make sure the contact table exists with RLS on
alter table public.contact_messages enable row level security;

-- Only YOU (logged in with that email) can read / change / delete
drop policy if exists "admin read contact"   on public.contact_messages;
drop policy if exists "admin delete contact" on public.contact_messages;
create policy "admin read contact"   on public.contact_messages
  for select to authenticated using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL_HERE');
create policy "admin delete contact" on public.contact_messages
  for delete to authenticated using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL_HERE');

drop policy if exists "admin read guestbook"   on public.guestbook;
drop policy if exists "admin update guestbook" on public.guestbook;
drop policy if exists "admin delete guestbook" on public.guestbook;
create policy "admin read guestbook"   on public.guestbook
  for select to authenticated using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL_HERE');
create policy "admin update guestbook" on public.guestbook
  for update to authenticated using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL_HERE')
  with check ((auth.jwt() ->> 'email') = 'YOUR_EMAIL_HERE');
create policy "admin delete guestbook" on public.guestbook
  for delete to authenticated using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL_HERE');

grant select, delete on public.contact_messages to authenticated;
grant select, update, delete on public.guestbook to authenticated;
-- Visitors can still post (insert) as before; they still cannot read contact messages.
