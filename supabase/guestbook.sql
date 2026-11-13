-- Run FIRST in Supabase > SQL Editor. Safe to run more than once.
-- Creates / hardens the guestbook and contact tables.
--
-- Security model:
--   * Visitors can NOT write to the database directly any more. All posts go through the
--     "submit" Edge Function (supabase/functions/submit), which verifies Cloudflare Turnstile,
--     validates the input and rate-limits per network, then inserts with the service role.
--   * Visitors can only READ approved guestbook notes (name, message, date), nothing else.
--   * Contact messages are never readable from the browser.
--   * New guestbook notes start as NOT approved (pre-moderation); you approve them in /admin.

create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  name text not null,
  message text not null,
  approved boolean default false,
  ip_hash text,
  created_at timestamptz default now()
);
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  ip_hash text,
  created_at timestamptz default now()
);

alter table public.guestbook add column if not exists approved boolean;
alter table public.guestbook add column if not exists ip_hash text;
alter table public.contact_messages add column if not exists ip_hash text;
alter table public.guestbook alter column approved set default false;
update public.guestbook set approved = false where approved is null;   -- existing approved rows stay visible

alter table public.guestbook enable row level security;
alter table public.contact_messages enable row level security;

-- Remove every older policy that let the browser insert (and the old read policies, recreated below)
drop policy if exists "public insert"      on public.guestbook;
drop policy if exists "guestbook insert"   on public.guestbook;
drop policy if exists "public read"        on public.guestbook;
drop policy if exists "guestbook read"     on public.guestbook;
drop policy if exists "contact insert"     on public.contact_messages;

create policy "public read" on public.guestbook
  for select to anon, authenticated using (approved = true);

-- Table privileges: start from nothing, then give back only what is needed.
revoke all on public.guestbook from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select (id, name, message, created_at, approved) on public.guestbook to anon;   -- approved rows only, via the policy

-- Database-level limits (the browser checks are only a convenience).
-- NOT VALID: old rows are not re-checked, every new row is.
alter table public.guestbook drop constraint if exists gb_len;
alter table public.guestbook add constraint gb_len check (
  char_length(name) between 1 and 40 and char_length(message) between 1 and 280) not valid;
alter table public.contact_messages drop constraint if exists cm_len;
alter table public.contact_messages add constraint cm_len check (
  char_length(name) between 1 and 80 and char_length(message) between 1 and 1500
  and char_length(email) <= 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') not valid;

create index if not exists guestbook_ip_time on public.guestbook (ip_hash, created_at desc);
create index if not exists contact_ip_time   on public.contact_messages (ip_hash, created_at desc);
