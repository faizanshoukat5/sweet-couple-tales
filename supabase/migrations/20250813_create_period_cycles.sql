-- Menstrual cycle tracking table for a partner
create table if not exists public.period_cycles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  last_period_start date,
  avg_cycle_length integer not null default 28 check (avg_cycle_length between 20 and 60),
  period_length integer not null default 5 check (period_length between 1 and 14),
  notes text,
  updated_at timestamptz not null default now(),
  constraint period_cycles_pair_unique unique(owner_id, partner_id)
);

alter table public.period_cycles enable row level security;

-- Allow owner and partner to read
create policy if not exists "period_cycles_read_pair"
on public.period_cycles for select
using (
  auth.uid() = owner_id or auth.uid() = partner_id
);

-- Allow owner to create
create policy if not exists "period_cycles_insert_owner"
on public.period_cycles for insert
with check (
  auth.uid() = owner_id
);

-- Allow owner to update
create policy if not exists "period_cycles_update_owner"
on public.period_cycles for update
using (
  auth.uid() = owner_id
);

-- Allow owner to delete
create policy if not exists "period_cycles_delete_owner"
on public.period_cycles for delete
using (
  auth.uid() = owner_id
);
