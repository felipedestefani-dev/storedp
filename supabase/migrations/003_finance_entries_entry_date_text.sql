-- Permite prazos em texto livre (ex.: "até 20/07") além de datas ISO
-- Rode no Supabase: SQL Editor → Run

drop index if exists finance_entries_entry_date_idx;
drop index if exists finance_entries_user_date_idx;

alter table public.finance_entries
  alter column entry_date type text using entry_date::text;

alter table public.finance_entries
  alter column entry_date set not null;
