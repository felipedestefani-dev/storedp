-- Rode este SQL no Supabase: SQL Editor → New query → Run
-- Tabela de lições e trabalhos (por usuário, com RLS)

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text default '' not null,
  kind text not null default 'trabalho' check (kind in ('lição', 'trabalho')),
  completed boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists assignments_user_id_idx on public.assignments (user_id);
create index if not exists assignments_created_at_idx on public.assignments (created_at desc);

alter table public.assignments enable row level security;

create policy "assignments_select_own"
  on public.assignments for select
  using (auth.uid() = user_id);

create policy "assignments_insert_own"
  on public.assignments for insert
  with check (auth.uid() = user_id);

create policy "assignments_update_own"
  on public.assignments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "assignments_delete_own"
  on public.assignments for delete
  using (auth.uid() = user_id);
