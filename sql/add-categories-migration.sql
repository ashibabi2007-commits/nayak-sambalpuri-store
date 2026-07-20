-- Run this in Supabase SQL Editor to add admin-managed categories.
-- Replace owner@example.com with your real admin email before running.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

-- Everyone can view categories.
drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories"
on public.categories
for select
using (true);

-- Only admin can add categories.
drop policy if exists "Admin can insert categories" on public.categories;
create policy "Admin can insert categories"
on public.categories
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

-- Only admin can update categories.
drop policy if exists "Admin can update categories" on public.categories;
create policy "Admin can update categories"
on public.categories
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com')
with check ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

-- Only admin can delete categories.
drop policy if exists "Admin can delete categories" on public.categories;
create policy "Admin can delete categories"
on public.categories
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'nayaksambalpuribastralaya26@gmail.com');

-- Add some starter categories only if table is empty.
insert into public.categories (name, description, sort_order)
select * from (values
  ('All Sarees', 'Complete saree collection', 1),
  ('Cotton Saree', 'Sambalpuri cotton sarees', 2),
  ('Silk Saree', 'Sambalpuri silk sarees', 3),
  ('Traditional Collection', 'Traditional Sambalpuri designs', 4)
) as v(name, description, sort_order)
where not exists (select 1 from public.categories);
