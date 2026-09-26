-- Trip City initial schema. Every table is owned by auth.users via trips.user_id and protected by RLS.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'he',
  created_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  destination text not null,
  country char(2) not null,
  city_key text not null default 'generic' check (city_key in ('paris','rome','london','new-york','tokyo','generic')),
  start_date date not null,
  end_date date not null,
  timezone text not null,               -- IANA, e.g. Europe/Paris. Never the device timezone.
  status text not null default 'planning' check (status in ('planning','upcoming','active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index on public.trips(user_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png','image/webp')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 10485760),
  storage_path text not null unique,    -- {user_id}/{trip_id}/{uuid}.{ext} in private bucket trip-documents
  linked_type text,
  linked_id uuid,
  created_at timestamptz not null default now()
);

create table public.flights (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  airline text,
  flight_number text not null,
  origin char(3) not null,
  destination char(3) not null,
  departure_at timestamptz not null,
  departure_timezone text not null,
  arrival_at timestamptz not null,
  arrival_timezone text not null,
  departure_terminal text,
  arrival_terminal text,
  gate text,
  booking_reference text,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  check_in_at timestamptz not null,
  check_out_at timestamptz not null,
  booking_number text,
  phone text,
  booking_url text,
  document_id uuid references public.documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  date date,
  start_at timestamptz,                 -- null = flexible, planner may place it
  duration_minutes integer check (duration_minutes > 0),
  price_amount numeric(10,2),
  price_currency char(3),
  ticket_status text not null default 'none' check (ticket_status in ('none','needed','purchased')),
  status text not null default 'planned' check (status in ('planned','confirmed','completed','cancelled')),
  document_id uuid references public.documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  kind text not null check (kind in ('match','show','theatre','restaurant','museum','other')),
  name text not null,
  location text,
  lat double precision,
  lng double precision,
  start_at timestamptz not null,
  duration_minutes integer,
  booking_reference text,
  document_id uuid references public.documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.transport (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  mode text not null check (mode in ('train','bus','taxi','metro','rental_car')),
  origin text not null,
  destination text not null,
  departure_at timestamptz not null,
  arrival_at timestamptz not null,
  operator text,
  seat text,
  booking_reference text,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.car_rentals (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  company text not null,
  car_model text,
  pickup_location text not null,
  pickup_at timestamptz not null,
  dropoff_location text not null,
  dropoff_at timestamptz not null,
  booking_reference text,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  provider text not null,
  policy_number text not null,
  coverage_start date not null,
  coverage_end date not null,
  emergency_phone text,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  category text not null check (category in ('documents','clothes','electronics','health','other')),
  label text not null,
  done boolean not null default false,
  order_index integer not null default 0
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,                   -- local date in trips.timezone
  start_at timestamptz not null,
  end_at timestamptz,
  item_type text not null check (item_type in ('flight','hotel_check_in','hotel_check_out','transport','activity','event','car_pickup','car_dropoff','free_time','note')),
  reference_id uuid,
  title text not null,
  order_index integer not null default 0,
  source text not null default 'user' check (source in ('user','ai','import')),
  is_locked boolean not null default false,
  ai_generated boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  check (end_at is null or end_at >= start_at)
);
create index on public.itinerary_items(trip_id, date, start_at);

-- Row Level Security --------------------------------------------------------
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

alter table public.trips enable row level security;
create policy "own trips" on public.trips for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.owns_trip(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.trips where id = t and user_id = auth.uid());
$$;

do $$
declare tbl text;
begin
  foreach tbl in array array['flights','hotels','activities','events','transport','car_rentals','insurance_policies','checklist_items','itinerary_items'] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('create policy "trip owner" on public.%I for all using (public.owns_trip(trip_id)) with check (public.owns_trip(trip_id))', tbl);
  end loop;
end $$;

alter table public.documents enable row level security;
create policy "own documents" on public.documents for all
  using (user_id = auth.uid() and public.owns_trip(trip_id))
  with check (user_id = auth.uid() and public.owns_trip(trip_id));

-- Private storage: files live under {user_id}/... and are read only through signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-documents', 'trip-documents', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "own folder read" on storage.objects for select
  using (bucket_id = 'trip-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own folder write" on storage.objects for insert
  with check (bucket_id = 'trip-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own folder delete" on storage.objects for delete
  using (bucket_id = 'trip-documents' and (storage.foldername(name))[1] = auth.uid()::text);
