-- Whole-trip snapshots: the signed-in user's TripBundle as JSON, keyed by the app's trip id.
-- Lets every edit sync across devices today; the normalized tables in 0001 stay for later server-side features.
create table public.trip_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, trip_key)
);

alter table public.trip_snapshots enable row level security;
create policy "own snapshots" on public.trip_snapshots for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Profile row on first sign-in (name from the Google account).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
