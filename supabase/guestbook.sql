-- Run in Supabase > SQL Editor. Safe to run more than once.
-- Fixes: HTTP 401 / 42501 on posting, and new posts not showing in the list.

alter table public.guestbook add column if not exists approved boolean;
alter table public.guestbook alter column approved set default true;
update public.guestbook set approved = true where approved is distinct from true;

alter table public.guestbook enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'guestbook'
  loop
    execute format('drop policy %I on public.guestbook', p.policyname);
  end loop;
end $$;

-- Only approved rows are readable by visitors
create policy "public read"   on public.guestbook
  for select to anon, authenticated using (approved = true);
create policy "public insert" on public.guestbook
  for insert to anon, authenticated with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert on public.guestbook to anon, authenticated;

do $$
declare s text;
begin
  for s in select pg_get_serial_sequence('public.guestbook', 'id')
  loop
    if s is not null then
      execute format('grant usage, select on sequence %s to anon, authenticated', s);
    end if;
  end loop;
end $$;

-- Optional: remove test rows
-- delete from public.guestbook where name = 'test';
