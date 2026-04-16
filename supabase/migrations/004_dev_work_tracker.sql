-- FD Dev Tracker — clientes, projetos, pagamentos e portfólio (RLS)
-- Rode no Supabase: SQL Editor → New query → Run

-- CLIENTES
create table if not exists public.dev_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null default '',
  phone text not null default '',
  company text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists dev_clients_user_id_idx on public.dev_clients (user_id);
alter table public.dev_clients enable row level security;

create policy "dev_clients_select_own"
  on public.dev_clients for select
  using (auth.uid() = user_id);

create policy "dev_clients_insert_own"
  on public.dev_clients for insert
  with check (auth.uid() = user_id);

create policy "dev_clients_update_own"
  on public.dev_clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dev_clients_delete_own"
  on public.dev_clients for delete
  using (auth.uid() = user_id);

-- PROJETOS / SITES
create table if not exists public.dev_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.dev_clients (id) on delete set null,
  title text not null,
  description text not null default '',
  url text not null default '',
  status text not null default 'backlog' check (status in ('backlog','em_andamento','aguardando_cliente','concluido','pausado','cancelado')),
  start_date date,
  due_date date,
  price numeric(14, 2) not null default 0 check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists dev_projects_user_id_idx on public.dev_projects (user_id);
create index if not exists dev_projects_client_id_idx on public.dev_projects (client_id);
create index if not exists dev_projects_status_idx on public.dev_projects (status);
alter table public.dev_projects enable row level security;

create policy "dev_projects_select_own"
  on public.dev_projects for select
  using (auth.uid() = user_id);

create policy "dev_projects_insert_own"
  on public.dev_projects for insert
  with check (auth.uid() = user_id);

create policy "dev_projects_update_own"
  on public.dev_projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dev_projects_delete_own"
  on public.dev_projects for delete
  using (auth.uid() = user_id);

-- PAGAMENTOS (ganhos por projeto)
create table if not exists public.dev_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.dev_projects (id) on delete cascade,
  amount numeric(14, 2) not null check (amount >= 0),
  due_date date,
  paid_at date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists dev_payments_user_id_idx on public.dev_payments (user_id);
create index if not exists dev_payments_project_id_idx on public.dev_payments (project_id);
create index if not exists dev_payments_paid_at_idx on public.dev_payments (paid_at desc);
alter table public.dev_payments enable row level security;

create policy "dev_payments_select_own"
  on public.dev_payments for select
  using (auth.uid() = user_id);

create policy "dev_payments_insert_own"
  on public.dev_payments for insert
  with check (auth.uid() = user_id);

create policy "dev_payments_update_own"
  on public.dev_payments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dev_payments_delete_own"
  on public.dev_payments for delete
  using (auth.uid() = user_id);

-- PORTFÓLIO — sites já feitos
create table if not exists public.dev_portfolio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text not null default '',
  description text not null default '',
  tech text not null default '',
  thumb_url text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists dev_portfolio_user_id_idx on public.dev_portfolio (user_id);
alter table public.dev_portfolio enable row level security;

create policy "dev_portfolio_select_own"
  on public.dev_portfolio for select
  using (auth.uid() = user_id);

create policy "dev_portfolio_insert_own"
  on public.dev_portfolio for insert
  with check (auth.uid() = user_id);

create policy "dev_portfolio_update_own"
  on public.dev_portfolio for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dev_portfolio_delete_own"
  on public.dev_portfolio for delete
  using (auth.uid() = user_id);

