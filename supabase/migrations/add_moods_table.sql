-- Create moods table for Mood Tracker
create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  mood text not null,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique (user_id, date)
);

-- Index for fast lookup
create index if not exists moods_user_date_idx on public.moods(user_id, date);
