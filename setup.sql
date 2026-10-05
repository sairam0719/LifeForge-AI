-- Run once in Supabase SQL Editor. No passwords or API keys belong in this file.
begin;
create table if not exists public.lifeforge_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.lifeforge_states enable row level security;
revoke all on public.lifeforge_states from anon;
grant select, insert, update on public.lifeforge_states to authenticated;
drop policy if exists "Read own state" on public.lifeforge_states;
create policy "Read own state" on public.lifeforge_states for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Insert own state" on public.lifeforge_states;
create policy "Insert own state" on public.lifeforge_states for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Update own state" on public.lifeforge_states;
create policy "Update own state" on public.lifeforge_states for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Optimistic concurrency: a second device cannot silently overwrite newer data.
create or replace function public.save_lifeforge_state(next_state jsonb, expected_revision bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare result_revision bigint;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(next_state) is distinct from 'object' or octet_length(next_state::text) > 10000000 then
    raise exception 'Invalid state or backup larger than 10 MB';
  end if;
  if expected_revision = 0 then
    insert into public.lifeforge_states(user_id, state, revision)
      values (auth.uid(), next_state, 1) on conflict (user_id) do nothing
      returning revision into result_revision;
  else
    update public.lifeforge_states set state = next_state, revision = revision + 1, updated_at = now()
      where user_id = auth.uid() and revision = expected_revision
      returning revision into result_revision;
  end if;
  if result_revision is null then raise exception 'LIFEFORGE_CONFLICT'; end if;
  return result_revision;
end;
$$;
revoke all on function public.save_lifeforge_state(jsonb,bigint) from public, anon;
grant execute on function public.save_lifeforge_state(jsonb,bigint) to authenticated;
commit;
