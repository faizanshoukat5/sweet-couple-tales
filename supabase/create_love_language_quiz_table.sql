
-- Table for storing Love Language Quiz results
create table if not exists public.love_language_quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  scores jsonb not null, -- { "words": 7, "acts": 5, ... }
  taken_at timestamp with time zone default timezone('utc'::text, now()),
  partner_id uuid references auth.users(id),
  shared_with_partner boolean default false,
  constraint unique_user_id unique (user_id)
);

-- Index for fast lookup
create index if not exists idx_love_language_quiz_user on public.love_language_quiz_results(user_id);

-- Enable RLS
alter table public.love_language_quiz_results enable row level security;

-- Policies
create policy "Users and their partner can view quiz results if shared" on public.love_language_quiz_results
  for select using (
    user_id = auth.uid()
    or (partner_id = auth.uid() and shared_with_partner = true)
  );
create policy "Users can insert their own quiz results" on public.love_language_quiz_results
  for insert with check (user_id = auth.uid());
create policy "Users can update/delete their own quiz results" on public.love_language_quiz_results
  for update using (user_id = auth.uid());
create policy "Users can delete their own quiz results" on public.love_language_quiz_results
  for delete using (user_id = auth.uid());
