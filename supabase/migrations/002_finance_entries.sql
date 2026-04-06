-- FD Investimentos — lançamentos por usuário (RLS)
-- Rode no Supabase: SQL Editor → New query → Run

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (
    type in ('ganho', 'ganho_futuro', 'despesa', 'despesa_futura', 'aporte', 'resgate', 'investido', 'lucro_invest', 'saldo_conta')
  ),
  amount numeric(14, 2) not null check (amount >= 0),
  description text not null default '',
  entry_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists finance_entries_user_id_idx on public.finance_entries (user_id);
create index if not exists finance_entries_entry_date_idx on public.finance_entries (entry_date desc);
create index if not exists finance_entries_user_date_idx on public.finance_entries (user_id, entry_date desc);

alter table public.finance_entries enable row level security;

create policy "finance_entries_select_own"
  on public.finance_entries for select
  using (auth.uid() = user_id);

create policy "finance_entries_insert_own"
  on public.finance_entries for insert
  with check (auth.uid() = user_id);

create policy "finance_entries_update_own"
  on public.finance_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "finance_entries_delete_own"
  on public.finance_entries for delete
  using (auth.uid() = user_id);
